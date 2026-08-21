import { CURRICULUM_STAGES, getAllLessonsInOrder } from "@/data/mockCurriculum";
import type { CurriculumStage, LessonStatus, Unit, UserProgress } from "@/types/arabic";

export function isLessonCompleted(lessonId: string, progress: UserProgress): boolean {
  return progress.completedLessonIds.includes(lessonId);
}

export function deriveUnitCompletion(
  unit: Unit,
  progress: UserProgress,
): { completed: boolean; unlocked: boolean } {
  const units = CURRICULUM_STAGES.flatMap((s) => s.units);
  const idx = units.findIndex((u) => u.id === unit.id);

  let unlocked = unit.unlocked;
  if (!unlocked && idx > 0) {
    const prev = units[idx - 1];
    unlocked = prev.lessons.every((l) => isLessonCompleted(l.id, progress));
  }
  if (idx === 0) unlocked = true;

  const completed =
    unit.lessons.length > 0 && unit.lessons.every((l) => isLessonCompleted(l.id, progress));

  return { completed, unlocked };
}

export function isUnitEffectivelyUnlocked(unit: Unit, progress: UserProgress): boolean {
  return deriveUnitCompletion(unit, progress).unlocked;
}

/** Lesson unlock: unit must be unlocked; within a unit, prior lessons must be completed. */
export function isLessonUnlocked(lessonId: string, progress: UserProgress): boolean {
  const ordered = getAllLessonsInOrder();
  const index = ordered.findIndex((entry) => entry.lesson.id === lessonId);
  if (index === -1) return false;

  const { unit, lesson } = ordered[index];
  if (!isUnitEffectivelyUnlocked(unit, progress)) return false;

  const lessonIndexInUnit = unit.lessons.findIndex((l) => l.id === lesson.id);
  for (let i = 0; i < lessonIndexInUnit; i++) {
    if (!isLessonCompleted(unit.lessons[i].id, progress)) return false;
  }
  return true;
}

export function getNextActiveLessonId(progress: UserProgress): string | null {
  const ordered = getAllLessonsInOrder();
  for (const entry of ordered) {
    if (!isLessonCompleted(entry.lesson.id, progress) && isLessonUnlocked(entry.lesson.id, progress)) {
      return entry.lesson.id;
    }
  }
  return null;
}

export function getLessonStatus(
  lessonId: string,
  progress: UserProgress,
  activeLessonId: string | null,
): LessonStatus {
  if (isLessonCompleted(lessonId, progress)) return "completed";
  if (!isLessonUnlocked(lessonId, progress)) return "locked";
  if (activeLessonId === lessonId) return "active";
  if (getNextActiveLessonId(progress) === lessonId) return "active";
  return "active";
}

export function withDerivedStageFlags(
  stages: CurriculumStage[],
  progress: UserProgress,
): CurriculumStage[] {
  return stages.map((stage) => ({
    ...stage,
    units: stage.units.map((unit) => {
      const { completed, unlocked } = deriveUnitCompletion(unit, progress);
      return { ...unit, completed, unlocked };
    }),
  }));
}
