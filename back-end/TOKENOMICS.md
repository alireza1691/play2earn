# PLOT — supply and allocation

## The constraint that shapes everything

`PLOT.sol` mints its whole supply once, in the constructor, and **has no mint
function**. There is no inflation, no emissions schedule, and no way to add one
without deploying a new token.

So "play-to-earn rewards" cannot mean minting. Every PLOT a player will ever
earn already exists and sits in some address today. The only question is which.

## Supply

**1,000,000,000 PLOT**, fixed.

| Bucket | Share | PLOT | Where it goes |
|---|---:|---:|---|
| Pool liquidity | 5% | 50,000,000 | Already in `Town` — seeded at deploy |
| Play rewards | 45% | 450,000,000 | Fed into the pool over time (see below) |
| Team | 15% | 150,000,000 | `PlotVesting`, 3-year linear, 1-year cliff |
| Treasury | 15% | 150,000,000 | Multisig, unvested |
| Marketing | 10% | 100,000,000 | Multisig, unvested |
| Sale | 10% | 100,000,000 | Sale contract or multisig |

## How a player actually earns PLOT

Through the pool, and only through the pool. A player sells food or gold with
`sellGood`, and the PLOT they receive comes out of `plotReserve` — the pool's
own holdings. Nothing is created.

This has a consequence worth stating plainly:

> **Total player earnings are capped by what is in the pool.**

At launch that is 50M PLOT split across the two reserves. When a player sells
goods the PLOT side shrinks and the goods side grows, which is also what makes
the price fall as more is sold. The pool cannot be drained — the constant
product guarantees that, and `invariant_poolsAreNeverEmpty` tests it — but it
can get thin enough that selling is barely worth doing.

That is the whole reason the rewards bucket exists.

## How the rewards bucket is delivered

45% is earmarked for players, and neither of the obvious routes works:

- `seedPool` is `poolSeeded`-gated and runs exactly once. It cannot top up.
- `deposit` credits `plotBalance[msg.sender]`, not `plotReserve`. Depositing
  from the treasury would add PLOT the contract *owes to the treasury*, not PLOT
  the pool can pay out — the accounting stays correct, it simply does not do
  what is wanted.

So `Town.addLiquidity` exists:

```solidity
/// Adds PLOT to a reserve without minting and without changing the goods side.
function addLiquidity(uint256 goodIndex, uint256 plotAmount) external onlyOwner;
```

Note what it does to price. Raising `plotReserve` alone raises
`plotReserve/goodsReserve`, so goods get *dearer* in PLOT terms — which is the
same as saying players earn more per unit sold. That is the intent, and also why
it is owner-gated and paced rather than dumped in one transaction.

It lives in `Town` rather than `TownWar` for room: 344 bytes against `Town`'s
~2.9 kB of margin and `TownWar`'s ~0.7 kB. Solvency is unaffected — the PLOT
enters the contract and the reserve in the same transaction, and
`SupplyInvariant` covers it.

### Pacing: demand-driven, proportional to depletion

There is no keeper and there cannot be one, so every top-up is a person running
a transaction. `script/new/TopUpPool.s.sol` decides whether one is needed:

- **Nothing is added while the reserves are healthy.** Money is spent only once
  players have actually drained it, which is the only time it does anything.
- **Each pool is topped back toward its own baseline**, by what it has lost
  rather than by a fixed share. Food and gold drift apart as people trade;
  splitting 50/50 would deepen the pool nobody is using.

Defaults: baseline 25M per pool (what each was seeded with), trigger at half of
that, ceiling of 50M per run so a mistyped baseline cannot empty the bucket in
one go. All three are env overrides.

Run it without `--broadcast` to see the recommendation and nothing else.

The same baseline and trigger drive the depth indicator in the game's Pool
panel, so a player can see for themselves why selling is paying what it is.

## Vesting

`src/new/PlotVesting.sol` holds the team's 150M on a 3-year linear release with
a 1-year cliff. Nothing is claimable for the first year; after that it releases
continuously and `release()` sends whatever has accrued.

It is deliberately dumb: one beneficiary, one schedule, no revocation, no owner.
A revocable schedule is a schedule the team does not really have, and an owner
who can revoke is a key worth attacking. If a second schedule is needed, deploy
a second instance.

The treasury, marketing and sale buckets are **not** vested here. They are
operational money that has to be spendable on a normal timescale; putting them
behind a cliff would mean the project could not pay for anything in its first
year.

## What is decided and what is not

Decided: the split above, and that the team's share vests over three years.

Decided since: the rewards bucket is delivered through `addLiquidity`, paced by
demand and split in proportion to how far each pool has drained.

Not decided, and needed before mainnet:

1. **Treasury custody.** "Multisig" above is an intention, not an address. A
   single hot key holding 40% of supply is the largest risk in this document —
   and on Sepolia today it is the key in `.env`, which is public by design.
   Create a Safe and set `TREASURY` before any deployment that matters.
2. **Sale terms.** 10% is reserved; price, cap and vesting for buyers are open,
   deliberately, until the game has been played enough to value.
