"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { MorphologyInteraction } from "@/data/curriculum";
import { ArabicText } from "@/components/ui/ArabicText";
import { HearButton } from "@/components/path/HearButton";
import { Button } from "@/components/ui/button";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

export function MorphologySlide({
  data,
  onComplete,
}: {
  data: MorphologyInteraction;
  onComplete: () => void;
}) {
  const slotCount = data.patternSlots.length;
  const [filled, setFilled] = useState<(string | null)[]>(() =>
    Array.from({ length: slotCount }, () => null),
  );
  const [poolUsed, setPoolUsed] = useState<Set<string>>(() => new Set());
  const { playTap, playSnap, playError } = useSoundEffects();

  const nextSlot = filled.findIndex((x) => x === null);
  const done = filled.every(Boolean) && filled.length === slotCount;

  const orderCorrect = useMemo(() => {
    if (!done) return false;
    return filled.every((id, i) => id === data.correctOrder[i]);
  }, [done, filled, data.correctOrder]);

  useEffect(() => {
    if (done && orderCorrect) onComplete();
  }, [done, orderCorrect, onComplete]);

  function place(letterId: string) {
    if (done || nextSlot < 0 || poolUsed.has(letterId)) return;
    playTap();
    const nextFilled = [...filled];
    nextFilled[nextSlot] = letterId;
    const nextUsed = new Set(poolUsed).add(letterId);
    setFilled(nextFilled);
    setPoolUsed(nextUsed);

    const allFilled = nextFilled.every(Boolean);
    if (allFilled) {
      const ok = nextFilled.every((id, i) => id === data.correctOrder[i]);
      if (ok) playSnap();
      else playError();
    }
  }

  function clear() {
    playTap();
    setFilled(Array.from({ length: slotCount }, () => null));
    setPoolUsed(new Set());
  }

  const letterById = useMemo(
    () => Object.fromEntries(data.rootLetters.map((l) => [l.id, l])),
    [data.rootLetters],
  );

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 py-2">
      <div className="text-center">
        <p className="text-xs tracking-wide text-white/40 uppercase">{data.patternName}</p>
        <p className="mt-1 font-arabic text-2xl text-white/50" dir="rtl" lang="ar">
          {data.templateLabel}
        </p>
        <p className="mt-2 text-sm text-white/55">
          Tap Thread letters in order into the Frame slots (1st → 2nd → 3rd).
        </p>
      </div>

      <div className="flex flex-wrap items-stretch justify-center gap-3" dir="ltr">
        {data.patternSlots.map((slot, i) => {
          const letterId = filled[i];
          const letter = letterId ? letterById[letterId] : null;
          const isNext = i === nextSlot;
          return (
            <div
              key={slot.id}
              className={cn(
                "flex min-h-[5.5rem] min-w-[4.5rem] flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-3 transition",
                letter
                  ? orderCorrect || !done
                    ? "border-solid border-emerald-400/50 bg-emerald-500/10"
                    : "border-solid border-rose-400/50 bg-rose-500/10"
                  : isNext
                    ? "border-amber-400/60 bg-amber-500/10"
                    : "border-white/20 bg-white/[0.03]",
              )}
            >
              <span className="mb-1 text-[10px] tracking-wide text-white/40 uppercase">
                {slot.label}
              </span>
              {letter ? (
                <ArabicText forceFull size="lg" className="text-white">
                  {letter.arabic}
                </ArabicText>
              ) : (
                <span className="text-2xl text-white/25">□</span>
              )}
            </div>
          );
        })}
      </div>

      <div dir="rtl" className="flex justify-center gap-2">
        {data.rootLetters.map((letter) => {
          const used = poolUsed.has(letter.id);
          return (
            <motion.button
              key={letter.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              disabled={done || used || nextSlot < 0}
              onClick={() => place(letter.id)}
              className={cn(
                "glass-tablet flex size-16 flex-col items-center justify-center transition sm:size-[4.5rem]",
                !used && nextSlot >= 0
                  ? "border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/15"
                  : "border-white/10 bg-white/5",
                used && "opacity-30",
              )}
            >
              <ArabicText forceFull size="lg" className="text-white">
                {letter.arabic}
              </ArabicText>
              {letter.latin ? (
                <span className="text-[10px] text-white/40">{letter.latin}</span>
              ) : null}
            </motion.button>
          );
        })}
      </div>

      {done && orderCorrect ? (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-4 text-center">
          <ArabicText forceFull className="text-amber-50">
            {data.resultArabic}
          </ArabicText>
          <p className="mt-2 text-lg text-white">{data.resultEnglish}</p>
          <div className="mt-3 flex justify-center">
            <HearButton text={data.resultArabic} label="Hear the word" size="sm" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {done && !orderCorrect ? (
            <p className="text-sm text-rose-200/80">Order is off — clear and try again.</p>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-white/40"
            onClick={clear}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
