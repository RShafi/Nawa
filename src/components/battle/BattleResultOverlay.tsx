"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Map, RotateCcw, Swords } from "lucide-react";
import { InlineArabic } from "@/components/ui/InlineArabic";
import { Button } from "@/components/ui/button";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export function BattleResultOverlay({
  outcome,
  sentence,
  meaning,
  hibrAwarded,
  onRematch,
  rematchLabel,
}: {
  outcome: "victory" | "defeat";
  sentence?: string;
  meaning?: string;
  hibrAwarded?: number | null;
  onRematch?: () => void;
  rematchLabel?: string;
}) {
  const { playSuccess, playError } = useSoundEffects();
  const won = outcome === "victory";

  useEffect(() => {
    if (won) playSuccess();
    else playError();
  }, [won, playSuccess, playError]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="absolute inset-0 z-[100] flex items-center justify-center bg-obsidian/80 p-4 backdrop-blur-md"
    >
      <div
        className={
          won
            ? "glass-tablet glow-amber w-full max-w-md border-amber-400/40 px-6 py-8 text-center shadow-[0_0_60px_-12px_rgba(245,158,11,0.55)]"
            : "glass-tablet w-full max-w-md border-rose-400/35 px-6 py-8 text-center shadow-[0_0_50px_-12px_rgba(244,63,94,0.45)]"
        }
      >
        {won ? (
          <>
            <p className="text-2xl font-semibold text-amber-100">The sentence landed</p>
            {sentence ? (
              <InlineArabic className="mt-3 block text-3xl text-amber-50">{sentence}</InlineArabic>
            ) : null}
            {meaning ? <p className="mt-2 text-sm text-white/70">{meaning}</p> : null}
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold text-rose-200">The line broke</p>
            <p className="mt-2 text-sm text-white/60">Learn another word, then try a shorter sentence.</p>
          </>
        )}

        {won && hibrAwarded ? (
          <p className="mt-4 text-sm text-amber-200/80">+{hibrAwarded} score</p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className={
              won
                ? "bg-celestial-amber h-12 font-semibold text-obsidian hover:bg-amber-400"
                : "h-12 bg-emerald-500 font-semibold text-black hover:bg-emerald-400"
            }
          >
            <Link href="/">
              <Map className="size-4" />
              Home
            </Link>
          </Button>
          {onRematch ? (
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-12 border-white/20"
              onClick={onRematch}
            >
              {rematchLabel ? (
                rematchLabel
              ) : won ? (
                <>
                  <Swords className="size-4" />
                  Fight again
                </>
              ) : (
                <>
                  <RotateCcw className="size-4" />
                  Try again
                </>
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
