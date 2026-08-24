"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Snowflake, Brain, Droplet, Heart, Sparkles, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { Push3DButton } from "./Push3DButton";

type Element = "flame" | "frost" | "mind";

interface Card {
  id: string;
  arabic: string;
  gloss: string;
  cost: number;
  element: Element;
}

const HAND: Card[] = [
  { id: "c1", arabic: "ضَرَبَ", gloss: "strike", cost: 2, element: "flame" },
  { id: "c2", arabic: "نَارٌ", gloss: "fire", cost: 3, element: "flame" },
  { id: "c3", arabic: "بِسَيْفٍ", gloss: "with a sword", cost: 1, element: "mind" },
  { id: "c4", arabic: "قَوِيّ", gloss: "strong", cost: 2, element: "frost" },
  { id: "c5", arabic: "دِرْعٌ", gloss: "shield", cost: 1, element: "frost" },
];

const ELEMENTS: Record<
  Element,
  { icon: typeof Flame; color: string; edge: string; glow: string }
> = {
  flame: {
    icon: Flame,
    color: "#FB923C",
    edge: "rgba(251,146,60,0.6)",
    glow: "rgba(251,146,60,0.4)",
  },
  frost: {
    icon: Snowflake,
    color: "#7DD3FC",
    edge: "rgba(125,211,252,0.6)",
    glow: "rgba(56,189,248,0.4)",
  },
  mind: {
    icon: Brain,
    color: "#C4B5FD",
    edge: "rgba(196,181,253,0.6)",
    glow: "rgba(167,139,250,0.4)",
  },
};

const ENEMY_HP = 0.68;
const PLAYER_HP = 0.82;
const MAX_MANA = 6;

export function ArenaView() {
  const [slots, setSlots] = useState<Card[]>([]);
  const manaUsed = slots.reduce((sum, c) => sum + c.cost, 0);

  function toggleCard(card: Card) {
    setSlots((prev) => {
      if (prev.some((c) => c.id === card.id)) return prev.filter((c) => c.id !== card.id);
      if (manaUsed + card.cost > MAX_MANA) return prev;
      return [...prev, card];
    });
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col lg:max-w-none lg:gap-4 lg:py-1">
      {/* Stage panel: boss + syntax chamber (glassmorphic container on desktop) */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-4 lg:rounded-[1.75rem] lg:border lg:border-[rgba(56,189,248,0.14)] lg:bg-[rgba(15,23,42,0.5)] lg:px-8 lg:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] lg:[backdrop-filter:blur(20px)]">
        {/* Boss zone */}
        <div className="relative flex flex-col items-center gap-3 pt-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-4 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(225,29,72,0.22), transparent 65%)",
              filter: "blur(30px)",
            }}
          />
          <div className="relative z-[1] flex w-full items-center gap-4">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-rose-300"
              style={{
                background: "linear-gradient(160deg, rgba(76,29,45,0.8), rgba(30,41,59,0.8))",
                border: "1px solid rgba(251,113,133,0.4)",
                boxShadow: "0 0 30px -6px rgba(225,29,72,0.5)",
              }}
            >
              <Skull className="h-10 w-10" strokeWidth={1.75} />
            </motion.div>
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-100">
                  {"al-Ghūl · الغُول"}
                </span>
                <span className="text-xs font-semibold text-rose-300">136 / 200</span>
              </div>
              <div
                className="relative h-3 overflow-hidden rounded-full"
                style={{ background: "rgba(148,163,184,0.14)" }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #E11D48, #FB7185)",
                    boxShadow: "0 0 12px rgba(225,29,72,0.6)",
                  }}
                  initial={{ width: "100%" }}
                  animate={{ width: `${ENEMY_HP * 100}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          </div>

          {/* Intent badge */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 12px rgba(251,113,133,0.25)",
                "0 0 22px rgba(251,113,133,0.55)",
                "0 0 12px rgba(251,113,133,0.25)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="relative z-[1] flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-rose-200"
            style={{
              background: "rgba(76,29,45,0.5)",
              border: "1px solid rgba(251,113,133,0.4)",
            }}
          >
            <Flame className="h-4 w-4" />
            Ember Wrath — 20 damage next turn
          </motion.div>
        </div>

        {/* Syntax chamber drop zone */}
        <div className="flex flex-1 flex-col justify-center py-6">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-[0.22em] text-cyan-300/80">
            Syntax Chamber — weave your sentence
          </p>
          <motion.div
            animate={{
              boxShadow: slots.length
                ? [
                    "0 0 24px -6px rgba(56,189,248,0.4)",
                    "0 0 40px -6px rgba(56,189,248,0.6)",
                    "0 0 24px -6px rgba(56,189,248,0.4)",
                  ]
                : "0 0 0 0 rgba(0,0,0,0)",
            }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="relative flex min-h-[104px] items-center justify-center gap-2 rounded-3xl p-3 lg:min-h-[132px]"
            style={{
              border: slots.length
                ? "1.5px solid rgba(56,189,248,0.55)"
                : "1.5px dashed rgba(148,163,184,0.28)",
              background: slots.length
                ? "rgba(56,189,248,0.06)"
                : "rgba(148,163,184,0.03)",
            }}
          >
            <AnimatePresence>
              {slots.length === 0 ? (
                <motion.span key="empty" exit={{ opacity: 0 }} className="text-sm text-slate-500">
                  Tap cards to inscribe them here
                </motion.span>
              ) : (
                slots.map((card) => {
                  const el = ELEMENTS[card.element];
                  return (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ scale: 0.6, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      className="flex flex-col items-center rounded-xl px-3 py-2 text-slate-100"
                      style={{
                        background: "rgba(15,23,42,0.85)",
                        border: `1px solid ${el.edge}`,
                        boxShadow: `0 0 16px -4px ${el.glow}`,
                      }}
                    >
                      <span
                        dir="rtl"
                        lang="ar"
                        className="font-arabic battle-arabic text-xl font-semibold"
                      >
                        {card.arabic}
                      </span>
                      <span className="text-[10px] opacity-70">{card.gloss}</span>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Footer: hand + cast + stats (docked on mobile, below the stage on desktop) */}
      <div className="px-4 pb-2 lg:px-0 lg:pb-0">
        <div className="flex items-end justify-center gap-2 lg:gap-3">
          {HAND.map((card) => {
            const el = ELEMENTS[card.element];
            const ElIcon = el.icon;
            const active = slots.some((c) => c.id === card.id);
            const affordable = active || manaUsed + card.cost <= MAX_MANA;
            return (
              <motion.button
                key={card.id}
                onClick={() => toggleCard(card)}
                whileHover={affordable ? { y: -14, scale: 1.05 } : undefined}
                whileTap={affordable ? { y: -6 } : undefined}
                animate={{ y: active ? -10 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                disabled={!affordable}
                className={cn(
                  "relative flex h-28 w-[62px] flex-col items-center justify-between rounded-xl p-2 text-slate-100 lg:h-32 lg:w-[72px]",
                  !affordable && "opacity-40",
                )}
                style={{
                  background: "linear-gradient(160deg, rgba(30,41,59,0.9), rgba(11,15,25,0.95))",
                  border: active ? `1.5px solid ${el.edge}` : "1px solid rgba(148,163,184,0.16)",
                  boxShadow: active
                    ? `0 0 22px -4px ${el.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`
                    : "0 8px 18px -8px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <span
                  className="flex items-center gap-0.5 self-start text-[11px] font-bold"
                  style={{ color: el.color }}
                >
                  <ElIcon className="h-3 w-3" />
                  {card.cost}
                </span>
                <span
                  dir="rtl"
                  lang="ar"
                  className="font-arabic battle-arabic text-xl font-semibold"
                >
                  {card.arabic}
                </span>
                <span className="text-[9px] leading-none opacity-70">{card.gloss}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Cast + stats */}
        <div className="mt-4 pb-6 lg:pb-0">
          <Push3DButton variant="amber" fullWidth disabled={slots.length === 0} className="text-lg">
            <Sparkles className="h-5 w-5" />
            Weave Sentence
          </Push3DButton>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2">
              <Heart className="h-5 w-5 shrink-0 fill-rose-400 text-rose-400" />
              <div
                className="relative h-2.5 flex-1 overflow-hidden rounded-full"
                style={{ background: "rgba(148,163,184,0.14)" }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${PLAYER_HP * 100}%`,
                    background: "linear-gradient(90deg, #E11D48, #FB7185)",
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-200">41/50</span>
            </div>
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1 font-bold text-cyan-300"
              style={{
                background: "rgba(56,189,248,0.12)",
                border: "1px solid rgba(56,189,248,0.3)",
              }}
            >
              <Droplet className="h-4 w-4 fill-current" />
              <span className="text-sm">
                {MAX_MANA - manaUsed}
                <span className="opacity-60">/{MAX_MANA}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
