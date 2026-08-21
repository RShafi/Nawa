"use client";

import { create } from "zustand";
import { findLessonById, INITIAL_USER_PROGRESS } from "@/data/mockCurriculum";
import type { ScrollTarget, SelectedDialect, TashkeelMode, UserProgress } from "@/types/arabic";

type NawaState = {
  selectedRootId: string;
  selectedPatternId: string;
  tashkeelMode: TashkeelMode;
  selectedDialectPhraseId: string | null;
  userProgress: UserProgress;
  activeLessonId: string | null;
  scrollTarget: ScrollTarget;
  highlightTick: number;

  setRootId: (id: string) => void;
  setPatternId: (id: string) => void;
  setTashkeelMode: (mode: TashkeelMode) => void;
  setSelectedDialect: (dialect: SelectedDialect) => void;
  setDialectPhraseId: (id: string | null) => void;
  clearScrollTarget: () => void;
  launchLesson: (lessonId: string) => void;
  completeLesson: (lessonId: string) => void;
};

export const useNawaStore = create<NawaState>((set, get) => ({
  selectedRootId: "ktb",
  selectedPatternId: "verb-i",
  tashkeelMode: "full",
  selectedDialectPhraseId: "phrase-hello",
  userProgress: INITIAL_USER_PROGRESS,
  activeLessonId: null,
  scrollTarget: null,
  highlightTick: 0,

  setRootId: (id) => set({ selectedRootId: id }),
  setPatternId: (id) => set({ selectedPatternId: id }),
  setTashkeelMode: (mode) => set({ tashkeelMode: mode }),
  setSelectedDialect: (dialect) =>
    set((s) => ({
      userProgress: { ...s.userProgress, selectedDialect: dialect },
    })),
  setDialectPhraseId: (id) => set({ selectedDialectPhraseId: id }),
  clearScrollTarget: () => set({ scrollTarget: null }),

  launchLesson: (lessonId) => {
    const found = findLessonById(lessonId);
    if (!found) return;
    const { lesson, stage } = found;

    const patch: Partial<NawaState> = {
      activeLessonId: lessonId,
      highlightTick: get().highlightTick + 1,
      userProgress: {
        ...get().userProgress,
        currentStageId: stage.stageId,
      },
    };

    if (lesson.rootId) patch.selectedRootId = lesson.rootId;
    if (lesson.patternId) patch.selectedPatternId = lesson.patternId;
    if (lesson.tashkeelMode) patch.tashkeelMode = lesson.tashkeelMode;
    if (lesson.dialectPhraseId) patch.selectedDialectPhraseId = lesson.dialectPhraseId;

    if (lesson.target === "morph") patch.scrollTarget = "morph";
    else if (lesson.target === "dialect") patch.scrollTarget = "dialect";
    else patch.scrollTarget = "path";

    set(patch);
  },

  completeLesson: (lessonId) => {
    const { userProgress } = get();
    if (userProgress.completedLessonIds.includes(lessonId)) return;

    const found = findLessonById(lessonId);
    const masteredRoots = [...userProgress.masteredRoots];
    if (found?.lesson.rootId && !masteredRoots.includes(found.lesson.rootId)) {
      // Master root when completing a morph lesson on that root
      if (found.lesson.target === "morph") {
        masteredRoots.push(found.lesson.rootId);
      }
    }

    set({
      userProgress: {
        ...userProgress,
        completedLessonIds: [...userProgress.completedLessonIds, lessonId],
        masteredRoots,
        currentStageId: found?.stage.stageId ?? userProgress.currentStageId,
      },
    });
  },
}));
