"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { HelpCircle, X } from "lucide-react";
import { ArabicText } from "@/components/common/ArabicText";
import { Button } from "@/components/ui/button";
import { TUTORIAL_DIALOGUE } from "@/data/tutorialDeck";
import { cn } from "@/lib/utils";
import { TUTORIAL_STORAGE_KEY, useBattleStore } from "@/store/useBattleStore";

type Step = {
  title: string;
  body: ReactNode;
  cta: string;
};

const STEPS: Step[] = [
  {
    title: "1 · Enemy Wards & Intent",
    body: (
      <>
        Look at the glowing intent badge above the enemy and the English Ward locks. The intent
        telegraphs the next strike. Wards are meanings you must counter — forge the matching Arabic
        word to shatter them before that Heavy Strike lands.
      </>
    ),
    cta: "Next — Craft & Cast",
  },
  {
    title: "2 · Craft & Cast",
    body: (
      <>
        <p className="mb-2">{TUTORIAL_DIALOGUE.craftMetaphor}</p>
        <p>
          Tap root <ArabicText className="inline text-emerald-200">د-ر-س</ArabicText> then pattern{" "}
          <ArabicText className="inline text-amber-200">مَفْعَل</ArabicText> to forge{" "}
          <ArabicText className="inline text-amber-100">مَدْرَسَة</ArabicText> (a place of learning).
          Cast it to break the ward “A place of learning.”
        </p>
      </>
    ),
    cta: "I’ll forge it",
  },
  {
    title: "3 · Stagger Phase",
    body: (
      <>
        When every Ward falls, the enemy staggers. Forge an aggressive Form I strike — tap{" "}
        <ArabicText className="inline text-emerald-200">ض-ر-ب</ArabicText> +{" "}
        <ArabicText className="inline text-amber-200">فَعَلَ</ArabicText> for{" "}
        <ArabicText className="inline text-amber-100">ضَرَبَ</ArabicText> — and deal critical damage
        while they’re exposed.
      </>
    ),
    cta: "Next — Tafsīr",
  },
  {
    title: "4 · Tafsīr safety valve",
    body: (
      <>
        Mastery 3 cards hide English. Tap the Eye (Tafsīr) if you forget — you’ll see the meaning,
        but that root deals <span className="font-semibold text-amber-200">half damage</span> for
        the rest of the battle. A fair trade when you’re stuck.
      </>
    ),
    cta: "Got it — fight!",
  },
];

export function TutorialOverlay() {
  const tutorialMode = useBattleStore((s) => s.tutorialMode);
  const tutorialStep = useBattleStore((s) => s.tutorialStep);
  const advanceTutorial = useBattleStore((s) => s.advanceTutorial);
  const skipTutorial = useBattleStore((s) => s.skipTutorial);

  if (!tutorialMode) return null;

  const step = STEPS[Math.min(tutorialStep, STEPS.length - 1)]!;
  const isLast = tutorialStep >= STEPS.length - 1;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-black/55" aria-hidden />
      <motion.div
        key={tutorialStep}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto relative z-10 w-full max-w-md rounded-2xl border border-amber-400/30 bg-[#12141c] p-5 shadow-2xl"
        role="dialog"
        aria-labelledby="arena-tutorial-title"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <p
            id="arena-tutorial-title"
            className="text-sm font-semibold tracking-wide text-amber-200 uppercase"
          >
            {step.title}
          </p>
          <button
            type="button"
            onClick={() => skipTutorial()}
            className="rounded-lg p-1 text-white/40 hover:bg-white/5 hover:text-white"
            aria-label="Skip tutorial"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-2 text-sm leading-relaxed text-white/75">{step.body}</div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-1.5 rounded-full",
                  i === tutorialStep ? "bg-amber-400" : "bg-white/20",
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-white/50"
              onClick={() => skipTutorial()}
            >
              Skip
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-amber-500 font-semibold text-black hover:bg-amber-400"
              onClick={() => advanceTutorial()}
            >
              {isLast ? "Got it — fight!" : step.cta}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function HowToPlayButton({ className }: { className?: string }) {
  const startTutorial = useBattleStore((s) => s.startTutorial);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("border-white/15 bg-white/5 text-white/80", className)}
      onClick={() => startTutorial()}
    >
      <HelpCircle className="size-3.5" />
      How to play
    </Button>
  );
}

export function resetArenaTutorialProgress() {
  try {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    // Also clear legacy key from earlier builds
    localStorage.removeItem("nawa-ward-tutorial-v1");
  } catch {
    /* ignore */
  }
}

export function useShouldAutoStartTutorial(): boolean {
  const [ready, setReady] = useState(false);
  const [should, setShould] = useState(false);

  useEffect(() => {
    try {
      const done =
        localStorage.getItem(TUTORIAL_STORAGE_KEY) === "1" ||
        localStorage.getItem("nawa-ward-tutorial-v1") === "1";
      setShould(!done);
    } catch {
      setShould(true);
    }
    setReady(true);
  }, []);

  return ready && should;
}

export function markArenaTutorialDone() {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}
