"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArabicText } from "@/components/common/ArabicText";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";
import { useBattleStore } from "@/store/useBattleStore";
import { generateValidSentencePair } from "@/utils/sentenceGenerator";
import type { WordCard } from "@/data/combatDictionary";

type LocalProps = {
  /** Controlled mode (tutorial) — when set, store is not used for cards/resolve */
  cards: WordCard[];
  active: boolean;
  onResolve: (success: boolean) => void;
  distractors?: WordCard[];
};

type StoreProps = {
  cards?: undefined;
  active?: undefined;
  onResolve?: undefined;
  distractors?: undefined;
};

/**
 * Soft-fail translation quiz after Cast — Critical Strike if correct.
 * Free-play reads pending Syntax Bar cards from the battle store; tutorial passes controlled props.
 */
export function ResonanceCheck(props: LocalProps | StoreProps = {}) {
  const storeState = useBattleStore((s) => s.combatState);
  const pendingCastCards = useBattleStore((s) => s.pendingCastCards);
  const resolveResonance = useBattleStore((s) => s.resolveResonance);
  const hand = useBattleStore((s) => s.hand);
  const { playSuccess, playError, playTap } = useSoundEffects();
  const [picked, setPicked] = useState<string | null>(null);

  const controlled = "cards" in props && props.cards != null && props.onResolve != null;
  const active = controlled ? Boolean(props.active) : storeState === "resonance_check";
  const slottedCards = controlled ? props.cards! : pendingCastCards;
  const distractorPool = controlled ? (props.distractors ?? []) : hand;

  const quiz = useMemo(() => {
    if (!active || slottedCards.length === 0) return null;
    return generateValidSentencePair(slottedCards, distractorPool);
  }, [active, slottedCards, distractorPool]);

  if (!active || !quiz) return null;

  function choose(option: string) {
    if (picked) return;
    playTap();
    setPicked(option);
    const success = option === quiz!.english;
    if (success) playSuccess();
    else playError();
    window.setTimeout(() => {
      setPicked(null);
      if (controlled) props.onResolve!(success);
      else resolveResonance(success);
    }, 280);
  }

  return (
    <div
      className="absolute inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal
      aria-labelledby="resonance-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="w-full max-w-md rounded-2xl border-2 border-amber-500/50 bg-slate-900/95 p-6 shadow-[0_0_50px_-12px_rgba(245,158,11,0.45)]"
      >
        <p
          id="resonance-title"
          className="text-center text-sm font-bold tracking-[0.18em] text-amber-400 uppercase"
        >
          Channel the Meaning
        </p>
        <p className="mt-1 text-center text-xs text-white/50">
          Translate your spell to unlock a Critical Strike
        </p>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/30 px-4 py-5 text-center">
          <ArabicText size="display" forceFull className="battle-arabic text-4xl text-amber-50">
            {quiz.arabic}
          </ArabicText>
        </div>

        {quiz.fallback ? (
          <p className="mt-2 text-center text-[10px] text-white/40">
            Resonance is unstable — match the literal gloss.
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-2">
          {quiz.options.map((opt) => {
            const selected = picked === opt;
            const isCorrect = opt === quiz.english;
            return (
              <button
                key={opt}
                type="button"
                disabled={Boolean(picked)}
                onClick={() => choose(opt)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-start text-sm leading-snug transition",
                  "border-white/15 bg-white/5 text-white/90 hover:border-amber-400/50 hover:bg-amber-500/10",
                  selected && isCorrect && "border-emerald-400/60 bg-emerald-500/15 text-emerald-100",
                  selected && !isCorrect && "border-rose-400/60 bg-rose-500/15 text-rose-100",
                  picked && !selected && "opacity-40",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
