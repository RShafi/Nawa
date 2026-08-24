"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArabicText } from "@/components/ui/ArabicText";

export type SpellProjectile = {
  id: string;
  arabic: string;
};

/** Glowing Arabic words dissolve into rune streaks toward the boss. */
export function SpellCastVFX({
  projectile,
  onDone,
}: {
  projectile: SpellProjectile | null;
  onDone?: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <AnimatePresence
        onExitComplete={() => {
          /* noop */
        }}
      >
        {projectile ? (
          <motion.div
            key={projectile.id}
            className="absolute start-1/4 bottom-[28%] flex flex-col items-center"
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{
              opacity: [1, 1, 0],
              x: [0, 40, 120],
              y: [0, -40, -110],
              scale: [1, 1.1, 0.4],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeIn" }}
            onAnimationComplete={() => onDone?.()}
          >
            <div className="rounded-xl border border-amber-400/50 bg-amber-500/20 px-3 py-1.5 shadow-[0_0_30px_-4px_rgba(245,158,11,0.8)] backdrop-blur-sm">
              <ArabicText
                size="inherit"
                className="battle-arabic text-lg leading-none text-amber-50"
              >
                {projectile.arabic}
              </ArabicText>
            </div>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute size-1.5 rounded-full bg-amber-300"
                initial={{ opacity: 0.8, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  x: 30 + i * 18,
                  y: -20 - i * 25,
                }}
                transition={{ duration: 0.55, delay: 0.05 * i }}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function BossAttackFlash({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active ? (
        <>
          <motion.div
            key="boss-flash-fill"
            className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-rose-600/40 via-rose-500/15 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          />
          <motion.div
            key="boss-flash-border"
            className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] shadow-[inset_0_0_0_3px_rgba(244,63,94,0.85)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </>
      ) : null}
    </AnimatePresence>
  );
}
