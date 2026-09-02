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
  maxCombo = 1,
  spellsCast = 1,
  hibrAwarded,
  onRematch,
  rematchLabel,
  pathHref = "/path",
  pathLabel = "Return to Path",
  onMountAudio,
}: {
  outcome: "victory" | "defeat";
  maxCombo?: number;
  spellsCast?: number;
  hibrAwarded?: number | null;
  onRematch?: () => void;
  rematchLabel?: string;
  pathHref?: string;
  pathLabel?: string;
  /** Optional: fade BGM / extra audio when the overlay appears */
  onMountAudio?: () => void;
}) {
  const { playSuccess, playError } = useSoundEffects();
  const won = outcome === "victory";

  useEffect(() => {
    onMountAudio?.();
    if (won) playSuccess();
    else playError();
  }, [won, playSuccess, playError, onMountAudio]);

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
            <p className="text-glow-amber text-4xl font-black tracking-wide text-amber-300 sm:text-5xl">
              VICTORY
            </p>
            <InlineArabic className="mt-2 block text-3xl text-amber-100">انتصار</InlineArabic>
          </>
        ) : (
          <>
            <p className="text-4xl font-black tracking-wide text-rose-300 sm:text-5xl">DEFEAT</p>
            <InlineArabic className="mt-2 block text-3xl text-rose-100/90">هزيمة</InlineArabic>
          </>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-[10px] tracking-wide text-white/45 uppercase">Max Combo</p>
            <p className="mt-1 font-mono text-lg font-bold text-white">{maxCombo} Words</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-[10px] tracking-wide text-white/45 uppercase">Spells Cast</p>
            <p className="mt-1 font-mono text-lg font-bold text-white">{spellsCast}</p>
          </div>
        </div>

        {won && hibrAwarded ? (
          <p className="mt-4 text-sm font-semibold text-amber-200">+{hibrAwarded} Hibr earned</p>
        ) : null}

        {!won ? (
          <p className="mt-4 text-sm text-white/60">
            Forge more Word Cards on the Path, then return stronger.
          </p>
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
            <Link href={pathHref}>
              <Map className="size-4" />
              {pathLabel}
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
