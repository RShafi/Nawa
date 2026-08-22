"use client";

import { create } from "zustand";

export type MasteryLevel = 0 | 1 | 2 | 3;

export type BustanTree = {
  rootId: string;
  /** Display string e.g. "ك-ت-ب" */
  letters: string;
  masteryLevel: MasteryLevel;
  /** For hover tooltip */
  patternsMastered: number;
  patternsTotal: number;
  gloss: string;
};

export type HydrateUserStatePayload = {
  currency: number;
  trees: BustanTree[];
  unlockedCities: string[];
};

type GamificationState = {
  trees: BustanTree[];
  hibrCurrency: number;
  unlockedCities: string[];
  progressHydrated: boolean;

  score: number;
  combo: number;
  timeLeft: number;
  isActive: boolean;
  lastResult: "correct" | "wrong" | null;

  setTrees: (trees: BustanTree[]) => void;
  growTree: (rootId: string) => BustanTree | null;
  hydrateUserState: (data: HydrateUserStatePayload) => void;
  setHibrCurrency: (amount: number) => void;
  addUnlockedCity: (cityId: string) => void;

  startGame: () => void;
  tick: () => void;
  submitAnswer: (isCorrect: boolean) => void;
  endGame: () => void;
  clearLastResult: () => void;
};

const INITIAL_TIME = 60;

export const useGamificationStore = create<GamificationState>((set, get) => ({
  trees: [],
  hibrCurrency: 0,
  unlockedCities: [],
  progressHydrated: false,

  score: 0,
  combo: 1,
  timeLeft: INITIAL_TIME,
  isActive: false,
  lastResult: null,

  setTrees: (trees) => set({ trees }),

  hydrateUserState: (data) =>
    set({
      hibrCurrency: data.currency,
      trees: data.trees,
      unlockedCities: data.unlockedCities,
      progressHydrated: true,
    }),

  setHibrCurrency: (amount) => set({ hibrCurrency: Math.max(0, amount) }),

  addUnlockedCity: (cityId) =>
    set((s) =>
      s.unlockedCities.includes(cityId)
        ? s
        : { unlockedCities: [...s.unlockedCities, cityId] },
    ),

  growTree: (rootId) => {
    let updated: BustanTree | null = null;
    set((s) => ({
      trees: s.trees.map((t) => {
        if (t.rootId !== rootId || t.masteryLevel >= 3) return t;
        const next: BustanTree = {
          ...t,
          patternsMastered: Math.min(t.patternsTotal, t.patternsMastered + 1),
          masteryLevel: Math.min(3, t.masteryLevel + 1) as MasteryLevel,
        };
        updated = next;
        return next;
      }),
    }));
    return updated;
  },

  startGame: () =>
    set({
      score: 0,
      combo: 1,
      timeLeft: INITIAL_TIME,
      isActive: true,
      lastResult: null,
    }),

  tick: () => {
    const { timeLeft, isActive } = get();
    if (!isActive) return;
    if (timeLeft <= 1) {
      set({ timeLeft: 0, isActive: false });
      return;
    }
    set({ timeLeft: timeLeft - 1 });
  },

  submitAnswer: (isCorrect) => {
    const { isActive, combo, score, timeLeft } = get();
    if (!isActive) return;

    if (isCorrect) {
      const nextCombo = combo + 1;
      set({
        score: score + 100 * combo,
        combo: nextCombo,
        lastResult: "correct",
      });
      return;
    }

    set({
      combo: 1,
      timeLeft: Math.max(0, timeLeft - 3),
      lastResult: "wrong",
      isActive: timeLeft - 3 <= 0 ? false : true,
    });
  },

  endGame: () => set({ isActive: false, lastResult: null }),

  clearLastResult: () => set({ lastResult: null }),
}));
