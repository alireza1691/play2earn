# Pending deploy

What `src/new` has that the live contracts do not.

**Add to this file with every contract change, and clear it when you redeploy.**
A redeploy costs ~0.06 ETH and a fresh set of addresses, so changes are batched
rather than shipped one at a time.

## Pending

Nothing. `src/new` and the deployed v5 are in step as of 2026-09-15.

The faucet and `addLiquidity` went out as a proxy upgrade rather than a fresh
deployment — `script/new/UpgradeTown.s.sol`. Addresses unchanged, the seeded
world intact, 0.042 ETH. Worth preferring whenever the storage layout allows it.

## Live deployments

Two of them, and neither replaces the other. v4 is kept because it holds state
worth comparing against, and the navbar switcher flips between them.

**v5** — Sepolia, 2026-09-11, from current `src/new`. In `deployments/sepolia.json`.

```
PLOT   0x4c28DA43D5716cF45a23DE305C2fC7Bb3312B083
Lands  0x06DA741C2527DC6C6C7E1959294608f6110Dd537   (proxy)
Town   0x0d2234f54a9723B840BF73b02E247Cd0837654B6   (proxy)
war    0xDca39922B49e4706d7AeC2D984eBdFE3C10352fd
```

Upgraded 2026-09-15 to add the faucet and `addLiquidity`. The proxy address is
the one that matters and it has not moved; the war module is a plain contract
and was replaced, so that line changes with every upgrade.

**v4** — Sepolia, 2026-09-06. Predates the PLOT rebrand, land types and wild
lands. Not in `deployments/sepolia.json` any more; its addresses live in
`blockdom-app/lib/blockchainData.ts` and nowhere else.

```
PLOT   0x66aEcbd4450837911dC15F4a02A461DF1d748279
Lands  0x16d54bee75A55C83E9324fCFDfB39cDED3feFc9f   (proxy)
Town   0x1D1eCB549e07A8f654Cd8195cB1400B45e834957   (proxy)
war    0x74962a328f1534dc1b49D058FF9eB3770af3eC8e
```

How to tell what has drifted from source, without guessing:

```bash
cast codesize <address> --rpc-url sepolia   # against `forge build --sizes`
```

Sizes are reported in kB at **1000** bytes, not 1024. Comparing them the other
way makes four identical contracts all look changed.

## Deploying

1. `forge test` — all green.
2. Check the nonce is quiet before broadcasting. The deploy key is shared, and a
   competing sender is what broke three earlier attempts:
   ```bash
   cast nonce 0x39A77B13BA2C5FA2249f7e5a4194582824D58c8E --rpc-url sepolia
   ```
   Sample it twice a few seconds apart; deploy only if it has not moved.
3. `--slow`, always. Parallel submission raced its own nonces.
4. **Simulate before broadcasting.** `forge script` runs the whole script against
   a fork first and broadcasts nothing if any step reverts — so "the script
   failed" and "the chain is half-seeded" are not the same thing, and a failed
   run normally leaves the chain untouched. Drop `--broadcast` to get the
   simulation on its own; it is much cheaper than finding out mid-run.
5. `forge script script/new/SeedGame.s.sol:SeedGame ... --broadcast --slow` to
   fill the world: ten lands, buildings, a clan with a member, and four built and
   garrisoned parcels handed to a rival.
6. Point the frontend at it — `blockdom-app/lib/blockchainData.ts`, the three v5
   addresses plus `v5FromBlock` and `v5Deployed`.
7. Regenerate `blockdom-app/abis/v5/` if the contracts changed. Leave `abis/v4/`
   alone; it describes v4, which stays live.
8. Empty the Pending section above.

## Things that have bitten, in this order

- **Inline field initialisers are invisible behind a proxy.** `uint256 x = 1;`
  runs in the constructor, which the proxy never executes. This made every town
  building free once. State goes in `initialize()`.
- **Jungles cannot be minted.** `mintLand` reverts with `Lands__LandNotForSale`,
  and a revert inside a broadcast unwinds the whole script. Two of the seed
  script's own coordinates were jungles. Check before adding one:
  `keccak256(abi.encode(tokenId)) % 100 < 10` is a jungle.
- **Barracks and training camp need a townhall first**, at least one level above
  themselves, or they revert with `TownhallUpgradeRequired`.
- **The seed script's PLOT budget is not slack.** Every goods purchase comes out
  of one deposit; adding a parcel to arm adds 60k to the bill. `SEED_PLOT_BUDGET`
  carries the arithmetic.
- **Infura refuses transactions from some regions** with `-32003 sender region is
  blocked ... SDN`. Reads work fine, which makes it look like a code problem.
