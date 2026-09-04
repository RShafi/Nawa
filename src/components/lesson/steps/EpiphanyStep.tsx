"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LoomHudFooterPortal } from "@/components/lesson/LoomHudFooter";
import { LoomStepFrame } from "@/components/lesson/LoomStepFrame";
import { LOOM_STAGE_ARENA } from "@/components/lesson/loomShared";
import { LessonTooltip } from "@/components/ui/InlineArabic";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useLessonStore } from "@/store/useLessonStore";
import type { InteractiveStep, VocabularyItem } from "@/types/curriculum";
import { cn } from "@/lib/utils";

export type EpiphanyStepProps = {
  step: InteractiveStep;
  forgeVocab: VocabularyItem;
  onComplete: () => void;
  hudLayout?: boolean;
};

export function EpiphanyStep({
  step,
  forgeVocab,
  onComplete,
  hudLayout = false,
}: EpiphanyStepProps) {
  const { playTap, playError, playCelestialEtch } = useSoundEffects();
  const unlockVocab = useLessonStore((s) => s.unlockVocab);
  const submitStepAnswer = useLessonStore((s) => s.submitStepAnswer);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [etched, setEtched] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);

  const options = step.options.slice(0, 3);

  function handlePick(optionId: string, isCorrect: boolean) {
    if (etched) return;
    playTap();
    setSelectedId(optionId);

    if (!isCorrect) {
      playError();
      setWrongId(optionId);
      window.setTimeout(() => setWrongId(null), 700);
      return;
    }

    playCelestialEtch();
    unlockVocab(forgeVocab.id);
    submitStepAnswer(step.id, true);
    setEtched(true);
  }

  const footer = useMemo(
    () =>
      etched ? (
        <Button
          type="button"
          size="lg"
          className="font-serif w-full bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400"
          onClick={() => onComplete()}
        >
          Continue
        </Button>
      ) : null,
    [etched, onComplete],
  );

  const stage = (
    <div className={cn(LOOM_STAGE_ARENA, "relative")}>
      <div className="relative flex w-full max-w-xl flex-col items-center gap-6">
        <motion.div
          layout
          className="relative w-full px-4 py-6 text-center"
          animate={
            etched
              ? {
                  boxShadow: [
                    "0 0 0 rgba(245,158,11,0)",
                    "0 0 48px rgba(245,158,11,0.55)",
                    "0 0 24px rgba(245,158,11,0.35)",
                  ],
                }
              : undefined
          }
        >
          <p
            className="font-arabic text-6xl font-bold text-amber-100 md:text-7xl lg:text-8xl"
            style={{ textShadow: "0 0 24px rgba(245,158,11,0.45)" }}
          >
            {forgeVocab.arabic}
          </p>
          <p className="mt-2 font-mono text-base text-amber-300/80 md:text-lg">
            {forgeVocab.transliteration}
          </p>
        </motion.div>

        <div className="grid w-full gap-3">
          {options.map((option) => {
            const isWrong = wrongId === option.id;
            const isChosen = selectedId === option.id;

            return (
              <motion.button
                key={option.id}
                type="button"
                disabled={etched}
                onClick={() => handlePick(option.id, option.isCorrect)}
                whileHover={etched ? undefined : { scale: 1.02 }}
                whileTap={etched ? undefined : { scale: 0.98 }}
                className={cn(
                  "rounded-xl border px-5 py-4 text-start transition md:py-5",
                  etched && option.isCorrect
                    ? "border-amber-400/60 bg-amber-500/15 text-amber-50"
                    : isWrong
                      ? "border-red-400/50 bg-red-950/30 text-red-100"
                      : "border-amber-500/20 bg-slate-900/70 text-slate-100 hover:border-amber-400/45",
                  isChosen && !etched && option.isCorrect && "border-amber-400/50",
                )}
              >
                <span className="font-serif text-lg font-semibold md:text-xl">{option.label}</span>
                {option.subLabel ? (
                  <span className="mt-0.5 block text-sm text-slate-400">{option.subLabel}</span>
                ) : null}
              </motion.button>
            );
          })}
        </div>

        {!etched ? (
          <p className="text-center text-sm text-slate-500">Pick the correct meaning</p>
        ) : step.explanation ? (
          <LessonTooltip text={step.explanation} className="max-w-xl" />
        ) : null}
      </div>
    </div>
  );

  if (hudLayout) {
    return (
      <>
        {stage}
        {footer ? <LoomHudFooterPortal>{footer}</LoomHudFooterPortal> : null}
      </>
    );
  }

  return (
    <LoomStepFrame
      phaseLabel="Epiphany"
      step={step}
      titleId="epiphany-title"
      hideExplanation
      footer={footer}
    >
      {stage}
    </LoomStepFrame>
  );
}
