# ReactApe Frontend

Next.js 15 single-page arcade game with real-time onchain leaderboard.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 3** — custom risograph/punk-zine design system
- **RainbowKit 2** + **wagmi 2** + **viem 2** — wallet connection & contract interaction
- **@somnia-chain/reactivity** — push-based WebSocket event subscriptions

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_WC_PROJECT_ID=<WalletConnect project ID>
NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed ReactApeGame address>
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── globals.css       — Global styles, CRT scanlines, halftone, animations
│   ├── layout.tsx        — Root HTML layout with font imports
│   ├── providers.tsx     — WagmiProvider + RainbowKit + React Query
│   └── page.tsx          — Main page: game state, wallet, score submission
│
├── components/
│   ├── GameArena.tsx     — Game canvas, falling items, HUD (timer/score/lives)
│   ├── FallingItem.tsx   — Individual ape (🐵) or bomb (💣) element
│   ├── Leaderboard.tsx   — Top-10 leaderboard with real-time reactivity
│   ├── RegisterName.tsx  — Onchain name registration (+1 bonus)
│   └── Confetti.tsx      — Score submission success animation
│
└── lib/
    ├── chain.ts          — Somnia Testnet chain definition (viem)
    ├── wagmi.ts          — wagmi config with RainbowKit & SSR
    ├── contract.ts       — ABI + contract address
    └── reactivity.ts     — Somnia Reactivity SDK + viem fallback
```

## Key Components

### `page.tsx`
Orchestrates all game state: wallet connection, game lifecycle (idle → playing → gameover → submitting), score/lives/timer, combo system, and onchain score submission via wagmi `useWriteContract`.

### `GameArena.tsx`
Renders the play area with `requestAnimationFrame` game loop. Spawns falling items at intervals that decrease as speed tiers increase (1x → 1.4x → 1.96x every 30s). Handles idle screen, game over overlay, and submit/play-again actions.

### `Leaderboard.tsx`
Fetches initial top-10 from `getLeaderboard()` on mount, then subscribes to `ScoreSubmitted` events via Somnia Reactivity for real-time updates. Merges new scores, re-sorts, and highlights the current player.

### `reactivity.ts`
Attempts to use `@somnia-chain/reactivity` SDK for native push-based event delivery. Falls back to `viem` `watchContractEvent` if the SDK is unavailable. Exports `subscribeToScores()`, `fetchLeaderboard()`, and `fetchPlayerName()`.

## Design System

| Token | Value | Usage |
|---|---|---|
| `neon-green` | `#BEFF00` | Scores, highlights, active states |
| `safety-orange` | `#FF6B00` | Headers, borders, underlayers |
| `bomb-red` | `#CC2200` | Bombs, damage, game over |
| `dark-bg` | `#0a0a0a` | Page background |
| `panel-black` | `#111111` | Panel backgrounds |
| `font-arcade` | Press Start 2P | Headings, scores |
| `font-mono` | JetBrains Mono | Data, addresses |

## Game Constants

| Constant | Value | Description |
|---|---|---|
| `GAME_DURATION` | 60s | Round length |
| `COMBO_THRESHOLD` | 5 | Consecutive apes for 2x |
| `COMBO_DURATION` | 5000ms | How long 2x lasts |
| `ARENA_W` | 700px | Arena width |
| `ARENA_H` | 500px | Arena height |
| `ITEM_SIZE` | 72px | Falling item diameter |
| `BASE_SPEED` | 2.0 | Base fall speed |
| `BOMB_CHANCE` | 0.25 | 25% chance of bomb spawn |

## Build

```bash
npm run build
npm start
```
