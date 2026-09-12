# deployments

`script/new/DeployBlockdom.s.sol` writes `<network>.json` here after a broadcast:
the proxy addresses the frontend needs, plus the implementations for verification.

Commit the real ones — `sepolia.json`, `base.json` — so `lib/blockchainData.ts`
and the block explorers have a single source of truth. `anvil.json` is ignored.
