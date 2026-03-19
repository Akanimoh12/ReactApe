"use client";

import { useMemo } from "react";

interface ConfettiProps {
  active: boolean;
}

const COLORS = ["#BEFF00", "#FF6B00", "#CC2200", "#ffffff", "#00ff88"];

export default function Confetti({ active }: ConfettiProps) {
  const pieces = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1.5}s`,
      color: COLORS[i % COLORS.length],
      rotation: Math.random() * 360,
      size: 6 + Math.random() * 8,
    }));
  }, [active]);

  if (!active) return null;

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            top: "-10px",
            animationDelay: p.delay,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
