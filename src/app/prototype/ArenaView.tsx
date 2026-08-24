"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Swords, Droplet, Heart, Sparkles, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { Push3DButton } from "./Push3DButton";

interface Card {
  id: string;
  arabic: string;
  gloss: string;
  cost: number;
}

const HAND: Card[] = [
  { id: "c1", arabic: "ضَرَبَ", gloss: "strike", cost: 2 },
  { id: "c2", arabic: "نَارٌ", gloss: "fire", cost: 3 },
  { id: "c3", arabic: "بِسَيْفٍ", gloss: "with a sword", cost: 1 },
  { id: "c4", arabic: "قَوِيّ", gloss: "strong", cost: 2 },
  { id: "c5", arabic: "دِرْعٌ", gloss: "shield", cost: 1 },
];

const ENEMY_HP = 0.68;
const PLAYER_HP = 0.82;
const MAX_INK = 6;

export function ArenaView() {
  const [slots, setSlots] = useState<Card[]>([]);
  const inkUsed = slots.reduce((sum, c) => sum + c.cost, 0);

  function toggleCard(card: Card) {
    setSlots((prev) => {
      if (prev.some((c) => c.id === card.id)) return prev.filter((c) => c.id !== card.id);
      if (inkUsed + card.cost > MAX_INK) return prev;
      return [...prev, card];
    });
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-4">
      {/* Enemy zone */}
      <div className="relative flex flex-col items-center gap-3 pt-6">
        <div className="ambient-aura" />
        <div className="relative z-[1] flex w-full items-center gap-4">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-destructive/20 text-destructive glow-amber"
          >
            <Skull className="h-10 w-10" strokeWidth={2} />
          </motion.div>
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-black text-foreground">{"al-Ghūl · الغُول"}</span>
              <span className="text-xs font-bold text-destructive">136 / 200</span>
            </div>
            <div className="relative h-3.5 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-destructive"
                initial={{ width: "100%" }}
                animate={{ width: `${ENEMY_HP * 100}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        </div>

        {/* Intent badge */}
        <motion.div
          animate={{ boxShadow: ["0 0 12px oklch(0.68 0.18 25 / 30%)", "0 0 24px oklch(0.68 0.18 25 / 60%)", "0 0 12px oklch(0.68 0.18 25 / 30%)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-[1] flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/15 px-4 py-1.5 text-sm font-bold text-destructive"
        >
          <Swords className="h-4 w-4" />
          Attacking for 20 next turn
        </motion.div>
      </div>

      {/* Syntax bar drop zone */}
      <div className="flex flex-1 flex-col justify-center py-6">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Syntax Bar — build your sentence
        </p>
        <div
          className={cn(
            "relative flex min-h-[104px] items-center justify-center gap-2 rounded-3xl border-2 border-dashed p-3 transition-colors",
            slots.length ? "border-primary/60 bg-primary/5 glow-emerald" : "border-border bg-white/[0.02]",
          )}
        >
          <AnimatePresence>
            {slots.length === 0 ? (
              <motion.span
                key="empty"
                exit={{ opacity: 0 }}
                className="text-sm text-muted-foreground"
              >
                Tap cards to cast a spell
              </motion.span>
            ) : (
              slots.map((card) => (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ scale: 0.6, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  className="flex flex-col items-center rounded-xl bg-primary px-3 py-2 text-primary-foreground"
                >
                  <span dir="rtl" lang="ar" className="font-arabic text-xl font-semibold battle-arabic">
                    {card.arabic}
                  </span>
                  <span className="text-[10px] opacity-80">{card.gloss}</span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Player hand */}
      <div className="pb-2">
        <div className="flex items-end justify-center gap-2">
          {HAND.map((card) => {
            const active = slots.some((c) => c.id === card.id);
            const affordable = active || inkUsed + card.cost <= MAX_INK;
            return (
              <motion.button
                key={card.id}
                onClick={() => toggleCard(card)}
                whileHover={affordable ? { y: -12, scale: 1.05 } : undefined}
                whileTap={affordable ? { y: -4 } : undefined}
                animate={{ y: active ? -8 : 0 }}
                disabled={!affordable}
                className={cn(
                  "relative flex h-28 w-[62px] flex-col items-center justify-between rounded-xl p-2 transition-colors",
                  active
                    ? "bg-primary/25 text-foreground ring-2 ring-primary"
                    : "glass-panel-strong text-foreground",
                  !affordable && "opacity-40",
                )}
                style={{
                  boxShadow: active
                    ? undefined
                    : "0 5px 0 0 oklch(0.1 0.02 265), 0 8px 18px -6px oklch(0 0 0 / 70%)",
                }}
              >
                <span className="flex items-center gap-0.5 self-start text-[11px] font-black text-[oklch(0.75_0.16_230)]">
                  <Droplet className="h-3 w-3 fill-current" />
                  {card.cost}
                </span>
                <span dir="rtl" lang="ar" className="font-arabic text-xl font-semibold battle-arabic">
                  {card.arabic}
                </span>
                <span className="text-[9px] leading-none opacity-70">{card.gloss}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Cast + stats */}
        <div className="mt-4 pb-6">
          <Push3DButton variant="amber" fullWidth disabled={slots.length === 0} className="text-lg">
            <Sparkles className="h-5 w-5" />
            Cast Spell
          </Push3DButton>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2">
              <Heart className="h-5 w-5 shrink-0 fill-destructive text-destructive" />
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-destructive"
                  style={{ width: `${PLAYER_HP * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-foreground">41/50</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-[oklch(0.75_0.16_230)]/15 px-3 py-1 font-black text-[oklch(0.75_0.16_230)]">
              <Droplet className="h-4 w-4 fill-current" />
              <span className="text-sm">
                {MAX_INK - inkUsed}
                <span className="opacity-60">/{MAX_INK}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
