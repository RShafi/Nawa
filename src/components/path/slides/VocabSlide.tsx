"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { VocabInteraction } from "@/data/curriculum";
import { ArabicText } from "@/components/ui/ArabicText";
import { HearButton } from "@/components/path/HearButton";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

export function VocabSlide({
  data,
  onComplete,
}: {
  data: VocabInteraction;
  onComplete: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const { playTap } = useSoundEffects();

  function flip() {
    if (flipped) return;
    playTap();
    setFlipped(true);
    onComplete();
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={flip}
        className="perspective-1000 w-full max-w-sm"
        aria-label={flipped ? data.english : "Tap to reveal English"}
      >
        <motion.div
          className="relative min-h-[12rem] w-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className={cn(
              "glass-tablet absolute inset-0 flex flex-col items-center justify-center px-6 py-8",
              flipped && "pointer-events-none",
            )}
            style={{ backfaceVisibility: "hidden" }}
          >
            <ArabicText forceFull className="text-amber-50">
              {data.arabic}
            </ArabicText>
            {data.latin ? (
              <p className="mt-2 text-sm text-white/45">{data.latin}</p>
            ) : null}
            <p className="mt-4 text-xs text-white/40">Tap to flip</p>
          </div>
          <div
            className="glass-tablet absolute inset-0 flex flex-col items-center justify-center border-emerald-400/30 bg-emerald-500/10 px-6 py-8"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <ArabicText forceFull size="lg" className="text-amber-50/90">
              {data.arabic}
            </ArabicText>
            <p className="mt-3 text-2xl font-semibold text-white">{data.english}</p>
          </div>
        </motion.div>
      </motion.button>

      {data.notes && data.notes.length > 0 ? (
        <ul className="w-full max-w-sm space-y-1.5 text-center text-sm text-white/50">
          {data.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}

      <HearButton text={data.audioText ?? data.arabic} />
    </div>
  );
}
