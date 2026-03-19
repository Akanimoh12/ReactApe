"use client";

import { useEffect, useState, useRef } from "react";
import {
  subscribeToScores,
  fetchLeaderboard,
  fetchPlayerName,
  type ScoreEvent,
} from "@/lib/reactivity";

export interface LeaderboardEntry {
  rank: number;
  player: string;
  displayName: string;
  score: number;
  timestamp: string;
  isNew?: boolean;
}

interface LeaderboardProps {
  currentPlayer?: string;
  latestSubmission?: { player: string; score: number } | null;
}

function truncateAddress(addr: string): string {
  if (addr.length <= 13) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatTimestamp(ts: bigint | number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - Number(ts);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Leaderboard({ currentPlayer, latestSubmission }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLive, setIsLive] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const onChainEntries = await fetchLeaderboard();

        if (cancelled) return;

        if (onChainEntries.length > 0) {
          const enriched: LeaderboardEntry[] = await Promise.all(
            onChainEntries.map(async (e: ScoreEvent, i: number) => {
              let displayName = "";
              try {
                displayName = await fetchPlayerName(e.player);
              } catch {}
              return {
                rank: i + 1,
                player: e.player,
                displayName,
                score: Number(e.score),
                timestamp: formatTimestamp(e.timestamp),
              };
            })
          );
          setEntries(enriched);
        }

        const unsub = await subscribeToScores((event: ScoreEvent) => {
          if (cancelled) return;
          setEntries((prev) => {
            const newEntry: LeaderboardEntry = {
              rank: 0,
              player: event.player,
              displayName: "",
              score: Number(event.score),
              timestamp: formatTimestamp(event.timestamp),
              isNew: true,
            };

            let updated = [...prev];
            const existingIdx = updated.findIndex(
              (e) => e.player.toLowerCase() === event.player.toLowerCase()
            );
            if (existingIdx >= 0) {
              if (Number(event.score) > updated[existingIdx].score) {
                updated[existingIdx] = { ...updated[existingIdx], ...newEntry, displayName: updated[existingIdx].displayName };
              }
            } else {
              updated.push(newEntry);
            }

            updated.sort((a, b) => b.score - a.score);
            updated = updated.slice(0, 10).map((e, i) => ({ ...e, rank: i + 1 }));

            return updated;
          });
        });

        unsubRef.current = unsub;
        setIsLive(true);
      } catch (err) {
        console.warn("[leaderboard] init error:", err);
      }
    }

    init();

    return () => {
      cancelled = true;
      unsubRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (!latestSubmission) return;

    setEntries((prev) => {
      const newEntry: LeaderboardEntry = {
        rank: 0,
        player: latestSubmission.player,
        displayName: "",
        score: latestSubmission.score,
        timestamp: "just now",
        isNew: true,
      };

      let updated = [...prev];
      const existingIdx = updated.findIndex(
        (e) => e.player.toLowerCase() === latestSubmission.player.toLowerCase()
      );
      if (existingIdx >= 0) {
        updated[existingIdx] = { ...updated[existingIdx], ...newEntry, displayName: updated[existingIdx].displayName };
      } else {
        updated.push(newEntry);
      }

      updated.sort((a, b) => b.score - a.score);
      updated = updated.slice(0, 10).map((e, i) => ({ ...e, rank: i + 1 }));
      return updated;
    });
  }, [latestSubmission]);

  return (
    <div className="relative h-full pt-8">
      <div className="absolute inset-0 torn-paper bg-safety-orange translate-y-3 -translate-x-2" />
      <div className="relative torn-paper bg-panel-black p-6 h-full flex flex-col riso-texture z-10 w-full shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-arcade text-safety-orange text-xl misregister">
            TOP APES
          </h2>
          <div className="flex items-center gap-2">
            <span className="font-mono text-neon-green text-sm font-bold flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  isLive ? "bg-neon-green animate-live-pulse shadow-[0_0_8px_#BEFF00]" : "bg-white/30"
                }`}
              />
              LIVE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[2rem_1fr_4rem_5rem] gap-2 mb-3 px-2 border-b border-white/10 pb-2">
          <span className="font-mono text-sm text-white/50 font-bold">#</span>
          <span className="font-mono text-sm text-white/50 font-bold">WALLET</span>
          <span className="font-mono text-sm text-white/50 text-right font-bold">SCORE</span>
          <span className="font-mono text-sm text-white/50 text-right font-bold">TIME</span>
        </div>

        <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
          {entries.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 py-8">
              <span className="text-4xl mb-3">🐵</span>
              <p className="font-arcade text-white/40 text-xs text-center">No scores yet</p>
              <p className="font-mono text-white/25 text-[10px] mt-1">Be the first ape!</p>
            </div>
          )}
          {entries.map((entry) => {
            const isCurrentPlayer =
              currentPlayer &&
              entry.player.toLowerCase() === currentPlayer.toLowerCase();

            return (
              <div
                key={`${entry.player}-${entry.rank}`}
                className={`
                  grid grid-cols-[2rem_1fr_4rem_5rem] gap-2 px-2 py-3 rounded-sm items-center
                  transition-all duration-300 relative
                  ${entry.isNew ? "animate-slide-in-right" : ""}
                  ${
                    isCurrentPlayer
                      ? "bg-neon-green text-dark-bg torn-paper shadow-[0_0_15px_#BEFF00] scale-[1.03] z-20 font-bold"
                      : "hover:bg-white/5 text-white"
                  }
                `}
              >
                <span
                  className={`font-mono text-base ${
                    isCurrentPlayer ? "text-dark-bg font-bold" : entry.rank <= 3 ? "text-safety-orange font-bold drop-shadow-[0_0_4px_#FF6B00]" : "text-white/80 font-medium"
                  }`}
                >
                  {entry.rank}
                </span>
                <span
                  className={`font-mono text-base truncate tracking-wide ${
                    isCurrentPlayer ? "text-dark-bg font-bold" : "text-neon-green font-medium drop-shadow-[0_0_3px_#BEFF00]"
                  }`}
                  title={entry.player}
                >
                  {entry.displayName || truncateAddress(entry.player)}
                  {entry.displayName && (
                    <span className={`${isCurrentPlayer ? "text-dark-bg/60" : "text-neon-green/60"} text-[10px] ml-1 font-bold`}>+1</span>
                  )}
                </span>
                <span className={`font-arcade text-[14px] text-right ${
                  isCurrentPlayer ? "text-dark-bg drop-shadow-none" : "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.6)]"
                }`}>
                  {String(entry.score).padStart(3, '0')}
                </span>
                <span className={`font-mono text-sm text-right ${
                  isCurrentPlayer ? "text-dark-bg font-bold" : "text-white/70 font-medium"
                }`}>
                  {entry.timestamp}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="font-mono text-[9px] text-white/30 text-center">Powered by Somnia Reactivity</p>
        </div>
      </div>
    </div>
  );
}
