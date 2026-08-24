"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ShapeInteraction } from "@/data/curriculum";
import { ArabicText } from "@/components/ui/ArabicText";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

export function ShapeSlide({
  data,
  onComplete,
}: {
  data: ShapeInteraction;
  onComplete: () => void;
}) {
  const [choice, setChoice] = useState<string | null>(null);
  const correct = choice === data.correctAnswer;
  const { playTap, playError } = useSoundEffects();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-2">
      <p className="text-center text-sm text-white/55">{data.prompt}</p>
      <div className="glass-tablet px-6 py-4">
        <ArabicText forceFull className="text-amber-50">
          {data.displayWord}
        </ArabicText>
      </div>
      {data.explanation && correct ? (
        <p className="text-center text-sm text-emerald-200/80">{data.explanation}</p>
      ) : null}

      <div className="grid w-full grid-cols-2 gap-2">
        {data.options.map((opt) => {
          const selected = choice === opt.arabic;
          const isAnswer = opt.arabic === data.correctAnswer;
          return (
            <motion.button
              key={opt.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              disabled={correct}
              onClick={() => {
                playTap();
                setChoice(opt.arabic);
                if (opt.arabic === data.correctAnswer) onComplete();
                else playError();
              }}
              className={cn(
                "glass-tablet flex flex-col items-center px-3 py-4 transition",
                !selected && "hover:bg-slate-800/70",
                selected && isAnswer && "border-emerald-400/50 bg-emerald-500/15",
                selected && !isAnswer && "border-rose-400/50 bg-rose-500/15",
              )}
            >
              <ArabicText forceFull size="lg" className="text-white">
                {opt.arabic}
              </ArabicText>
              <span className="mt-1 text-[10px] tracking-wide text-white/40 uppercase">
                {opt.form}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
