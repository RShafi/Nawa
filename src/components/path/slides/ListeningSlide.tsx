"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ListeningInteraction } from "@/data/curriculum";
import { HearButton } from "@/components/path/HearButton";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

export function ListeningSlide({
  data,
  onComplete,
}: {
  data: ListeningInteraction;
  onComplete: () => void;
}) {
  const [choice, setChoice] = useState<string | null>(null);
  const correct = choice === data.answer;
  const { playTap, playError } = useSoundEffects();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-2">
      <HearButton
        text={data.audioText}
        label="Play sound"
        size="lg"
        variant="default"
        className="h-14 bg-astral-cyan font-semibold text-obsidian hover:bg-sky-400"
      />
      <p className="text-center text-sm text-white/50">No Arabic text — trust your ear.</p>

      <div className="grid w-full gap-2 sm:grid-cols-2">
        {data.options.map((opt) => {
          const selected = choice === opt;
          const isAnswer = opt === data.answer;
          return (
            <motion.button
              key={opt}
              type="button"
              whileTap={{ scale: 0.96 }}
              disabled={correct}
              onClick={() => {
                playTap();
                setChoice(opt);
                if (opt === data.answer) onComplete();
                else playError();
              }}
              className={cn(
                "glass-tablet rounded-xl px-4 py-3 text-start text-base transition",
                !selected && "hover:bg-slate-800/70",
                selected && isAnswer && "border-emerald-400/50 bg-emerald-500/15 text-emerald-50",
                selected && !isAnswer && "border-rose-400/50 bg-rose-500/15 text-rose-50",
              )}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
      {choice && !correct ? (
        <p className="text-sm text-white/45">Not that one — play again and try another.</p>
      ) : null}
    </div>
  );
}
