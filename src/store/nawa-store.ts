"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  findCurriculumLesson,
  getNextCurriculumLessonId,
  INITIAL_USER_PROGRESS,
} from "@/data/curriculumData";
import { DERIVED_WORDS } from "@/data/mockRoots";
import { hasDerivedWord } from "@/lib/arabic-utils";
import type { SelectedDialect, TashkeelMode, UserProgress } from "@/types/arabic";

/** Bump only when intentionally wiping stored progress. */
export const PROGRESS_SEED = "fresh-v2";

type NawaState = {
  selectedRootId: string;
  selectedPatternId: string;
  tashkeelMode: TashkeelMode;
  selectedDialectPhraseId: string | null;
  selectedDialect: SelectedDialect;
  userProgress: UserProgress;
  progressSeed: string;
  _hasHydrated: boolean;

  setRootId: (id: string) => void;
  setPatternId: (id: string) => void;
  setTashkeelMode: (mode: TashkeelMode) => void;
  setSelectedDialect: (dialect: SelectedDialect) => void;
  setDialectPhraseId: (id: string | null) => void;
  setActiveLessonId: (id: string) => void;
  completeLesson: (lessonId: string) => void;
  hydrateLessonTools: (lessonId: string) => void;
  hydrateLessonProgress: (completedLessonIds: string[]) => void;
  resetProgressIfStale: () => void;
  setHasHydrated: (v: boolean) => void;
};

export const useNawaStore = create<NawaState>()(
  persist(
    (set, get) => ({
      selectedRootId: "ktb",
      selectedPatternId: "verb-i",
      tashkeelMode: "full",
      selectedDialectPhraseId: "phrase-hello",
      selectedDialect: "levantine",
      userProgress: INITIAL_USER_PROGRESS,
      progressSeed: PROGRESS_SEED,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setRootId: (id) => {
        const currentPattern = get().selectedPatternId;
        if (hasDerivedWord(id, currentPattern, DERIVED_WORDS)) {
          set({ selectedRootId: id });
          return;
        }
        const fallback = DERIVED_WORDS.find((w) => w.rootId === id)?.patternId ?? currentPattern;
        set({ selectedRootId: id, selectedPatternId: fallback });
      },
      setPatternId: (id) => set({ selectedPatternId: id }),
      setTashkeelMode: (mode) => set({ tashkeelMode: mode }),
      setSelectedDialect: (dialect) => set({ selectedDialect: dialect }),
      setDialectPhraseId: (id) => set({ selectedDialectPhraseId: id }),

      setActiveLessonId: (id) => {
        set({
          userProgress: { ...get().userProgress, activeLessonId: id },
        });
        get().hydrateLessonTools(id);
      },

      hydrateLessonTools: (lessonId) => {
        const found = findCurriculumLesson(lessonId);
        if (!found) return;
        const { lesson } = found;
        // Do not overwrite tashkeelMode — header toggle is authoritative & persisted.
        set({
          ...(lesson.rootId ? { selectedRootId: lesson.rootId } : {}),
          ...(lesson.patternId ? { selectedPatternId: lesson.patternId } : {}),
          ...(lesson.dialectPhraseId
            ? { selectedDialectPhraseId: lesson.dialectPhraseId }
            : {}),
        });
      },

      completeLesson: (lessonId) => {
        const { userProgress } = get();
        if (userProgress.completedLessonIds.includes(lessonId)) return;

        const completedLessonIds = [...userProgress.completedLessonIds, lessonId];
        const nextId = getNextCurriculumLessonId(completedLessonIds);

        set({
          userProgress: {
            completedLessonIds,
            activeLessonId: nextId ?? lessonId,
          },
        });
      },

      hydrateLessonProgress: (completedLessonIds) => {
        const unique = [...new Set(completedLessonIds)];
        const nextId = getNextCurriculumLessonId(unique);
        set({
          userProgress: {
            completedLessonIds: unique,
            activeLessonId: nextId ?? get().userProgress.activeLessonId,
          },
        });
      },

      resetProgressIfStale: () => {
        if (get().progressSeed === PROGRESS_SEED) return;
        set({
          userProgress: INITIAL_USER_PROGRESS,
          progressSeed: PROGRESS_SEED,
        });
      },
    }),
    {
      name: "nawa-progress",
      partialize: (state) => ({
        userProgress: state.userProgress,
        progressSeed: state.progressSeed,
        selectedDialect: state.selectedDialect,
        tashkeelMode: state.tashkeelMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
