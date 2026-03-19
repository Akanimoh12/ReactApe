"use client";

import { type FallingItemData } from "./GameArena";

interface FallingItemProps {
  item: FallingItemData;
  onClick: (item: FallingItemData) => void;
}

export default function FallingItem({ item, onClick }: FallingItemProps) {
  const isApe = item.type === "ape";

  return (
    <button
      onClick={() => onClick(item)}
      className={`
        absolute w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center
        cursor-pointer select-none transition-transform active:scale-90
        font-arcade text-[10px] leading-tight text-center z-20 
        ${
          isApe
            ? "bg-neon-green text-dark-bg border-[4px] border-dark-bg shadow-[-3px_3px_0px_rgba(0,0,0,1)] hover:scale-105"
            : "bg-panel-black text-safety-orange border-[3px] border-safety-orange shadow-[-3px_3px_0px_rgba(255,107,0,0.5)] hover:bg-black"
        }
      `}
      style={{
        left: `${item.x}px`,
        top: `${item.y}px`,
        // Halftone texture overlay via radial dot pattern
        backgroundImage: isApe
          ? "radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)"
          : "radial-gradient(circle, rgba(255,107,0,0.15) 1px, transparent 1px)",
        backgroundSize: "4px 4px",
      }}
      aria-label={isApe ? "Catch the ape" : "Bomb - avoid!"}
    >
      {isApe ? (
        <span className="flex flex-col items-center gap-[2px]">
          <span className="text-[26px]">🐵</span>
          <span className="font-bold tracking-widest mt-[-4px]">APE</span>
        </span>
      ) : (
        <span className="text-[32px]">💣</span>
      )}
    </button>
  );
}
