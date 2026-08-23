"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBattleStore } from "@/store/useBattleStore";

export function EnemyWards() {
  const wards = useBattleStore((s) => s.wards);
  const isStaggered = useBattleStore((s) => s.isStaggered);
  const loaded = useBattleStore((s) => s.loaded);
  const tutorialMode = useBattleStore((s) => s.tutorialMode);
  const tutorialStep = useBattleStore((s) => s.tutorialStep);

  if (!wards.length) return null;

  const matchId =
    loaded?.spell &&
    wards.find(
      (w) =>
        !w.shattered &&
        w.rootId === loaded.spell!.root &&
        w.patternId === loaded.spell!.pattern,
    )?.id;

  return (
    <div
      className={cn(
        "space-y-1",
        tutorialMode && tutorialStep === 0 && "ring-2 ring-violet-400/60 rounded-xl p-0.5",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] tracking-[0.14em] text-violet-200/70 uppercase">Wards</p>
        {isStaggered ? (
          <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-200 uppercase">
            All clear — bonus damage
          </span>
        ) : (
          <span className="text-[9px] text-white/35">
            {wards.filter((w) => !w.shattered).length} left
          </span>
        )}
      </div>
      <ul className="flex flex-wrap gap-1">
        <AnimatePresence>
          {wards.map((ward) => {
            const isMatch = matchId === ward.id;
            return (
              <motion.li
                key={ward.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: ward.shattered ? 0.35 : 1,
                  scale: ward.shattered ? 0.95 : isMatch ? 1.03 : 1,
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px]",
                  ward.shattered
                    ? "border-white/10 bg-white/5 text-white/35 line-through"
                    : isMatch
                      ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-50"
                      : "border-violet-400/35 bg-violet-500/15 text-violet-50",
                )}
              >
                <Shield className="size-3 shrink-0 opacity-70" />
                {ward.english}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
