"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LoomHudFooterPortal } from "@/components/lesson/LoomHudFooter";
import { LoomStepFrame } from "@/components/lesson/LoomStepFrame";
import { LOOM_STAGE_ARENA } from "@/components/lesson/loomShared";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { prefetchArabic, speakArabic } from "@/lib/audio";
import type { ArabicRoot, InteractiveStep } from "@/types/curriculum";
import { getLetterPhoneticHint } from "@/utils/tts";
import { cn } from "@/lib/utils";

export type ObservatoryStepProps = {
  step: InteractiveStep;
  root: ArabicRoot;
  onComplete: () => void;
  hudLayout?: boolean;
};

const REVEAL_AUDIO_DELAY_MS = 120;

export function ObservatoryStep({
  step,
  root,
  onComplete,
  hudLayout = false,
}: ObservatoryStepProps) {
  const { playTap, playSnap } = useSoundEffects();
  const [revealed, setRevealed] = useState<boolean[]>(() => root.letters.map(() => false));
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const playGenRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const onCompleteStable = useCallback(() => onComplete(), [onComplete]);

  useEffect(() => {
    return () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };
  }, []);

  const scheduleTimer = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  const translitParts = useMemo(
    () =>
      root.transliteration
        .split(/[-\s]+/)
        .map((p) => p.trim())
        .filter(Boolean),
    [root.transliteration],
  );

  const allRevealed = revealed.every(Boolean);

  useEffect(() => {
    prefetchArabic([...root.letters]);
  }, [root.letters]);

  const revealOrb = useCallback(
    (index: number, letter: string) => {
      if (revealed[index]) return;

      playTap();
      const gen = ++playGenRef.current;
      setPlayingIndex(index);

      setRevealed((prev) => {
        const next = [...prev];
        next[index] = true;
        if (next.every(Boolean)) {
          scheduleTimer(() => playSnap(), REVEAL_AUDIO_DELAY_MS + 80);
        }
        return next;
      });

      scheduleTimer(() => {
        void speakArabic(letter).finally(() => {
          if (gen === playGenRef.current) setPlayingIndex(null);
        });
      }, REVEAL_AUDIO_DELAY_MS);
    },
    [playSnap, playTap, revealed, scheduleTimer],
  );

  const footer = (
    <Button
      type="button"
      size="lg"
      disabled={!allRevealed}
      className="font-serif w-full bg-amber-500 font-semibold tracking-wide text-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.35)] hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
      onClick={() => {
        playSnap();
        onCompleteStable();
      }}
    >
      Continue
    </Button>
  );

  const stage = (
    <div className={LOOM_STAGE_ARENA}>
      <motion.div
        layout={false}
        className="flex w-full max-w-4xl flex-row-reverse items-center justify-center gap-8 md:gap-12 lg:gap-16"
      >
        {root.letters.map((letter, index) => {
          const isOpen = revealed[index];
          const hint = getLetterPhoneticHint(letter, translitParts[index]);
          const isPlaying = playingIndex === index;

          return (
            <motion.button
              key={`orb-${root.id}-${index}`}
              type="button"
              layout={false}
              onClick={() => revealOrb(index, letter)}
              className="group flex flex-1 flex-col items-center gap-4"
              aria-label={isOpen ? `Letter ${hint.name}` : "Reveal star orb"}
            >
              <motion.span
                layout={false}
                whileTap={{ scale: 0.9 }}
                style={{ willChange: "transform" }}
                className={cn(
                  "relative flex size-28 items-center justify-center overflow-hidden rounded-full md:size-36 lg:size-40",
                  "border border-amber-500/20",
                  "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/40 via-slate-800 to-slate-900",
                  "shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]",
                  isOpen &&
                    "border-amber-400/50 shadow-[0_0_40px_rgba(245,158,11,0.5),inset_0_0_20px_rgba(0,0,0,0.8)]",
                  isPlaying && "ring-2 ring-amber-400/60 ring-offset-2 ring-offset-slate-950",
                )}
                animate={
                  isOpen
                    ? { scale: 1, rotate: 0 }
                    : {
                        scale: [1, 1.06, 1],
                        rotate: [0, 4, -4, 0],
                        opacity: [0.9, 1, 0.9],
                      }
                }
                transition={
                  isOpen
                    ? { type: "spring", stiffness: 320, damping: 24 }
                    : { repeat: Infinity, duration: 4.2 + index * 0.35, ease: "easeInOut" }
                }
              >
                <span
                  className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.12),transparent_55%)]"
                  aria-hidden
                />
                {!isOpen ? (
                  <span className="pointer-events-none absolute inset-4 rounded-full bg-amber-400/10 blur-md" />
                ) : (
                  <motion.span
                    layout={false}
                    initial={{ opacity: 0, scale: 0.45 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 22, duration: 0.3 }}
                    className="font-arabic relative z-10 text-7xl font-bold text-amber-300 drop-shadow-[0_0_28px_rgba(251,191,36,0.85)] md:text-8xl lg:text-9xl"
                  >
                    {letter}
                  </motion.span>
                )}
              </motion.span>

              {isOpen ? (
                <motion.div
                  layout={false}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.28 }}
                  className="text-center"
                  dir="ltr"
                >
                  <p className="text-base font-medium text-amber-100 md:text-lg">
                    Sound: <span className="font-mono">&quot;{hint.sound}&quot;</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Letter: {hint.name}</p>
                </motion.div>
              ) : (
                <span className="text-xs tracking-widest text-slate-600 uppercase" dir="ltr">
                  Tap star
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );

  if (hudLayout) {
    return (
      <LayoutGroup id="observatory">
        {stage}
        <LoomHudFooterPortal>{footer}</LoomHudFooterPortal>
      </LayoutGroup>
    );
  }

  return (
    <LayoutGroup id="observatory">
      <LoomStepFrame phaseLabel="Observatory" step={step} titleId="observatory-title" footer={footer}>
        {stage}
      </LoomStepFrame>
    </LayoutGroup>
  );
}
