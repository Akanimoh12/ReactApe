# ReactApe Architecture

System design and data flow for the ReactApe onchain arcade game.

## Overview

ReactApe is a two-layer application: a **Next.js frontend** that runs the game in the browser, and a **Solidity smart contract** on Somnia Testnet that stores scores and maintains a leaderboard. The two layers communicate via **wagmi/viem** for writes and **Somnia Reactivity** for real-time event streaming.

## System Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     BROWSER (Next.js 15)                  │
│                                                          │
│  ┌──────────────┐       ┌──────────────┐                │
│  │  GameArena    │       │  Leaderboard  │               │
│  │              │       │              │◄── ScoreSubmitted│
│  │  game loop   │       │  top 10      │    (push event) │
│  │  score/lives │       │  real-time   │                │
│  └──────┬───────┘       └──────┬───────┘                │
│         │                      │                         │
│         │ submitScore()        │ subscribeToScores()     │
│         │ registerName()       │ fetchLeaderboard()      │
│         │                      │                         │
│  ┌──────▼──────────────────────▼───────┐                │
│  │          wagmi + viem               │                │
│  │   (wallet connection, tx signing)   │                │
│  └──────────────┬──────────────────────┘                │
│                 │                                        │
│  ┌──────────────▼──────────────────────┐                │
│  │    Somnia Reactivity SDK            │                │
│  │    (WebSocket push subscription)    │                │
│  │    Fallback: viem watchContractEvent│                │
│  └──────────────┬──────────────────────┘                │
└─────────────────┼────────────────────────────────────────┘
                  │
        ┌─────────▼─────────┐
        │   Somnia Testnet   │
        │   Chain ID: 50312  │
        │                    │
        │  ReactApeGame.sol  │
        │  ┌──────────────┐  │
        │  │ submitScore() │  │ → emits ScoreSubmitted
        │  │ registerName()│  │ → emits NameRegistered
        │  │ leaderboard[] │  │ → sorted top-10 array
        │  │ personalBest  │  │ → per-player high score
        │  └──────────────┘  │
        └────────────────────┘
```

## Data Flow

### Score Submission

1. Player completes a game round in `GameArena`
2. `page.tsx` calls `submitScore(uint256)` via wagmi `useWriteContract`
3. The contract applies name bonus (+1 if registered), updates personal best, and inserts into the leaderboard
4. Contract emits `ScoreSubmitted(address player, uint256 score, uint256 timestamp)`
5. Somnia Reactivity pushes the event to all subscribed clients via WebSocket
6. `Leaderboard` component receives the event, merges it into local state, re-sorts, and re-renders

### Leaderboard Initialization

1. On mount, `Leaderboard` calls `fetchLeaderboard()` → `getLeaderboard()` view function
2. Enriches each entry with display names via `fetchPlayerName()`
3. Sets up Reactivity subscription for live updates
4. Any new `ScoreSubmitted` events merge into the existing state

### Name Registration

1. `RegisterName` component calls `registerName(string)` via wagmi
2. Contract stores name and sets `hasName[player] = true`
3. All future `submitScore()` calls from that player get +1 bonus

## Reactivity Integration

Somnia Reactivity is a native push-based event delivery system. Instead of the frontend polling for new events, the chain pushes `ScoreSubmitted` events directly to subscribers via WebSocket.

**Primary path:** `@somnia-chain/reactivity` SDK
```
SDK.subscribe() → WebSocket → onData callback → setEntries()
```

**Fallback path:** `viem` `watchContractEvent` (used if SDK is unavailable)
```
publicClient.watchContractEvent() → onLogs callback → setEntries()
```

Both paths are event-driven. The SDK path uses Somnia's native push infrastructure for lower latency (~100ms vs polling's 5-10s).

## Frontend Architecture

### State Management

All game state lives in `page.tsx` and flows down as props:

```
page.tsx (orchestrator)
├── GameArena (gameState, score, lives, timer, handlers)
├── Leaderboard (currentPlayer, latestSubmission)
├── RegisterName (hasName, currentName)
└── Confetti (active)
```

No external state library — React `useState` + `useCallback` + `useEffect`.

### Game Loop

`GameArena` uses `requestAnimationFrame` for smooth item movement:

1. `spawnItem()` runs on a `setInterval` (interval decreases with speed tier)
2. `gameLoop()` runs every frame, updating each item's Y position
3. Click handlers remove items and trigger score/damage effects
4. Timer counts down from 60s; speed tier increases at 30s and 60s

### Wallet Integration

- **RainbowKit** provides the connect button and wallet modal
- **wagmi** hooks (`useAccount`, `useReadContract`, `useWriteContract`) handle all chain interaction
- **viem** is the underlying transport layer

## Smart Contract Architecture

### Storage Layout

```
playerNames:    mapping(address => string)     — display names
hasName:        mapping(address => bool)       — name registration flag
personalBest:   mapping(address => uint256)    — highest score per player
leaderboard:    LeaderboardEntry[10]           — fixed-size sorted array
leaderboardCount: uint256                      — current entry count (≤ 10)
```

### Leaderboard Algorithm

The leaderboard uses insert-sort with bubble-up in a fixed-size array of 10:

1. If player already on board and new score is higher → update in place, bubble up
2. If board not full → append, bubble up
3. If board full and score beats last entry → replace last, bubble up

Worst case: 10 swaps. Gas cost is constant regardless of total players.

## Project Structure

```
ReactApe/
├── README.md                 — Project overview, setup, links
├── ARCHITECTURE.md           — This file
├── contracts/
│   ├── README.md             — Contract documentation
│   ├── foundry.toml          — Forge config (Solc 0.8.24, RPC)
│   ├── src/ReactApeGame.sol  — Main contract
│   ├── script/Deploy.s.sol   — Deployment script
│   └── test/ReactApeGame.t.sol — 10 unit tests
└── frontend/
    ├── README.md             — Frontend documentation
    ├── package.json          — Dependencies
    ├── .env.example          — Environment template
    └── src/
        ├── app/              — Next.js App Router pages
        ├── components/       — React components
        └── lib/              — Chain config, ABI, reactivity
```
