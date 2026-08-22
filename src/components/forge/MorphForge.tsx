"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import { FORGE_PUZZLES } from "@/data/mockForge";
import { ForgeTimer } from "@/components/forge/ForgeTimer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGamificationStore } from "@/store/useGamificationStore";

function burstConfetti() {
  const common = { particleCount: 55, spread: 55, startVelocity: 35 };
  void confetti({ ...common, angle: 60, origin: { x: 0, y: 1 } });
  void confetti({ ...common, angle: 120, origin: { x: 1, y: 1 } });
}

export function MorphForge({
  onReplay,
  onExitToLobby,
}: {
  onReplay?: () => void;
  onExitToLobby?: () => void;
}) {
  const score = useGamificationStore((s) => s.score);
  const combo = useGamificationStore((s) => s.combo);
  const timeLeft = useGamificationStore((s) => s.timeLeft);
  const isActive = useGamificationStore((s) => s.isActive);
  const lastResult = useGamificationStore((s) => s.lastResult);
  const tick = useGamificationStore((s) => s.tick);
  const submitAnswer = useGamificationStore((s) => s.submitAnswer);
  const endGame = useGamificationStore((s) => s.endGame);
  const clearLastResult = useGamificationStore((s) => s.clearLastResult);

  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [feedbackFlash, setFeedbackFlash] = useState<"correct" | "wrong" | null>(null);

  const puzzle = FORGE_PUZZLES[puzzleIndex % FORGE_PUZZLES.length]!;
  const comboMilestone = combo > 1 && combo % 3 === 0;

  const shuffledOptions = useMemo(() => {
    const seed = puzzle.id.length + puzzleIndex;
    return [...puzzle.options]
      .map((opt, i) => ({ opt, rank: (seed * 17 + i * 13) % 97 }))
      .sort((a, b) => a.rank - b.rank)
      .map((x) => x.opt);
  }, [puzzle, puzzleIndex]);

  useEffect(() => {
    if (!isActive) return;
    const id = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(id);
  }, [isActive, tick]);

  const advance = useCallback(() => {
    setPuzzleIndex((i) => (i + 1) % FORGE_PUZZLES.length);
  }, []);

  function handlePick(pattern: string) {
    if (!isActive || feedbackFlash) return;
    const correct = pattern === puzzle.correctPattern;
    const prevCombo = combo;
    submitAnswer(correct);

    if (correct) {
      setFeedbackFlash("correct");
      const nextCombo = prevCombo + 1;
      if (nextCombo % 5 === 0) burstConfetti();
      window.setTimeout(() => {
        setFeedbackFlash(null);
        clearLastResult();
        advance();
      }, 420);
    } else {
      setFeedbackFlash("wrong");
      window.setTimeout(() => {
        setFeedbackFlash(null);
        clearLastResult();
      }, 450);
    }
  }

  if (!isActive) {
    return (
      <div className="glass-panel glow-forge mx-auto max-w-lg space-y-4 rounded-2xl px-6 py-10 text-center">
        <Zap className="mx-auto size-10 text-orange-300" />
        <h2 className="text-2xl font-semibold text-white">
          {timeLeft === 0 ? "Time’s up" : "Run ended"}
        </h2>
        <p className="text-muted-foreground text-base">
          Final score:{" "}
          <span className="font-mono text-xl font-bold text-orange-200 tabular-nums">{score}</span>
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <motion.div whileTap={{ scale: 0.94 }} whileHover={{ scale: 1.03 }}>
            <Button
              size="lg"
              className="bg-orange-500 text-black hover:bg-orange-400"
              onClick={() => {
                setPuzzleIndex(0);
                setFeedbackFlash(null);
                onReplay?.();
              }}
            >
              Play again
            </Button>
          </motion.div>
          <Button size="lg" variant="outline" onClick={() => onExitToLobby?.()}>
            Back to lobby
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <ForgeTimer seconds={timeLeft} />
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="glass-panel rounded-xl px-3 py-2 text-end">
            <p className="text-[10px] tracking-wide text-white/45 uppercase">Score</p>
            <motion.p
              key={score}
              initial={{ scale: 1.15, color: "#fdba74" }}
              animate={{ scale: 1, color: "#fff" }}
              className="font-mono text-xl font-bold tabular-nums sm:text-2xl"
            >
              {score}
            </motion.p>
          </div>
          <motion.div
            animate={
              comboMilestone
                ? { scale: [1, 1.18, 1], boxShadow: "0 0 28px -4px rgba(249,115,22,0.55)" }
                : { scale: 1 }
            }
            transition={{ type: "spring", stiffness: 380, damping: 16 }}
            className={cn(
              "glass-panel rounded-xl px-3 py-2 text-end",
              combo >= 3 && "border-orange-400/40 bg-orange-500/10",
            )}
          >
            <p className="text-[10px] tracking-wide text-white/45 uppercase">Combo</p>
            <p className="flex items-center justify-end gap-1 font-mono text-xl font-bold tabular-nums sm:text-2xl">
              <motion.span
                key={combo}
                initial={{ y: 10, opacity: 0, scale: 0.7 }}
                animate={{ y: 0, opacity: 1, scale: comboMilestone ? 1.2 : 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
              >
                {combo}x
              </motion.span>
              {combo >= 2 ? <Flame className="size-5 text-orange-400" /> : null}
            </p>
          </motion.div>
        </div>
      </header>

      <div className="relative">
        <div className="ambient-aura" aria-hidden />
        <motion.div
          key={puzzle.id + puzzleIndex}
          animate={
            feedbackFlash === "wrong"
              ? { x: [-10, 10, -8, 8, 0] }
              : feedbackFlash === "correct"
                ? { scale: [1, 1.04, 1] }
                : { x: 0, scale: 1 }
          }
          transition={{ duration: 0.38, type: "spring", stiffness: 400, damping: 22 }}
          className={cn(
            "glass-panel relative z-[1] space-y-5 rounded-2xl p-5 sm:p-7",
            feedbackFlash === "wrong" && "border-red-400/50 bg-red-500/15 glow-forge",
            feedbackFlash === "correct" && "border-emerald-400/50 bg-emerald-500/15 glow-emerald",
            !feedbackFlash && "glow-forge border-orange-400/15",
          )}
        >
          <AnimatePresence>
            {feedbackFlash ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-2xl",
                  feedbackFlash === "correct" ? "bg-emerald-400/10" : "bg-red-500/10",
                )}
              />
            ) : null}
          </AnimatePresence>

          <div className="space-y-2 text-center">
            <p className="text-xs tracking-wide text-white/45 uppercase sm:text-sm">Match the mold</p>
            <p className="text-xl font-semibold leading-snug text-white sm:text-2xl">
              {puzzle.targetMeaning}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3" dir="rtl">
            {puzzle.consonants.map((c) => (
              <motion.span
                key={c}
                whileHover={{ y: -2 }}
                className="font-arabic flex size-14 items-center justify-center rounded-xl border border-orange-400/35 bg-orange-500/15 text-3xl font-semibold leading-loose text-orange-50 sm:size-16 sm:text-4xl"
              >
                {c}
              </motion.span>
            ))}
          </div>
          <p className="text-center text-sm text-white/50">
            Root {puzzle.letters} · pick the pattern
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {shuffledOptions.map((opt) => (
              <motion.div key={opt} whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.04 }}>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={Boolean(feedbackFlash)}
                  onClick={() => handlePick(opt)}
                  className="font-arabic h-14 w-full border-white/12 bg-white/4 text-xl leading-loose hover:border-orange-400/40 hover:bg-orange-500/10 sm:h-16 sm:text-2xl"
                >
                  <span dir="rtl" lang="ar">
                    {opt}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center">
        <Button type="button" variant="ghost" size="sm" onClick={() => endGame()}>
          End run
        </Button>
      </div>

      <AnimatePresence>
        {lastResult === "correct" ? (
          <motion.p
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm font-medium text-emerald-400"
          >
            Hit!
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
