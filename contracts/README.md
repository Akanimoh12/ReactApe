# 📜 ReactApe Contracts

This is the engine room of ReactApe. No fluff, no bloated state—just pure, lean, gas-optimized onchain logic.

We built `ReactApeGame.sol` (Solidity 0.8.24) to manage high scores, player name registrations, and leaderboard data sorting. But here's the best part: its real job is simply to **emit events.**

### ⚡ The Reactivity Hook
Every time a player logs a new high score, we fire the `ScoreSubmitted` event. That's it. 
Instead of relying on heavy getter functions to refresh data for every single gamer, the **Somnia Reactivity** layer listens for this exact event and pushes it to our Next.js frontend at lightning speed. The contract stays lightweight, and the latency stays magically low.

### Fast Facts
- **Framework:** Foundry ⚡
- **Chain:** Somnia Testnet (50312)
- **Deployed Address:** [`0x6Ff8A142F4909d5ef59C59b28Ccd1184E95F477A`](https://explorer.somnia.network/address/0x6Ff8A142F4909d5ef59C59b28Ccd1184E95F477A)
- **Tests:** 11 passing integration tests verifying score accumulation, combo checks, and leaderboard inserts.

### Setup (For the bold)
If you want to poke at the code or test the logic yourself:
```bash
forge install
forge test -vvv
```
