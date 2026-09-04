"use client";

import { create } from "zustand";
import { assembleFromMold, isRootSlot, type PatternMold } from "@/types/curriculum";
import { getForgeTrial } from "@/content/forgeTrials";
import type {
  ArenaEvent,
  ForgeGameStatus,
  ForgeTarget,
  ForgeTrial,
} from "@/types/forge";

type ArenaListener = (event: ArenaEvent) => void;

const listeners = new Set<ArenaListener>();

function emit(event: ArenaEvent): void {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch (err) {
      console.error("[arenaStore] listener error", err);
    }
  }
}

/** Subscribe to arena events (future WebSocket bridge hooks here). */
export function subscribeArenaEvents(listener: ArenaListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emptySlotsForMold(mold: PatternMold | null): (string | null)[] {
  if (!mold) return [];
  const count = mold.visualSlots.filter((t) => isRootSlot(t)).length;
  return Array.from({ length: count }, () => null);
}

type ArenaState = {
  trialId: string | null;
  trial: ForgeTrial | null;
  activeTargets: ForgeTarget[];
  waveIndex: number;
  activeMold: PatternMold | null;
  /** Parallel to mold root slots — null = empty. */
  slottedRoots: (string | null)[];
  score: number;
  comboMultiplier: number;
  lives: number;
  gameStatus: ForgeGameStatus;
  lastCastArabic: string | null;
  completedTrialIds: string[];

  initTrial: (trialId: string) => boolean;
  resetSession: () => void;
  spawnTarget: () => void;
  setMold: (mold: PatternMold | null) => void;
  slotRoot: (slotIndex: number, letter: string) => void;
  clearSlot: (slotIndex: number) => void;
  clearMoldSlots: () => void;
  castWord: () => { ok: boolean; arabic?: string; reason?: string };
  triggerComboDrop: () => void;
  markTargetEscaped: (targetId: string) => void;
  markTrialComplete: () => void;
};

function resolveRootLetters(
  trial: ForgeTrial,
  rootId: string,
): readonly [string, string, string] | null {
  const found = trial.deck.roots.find((r) => r.id === rootId);
  return found?.letters ?? null;
}

export const useArenaStore = create<ArenaState>((set, get) => ({
  trialId: null,
  trial: null,
  activeTargets: [],
  waveIndex: 0,
  activeMold: null,
  slottedRoots: [],
  score: 0,
  comboMultiplier: 1,
  lives: 3,
  gameStatus: "idle",
  lastCastArabic: null,
  completedTrialIds: [],

  initTrial: (trialId) => {
    const trial = getForgeTrial(trialId);
    if (!trial) return false;

    const first = trial.targets[0];
    const targets: ForgeTarget[] = [];
    if (first) {
      const letters = resolveRootLetters(trial, first.rootId);
      targets.push({
        id: `target-${trialId}-0`,
        english: first.english,
        arabic: first.arabic,
        transliteration: first.transliteration,
        root: letters ?? ["?", "?", "?"],
        rootId: first.rootId,
        patternId: first.pattern.id,
        patternLabel: first.pattern.name,
        ttsOverride: first.ttsOverride,
        status: "falling",
        spawnIndex: 0,
      });
    }

    set({
      trialId,
      trial,
      activeTargets: targets,
      waveIndex: targets.length > 0 ? 1 : 0,
      activeMold: null,
      slottedRoots: [],
      score: 0,
      comboMultiplier: 1,
      lives: 3,
      gameStatus: "playing",
      lastCastArabic: null,
    });

    emit({ type: "TRIAL_INIT", trialId });
    if (targets[0]) emit({ type: "TARGET_SPAWNED", target: targets[0] });
    return true;
  },

  resetSession: () => {
    set({
      trialId: null,
      trial: null,
      activeTargets: [],
      waveIndex: 0,
      activeMold: null,
      slottedRoots: [],
      score: 0,
      comboMultiplier: 1,
      lives: 3,
      gameStatus: "idle",
      lastCastArabic: null,
    });
  },

  spawnTarget: () => {
    const { trial, waveIndex, activeTargets, gameStatus } = get();
    if (!trial || gameStatus !== "playing") return;
    if (waveIndex >= trial.targets.length) return;

    const vocab = trial.targets[waveIndex]!;
    const letters = resolveRootLetters(trial, vocab.rootId);
    const target: ForgeTarget = {
      id: `target-${trial.id}-${waveIndex}`,
      english: vocab.english,
      arabic: vocab.arabic,
      transliteration: vocab.transliteration,
      root: letters ?? ["?", "?", "?"],
      rootId: vocab.rootId,
      patternId: vocab.pattern.id,
      patternLabel: vocab.pattern.name,
      ttsOverride: vocab.ttsOverride,
      status: "falling",
      spawnIndex: waveIndex,
    };

    set({
      activeTargets: [...activeTargets.filter((t) => t.status === "falling"), target],
      waveIndex: waveIndex + 1,
    });
    emit({ type: "TARGET_SPAWNED", target });
  },

  setMold: (mold) => {
    set({
      activeMold: mold,
      slottedRoots: emptySlotsForMold(mold),
      lastCastArabic: null,
    });
    emit({ type: "MOLD_SET", moldId: mold?.id ?? null });
  },

  slotRoot: (slotIndex, letter) => {
    const { slottedRoots, activeMold } = get();
    if (!activeMold) return;
    if (slotIndex < 0 || slotIndex >= slottedRoots.length) return;

    const next = [...slottedRoots];
    next[slotIndex] = letter;
    set({ slottedRoots: next });
    emit({ type: "ROOT_SLOTTED", slotIndex, letter });

    // Auto-cast when all slots filled.
    if (next.every((l) => l != null && l.length > 0)) {
      queueMicrotask(() => {
        get().castWord();
      });
    }
  },

  clearSlot: (slotIndex) => {
    const { slottedRoots } = get();
    if (slotIndex < 0 || slotIndex >= slottedRoots.length) return;
    const next = [...slottedRoots];
    next[slotIndex] = null;
    set({ slottedRoots: next });
    emit({ type: "ROOT_CLEARED", slotIndex });
  },

  clearMoldSlots: () => {
    const { activeMold } = get();
    set({ slottedRoots: emptySlotsForMold(activeMold), lastCastArabic: null });
  },

  castWord: () => {
    const state = get();
    const { activeMold, slottedRoots, activeTargets, trial, comboMultiplier, score } = state;

    if (!activeMold || !trial) {
      emit({ type: "CAST_FAILED", reason: "No mold selected" });
      return { ok: false, reason: "No mold selected" };
    }

    if (slottedRoots.some((l) => !l)) {
      emit({ type: "CAST_FAILED", reason: "Slots incomplete" });
      return { ok: false, reason: "Slots incomplete" };
    }

    const rootTuple = slottedRoots as [string, string, string];
    const arabic = assembleFromMold(activeMold, rootTuple);

    const falling = activeTargets.filter((t) => t.status === "falling");
    const match = falling.find(
      (t) =>
        t.patternId === activeMold.id &&
        t.root[0] === rootTuple[0] &&
        t.root[1] === rootTuple[1] &&
        t.root[2] === rootTuple[2],
    );

    if (!match) {
      get().triggerComboDrop();
      emit({ type: "CAST_FAILED", reason: "No matching target" });
      set({ slottedRoots: emptySlotsForMold(activeMold), lastCastArabic: null });
      return { ok: false, reason: "No matching target" };
    }

    const scoreDelta = 100 * comboMultiplier;
    const nextTargets = activeTargets.map((t) =>
      t.id === match.id ? { ...t, status: "destroyed" as const } : t,
    );
    const remainingWaves = trial.targets.length - state.waveIndex;
    const stillFalling = nextTargets.some((t) => t.status === "falling");
    const victory = !stillFalling && remainingWaves <= 0;

    set({
      activeTargets: nextTargets,
      score: score + scoreDelta,
      comboMultiplier: comboMultiplier + 1,
      slottedRoots: emptySlotsForMold(activeMold),
      lastCastArabic: arabic,
      gameStatus: victory ? "victory" : "casting",
    });

    emit({
      type: "WORD_CAST",
      arabic,
      targetId: match.id,
      scoreDelta,
    });

    if (victory) {
      get().markTrialComplete();
    } else {
      // Resume playing after cast flourish; spawn next wave target.
      setTimeout(() => {
        const current = get();
        if (current.gameStatus !== "casting") return;
        set({ gameStatus: "playing", lastCastArabic: null });
        if (!current.activeTargets.some((t) => t.status === "falling")) {
          current.spawnTarget();
        }
      }, 900);
    }

    return { ok: true, arabic };
  },

  triggerComboDrop: () => {
    set({ comboMultiplier: 1 });
    emit({ type: "COMBO_DROP", multiplier: 1 });
  },

  markTargetEscaped: (targetId) => {
    const { activeTargets, lives, trial, waveIndex, score } = get();
    const nextTargets = activeTargets.map((t) =>
      t.id === targetId && t.status === "falling"
        ? { ...t, status: "escaped" as const }
        : t,
    );
    const nextLives = lives - 1;
    emit({ type: "TARGET_ESCAPED", targetId });

    if (nextLives <= 0) {
      set({
        activeTargets: nextTargets,
        lives: 0,
        gameStatus: "defeat",
        comboMultiplier: 1,
      });
      emit({ type: "TRIAL_DEFEAT", score });
      return;
    }

    const remainingWaves = (trial?.targets.length ?? 0) - waveIndex;
    const stillFalling = nextTargets.some((t) => t.status === "falling");

    set({
      activeTargets: nextTargets,
      lives: nextLives,
      comboMultiplier: 1,
    });

    if (!stillFalling && remainingWaves > 0) {
      get().spawnTarget();
    } else if (!stillFalling && remainingWaves <= 0) {
      get().markTrialComplete();
    }
  },

  markTrialComplete: () => {
    const { trialId, score, completedTrialIds } = get();
    const nextCompleted =
      trialId && !completedTrialIds.includes(trialId)
        ? [...completedTrialIds, trialId]
        : completedTrialIds;
    set({
      gameStatus: "victory",
      completedTrialIds: nextCompleted,
    });
    emit({ type: "TRIAL_COMPLETE", score });
  },
}));
