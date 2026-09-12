# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independent projects, no shared tooling or workspace root:

- `blockdom-app/` — Next.js 14 App Router frontend (TypeScript, Tailwind, NextUI), the game client for **Plot War**, a play-to-earn land/town/battle game. The directory name still says "blockdom"; the game was renamed and the directory was not.
- `back-end/` — Foundry (Solidity) project holding the game's smart contracts.

## Three live deployments — read this first

The contracts exist twice in source and three times on chain.

- `back-end/src/*.sol` — **v3**, the original contracts. Deployed and still serving the `/explore` and `/testnet/` routes. Treat as frozen: they are kept only because real state sits behind them.
- `back-end/src/new/*.sol` — the rewrite that fixed ~60 audit findings and added clans, an AMM pool, wild lands and upgradeability. **This one source tree is deployed twice:**
  - **v4** — an earlier build, from before the PLOT rebrand, land types and wild lands. Left running under `/v4/` because it holds state worth comparing against. Its bytecode still says `BMT` and knows nothing about jungles, which is why `lib/instances.ts` carries the `LEGACY_V4_FRAGMENTS` shim for the one renamed getter. **Do not delete that shim** — it is v4's, and v4 is not going anywhere.
  - **v5** — current source, deployed 2026-09-11, served from `/v5/`. Slippage guards, the swap events, the pool in the war module, land at 0.005 ETH.

`back-end/deployments/sepolia.json` holds **v5 only**; v4's addresses live in `blockdom-app/lib/blockchainData.ts` and nowhere else.

New work goes in `src/new`, `test/new` and `script/new`. Do not edit the v3 files. Anything landing in `src/new` changes v5 on the next deploy and never touches v4 — a signature change there is a breaking ABI change for `abis/v5/` alone, which is what keeps the two separable.

`back-end/PENDING_DEPLOY.md` tracks what source has that the chain does not. Add to it with every contract change; clear it on deploy.

## Commands

Frontend (`cd blockdom-app`):

```bash
npm run dev      # dev server on :3000
npm run build    # production build
npm run lint     # next lint (eslint-config-next)
npx tsc --noEmit # typecheck
```

Contracts (`cd back-end`):

```bash
forge build
forge build --sizes                       # watch the EIP-170 margin, see below
forge test
forge test --match-test <testName> -vvv   # single test
forge fmt
anvil                                     # local node

SEED_TEST_LANDS=true forge script script/new/DeployPlotWar.s.sol:DeployPlotWar \
  --rpc-url sepolia --private-key <key> --broadcast
```

`foundry.toml` sets `via_ir = true` and `optimizer_runs = 1` — that is size pressure, not a preference (see below). Fuzz runs 600 with fixed seed `0x3e8`. Named RPC endpoints live in `[rpc_endpoints]`, so `--rpc-url sepolia` works.

## Contracts (`back-end/src/new`)

- `LandsV3.sol` — ERC721 land NFTs, UUPS-upgradeable. **Token id is the decimal concatenation of x and y** (x=123, y=145 → `123145`), both constrained to 100–199, so ids run `100100..199199` and the map is exactly **10,000 parcels**. That range *is* the supply cap; no cap logic exists or is needed. Also owns the land-type system (below).
- `Town.sol` (~1,700 lines) — four contracts in one file:
  - `Barracks` — warrior table and army maths.
  - `TownBase` — all shared state and the economy: buildings, goods, the AMM pool, the starter pack. **Every state variable lives here**, because both halves below inherit it and must see the same storage layout.
  - `Town` — the deployed entry point.
  - `TownWar` — recruiting, dispatch, battle, retreat, wild lands. A separately deployed contract that `Town` reaches by `delegatecall`.
- `Clans.sol` — membership and seasons, mixed into `TownBase`.
- `PLOT.sol` — the ERC20. Whole supply minted once at deploy; there is no mint function.
- `LandsProxy.sol` — a thin `ERC1967Proxy` used for both `Lands` and `Town`.

### Contract size is the binding constraint

```
Town      ~21.7 kB   margin ~2.9 kB
TownWar   ~23.9 kB   margin ~0.7 kB     <- now the tight one
Lands      ~8.9 kB   margin ~15.7 kB
```

The EIP-170 limit is 24,576 bytes. Run `forge build --sizes` before and after anything that adds code; the margins move, and **which contract is full has already flipped once**. `Town` used to be the one with no room, so the pool was moved into `TownWar` to free 2.7 kB — which cost `TownWar` most of its own. Today new code goes in `Town`; check the numbers rather than trusting this paragraph.

Three consequences:

1. `Town` has a catch-all `fallback()` that delegatecalls any unknown selector into `warModule`. There are no per-function stubs, so **a function in `TownWar` costs zero bytes in `Town`** — and because the selectors are unchanged, code can be moved between the two without any caller noticing. That is a real escape hatch when one side fills up.
2. Helpers placed in `TownBase` are compiled into *both*. If only one half calls something, declare it there instead.
3. `TownWar` now holds the AMM, so **trading requires `warModule` to be set**. Before, forgetting `setWarModule` only broke war; now it stops the economy too. The deploy script always sets it — watch for it on an upgrade.

Because of the fallback, `Town`'s compile-time ABI is incomplete. The frontend needs **`Town` + `TownWar` merged** — `abis/v5/townAbi.json` is generated that way. Solidity does not know this either: a test calling a pool function on a `Town`-typed variable will not compile, so tests reach them as `TownWar(address(town)).buyGood(...)`.

### Upgradeability rules

Both contracts sit behind proxies, so:

- New state goes at the **end** of `TownBase` (and at the end of a struct, never inserted — see `DispatchedArmy.departedAt`).
- No constructors for state; `initialize()` does the work. An inline field initialiser (`uint256 x = 1;`) runs in the constructor and is invisible to the proxy — this has already caused one bug where every town building was free.
- Tests that reach storage with `vm.store` hardcode slot numbers. Re-read them with `forge inspect Town storage-layout` after touching state; `test/new/TownFixes.t.sol` keeps them as named constants at the top.

### Invariants worth not breaking

`test/new/SupplyInvariant.t.sol` runs four properties over 9,000 random calls each:

- `totalExistedGood` equals the sum of every land's balance. Any path that creates or destroys goods must move both sides — wild-land regrowth included.
- The contract holds every PLOT it owes: `balanceOf(town) == Σ plotBalance + plotReserve[0] + plotReserve[1]`.
- Neither pool reserve can reach zero.

### Land types and wild lands

`Lands.landType(id)` returns `Town` or `Jungle`. The default comes from `naturalType(id)`, a **pure** hash of the token id (~10% Jungle), so the whole map is known before anything is minted and the frontend can colour it with no chain call. `setLandType` (owner-only) overrides it, and refuses any parcel somebody already owns — `Lands` has no burn, so a sold parcel's type is frozen for good.

A Jungle nobody owns is a **wild land**: attackable without ever being minted, holding goods and a garrison that regrow on a 7-day clock. Regrowth is computed on the way into battle (`_regenerateWild`), the same lazy trick `_claim` uses for buildings — there is no keeper and no scheduled transaction anywhere in this codebase, and there cannot be.

Unlocking a jungle means `setLandType(id, Town)`; it then mints and sells like any other parcel, and stops being wild the moment it has an owner.

## Frontend architecture (`blockdom-app`)

### Deployment is derived from the URL

There is no environment flag. `lib/deployments.ts` is the single source:

```ts
export type Deployment = "v3-testnet" | "v3-mainnet" | "v4-testnet" | "v5-testnet";
// /v5/ → v5-testnet, /v4/ → v4-testnet, /testnet/ → v3-testnet, otherwise v3-mainnet
```

Components call `useDeployment()` and resolve contracts through the helpers in `lib/instances.ts` (`townRead(deployment)` and friends) rather than importing an instance directly. That is what lets one set of components serve four deployments; do not reintroduce per-route copies.

Two predicates, and the difference matters:

- `isRewrite(d)` — **v4 or v5**. A capability question: does this deployment have clans, the pool, land types? Almost every component wants this one. It was called `isV4` until v5 existed, which would now have been a lie.
- `hasSlippageGuards(d)` — **v5 only**. v4's trade functions take three arguments and v5's take four, so the call site has to know. Wrong arity fails at encoding time, not on chain.

`components/deploymentSwitch.tsx` flips between v4 and v5 in the navbar. It rewrites the current path (`switchDeployment`) rather than linking to a fixed page, so it survives routes with parameters, and it renders `null` outside the two rewrites.

### Contract access pattern

`lib/instances.ts` is the only place contracts are constructed:

- `*PInst` — read-only, bound to a `JsonRpcProvider` (module-level singletons).
- `*SInst(signer)` — factory returning a write instance, called with the thirdweb `useSigner()` result.
- `*V4*` / `*V5*` — the same pair against the v4 and v5 addresses.

Addresses live in `lib/blockchainData.ts`; the v4 and v5 ones are **proxy** addresses, never implementations.

v4 and v5 are both live and neither replaces the other — v4 holds state from earlier testing, and keeping both is what makes the switcher useful. They need **separate ABIs**: `abis/v4/` and `abis/v5/` differ in the trade signatures, so they are not interchangeable. v4 additionally carries a `LEGACY_V4_FRAGMENTS` shim in `lib/instances.ts` because it predates the PLOT rebrand; v5 needs none.

### State is a stack of React contexts, not a store

`app/layout.tsx` nests ~9 providers; order matters because lower ones consume upper ones.

- `blockchain-state-context` — global transaction state machine (`waitingUserApproval`, `waitingBlockchainConfirmation`, `confirmed`, …). `components/popUpState.tsx` renders the modal purely off this value.
- `blockchain-utils-context` — **every write transaction lives here**. Each follows the same shape: `validateWallet()` → `validateChain()` → pick the signer instance for the deployment → `setTransactionState("waitingUserApproval")` → send → `handleResult(tx)` with `handleError` in the catch. Add new transactions here, not in components.
- `api-data-context` — fetches raw logs from the explorer and derives state by decoding them in `lib/utils.ts`. `setApiTrigger(true)` re-fetches after a delay so the explorer can index the new block.
- `user-data-context`, `map-context`, `selected-building-context`, `selected-window-context` — per-session UI/game selections.

### Event-log-as-database

There is no backend or indexer. `lib/utils.ts` reconstructs game state from explorer logs:

- `getMintedLandsFromEvents` — ERC721 `Transfer` from the zero address with a token id in the land range.
- `getResBuildingsFromEvents` — Town `Build`, with level inferred by *counting* matching `Upgrade` events.
- `getWarLogsFromEvents` — decodes `Attack`.

Event topics are resolved through `ethers.utils.Interface(townABI).getEventTopic(...)`, so **`abis/v4/townAbi.json` must stay in sync with `src/new/Town.sol`** — a changed event signature yields empty state rather than an error. Regenerate after any contract change; `abis/v4/README.md` documents how and what changed.

Live values that are not event-derived (worker timers, army counts, PLOT balance) are read directly — see `components/navbar.tsx`.

Uses ethers **v5** (`@thirdweb-dev/react` v4). `formatEther`/`parseEther` come from `ethers/lib/utils`.

### Routes

- `app/explore|myLand|battleLog|dashboard/` — v3 mainnet.
- `app/testnet/...` — v3 testnet.
- `app/v4/...` — v4 on Sepolia.
- `app/v5/...` — v5 on Sepolia, same components again.
- `app/clans/` — clan screens.
- `app/_gameplay-pages/` — an abandoned kebab-case refactor, prefixed with `_` so Next ignores it. Do not add to it.

`components/gameComponents/` holds the game UI; `components/indexPage/` the landing page. Path alias `@/*` maps to the `blockdom-app` root.

## Notes

- `blockdom-app/AGENTS.md` warns that this Next.js version differs from training data; read `node_modules/next/dist/docs/` before writing Next-specific code.
- The audit and design documents produced for this rewrite are published as Artifacts, linked from the conversation history rather than checked in.
