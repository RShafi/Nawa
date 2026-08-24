"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { MatchingInteraction } from "@/data/curriculum";
import { ArabicText } from "@/components/ui/ArabicText";
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

export function MatchingSlide({
  data,
  onComplete,
}: {
  data: MatchingInteraction;
  onComplete: () => void;
}) {
  const left = data.pairs;
  const right = useMemo(
    () => shuffle(data.pairs.map((p) => ({ id: p.id, english: p.english }))),
    [data.pairs],
  );
  const { playTap, playSnap, playError } = useSoundEffects();

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);

  function pickLeft(id: string) {
    if (matched.has(id)) return;
    playTap();
    setSelectedLeft(id);
    setWrong(null);
  }

  function pickRight(id: string) {
    if (matched.has(id) || !selectedLeft) return;
    if (selectedLeft === id) {
      playSnap();
      const next = new Set(matched);
      next.add(id);
      setMatched(next);
      setSelectedLeft(null);
      setWrong(null);
      if (next.size === data.pairs.length) onComplete();
    } else {
      playError();
      setWrong(id);
      window.setTimeout(() => setWrong(null), 500);
      setSelectedLeft(null);
    }
  }

  return (
    <div className="mx-auto grid max-w-lg grid-cols-2 gap-3 py-2">
      <div className="space-y-2">
        <p className="text-center text-[10px] tracking-wide text-white/40 uppercase">Arabic</p>
        {left.map((p) => (
          <motion.button
            key={p.id}
            type="button"
            whileTap={{ scale: 0.96 }}
            disabled={matched.has(p.id)}
            onClick={() => pickLeft(p.id)}
            className={cn(
              "glass-tablet flex w-full items-center justify-center px-2 py-3 transition",
              matched.has(p.id) && "border-emerald-400/40 bg-emerald-500/10 opacity-60",
              selectedLeft === p.id && "border-amber-400/60 bg-amber-500/15",
            )}
          >
            <ArabicText forceFull size="md" className="text-amber-50">
              {p.arabic}
            </ArabicText>
          </motion.button>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-center text-[10px] tracking-wide text-white/40 uppercase">English</p>
        {right.map((p) => (
          <motion.button
            key={p.id}
            type="button"
            whileTap={{ scale: 0.96 }}
            disabled={matched.has(p.id)}
            onClick={() => pickRight(p.id)}
            className={cn(
              "glass-tablet flex w-full items-center justify-center px-2 py-3 text-sm transition",
              matched.has(p.id) && "border-emerald-400/40 bg-emerald-500/10 opacity-60",
              wrong === p.id && "border-rose-400/50 bg-rose-500/15",
            )}
          >
            {p.english}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
