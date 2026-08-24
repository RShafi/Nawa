"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { TranslationInteraction } from "@/data/curriculum";
import { ArabicText } from "@/components/ui/ArabicText";
import { Button } from "@/components/ui/button";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function TranslationSlide({
  data,
  onComplete,
}: {
  data: TranslationInteraction;
  onComplete: () => void;
}) {
  const bank = useMemo(() => shuffle(data.bank), [data.bank]);
  const [built, setBuilt] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const { playTap, playSnap, playError } = useSoundEffects();

  function tap(word: string) {
    if (done) return;
    playTap();
    const next = [...built, word];
    setBuilt(next);
    if (next.length === data.answer.length) {
      const ok = next.every((w, i) => w === data.answer[i]);
      if (ok) {
        playSnap();
        setDone(true);
        onComplete();
      } else {
        playError();
      }
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 py-2">
      <p className="text-center text-xl font-semibold text-white sm:text-2xl">{data.english}</p>

      <div
        dir="rtl"
        className="rune-chamber flex min-h-[4.5rem] flex-wrap items-center justify-center gap-2 px-3 py-3"
      >
        {built.length === 0 ? (
          <span className="text-sm text-white/35">Your Arabic builds here</span>
        ) : (
          built.map((w, i) => (
            <ArabicText key={`${w}-${i}`} forceFull size="md" className="text-amber-50">
              {w}
            </ArabicText>
          ))
        )}
      </div>

      <div dir="rtl" className="flex flex-wrap justify-center gap-2">
        {bank.map((word) => {
          const used = built.filter((w) => w === word).length;
          const available = data.bank.filter((w) => w === word).length;
          const disabled = done || used >= available;
          return (
            <motion.button
              key={word}
              type="button"
              whileTap={{ scale: 0.96 }}
              disabled={disabled}
              onClick={() => tap(word)}
              className={cn(
                "glass-tablet px-3 py-2 transition hover:bg-slate-800/70",
                disabled && "opacity-30",
              )}
            >
              <ArabicText forceFull size="sm" className="text-white">
                {word}
              </ArabicText>
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-white/45"
          disabled={done || built.length === 0}
          onClick={() => {
            playTap();
            setBuilt([]);
          }}
        >
          Clear
        </Button>
      </div>

      {built.length === data.answer.length && !done ? (
        <p className="text-center text-sm text-rose-200/90">
          Order isn’t right yet — clear and try again.
        </p>
      ) : null}
    </div>
  );
}
