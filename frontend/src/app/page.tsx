"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

import GameArena, { type GameState } from "@/components/GameArena";
import Leaderboard from "@/components/Leaderboard";
import RegisterName from "@/components/RegisterName";
import Confetti from "@/components/Confetti";
import { REACT_APE_ABI, REACT_APE_CONTRACT_ADDRESS } from "@/lib/contract";

const GAME_DURATION = 60;
const COMBO_THRESHOLD = 5;
const COMBO_DURATION = 5000;

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: hasNameOnChain } = useReadContract({
    address: REACT_APE_CONTRACT_ADDRESS,
    abi: REACT_APE_ABI,
    functionName: "hasName",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: playerNameOnChain } = useReadContract({
    address: REACT_APE_CONTRACT_ADDRESS,
    abi: REACT_APE_ABI,
    functionName: "playerNames",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: personalBestOnChain } = useReadContract({
    address: REACT_APE_CONTRACT_ADDRESS,
    abi: REACT_APE_ABI,
    functionName: "personalBest",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const {
    writeContract: submitScoreTx,
    data: submitTxHash,
    isPending: isSubmitPending,
  } = useWriteContract();

  const { isLoading: isSubmitConfirming, isSuccess: isSubmitSuccess } =
    useWaitForTransactionReceipt({ hash: submitTxHash });

  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timer, setTimer] = useState(GAME_DURATION);
  const [speedTier, setSpeedTier] = useState(1);
  const [comboCount, setComboCount] = useState(0);
  const [comboActive, setComboActive] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [registeredName, setRegisteredName] = useState("");
  const [latestSubmission, setLatestSubmission] = useState<{
    player: string;
    score: number;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (playerNameOnChain && typeof playerNameOnChain === "string") {
      setRegisteredName(playerNameOnChain);
    }
  }, [playerNameOnChain]);

  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            setGameState("gameover");
            return 0;
          }
          const elapsed = GAME_DURATION - next;
          if (elapsed >= 60) setSpeedTier(3);
          else if (elapsed >= 30) setSpeedTier(2);
          else setSpeedTier(1);

          return next;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState]);

  useEffect(() => {
    if (lives <= 0 && gameState === "playing") {
      setGameState("gameover");
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [lives, gameState]);

  useEffect(() => {
    if (isSubmitSuccess && gameState === "submitting") {
      setShowConfetti(true);
      setScoreSubmitted(true);
      setLatestSubmission({
        player: address ?? "",
        score,
      });
      setGameState("gameover");
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isSubmitSuccess, gameState, address, score]);

  const handlePlay = useCallback(() => {
    setScore(0);
    setLives(3);
    setTimer(GAME_DURATION);
    setSpeedTier(1);
    setComboCount(0);
    setComboActive(false);
    setLatestSubmission(null);
    setScoreSubmitted(false);
    setGameState("playing");
  }, []);

  const handleApeClick = useCallback(() => {
    const points = comboActive ? 4 : 2;
    setScore((prev) => prev + points);

    setComboCount((prev) => {
      const next = prev + 1;
      if (next >= COMBO_THRESHOLD && !comboActive) {
        setComboActive(true);
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        comboTimerRef.current = setTimeout(() => {
          setComboActive(false);
          setComboCount(0);
        }, COMBO_DURATION);
        return 0;
      }
      return next;
    });
  }, [comboActive]);

  const handleBombClick = useCallback(() => {
    setLives((prev) => Math.max(0, prev - 1));
    setComboCount(0);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!address || score <= 0) return;
    setGameState("submitting");
    submitScoreTx({
      address: REACT_APE_CONTRACT_ADDRESS,
      abi: REACT_APE_ABI,
      functionName: "submitScore",
      args: [BigInt(score)],
    });
  }, [address, score, submitScoreTx]);

  const handlePlayAgain = useCallback(() => {
    handlePlay();
  }, [handlePlay]);

  const handleNameRegistered = useCallback((name: string) => {
    setRegisteredName(name);
  }, []);

  return (
    <main className="min-h-screen bg-black p-4 md:p-8 flex flex-col justify-center relative z-10">
      <Confetti active={showConfetti} />

      <header className="absolute top-4 left-4 right-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <h1 className="font-arcade text-neon-green text-2xl md:text-4xl font-bold misregister drop-shadow-[3px_3px_0_rgba(255,107,0,0.8)] tracking-wider">
            REACTAPE
          </h1>
          {isConnected && (
            <RegisterName
              hasName={!!hasNameOnChain}
              currentName={registeredName}
              onRegistered={handleNameRegistered}
            />
          )}
        </div>
        <div className="ml-auto mr-4 transform hover:scale-105 transition-transform">
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus="address"
          />
        </div>
      </header>

      <div className="flex flex-col xl:flex-row gap-12 max-w-[1240px] w-full mx-auto mt-20 items-center xl:items-start lg:justify-center">
        <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[700px] flex-shrink-0 relative">
          <GameArena
            gameState={gameState}
            score={score}
            lives={lives}
            timer={timer}
            speedTier={speedTier}
            comboActive={comboActive}
            onApeClick={handleApeClick}
            onBombClick={handleBombClick}
            onPlay={handlePlay}
            onSubmit={handleSubmit}
            onPlayAgain={handlePlayAgain}
            isConnected={isConnected}
            personalBest={Number(personalBestOnChain ?? 0)}
            isSubmitted={scoreSubmitted}
          />
        </div>

        <div className="w-full lg:w-[450px] flex-shrink-0 h-[550px]">
          <Leaderboard
            currentPlayer={address}
            latestSubmission={latestSubmission}
          />
        </div>
      </div>
    </main>
  );
}
