"use client";

import type { CurriculumLesson } from "@/types/curriculum";

export type TargetHudProps = {
  lesson: CurriculumLesson;
};

/** Resolve the lesson objective shown in the permanent target banner. */
export function resolveLessonTarget(
  lesson: CurriculumLesson,
): { arabic: string; meaning: string } | null {
  if (lesson.unlockableVocab.length > 0) {
    const vocab = lesson.unlockableVocab[0]!;
    return { arabic: vocab.arabic, meaning: vocab.english };
  }

  switch (lesson.id) {
    case "lesson-0-0":
      return { arabic: "نَوَى", meaning: "Begin your path" };
    case "lesson-1-1":
      return { arabic: "ب · ت · ث", meaning: "Ba · Ta · Tha (shapes)" };
    case "lesson-1-2":
      return { arabic: "بَ · تَ · ثَ", meaning: "Ba · Ta · Tha with Fatha" };
    default:
      return { arabic: lesson.root.letters.join(" · "), meaning: lesson.root.primaryMeaning };
  }
}

export function TargetHud({ lesson }: TargetHudProps) {
  const target = resolveLessonTarget(lesson);
  if (!target) return null;

  return (
    <div
      className="shrink-0 border-b border-amber-500/20 bg-[#0B0F19]/75 px-4 py-2.5 backdrop-blur-md lg:px-8"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm lg:justify-start lg:text-base">
        <span className="font-medium tracking-wide text-amber-500/90 uppercase">Target</span>
        <span className="font-arabic text-xl font-bold text-amber-100 lg:text-2xl" dir="rtl">
          {target.arabic}
        </span>
        <span className="hidden text-slate-600 sm:inline" aria-hidden>
          —
        </span>
        <span className="text-slate-300">{target.meaning}</span>
      </div>
    </div>
  );
}
