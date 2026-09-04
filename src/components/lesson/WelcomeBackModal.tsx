"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type WelcomeBackModalProps = {
  rootLetters: [string, string, string];
  rootMeaning: string;
  currentStep: number;
  totalSteps: number;
  unlockedWords: { arabic: string; english: string }[];
  onContinue: () => void;
};

export function WelcomeBackModal({
  rootLetters,
  rootMeaning,
  currentStep,
  totalSteps,
  unlockedWords,
  onContinue,
}: WelcomeBackModalProps) {
  const progressPct =
    totalSteps > 0 ? Math.min(100, Math.round((currentStep / totalSteps) * 100)) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal
      aria-labelledby="welcome-back-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-900/90 p-6 shadow-2xl"
      >
        <header className="space-y-2 text-center">
          <span className="inline-flex rounded-full border border-amber-400/50 bg-amber-500/15 px-3 py-0.5 text-[10px] font-bold tracking-[0.2em] text-amber-300 uppercase">
            Session Resumed
          </span>
          <h2
            id="welcome-back-title"
            className="text-xl font-semibold tracking-tight text-white"
          >
            Welcome Back to the Crucible
          </h2>
        </header>

        <div className="glass-tablet mt-5 space-y-2 border-amber-500/25 px-4 py-4 text-center">
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic text-3xl font-bold tracking-wide text-amber-400"
            aria-label={`Root letters ${rootLetters.join(" ")}`}
          >
            {rootLetters.join(" ")}
          </p>
          <p className="text-sm text-white/70">{rootMeaning}</p>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Progress checkpoint</span>
            <span className="font-mono tabular-nums text-amber-200/90">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/50">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </div>
        </div>

        {unlockedWords.length > 0 ? (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium tracking-wide text-white/55 uppercase">
              Words unlocked this session
            </p>
            <ul className="max-h-28 space-y-1.5 overflow-y-auto">
              {unlockedWords.map((word) => (
                <li
                  key={`${word.arabic}-${word.english}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-sm"
                >
                  <span dir="rtl" lang="ar" className="font-arabic text-base text-amber-100">
                    {word.arabic}
                  </span>
                  <span className="truncate text-white/65">{word.english}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Button
          type="button"
          size="lg"
          className={cn(
            "mt-6 w-full bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400",
          )}
          onClick={onContinue}
        >
          Resume Lesson
        </Button>
      </motion.div>
    </div>
  );
}
