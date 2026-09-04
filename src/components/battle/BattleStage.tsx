"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CombatState } from "@/lib/combatPacing";
import { cn } from "@/lib/utils";

/**
 * Strict 3-row Grid HUD — fits calc(100dvh-80px) with no scroll.
 * Rows: Boss (auto) | Syntax/Tutorial (1fr) | Hand (auto)
 */
export function BattleStage({
  children,
  className,
  shake = false,
  combatState = "idle",
}: {
  children: React.ReactNode;
  className?: string;
  shake?: boolean;
  combatState?: CombatState;
}) {
  const attacking = combatState === "enemy_attacking";
  const casting = combatState === "player_attacking";

  return (
    <motion.div
      animate={
        shake || attacking
          ? { x: [-8, 8, -6, 6, 0] }
          : casting
            ? { scale: [1, 1.005, 1] }
            : { x: 0, scale: 1 }
      }
      transition={{ duration: 0.35 }}
      className={cn(
        "relative mx-auto grid h-[calc(100dvh-80px)] w-full max-w-6xl grid-rows-[auto_minmax(0,1fr)_auto] gap-2 overflow-hidden p-2 md:gap-4 md:p-4",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function CombatPhaseBanner({
  combatState,
  blocked = false,
}: {
  combatState: CombatState;
  blocked?: boolean;
}) {
  const showEnemy = combatState === "enemy_turn_transition";
  const showBlock = blocked && combatState === "enemy_attacking";

  return (
    <AnimatePresence>
      {showEnemy || showBlock ? (
        <motion.div
          key={showBlock ? "blocked" : "enemy-turn"}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="pointer-events-none absolute inset-0 z-[70] flex items-center justify-center bg-obsidian/55 backdrop-blur-[2px]"
        >
          <div className="text-center">
            <p
              className={cn(
                "font-display text-4xl font-black tracking-[0.2em] uppercase sm:text-5xl md:text-6xl",
                showBlock
                  ? "text-sky-300"
                  : "bg-gradient-to-r from-rose-200 via-rose-300 to-rose-500 bg-clip-text text-transparent",
              )}
            >
              {showBlock ? "BLOCKED!" : "ENEMY TURN"}
            </p>
            <p className="mt-2 text-sm text-white/60">
              {showBlock ? "Your Frost Ward holds." : "Brace for impact"}
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Strict Grid zone class names */
export const HUD_BOSS =
  "relative z-10 flex min-h-0 flex-col items-center justify-start";
export const HUD_MIDDLE =
  "relative z-10 mx-auto flex min-h-0 w-full max-w-3xl flex-col items-center justify-center gap-2";
export const HUD_HAND =
  "relative z-10 mx-auto flex min-h-0 w-full max-w-4xl flex-col items-center justify-end";
