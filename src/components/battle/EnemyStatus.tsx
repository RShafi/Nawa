"use client";

import { motion } from "framer-motion";
import { Eye, Shield, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBattleStore } from "@/store/useBattleStore";

const ICON = {
  sword: Swords,
  shield: Shield,
  eye: Eye,
} as const;

export function EnemyStatus() {
  const intent = useBattleStore((s) => s.enemyIntent);

  if (!intent) return null;

  const Icon = ICON[intent.icon];
  const countdown =
    intent.turnsUntil <= 0
      ? "now"
      : intent.turnsUntil === 1
        ? "in 1 turn"
        : `in ${intent.turnsUntil} turns`;

  const detail =
    intent.damage > 0
      ? `${intent.label} (${intent.damage} DMG) ${countdown}`
      : `${intent.label} ${countdown}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glow-amber relative mx-auto flex max-w-md shrink-0 items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1 text-center",
        intent.kind === "heavy-strike"
          ? "border-rose-400/45 bg-rose-500/15 text-rose-50"
          : intent.kind === "ward-shield"
            ? "border-sky-400/45 bg-sky-500/15 text-sky-50"
            : "border-violet-400/45 bg-violet-500/15 text-violet-50",
      )}
      role="status"
      aria-live="polite"
    >
      <Icon className="size-3.5 shrink-0 opacity-90" />
      <p className="text-[11px] font-semibold tracking-wide sm:text-xs">{detail}</p>
    </motion.div>
  );
}
