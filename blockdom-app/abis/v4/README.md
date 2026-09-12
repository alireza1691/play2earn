# v4 ABIs — `back-end/src/new`

Generated from the rewritten contracts. The files one level up (`abis/*.json`) still
describe the contracts currently deployed on Sepolia, so **nothing here is wired up
yet**. Swap the imports in `lib/instances.ts` only after redeploying.

Regenerate with:

```bash
cd back-end && forge build
```

`townAbi.json` is **Town and TownWar merged**. Town routes any selector it does not
define to TownWar through a catch-all `fallback`, so one address answers both halves
and a caller needs both ABIs in one file. The artifacts sit in two places, because
only names that collide with the legacy `src/` contracts get namespaced:

```
back-end/out/new/Town.sol/Town.json      <- Town   (collides with src/Town.sol)
back-end/out/Town.sol/TownWar.json       <- TownWar (no collision)
back-end/out/new/LandsV3.sol/Lands.json
back-end/out/PLOT.sol/PLOT.json
```

## What actually breaks in the frontend

Almost nothing. Every Town function the app calls kept its exact signature except one,
and every event the log decoder reads (`Build`, `Upgrade`, `Attack`, and ERC721
`Transfer`) is unchanged — so `lib/utils.ts` needs no edits.

### 1. `getDispatchedArmies` gained one field

```
old  (uint256[] amounts, ..., bool isReturning, uint256 remainedArmybyPercent)
new  (uint256[] amounts, ..., bool isReturning, uint256 remainedArmybyPercent, uint256 departedAt)
```

`departedAt` was appended, not inserted, precisely because
`components/gameComponents/battleLog/ongoingLog.tsx` reads the struct by field name.
Existing accesses keep working. Add `departedAt: BigNumber` to `DispatchedArmy` in
`lib/types.ts` if you want it typed.

### 2. The token was renamed

`BMT` is now `PLOT`: contract `PLOT` in `src/new/PLOT.sol`, `ERC20("Plot War Token", "PLOT")`.
The land NFT went with it — `ERC721("Plot War Lands", "PWL")`, previously `"BML"`.

One Town method changed name with it:

```
old  getBMTbalance(address)
new  getPlotBalance(address)
```

`components/navbar.tsx` already branches on `isV4(deployment)` for this, because the
v3 contracts deployed on Sepolia still answer to the old name.

### 3. Lands is purely additive

Nothing removed, nothing reshaped. `URI()` — the only Lands method the app calls
directly — is untouched.

### 4. Land types

`Lands` now types every parcel. `landType(id)` returns `0` for Town and `1` for Jungle;
`naturalType(id)` is `pure`, so the frontend can colour all 10,000 parcels without a
single chain call. Wild parcels are not mintable — `isForSale(id)` says so — until the
owner calls `setLandType(id, Town)`.

## New surface worth using

| Call | Why |
|---|---|
| `startLand(landId)` | Grants the 400/400 starter goods. Any owner action triggers it automatically, but a "Start" button makes it explicit for new players. |
| `hasStarted(landId)` | Whether that land has drawn its starter pack yet. |
| `quoteBuy(goodIndex, plotAmount)` | Preview a purchase before sending it. |
| `quoteSell(goodIndex, goodsAmount)` | Preview a sale. Worth showing — the pool has slippage now, so the rate is no longer fixed. |
| `getReserves()` | `(plotReserve[2], goodsReserve[2])`, for a market/price panel. |
| `disbandArmy(landId, uint256[6])` | Stand warriors down. Needed in the UI: a returning army is refused if the garrison is full, and this is the only way to make room. |
| `getTotalExistedGood()` | Global food/gold supply. |
| `landType(id)` / `naturalType(id)` / `isForSale(id)` | Colour the map and grey out wild parcels. |
| `isWildLand(id)` | Whether a parcel is a raidable jungle right now. |
| `paused()` | Show a maintenance banner instead of letting transactions fail. |

## Behaviour changes the UI should reflect

- **`getGoodsPrice()` is now a live AMM price** off the pool reserves, not a fixed
  1:1. Opening rate is 1 PLOT = 2 goods. Quote before every trade rather than
  computing client-side.
- **Travel times changed.** Coordinates now decode correctly, so `getDispatchTime`
  returns real distances: a neighbouring land is ~2.5 minutes away, opposite corners
  just under 6 hours. Any hardcoded assumptions about march length are wrong.
- **`joinDispatchedArmy` can revert with `MaxCapacity`** if the garrison filled up
  while the army was away. Surface it with a prompt to disband.
- **Resource buildings take 2 hours to build**, not 6.
- **New events** worth reading for the battle log: `Retreat`, `ArmyReturned`,
  `WarriorLosses`, `BuyGood`, `SellGood`, `LandStarted`, `PoolSync`.

## Addresses

Both contracts sit behind proxies now. Point `lib/blockchainData.ts` at the **proxy**
addresses that `script/new/DeployBlockdom.s.sol` prints, never the implementations.
