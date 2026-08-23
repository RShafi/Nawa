"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBattleStore } from "@/store/useBattleStore";
import { cn } from "@/lib/utils";

export function CombatTurnBanner() {
  const banner = useBattleStore((s) => s.turnBanner);
  const clearTurnBanner = useBattleStore((s) => s.clearTurnBanner);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => clearTurnBanner(), 2200);
    return () => window.clearTimeout(t);
  }, [banner, clearTurnBanner]);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/3 z-30 flex justify-center px-4">
      <AnimatePresence>
        {banner ? (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className={cn(
              "glass-panel-strong w-full max-w-md rounded-2xl border px-5 py-4 text-center shadow-2xl",
              banner.tone === "enemy" && "border-rose-400/40",
              banner.tone === "player" && "border-emerald-400/40",
              banner.tone === "system" && "border-amber-400/35",
            )}
          >
            <p className="text-lg font-semibold text-white">{banner.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-white/65">{banner.detail}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
