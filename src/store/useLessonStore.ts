"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CurriculumLesson, VocabularyItem } from "@/types/curriculum";

/** Idle gap before prompting “welcome back” on resume (5 minutes). */
const SESSION_IDLE_MS = 5 * 60 * 1000;

const STORAGE_KEY = "nawa-lesson-progress-v1";

/** Populated by the content pipeline when lessons are registered. */
const lessonCatalog = new Map<string, CurriculumLesson>();

export function registerLessons(lessons: readonly CurriculumLesson[]): void {
  for (const lesson of lessons) {
    lessonCatalog.set(lesson.id, lesson);
  }
}

export function getRegisteredLesson(lessonId: string): CurriculumLesson | undefined {
  return lessonCatalog.get(lessonId);
}

function uniqueIds(ids: readonly string[]): string[] {
  return [...new Set(ids)];
}

function vocabIdsFromStep(lesson: CurriculumLesson, stepId: string): string[] {
  const step = lesson.steps.find((s) => s.id === stepId);
  if (!step) return [];
  if (step.type === "epiphany" && step.forgeVocab) return [step.forgeVocab.id];
  if (!step.targetVocab?.length) return [];
  return step.targetVocab.map((v) => v.id);
}

function mergeMasteredVocab(
  current: readonly string[],
  additions: readonly string[],
): string[] {
  if (!additions.length) return [...current];
  return uniqueIds([...current, ...additions]);
}

export interface LessonProgressState {
  // Active State
  activeLessonId: string | null;
  currentStepIndex: number;
  completedStepIds: string[];
  masteredVocabIds: string[];
  lastActiveTimestamp: number | null;
  showWelcomeBack: boolean;
  hasHydrated: boolean;

  // Actions
  startLesson: (lessonId: string) => void;
  submitStepAnswer: (stepId: string, isCorrect: boolean) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  completeLesson: () => void;
  dismissWelcomeBack: () => void;
  checkSessionResume: () => void;
  resetLessonProgress: (lessonId?: string) => void;
  unlockVocab: (vocabId: string) => void;
  setHasHydrated: (state: boolean) => void;
}

const initialState = {
  activeLessonId: null as string | null,
  currentStepIndex: 0,
  completedStepIds: [] as string[],
  masteredVocabIds: [] as string[],
  lastActiveTimestamp: null as number | null,
  showWelcomeBack: false,
  hasHydrated: false,
};

export const useLessonStore = create<LessonProgressState>()(
  persist(
    (set, get) => ({
      ...initialState,

      startLesson: (lessonId) => {
        const { activeLessonId } = get();
        const now = Date.now();

        if (activeLessonId === lessonId) {
          set({ lastActiveTimestamp: now, showWelcomeBack: false });
          return;
        }

        set({
          activeLessonId: lessonId,
          currentStepIndex: 0,
          completedStepIds: [],
          lastActiveTimestamp: now,
          showWelcomeBack: false,
        });
      },

      submitStepAnswer: (stepId, isCorrect) => {
        const state = get();
        if (!state.activeLessonId) return;

        const now = Date.now();
        const lesson = lessonCatalog.get(state.activeLessonId);

        let completedStepIds = state.completedStepIds;
        let masteredVocabIds = state.masteredVocabIds;

        if (isCorrect) {
          if (!completedStepIds.includes(stepId)) {
            completedStepIds = [...completedStepIds, stepId];
          }
          if (lesson) {
            masteredVocabIds = mergeMasteredVocab(
              masteredVocabIds,
              vocabIdsFromStep(lesson, stepId),
            );
          }
        }

        set({
          completedStepIds,
          masteredVocabIds,
          lastActiveTimestamp: now,
        });
      },

      goToNextStep: () => {
        const state = get();
        if (!state.activeLessonId) return;

        const lesson = lessonCatalog.get(state.activeLessonId);
        const maxIndex = lesson ? Math.max(0, lesson.steps.length - 1) : Infinity;

        set({
          currentStepIndex: Math.min(state.currentStepIndex + 1, maxIndex),
          lastActiveTimestamp: Date.now(),
          showWelcomeBack: false,
        });
      },

      goToPreviousStep: () => {
        const state = get();
        if (!state.activeLessonId) return;

        set({
          currentStepIndex: Math.max(0, state.currentStepIndex - 1),
          lastActiveTimestamp: Date.now(),
          showWelcomeBack: false,
        });
      },

      completeLesson: () => {
        const state = get();
        if (!state.activeLessonId) return;

        const lesson = lessonCatalog.get(state.activeLessonId);
        const unlockIds = lesson?.unlockableVocab.map((v: VocabularyItem) => v.id) ?? [];
        const milestone =
          lesson && unlockIds.length === 0
            ? [`milestone:${state.activeLessonId}`]
            : [];

        set({
          activeLessonId: null,
          currentStepIndex: 0,
          completedStepIds: [],
          masteredVocabIds: mergeMasteredVocab(state.masteredVocabIds, [
            ...unlockIds,
            ...milestone,
          ]),
          lastActiveTimestamp: Date.now(),
          showWelcomeBack: false,
        });
      },

      dismissWelcomeBack: () => set({ showWelcomeBack: false }),

      checkSessionResume: () => {
        const { activeLessonId, lastActiveTimestamp, hasHydrated } = get();
        if (!hasHydrated || !activeLessonId || lastActiveTimestamp == null) return;

        const idleMs = Date.now() - lastActiveTimestamp;
        if (idleMs >= SESSION_IDLE_MS) {
          set({ showWelcomeBack: true });
        }
      },

      resetLessonProgress: (lessonId) => {
        if (!lessonId) {
          set({ ...initialState, hasHydrated: get().hasHydrated });
          return;
        }

        const state = get();
        const lesson = lessonCatalog.get(lessonId);
        const lessonVocabIds = new Set(
          lesson?.unlockableVocab.map((v) => v.id) ?? [],
        );

        const masteredVocabIds = state.masteredVocabIds.filter(
          (id) => !lessonVocabIds.has(id),
        );

        if (state.activeLessonId === lessonId) {
          set({
            activeLessonId: null,
            currentStepIndex: 0,
            completedStepIds: [],
            masteredVocabIds,
            lastActiveTimestamp: null,
            showWelcomeBack: false,
          });
          return;
        }

        if (lessonVocabIds.size > 0) {
          set({ masteredVocabIds });
        }
      },

      unlockVocab: (vocabId) => {
        const state = get();
        set({
          masteredVocabIds: mergeMasteredVocab(state.masteredVocabIds, [vocabId]),
          lastActiveTimestamp: Date.now(),
        });
      },

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeLessonId: state.activeLessonId,
        currentStepIndex: state.currentStepIndex,
        completedStepIds: state.completedStepIds,
        masteredVocabIds: state.masteredVocabIds,
        lastActiveTimestamp: state.lastActiveTimestamp,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.checkSessionResume();
      },
    },
  ),
);
