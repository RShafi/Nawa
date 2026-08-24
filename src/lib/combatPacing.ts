/** Shared combat timing helpers for Arena + Tutorial. */

export const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export type CombatState =
  | "idle"
  | "resonance_check"
  | "player_attacking"
  | "enemy_turn_transition"
  | "enemy_attacking";

/** Damage multiplier applied when Resonance Check succeeds. */
export const RESONANCE_CRIT_MULT = 2;
