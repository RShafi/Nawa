"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SYNTAX_SHELL } from "@/components/battle/SyntaxBoard";
import {
  runSuccessFlash,
  SUCCESS_FLASH_ANIMATE,
  SUCCESS_FLASH_TRANSITION,
} from "@/components/lesson/successFlash";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import type { InteractiveStep, InteractiveStepOption } from "@/types/curriculum";
import { cn } from "@/lib/utils";

const entrance = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
};

const ARTIFACT_TILE =
  "border border-white/10 bg-gradient-to-b from-slate-800 to-slate-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_8px_20px_rgba(0,0,0,0.5)] backdrop-blur-md";

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export type SentenceBuilderStepProps = {
  step: InteractiveStep;
  onComplete: () => void;
};

export function SentenceBuilderStep({ step, onComplete }: SentenceBuilderStepProps) {
  const { playTap, playSnap, playError, playSuccess } = useSoundEffects();
  const bankOrder = useMemo(() => shuffle(step.options), [step.options]);
  const correctOrder = useMemo(() => step.options.map((o) => o.id), [step.options]);

  const [slots, setSlots] = useState<InteractiveStepOption[]>([]);
  const [checked, setChecked] = useState(false);
  const [passed, setPassed] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);

  const usedIds = new Set(slots.map((s) => s.id));
  const available = bankOrder.filter((o) => !usedIds.has(o.id));

  function addWord(option: InteractiveStepOption) {
    if (passed) return;
    playTap();
    setSlots((prev) => [...prev, option]);
    setChecked(false);
  }

  function removeWord(optionId: string) {
    if (passed) return;
    playTap();
    setSlots((prev) => {
      const index = prev.findIndex((s) => s.id === optionId);
      if (index < 0) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setChecked(false);
  }

  function validate() {
    if (passed || slots.length !== step.options.length) return;
    playTap();
    setChecked(true);

    const ok = slots.every((slot, i) => slot.id === correctOrder[i]);
    if (ok) {
      playSuccess();
      playSnap();
      setPassed(true);
      runSuccessFlash(setSuccessFlash, onComplete);
    } else {
      playError();
    }
  }

  return (
    <LayoutGroup id="sentence-builder">
      <motion.section
        layout
        initial={entrance.initial}
        animate={
          successFlash
            ? { opacity: 1, y: 0, ...SUCCESS_FLASH_ANIMATE }
            : entrance.animate
        }
        transition={successFlash ? SUCCESS_FLASH_TRANSITION : entrance.transition}
        className="mx-auto flex w-full max-w-lg flex-col gap-5 rounded-2xl px-2 py-4"
        aria-labelledby="sentence-builder-title"
      >
        <motion.header layout className="space-y-2 text-center">
        <p className="text-xs font-semibold tracking-[0.18em] text-amber-400/80 uppercase">
          Sentence Builder
        </p>
          <h3 id="sentence-builder-title" className="font-display text-lg font-semibold text-white">
            {step.promptTitle}
          </h3>
          <p className="text-sm text-white/65">{step.promptDescription}</p>
        </motion.header>

        <motion.div layout className="space-y-2">
          <div
            className={cn(
              SYNTAX_SHELL,
              slots.length > 0 && !checked && "border-amber-400/45",
              passed && "border-emerald-400/45 shadow-[inset_0_0_40px_rgba(0,0,0,0.8),0_0_24px_-8px_rgba(16,185,129,0.35)]",
              checked && !passed && "border-rose-400/45 shadow-[inset_0_0_40px_rgba(0,0,0,0.8),0_0_20px_-8px_rgba(244,63,94,0.3)]",
            )}
          >
            <p className="font-display mb-1 shrink-0 text-[10px] tracking-[0.18em] text-amber-200/70 uppercase">
              Spell Chamber
            </p>
            <div
              dir="rtl"
              className="flex h-full min-h-0 w-full flex-1 flex-row flex-wrap items-center justify-center gap-2 p-1 md:gap-3"
            >
              <AnimatePresence mode="popLayout">
                {slots.length === 0 ? (
                  <motion.p
                    key="empty"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-3 text-center text-sm text-amber-100/70"
                  >
                    Tap words below to weave your phrase…
                  </motion.p>
                ) : (
                  slots.map((slot) => (
                    <motion.button
                      key={slot.id}
                      type="button"
                      layout
                      layoutId={`lesson-slot-${slot.id}`}
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.82, y: 8 }}
                      transition={{ type: "spring", stiffness: 420, damping: 28 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={passed}
                      title="Tap to unsocket"
                      onClick={() => removeWord(slot.id)}
                      className={cn(
                        ARTIFACT_TILE,
                        "group relative min-w-[4.5rem] rounded-xl px-3 py-2 hover:border-red-500/80 hover:bg-red-950/20",
                      )}
                    >
                      <span dir="rtl" lang="ar" className="font-arabic block text-xl text-amber-50">
                        {slot.label}
                      </span>
                      <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[9px] text-red-200/0 opacity-0 transition group-hover:text-red-200/90 group-hover:opacity-100">
                        Tap to unsocket
                      </span>
                    </motion.button>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <motion.div layout className="space-y-2">
          <p className="text-center text-[10px] tracking-wide text-white/40 uppercase">Word Bank</p>
          <div className="flex flex-wrap justify-center gap-2">
            {available.map((option) => (
              <motion.button
                key={option.id}
                type="button"
                layout
                layoutId={`lesson-slot-${option.id}`}
                whileTap={{ scale: 0.96 }}
                whileHover={{ y: -4, scale: 1.03 }}
                disabled={passed}
                onClick={() => addWord(option)}
                className={cn(
                  ARTIFACT_TILE,
                  "min-w-[4.5rem] rounded-xl px-3 py-2 transition hover:border-amber-400/80 hover:shadow-[0_0_18px_rgba(245,158,11,0.35)]",
                )}
              >
                <span dir="rtl" lang="ar" className="font-arabic block text-xl text-amber-50">
                  {option.label}
                </span>
                {option.subLabel ? (
                  <span className="mt-0.5 block text-[10px] text-white/45">{option.subLabel}</span>
                ) : null}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          layout
          className={cn(
            "rounded-xl border px-3 py-2 text-center text-sm",
            passed && "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
            checked && !passed && "border-rose-400/40 bg-rose-500/10 text-rose-100",
            !checked && "border-white/10 bg-black/30 text-white/45",
          )}
        >
          {passed
            ? step.explanation
            : checked
              ? "Not quite — check the word order and try again."
              : slots.length === step.options.length
                ? "Ready to check your sentence."
                : `Place ${step.options.length - slots.length} more word(s).`}
        </motion.div>

        <motion.div layout className="w-full">
          <Button
            type="button"
            size="lg"
            disabled={passed || slots.length !== step.options.length}
            className="font-display w-full bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-40"
            onClick={validate}
          >
            Check Sentence
          </Button>
        </motion.div>
      </motion.section>
    </LayoutGroup>
  );
}
