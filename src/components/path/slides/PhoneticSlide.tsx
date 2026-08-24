"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { PhoneticInteraction } from "@/data/curriculum";
import { ArabicText } from "@/components/ui/ArabicText";
import { HearButton } from "@/components/path/HearButton";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

export function PhoneticSlide({
  data,
  onComplete,
}: {
  data: PhoneticInteraction;
  onComplete: () => void;
}) {
  const [choice, setChoice] = useState<string | null>(null);
  const correct = choice === data.answerId;
  const { playTap, playError } = useSoundEffects();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-2">
      <HearButton
        text={data.audioText}
        label="Play sound"
        size="lg"
        variant="default"
        className="bg-celestial-amber h-14 font-semibold text-obsidian hover:bg-amber-400"
      />
      {data.hint ? <p className="text-center text-sm text-white/50">{data.hint}</p> : null}

      <div className="grid w-full grid-cols-2 gap-2">
        {data.options.map((opt) => {
          const selected = choice === opt.id;
          const isAnswer = opt.id === data.answerId;
          return (
            <motion.button
              key={opt.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              disabled={correct}
              onClick={() => {
                playTap();
                setChoice(opt.id);
                if (opt.id === data.answerId) onComplete();
                else playError();
              }}
              className={cn(
                "glass-tablet flex flex-col items-center px-3 py-4 transition",
                !selected && "hover:bg-slate-800/70",
                selected && isAnswer && "border-emerald-400/50 bg-emerald-500/15",
                selected && !isAnswer && "border-rose-400/50 bg-rose-500/15",
              )}
            >
              <ArabicText forceFull className="text-amber-50">
                {opt.arabic}
              </ArabicText>
              {opt.label ? (
                <span className="mt-1 text-xs text-white/45">{opt.label}</span>
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
