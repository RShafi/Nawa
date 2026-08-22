"use client";

import { motion } from "framer-motion";
import { Sprout, TreeDeciduous, Trees } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MasteryLevel } from "@/store/useGamificationStore";

const STAGE_LABEL: Record<MasteryLevel, string> = {
  0: "Seed",
  1: "Sprout",
  2: "Branching",
  3: "Fully Rooted",
};

type RootTreeProps = {
  letters: string;
  masteryLevel: MasteryLevel;
  patternsMastered: number;
  patternsTotal: number;
  gloss?: string;
  selected?: boolean;
  celebrating?: boolean;
  onSelect?: () => void;
};

export function RootTree({
  letters,
  masteryLevel,
  patternsMastered,
  patternsTotal,
  gloss,
  selected,
  celebrating,
  onSelect,
}: RootTreeProps) {
  const pct = Math.round((patternsMastered / Math.max(1, patternsTotal)) * 100);

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      animate={
        celebrating
          ? { scale: [1, 1.1, 1], y: [0, -10, 0] }
          : selected
            ? { y: -5 }
            : { y: 0 }
      }
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={cn(
        "glass-panel group relative flex w-[10rem] flex-col items-center gap-2.5 overflow-hidden rounded-2xl px-3 py-4 text-center sm:w-48 sm:py-5",
        selected && "ring-2 ring-emerald-400/40",
        masteryLevel === 0 && "border-white/8",
        masteryLevel === 1 && "shadow-[inset_0_0_24px_-8px_rgba(163,230,53,0.25)]",
        masteryLevel === 2 && "glow-emerald shadow-[inset_0_0_28px_-6px_rgba(52,211,153,0.3)]",
        masteryLevel === 3 && "shimmer-border glow-amber shadow-[inset_0_0_32px_-4px_rgba(251,191,36,0.28)]",
      )}
    >
      {/* Inner mastery glow */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-60",
          masteryLevel === 0 && "bg-[radial-gradient(circle_at_50%_70%,rgba(255,255,255,0.04),transparent_55%)]",
          masteryLevel === 1 && "bg-[radial-gradient(circle_at_50%_40%,rgba(163,230,53,0.12),transparent_60%)]",
          masteryLevel === 2 && "bg-[radial-gradient(circle_at_50%_35%,rgba(52,211,153,0.16),transparent_65%)]",
          masteryLevel === 3 && "bg-[radial-gradient(circle_at_50%_30%,rgba(251,191,36,0.18),transparent_65%)]",
        )}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-x-5 bottom-2 h-3 rounded-[100%] bg-emerald-950/70 opacity-60"
        aria-hidden
      />

      <TreeGlyph level={masteryLevel} letters={letters} />

      <div className="relative z-[1] w-full space-y-1">
        <p
          className={cn(
            "font-arabic text-xl tracking-wide sm:text-2xl",
            masteryLevel === 0 && "text-white/45",
            masteryLevel === 3 && "text-glow-amber text-amber-100",
            masteryLevel > 0 && masteryLevel < 3 && "text-emerald-50",
          )}
          dir="rtl"
          lang="ar"
        >
          {letters}
        </p>
        {gloss ? (
          <p className="truncate text-xs text-white/65 capitalize sm:text-sm">{gloss}</p>
        ) : null}

        {masteryLevel === 3 ? (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex rounded-full border border-amber-300/40 bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-100 uppercase"
          >
            Fully Rooted
          </motion.span>
        ) : (
          <p className="text-[10px] font-medium tracking-wide text-white/50 uppercase sm:text-xs">
            {STAGE_LABEL[masteryLevel]}
          </p>
        )}

        <div className="mx-auto mt-1 w-full max-w-[7.5rem] space-y-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className={cn(
                "h-full rounded-full",
                masteryLevel === 3 ? "bg-amber-400" : "bg-emerald-400",
              )}
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
          <p className="text-[10px] text-white/45">
            {patternsMastered}/{patternsTotal} patterns
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function TreeGlyph({ level, letters }: { level: MasteryLevel; letters: string }) {
  if (level === 0) {
    return (
      <div className="relative z-[1] flex h-20 items-end justify-center sm:h-24">
        <motion.div
          className="relative flex size-14 items-center justify-center sm:size-16"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span
            className="absolute size-10 rounded-full bg-amber-200/20 blur-md"
            style={{ animation: "seed-pulse 2.2s ease-in-out infinite" }}
            aria-hidden
          />
          <span className="absolute size-3 rounded-full bg-amber-100/80 shadow-[0_0_12px] shadow-amber-200/70" />
          <span
            className="font-arabic absolute bottom-1 text-[10px] tracking-tight text-white/30"
            dir="rtl"
          >
            {letters.replaceAll("-", "")}
          </span>
        </motion.div>
      </div>
    );
  }

  if (level === 1 || level === 2) {
    const Icon = level === 1 ? Sprout : TreeDeciduous;
    const color = level === 1 ? "text-lime-400" : "text-emerald-400";
    return (
      <div className="relative z-[1] flex h-20 items-end justify-center sm:h-24">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="pointer-events-none absolute bottom-8 size-1.5 rounded-full bg-emerald-300/70"
            style={{
              left: `${35 + i * 14}%`,
              animation: `float-particle ${1.8 + i * 0.35}s ease-out ${i * 0.4}s infinite`,
            }}
            aria-hidden
          />
        ))}
        <motion.div
          animate={{ rotate: [-3, 3, -3], scale: [1, 1.04, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "bottom center" }}
        >
          <Icon className={cn("size-14 sm:size-16", color)} strokeWidth={1.35} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative z-[1] flex h-20 items-end justify-center sm:h-24">
      <motion.div
        animate={{
          filter: [
            "drop-shadow(0 0 6px rgba(251,191,36,0.45))",
            "drop-shadow(0 0 18px rgba(251,191,36,0.85))",
            "drop-shadow(0 0 6px rgba(251,191,36,0.45))",
          ],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Trees className="size-14 text-amber-300 sm:size-16" strokeWidth={1.35} />
      </motion.div>
    </div>
  );
}
