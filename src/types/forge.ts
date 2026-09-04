/**
 * The Forge — Pattern Forge types for wave-based root × mold combat.
 */

import type { ArabicRoot, PatternMold, VocabularyItem } from "@/types/curriculum";

export type ForgeTargetStatus = "falling" | "locked" | "destroyed" | "escaped";

export type ForgeTarget = {
  id: string;
  english: string;
  arabic: string;
  transliteration: string;
  root: readonly [string, string, string];
  rootId: string;
  patternId: string;
  patternLabel: string;
  ttsOverride?: string;
  status: ForgeTargetStatus;
  /** Vertical fall progress 0 → 1 (Framer drives visual). */
  spawnIndex: number;
};

export type ForgeGameStatus =
  | "idle"
  | "ready"
  | "playing"
  | "casting"
  | "victory"
  | "defeat";

export type ForgeDeck = {
  roots: readonly ArabicRoot[];
  molds: readonly PatternMold[];
};

export type ForgeTrial = {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly chapterId: string;
  /** Unlock after this loom lesson is complete. */
  readonly unlockAfterLessonId: string;
  readonly deck: ForgeDeck;
  readonly targets: readonly VocabularyItem[];
  readonly fallDurationMs: number;
};

/** Event bus payloads — ready for future WebSocket fan-out. */
export type ArenaEvent =
  | { type: "TRIAL_INIT"; trialId: string }
  | { type: "TARGET_SPAWNED"; target: ForgeTarget }
  | { type: "MOLD_SET"; moldId: string | null }
  | { type: "ROOT_SLOTTED"; slotIndex: number; letter: string }
  | { type: "ROOT_CLEARED"; slotIndex: number }
  | { type: "WORD_CAST"; arabic: string; targetId: string; scoreDelta: number }
  | { type: "CAST_FAILED"; reason: string }
  | { type: "COMBO_DROP"; multiplier: number }
  | { type: "TARGET_ESCAPED"; targetId: string }
  | { type: "TRIAL_COMPLETE"; score: number }
  | { type: "TRIAL_DEFEAT"; score: number };
