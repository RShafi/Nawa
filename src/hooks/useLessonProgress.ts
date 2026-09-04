"use client";

import { useEffect, useState } from "react";
import { curriculumData } from "@/content/curriculumData";
import { registerLessons, useLessonStore } from "@/store/useLessonStore";

export function useLessonProgress() {
  const store = useLessonStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    registerLessons(curriculumData);
  }, []);

  const activeLesson = store.activeLessonId
    ? curriculumData.find((l) => l.id === store.activeLessonId) ?? null
    : null;

  const currentStep = activeLesson
    ? activeLesson.steps[store.currentStepIndex] ?? null
    : null;

  return {
    ...store,
    isLoaded: isClient && store.hasHydrated,
    activeLesson,
    currentStep,
    totalSteps: activeLesson ? activeLesson.steps.length : 0,
    isStepCompleted: (stepId: string) => store.completedStepIds.includes(stepId),
    isVocabMastered: (vocabId: string) => store.masteredVocabIds.includes(vocabId),
  };
}
