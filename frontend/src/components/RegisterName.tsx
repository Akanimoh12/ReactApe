"use client";

import { useState, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { REACT_APE_ABI, REACT_APE_CONTRACT_ADDRESS } from "@/lib/contract";

interface RegisterNameProps {
  hasName: boolean;
  currentName: string;
  onRegistered: (name: string) => void;
}

export default function RegisterName({ hasName, currentName, onRegistered }: RegisterNameProps) {
  const [name, setName] = useState(currentName);
  const [isOpen, setIsOpen] = useState(false);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleRegister = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 32) return;

    writeContract({
      address: REACT_APE_CONTRACT_ADDRESS,
      abi: REACT_APE_ABI,
      functionName: "registerName",
      args: [trimmed],
    });
  }, [name, writeContract]);

  if (isSuccess && name.trim() && isOpen) {
    onRegistered(name.trim());
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="font-mono text-[10px] text-neon-green/60 hover:text-neon-green
                   border border-neon-green/20 hover:border-neon-green/50
                   px-3 py-1.5 rounded transition-all"
      >
        {hasName ? `✏️ ${currentName}` : "📝 Register Name (+1 bonus)"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        maxLength={32}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter display name"
        className="font-mono text-xs bg-dark-bg border border-neon-green/30
                   text-white px-3 py-1.5 rounded w-40
                   focus:border-neon-green focus:outline-none"
      />
      <button
        onClick={handleRegister}
        disabled={isPending || isConfirming || !name.trim()}
        className="font-mono text-[10px] text-dark-bg bg-neon-green
                   px-3 py-1.5 rounded hover:bg-white transition-all
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending || isConfirming ? "..." : "SAVE"}
      </button>
      <button
        onClick={() => setIsOpen(false)}
        className="font-mono text-[10px] text-white/40 hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
