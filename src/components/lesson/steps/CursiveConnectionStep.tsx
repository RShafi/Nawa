"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AmbientParticles } from "@/components/battle/AmbientParticles";
import { Button } from "@/components/ui/button";
import { LoomHudFooterPortal } from "@/components/lesson/LoomHudFooter";
import { LoomStepFrame } from "@/components/lesson/LoomStepFrame";
import { LOOM_STAGE_ARENA } from "@/components/lesson/loomShared";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import {
  assembleCursiveRoot,
  cursivePositionInRoot,
  rootLettersInReadingOrder,
  type CursivePosition,
} from "@/lib/arabic-utils";
import {
  CURSIVE_MORPH_DURATION,
  CursiveMorphNode,
} from "@/components/common/CursiveMorphNode";
import type { ArabicRoot, InteractiveStep } from "@/types/curriculum";
import { cn } from "@/lib/utils";

export type CursiveConnectionStepProps = {
  step: InteractiveStep;
  root: ArabicRoot;
  onComplete: () => void;
  hudLayout?: boolean;
};

type TheaterPhase = "idle" | "gliding" | "locking" | "complete";

const POSITION_LABEL: Record<CursivePosition, string> = {
  isolated: "Isolated",
  initial: "Initial",
  medial: "Medial",
  final: "Final",
};

const STEP_MS = Math.round(CURSIVE_MORPH_DURATION * 1000);
const GLIDE_MS = STEP_MS * 4;
const MORPH_STAGGER_MS = STEP_MS;
const LOCK_MS = STEP_MS;

export function CursiveConnectionStep({
  step,
  root,
  onComplete,
  hudLayout = false,
}: CursiveConnectionStepProps) {
  const { playTap, playSnap, playCast } = useSoundEffects();
  const timersRef = useRef<number[]>([]);

  const readingLetters = useMemo(
    () => rootLettersInReadingOrder(root.letters),
    [root.letters],
  );

  const forgedWord = useMemo(() => assembleCursiveRoot(root.letters), [root.letters]);

  const [phase, setPhase] = useState<TheaterPhase>("idle");
  const [morphedCount, setMorphedCount] = useState(0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
  }, []);

  const startMorphTheater = useCallback(() => {
    if (phase !== "idle") return;
    clearTimers();
    playTap();
    setPhase("gliding");
    setMorphedCount(0);

    readingLetters.forEach((_, index) => {
      schedule(() => setMorphedCount((c) => Math.max(c, index + 1)), STEP_MS + index * MORPH_STAGGER_MS);
    });

    schedule(() => {
      setPhase("locking");
      playCast();
    }, GLIDE_MS);

    schedule(() => {
      setPhase("complete");
      playSnap();
    }, GLIDE_MS + LOCK_MS);
  }, [clearTimers, phase, playCast, playSnap, playTap, readingLetters, schedule]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const morphComplete = phase === "complete";

  const footer = (
    <Button
      type="button"
      size="lg"
      disabled={!morphComplete}
      className="font-serif w-full bg-amber-500 font-semibold text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
      onClick={() => {
        playSnap();
        onComplete();
      }}
    >
      Continue
    </Button>
  );

  const stage = (
    <div className={cn(LOOM_STAGE_ARENA, "relative overflow-hidden")}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.08)_0%,_transparent_65%)]"
      />
      <AmbientParticles count={28} />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-10 px-4">
        {/* Forge Core — letters glide toward this */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400/20 bg-amber-500/5 shadow-[0_0_60px_rgba(245,158,11,0.15)] md:size-44"
          animate={
            phase === "gliding" || phase === "locking"
              ? { scale: [1, 1.12, 1.05], opacity: [0.5, 0.9, 0.7] }
              : { scale: 1, opacity: 0.45 }
          }
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />

        <div className="relative flex h-44 w-full items-center justify-center md:h-52" dir="rtl">
          <AnimatePresence mode="wait">
            {phase === "complete" ? (
              <motion.p
                key="forged-word"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, ease: "easeInOut" }}
                className="font-arabic text-7xl font-bold text-amber-50 md:text-8xl lg:text-9xl"
                style={{ textShadow: "0px 0px 16px rgba(245,158,11,0.45)" }}
              >
                {forgedWord}
              </motion.p>
            ) : (
              <motion.div
                key="floating-letters"
                className={cn(
                  "flex w-full items-center transition-[gap,justify-content] duration-[1200ms] ease-in-out",
                  phase === "idle" ? "justify-end gap-10 md:gap-16" : "justify-center gap-1 md:gap-2",
                )}
                layout
              >
                {readingLetters.map((letter, index) => {
                  const position = cursivePositionInRoot(index, readingLetters.length);
                  const isMorphed = morphedCount > index;
                  const morphPosition: CursivePosition = isMorphed ? position : "isolated";
                  const slideX = isMorphed ? (index === 0 ? -10 : index === 1 ? -5 : 0) : 0;

                  return (
                    <motion.div
                      key={`morph-${letter}-${index}`}
                      layout
                      initial={{ opacity: 0, y: 16, scale: 0.88 }}
                      animate={{
                        opacity: 1,
                        y: phase === "idle" ? [0, -6, 0] : 0,
                      }}
                      transition={{
                        opacity: { duration: 0.45, delay: index * 0.08 },
                        y:
                          phase === "idle"
                            ? { repeat: Infinity, duration: 3.2 + index * 0.4, ease: "easeInOut" }
                            : { duration: STEP_MS / 1000, ease: "easeInOut" },
                      }}
                      className="relative flex flex-col items-center"
                    >
                      <CursiveMorphNode
                        letter={letter}
                        position={morphPosition}
                        size="lg"
                        slideX={slideX}
                      />

                      {phase !== "idle" && isMorphed ? (
                        <motion.span
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-[10px] tracking-[0.14em] text-amber-400/70 uppercase"
                        >
                          {POSITION_LABEL[position]}
                        </motion.span>
                      ) : null}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-4">
          {!morphComplete ? (
            <Button
              type="button"
              size="lg"
              disabled={phase !== "idle"}
              onClick={startMorphTheater}
              className={cn(
                "font-serif gap-2 bg-amber-500 px-8 text-base font-semibold text-slate-950",
                "shadow-[0_0_32px_rgba(245,158,11,0.55)] hover:bg-amber-400",
                "disabled:cursor-wait disabled:bg-amber-500/80 disabled:text-slate-900/70",
              )}
            >
              <Sparkles className="size-5" aria-hidden />
              {phase === "idle" ? "Watch Cursive Morph" : "Morphing…"}
            </Button>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-amber-300/80"
            >
              Letters locked — cursive word forged
            </motion.p>
          )}

          {phase === "idle" ? (
            <p className="text-center text-xs tracking-wide text-slate-500">
              Letters start isolated on the right · they glide left and shape-shift as they meet
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (hudLayout) {
    return (
      <>
        {stage}
        <LoomHudFooterPortal>{footer}</LoomHudFooterPortal>
      </>
    );
  }

  return (
    <LoomStepFrame
      phaseLabel="Cursive Morph Theater"
      step={step}
      titleId="cursive-connection-title"
      footer={footer}
    >
      {stage}
    </LoomStepFrame>
  );
}
