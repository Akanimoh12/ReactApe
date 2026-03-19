# ReactApe Smart Contracts

Foundry project containing the `ReactApeGame` contract — an onchain score registry and top-10 leaderboard for the ReactApe arcade game.

## Contract: `ReactApeGame.sol`

Deployed on **Somnia Testnet** (Chain ID: 50312).

### Functions

| Function | Type | Description |
|---|---|---|
| `registerName(string)` | Write | Register/update a display name (1-32 bytes). Enables +1 score bonus. |
| `submitScore(uint256)` | Write | Submit a game score. Updates personal best and leaderboard. |
| `getLeaderboard()` | View | Returns the top-10 leaderboard entries. |
| `getPlayerName(address)` | View | Returns a player's display name. |
| `personalBest(address)` | View | Returns a player's highest score. |
| `hasName(address)` | View | Whether a player has registered a name. |
| `leaderboardCount()` | View | Number of entries in the leaderboard (≤ 10). |

### Events

| Event | Parameters | Description |
|---|---|---|
| `ScoreSubmitted` | `address indexed player, uint256 score, uint256 timestamp` | Emitted on every score submission (used by Somnia Reactivity) |
| `NameRegistered` | `address indexed player, string name` | Emitted when a player registers/updates their name |

### Design Choices

- **No admin/owner** — fully permissionless, no upgrade path
- **Custom errors** — `ScoreMustBePositive`, `NameTooLong`, `NameCannotBeEmpty` for gas-efficient reverts
- **O(10) leaderboard** — insert-sort with bubble-up, constant gas regardless of total players
- **No reentrancy risk** — no external calls or ETH/token transfers
- **Name bonus** — +1 point per submission if player has registered a name

## Setup

```bash
# Install dependencies
forge install

# Compile
forge build

# Run tests (10 tests)
forge test -vvv
```

## Test Coverage

The test suite (`test/ReactApeGame.t.sol`) covers:

1. Score submission and personal best tracking
2. Name registration and validation
3. Name bonus application (+1)
4. Leaderboard ordering and updates
5. Leaderboard overflow (>10 entries)
6. Player score replacement (higher score only)
7. Error cases (zero score, empty name, long name)

## Deploy

```bash
export PRIVATE_KEY=0xYourPrivateKeyHere

forge script script/Deploy.s.sol:DeployReactApeGame \
  --rpc-url https://dream-rpc.somnia.network \
  --broadcast -vvvv
```

The deployment script reads `PRIVATE_KEY` from the environment. **Never commit your private key.**

## Configuration

`foundry.toml`:
- Solidity 0.8.24
- RPC endpoint: `https://dream-rpc.somnia.network`
- Explorer: `https://somnia-testnet.socialscan.io`
