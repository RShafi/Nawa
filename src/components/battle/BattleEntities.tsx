"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flame, Shield, Sparkles, Swords } from "lucide-react";
import { InlineArabic } from "@/components/ui/InlineArabic";
import type { ElementSchool } from "@/data/combatDictionary";
import { cn } from "@/lib/utils";

export type CombatFloat = {
  id: string;
  text: string;
  tone: "damage" | "burn" | "frost" | "mind" | "shield" | "miss" | "critical";
};

export function PlayerHero({
  hp,
  maxHp,
  shield = 0,
  hit = false,
  damageFloat,
  className,
}: {
  hp: number;
  maxHp: number;
  shield?: number;
  hit?: boolean;
  damageFloat?: string | null;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  return (
    <motion.div
      className={cn("relative flex flex-col items-center gap-0.5", className)}
      animate={
        hit
          ? { x: [-10, 10, -10, 10, 0], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }
          : { y: 0 }
      }
      transition={hit ? { duration: 0.35 } : { duration: 0.2 }}
    >
      <AnimatePresence>
        {damageFloat ? (
          <motion.span
            key={damageFloat}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: -28 }}
            exit={{ opacity: 0 }}
            className={cn(
              "pointer-events-none absolute -top-1 z-20 font-mono text-sm font-black",
              damageFloat.includes("BLOCK") ? "text-sky-300" : "text-rose-300",
            )}
          >
            {damageFloat}
          </motion.span>
        ) : null}
      </AnimatePresence>
      <div className="relative p-1">
        <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl" />
        <div
          className={cn(
            "relative flex aspect-square h-[10vh] min-h-[52px] max-h-[80px] items-center justify-center rounded-2xl border bg-gradient-to-b from-slate-800 to-obsidian",
            shield > 0
              ? "border-sky-400/60 shadow-[0_0_28px_-6px_rgba(56,189,248,0.65)]"
              : "border-amber-400/40 shadow-[0_0_28px_-6px_rgba(245,158,11,0.55)]",
          )}
        >
          {shield > 0 ? (
            <Shield className="size-[clamp(1.25rem,3vh,1.75rem)] text-sky-300" />
          ) : (
            <Sparkles className="size-[clamp(1.25rem,3vh,1.75rem)] text-amber-300" />
          )}
        </div>
      </div>
      <p className="text-[clamp(0.6rem,1.3vh,0.75rem)] font-semibold tracking-wide text-amber-100/80 uppercase">
        Apprentice
      </p>
      {shield > 0 ? (
        <p className="font-mono text-[clamp(0.55rem,1.2vh,0.65rem)] font-bold text-sky-300">
          Ward {shield}
        </p>
      ) : null}
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/50 sm:w-20">
        <motion.div className="h-full rounded-full bg-rose-500" animate={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[clamp(0.6rem,1.3vh,0.75rem)] text-white/55">
        {hp}/{maxHp}
      </span>
    </motion.div>
  );
}

export function BossEntity({
  name,
  nameAr,
  hp,
  maxHp,
  shield = 0,
  burn = 0,
  frost = false,
  weakTo,
  hit = false,
  attacking = false,
  floats = [],
  intentLabel,
  large = false,
  className,
}: {
  name: string;
  nameAr: string;
  hp: number;
  maxHp: number;
  shield?: number;
  burn?: number;
  frost?: boolean;
  weakTo?: ElementSchool | null;
  hit?: boolean;
  /** Lunge toward player on enemy turn */
  attacking?: boolean;
  floats?: CombatFloat[];
  intentLabel?: string;
  large?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  return (
    <motion.div
      className={cn(
        "relative flex w-full max-w-sm flex-col items-center gap-1",
        attacking && "z-[75]",
        className,
      )}
      animate={
        attacking
          ? {
              y: [0, 18, 0],
              x: [0, -12, 0],
              filter: [
                "brightness(1) drop-shadow(0 0 0 transparent)",
                "brightness(1.35) drop-shadow(0 0 18px rgba(244,63,94,0.7))",
                "brightness(1) drop-shadow(0 0 0 transparent)",
              ],
            }
          : hit
            ? { x: [-5, 5, -5, 5, 0], scale: [1, 1.04, 0.98, 1] }
            : { y: 0 }
      }
      transition={
        attacking || hit
          ? { duration: 0.45 }
          : { duration: 0.2 }
      }
    >
      <AnimatePresence>
        {floats.map((f) => (
          <motion.span
            key={f.id}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: -36, scale: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "pointer-events-none absolute -top-1 z-20 font-mono font-black",
              f.tone === "critical" &&
                "text-lg text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] sm:text-xl",
              f.tone === "damage" && "text-sm text-rose-300",
              f.tone === "burn" && "text-sm text-orange-300",
              f.tone === "frost" && "text-sm text-cyan-300",
              f.tone === "mind" && "text-sm text-violet-300",
              f.tone === "shield" && "text-sm text-sky-200",
              f.tone === "miss" && "text-sm text-white/50",
            )}
          >
            {f.text}
          </motion.span>
        ))}
      </AnimatePresence>

      {intentLabel ? (
        <div className="glass-tablet flex items-center gap-1.5 border-rose-400/35 px-2 py-0.5 text-[clamp(0.65rem,1.4vh,0.8rem)] font-semibold text-rose-100">
          <Swords className="size-3.5 text-rose-300" />
          {intentLabel}
        </div>
      ) : null}

      <div className="relative p-1">
        <div
          className={cn(
            "absolute -inset-1 rounded-full blur-2xl",
            burn > 0 ? "bg-orange-500/30" : frost ? "bg-cyan-400/25" : "bg-violet-500/25",
          )}
        />
        <div
          className={cn(
            "relative flex aspect-square h-[12vh] min-h-[60px] max-h-[100px] flex-col items-center justify-center rounded-3xl border border-violet-400/45 bg-gradient-to-b from-violet-950/95 to-slate-950 shadow-[0_0_40px_-8px_rgba(139,92,246,0.65)]",
            large && "max-h-[120px]",
          )}
        >
          <span className="text-[clamp(1.5rem,4vh,2.5rem)]" aria-hidden>
            𓂀
          </span>
          <span className="text-[clamp(0.5rem,1vh,0.6rem)] tracking-widest text-violet-200/70 uppercase">
            Djinn
          </span>
        </div>
        {shield > 0 ? (
          <motion.div
            className="absolute inset-0.5 rounded-[1.5rem] border-2 border-cyan-300/60"
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        ) : null}
      </div>

      <div className="text-center">
        <p className="text-[clamp(0.8rem,1.8vh,1.1rem)] font-semibold text-white">{name}</p>
        <InlineArabic className="mt-0.5 block text-[clamp(1rem,2.2vh,1.5rem)] text-amber-100/80">
          {nameAr}
        </InlineArabic>
        {weakTo ? (
          <p className="text-[clamp(0.55rem,1.2vh,0.7rem)] font-medium text-amber-200/80">
            Weak to {weakTo}
          </p>
        ) : null}
      </div>

      <div className="glass-tablet w-full max-w-[14rem] space-y-1 border-white/10 px-3 py-1.5">
        <div className="flex justify-between text-[clamp(0.65rem,1.4vh,0.8rem)] text-white/70">
          <span className="font-medium">HP</span>
          <span className="font-mono tabular-nums">
            {hp}/{maxHp}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/55">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-rose-500"
            animate={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {shield > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[clamp(0.55rem,1.2vh,0.7rem)] font-semibold text-cyan-100">
              <Shield className="size-3" />
              Ward {shield}
            </span>
          ) : null}
          {burn > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-0.5 text-[clamp(0.55rem,1.2vh,0.7rem)] font-semibold text-orange-100">
              <Flame className="size-3" />
              Burn {burn}
            </span>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
