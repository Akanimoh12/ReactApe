"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import FallingItem from "./FallingItem";

export interface FallingItemData {
  id: number;
  type: "ape" | "bomb";
  x: number;
  y: number;
  speed: number;
}

export type GameState = "idle" | "playing" | "gameover" | "submitting";

interface GameArenaProps {
  gameState: GameState;
  score: number;
  lives: number;
  timer: number;
  speedTier: number;
  comboActive: boolean;
  onApeClick: () => void;
  onBombClick: () => void;
  onPlay: () => void;
  onSubmit: () => void;
  onPlayAgain: () => void;
  isConnected: boolean;
  personalBest: number;
  isSubmitted: boolean;
}

const ARENA_W = 700;
const ARENA_H = 500;
const ITEM_SIZE = 72;
const BASE_SPEED = 2.5;
const BASE_SPAWN_INTERVAL = 450;
const BOMB_CHANCE = 0.28;

export default function GameArena({
  gameState,
  score,
  lives,
  timer,
  speedTier,
  comboActive,
  onApeClick,
  onBombClick,
  onPlay,
  onSubmit,
  onPlayAgain,
  isConnected,
  personalBest,
  isSubmitted,
}: GameArenaProps) {
  const [items, setItems] = useState<FallingItemData[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [flashActive, setFlashActive] = useState(false);
  const [scorePop, setScorePop] = useState(false);

  const itemIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTimeRef = useRef<number>(0);

  const speedMultiplier = Math.pow(1.4, speedTier - 1);
  const spawnInterval = BASE_SPAWN_INTERVAL / speedMultiplier;

  const spawnItem = useCallback(() => {
    const isBomb = Math.random() < BOMB_CHANCE;
    const newItem: FallingItemData = {
      id: ++itemIdRef.current,
      type: isBomb ? "bomb" : "ape",
      x: Math.random() * (ARENA_W - ITEM_SIZE),
      y: -ITEM_SIZE,
      speed: BASE_SPEED * speedMultiplier * (0.8 + Math.random() * 0.4),
    };
    setItems((prev) => [...prev, newItem]);
  }, [speedMultiplier]);

  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 16;
      lastTimeRef.current = timestamp;

      setItems((prev) =>
        prev
          .map((item) => ({
            ...item,
            y: item.y + item.speed * delta,
          }))
          .filter((item) => item.y < ARENA_H + ITEM_SIZE)
      );

      animFrameRef.current = requestAnimationFrame(gameLoop);
    },
    []
  );

  useEffect(() => {
    if (gameState === "playing") {
      setItems([]);
      lastTimeRef.current = 0;
      itemIdRef.current = 0;

      animFrameRef.current = requestAnimationFrame(gameLoop);

      spawnTimerRef.current = setInterval(spawnItem, spawnInterval);

      return () => {
        cancelAnimationFrame(animFrameRef.current);
        if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      };
    } else {
      cancelAnimationFrame(animFrameRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    }
  }, [gameState, gameLoop, spawnItem, spawnInterval]);

  useEffect(() => {
    if (gameState !== "playing") {
      setItems([]);
    }
  }, [gameState]);

  const handleItemClick = useCallback(
    (item: FallingItemData) => {
      if (gameState !== "playing") return;

      setItems((prev) => prev.filter((i) => i.id !== item.id));

      if (item.type === "ape") {
        const pid = ++particleIdRef.current;
        setParticles((prev) => [...prev, { id: pid, x: item.x + ITEM_SIZE / 2, y: item.y + ITEM_SIZE / 2 }]);
        setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== pid)), 500);

        setScorePop(true);
        setTimeout(() => setScorePop(false), 300);

        onApeClick();
      } else {
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 300);
        onBombClick();
      }
    },
    [gameState, onApeClick, onBombClick]
  );

  return (
    <div className="relative flex flex-col items-center justify-center pt-16 md:pt-8 w-full">
      <div className="absolute top-[-10px] md:top-[-20px] left-0 md:left-[-30px] z-50 transform -rotate-3 scale-90 md:scale-100 origin-top-left">
        <div className="absolute inset-0 torn-paper bg-neon-green transform translate-y-2 -translate-x-2" />
        <div className="relative torn-paper bg-panel-black px-6 py-4 riso-texture">
          <span className="font-arcade text-neon-green text-5xl md:text-6xl drop-shadow-[2px_2px_0px_#FF6B00]">
            {String(timer).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="absolute top-[-20px] md:top-[-30px] right-0 md:right-[-30px] z-50 transform rotate-1 scale-90 md:scale-100 origin-top-right">
        <div className="absolute inset-0 torn-paper bg-safety-orange transform translate-y-2 translate-x-2" />
        <div className="relative torn-paper bg-panel-black px-8 py-5 flex flex-col items-center riso-texture h-full">
          <div className="flex flex-col items-center mb-3">
            <span
              className={`font-arcade text-neon-green text-4xl drop-shadow-[2px_2px_0px_#FF6B00] transition-transform ${
                scorePop ? "scale-130" : "scale-100"
              }`}
            >
              {String(score).padStart(3, "0")}
            </span>
            {comboActive && (
              <span className="font-arcade text-safety-orange text-[12px] mt-1 animate-pulse font-bold tracking-wider">
                2x COMBO!
              </span>
            )}
          </div>
          <span className="font-mono text-neon-green text-base mb-2 font-bold drop-shadow-[0_0_8px_#BEFF00]">
            SPEED: {speedTier}x{" "}
          </span>
          <span className="font-mono text-neon-green/80 text-sm mb-3 text-center">
            ({speedTier === 1 ? "Slow" : speedTier === 2 ? "Medium" : "Fast"})
          </span>
          <div className={`flex gap-1 ${flashActive ? "animate-shake" : ""}`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`text-2xl transition-opacity font-arcade text-safety-orange bg-safety-orange/20 rounded-full w-8 h-8 flex items-center justify-center ${
                  i < lives ? "opacity-100 shadow-[0_0_10px_#FF6B00]" : "opacity-20 grayscale"
                }`}
              >
                🦍
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="relative overflow-hidden riso-texture animate-pulse-glow mt-8 bg-dark-bg/90 backdrop-blur-sm mx-auto max-w-full"
        style={{ 
          width: '100%',
          maxWidth: `${ARENA_W}px`, 
          height: ARENA_H,
          border: '4px solid #FF6B00',
          boxShadow: '0 0 20px #FF6B00, inset 0 0 20px #FF6B00',
          borderRadius: '2px'
        }}
      >
        <div className="scanline-overlay" />

        {flashActive && (
          <div className="absolute inset-0 bg-bomb-red/40 z-30 pointer-events-none bomb-flash" />
        )}

        {gameState === "playing" &&
          items.map((item) => (
            <FallingItem key={item.id} item={item} onClick={handleItemClick} />
          ))}

        {particles.map((p) => (
          <div
            key={p.id}
            className="particle-burst"
            style={{ left: p.x, top: p.y }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
        ))}

        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-dark-bg/80">
            <h1 className="font-arcade text-neon-green text-2xl misregister mb-2">
              REACTAPE
            </h1>
            <p className="font-mono text-white/60 text-sm mb-1">
              Catch apes. Dodge bombs. Submit onchain.
            </p>
            {personalBest > 0 && (
              <p className="font-mono text-safety-orange text-xs mb-6">
                Personal Best: {personalBest}
              </p>
            )}
            {isConnected ? (
              <button
                onClick={onPlay}
                className="font-arcade text-dark-bg bg-neon-green px-8 py-4 text-lg
                           hover:bg-white hover:scale-105 transition-all
                           shadow-[0_0_20px_#BEFF00] active:scale-95"
              >
                PLAY
              </button>
            ) : (
              <p className="font-arcade text-safety-orange text-[10px] text-center px-4">
                CONNECT WALLET<br />TO PLAY
              </p>
            )}
          </div>
        )}

        {(gameState === "gameover" || gameState === "submitting") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-dark-bg/85">
            <h2 className="font-arcade text-bomb-red text-3xl animate-glitch mb-4">
              GAME OVER
            </h2>
            <p className="font-arcade text-neon-green text-xl mb-2">
              SCORE: {score}
            </p>
            {isSubmitted && (
              <p className="font-mono text-neon-green text-xs mt-2 animate-pulse">Score submitted onchain!</p>
            )}
            <div className="flex gap-4 mt-6">
              {score > 0 && gameState === "gameover" && !isSubmitted && (
                <button
                  onClick={onSubmit}
                  className="font-arcade text-[10px] text-dark-bg bg-neon-green px-6 py-3
                             hover:bg-white transition-all shadow-[0_0_16px_#BEFF00]
                             active:scale-95"
                >
                  SUBMIT SCORE
                </button>
              )}
              {score === 0 && gameState === "gameover" && (
                <span className="font-mono text-white/40 text-xs">
                  NO SCORE TO SUBMIT
                </span>
              )}
              {gameState === "submitting" && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-neon-green text-xs">
                    Submitting onchain...
                  </span>
                </div>
              )}
              {gameState !== "submitting" && (
                <button
                  onClick={onPlayAgain}
                  className="font-arcade text-[10px] text-white border border-white/30 px-6 py-3
                             hover:border-neon-green hover:text-neon-green transition-all
                             active:scale-95"
                >
                  PLAY AGAIN
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
