# 🦍 ReactApe — Bored Ape Blitz on Somnia

> Catch falling apes, dodge bombs, submit your high score onchain — and watch the leaderboard update instantly thanks to Somnia Reactivity.

![ReactApe Banner](boredape_game.png)

<p align="center">
  <a href="https://react-ape.vercel.app/"><strong>🌐 Play the Game (Live)</strong></a> ·
  <a href="https://www.loom.com/share/7fa87ab3fdba4d998eeb65e9673a22f5"><strong>🎬 Watch the Demo Video</strong></a>
</p>

---

## The Game
**ReactApe** is a retro-arcade Web3 experience built on the **Somnia Testnet**. You have one job: catch the falling Bored Apes and avoid the bombs. The game speeds up, the chaos intensifies, and every point matters. 

But the real magic happens when you finish a round.

## ⚡ Built for Speed: The Reactivity Advantage
Web3 games are notoriously clunky. You submit a transaction, stare at a loading spinner, poll the RPC every 3 seconds, and hope the UI updates in time to keep players engaged. **Not anymore.**

We built ReactApe to showcase the raw speed of **Somnia Reactivity**, a native push-based event system. 
Instead of obsessively polling the blockchain for leaderboard changes, the ReactApe frontend maintains a highly efficient WebSocket connection. The exact millisecond your `ScoreSubmitted` transaction hits the Somnia chain, the event is securely pushed to the browser. 

**The result?** The leaderboard snaps to your new high score in ~100ms. No RPC spam, no delay, just pure arcade dopamine. It feels like a Web2 data center, but it's 100% onchain.

## Smart Contract Details
- **Network:** Somnia Testnet (50312)
- **Contract Address:** [`0x6Ff8A142F4909d5ef59C59b28Ccd1184E95F477A`](https://shannon-explorer.somnia.network/address/0x6Ff8A142F4909d5ef59C59b28Ccd1184E95F477A)

## Dive into the Code
This project is split into two perfectly paired halves. Check out their dedicated readmes for a peek beneath the hood:
- 📜 **[Contracts](/contracts/README.md)**: Lean, gas-optimized Solidity that powers the game logic and emits those juicy reactivity events. 
- 🕹️ **[Frontend](/frontend/README.md)**: A beautifully chaotic, responsive React 19 app that consumes Reactivity streams to keep the UI snappy.

---
*Built with blood, sweat, and a whole lot of pixel art.*
