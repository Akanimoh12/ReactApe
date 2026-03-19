import { createPublicClient, http, type Log } from "viem";
import { somniaTestnet } from "./chain";
import { REACT_APE_ABI, REACT_APE_CONTRACT_ADDRESS } from "./contract";

export interface ScoreEvent {
  player: string;
  score: bigint;
  timestamp: bigint;
}

type ScoreEventCallback = (event: ScoreEvent) => void;

const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http("https://dream-rpc.somnia.network"),
});

export async function subscribeToScores(
  onScore: ScoreEventCallback
): Promise<() => void> {
  try {
    const { SDK } = await import("@somnia-chain/reactivity");

    const sdk = new SDK({ public: publicClient });

    const subscription = await sdk.subscribe({
      ethCalls: [],
      onData: (data: unknown) => {
        try {
          const log = data as { args: { player: string; score: bigint; timestamp: bigint } };
          if (log.args) {
            onScore({
              player: log.args.player,
              score: log.args.score,
              timestamp: log.args.timestamp,
            });
          }
        } catch {}
      },
    });

    return () => {
      if (subscription && typeof (subscription as { unsubscribe?: () => void }).unsubscribe === "function") {
        (subscription as { unsubscribe: () => void }).unsubscribe();
      }
    };
  } catch {
    console.info("[reactivity] SDK unavailable, falling back to viem");
    return subscribeViaViem(onScore);
  }
}

function subscribeViaViem(onScore: ScoreEventCallback): () => void {
  const wsClient = createPublicClient({
    chain: somniaTestnet,
    transport: http("https://dream-rpc.somnia.network"),
  });

  const unwatch = wsClient.watchContractEvent({
    address: REACT_APE_CONTRACT_ADDRESS,
    abi: REACT_APE_ABI,
    eventName: "ScoreSubmitted",
    onLogs: (logs: Log[]) => {
      for (const log of logs) {
        const decoded = log as unknown as {
          args: { player: string; score: bigint; timestamp: bigint };
        };
        if (decoded.args) {
          onScore({
            player: decoded.args.player,
            score: decoded.args.score,
            timestamp: decoded.args.timestamp,
          });
        }
      }
    },
  });

  return unwatch;
}

export async function fetchLeaderboard(): Promise<ScoreEvent[]> {
  const data = await publicClient.readContract({
    address: REACT_APE_CONTRACT_ADDRESS,
    abi: REACT_APE_ABI,
    functionName: "getLeaderboard",
  });

  return (data as { player: string; score: bigint; timestamp: bigint }[]).map(
    (entry) => ({
      player: entry.player,
      score: entry.score,
      timestamp: entry.timestamp,
    })
  );
}

export async function fetchPlayerName(address: string): Promise<string> {
  const name = await publicClient.readContract({
    address: REACT_APE_CONTRACT_ADDRESS,
    abi: REACT_APE_ABI,
    functionName: "getPlayerName",
    args: [address as `0x${string}`],
  });

  return name as string;
}
