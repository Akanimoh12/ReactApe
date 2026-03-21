# 🕹️ ReactApe Frontend

Welcome to the arcade. This is a Next.js 15, React 19, and Tailwind CSS powerhouse, meticulously designed to look like a punk-zine fever dream and run like a racecar.

### ⚡ Reactivity Puts the "Real" in Real-Time
We got tired of writing `setInterval` loops to poll RPCs for blockchain state. It feels terrible, it destroys RPC quotas, and it ruins the vibe of a fast-paced game. 

So, we integrated `@somnia-chain/reactivity`. 
When our smart contract fires a `ScoreSubmitted` event, the Somnia network immediately pushes that event directly to our app via WebSockets. The global leaderboard updates almost instantaneously across all clients. It is exactly the snappy, instant feedback loop you expect from standard web games, finally brought to Web3. 

### Why It's Fast
- Subscribing to Reactivity endpoints instead of fetching.
- Smart state accumulation logic handling raw incoming points.
- Zero-latency wallet integrations via RainbowKit & wagmi.

### Run it Locally
Want to tweak the fall speed or mess with the retro CRT styling? Let's go:

```bash
npm install
# 1. Copy the example env
cp .env.example .env.local
# 2. Add NEXT_PUBLIC_WC_PROJECT_ID and NEXT_PUBLIC_CONTRACT_ADDRESS to .env.local
# 3. Spin it up
npm run dev
```

Now open [http://localhost:3000](http://localhost:3000) and start catching those apes!
