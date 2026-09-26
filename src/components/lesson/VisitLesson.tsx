"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { completeVisitAction } from "@/app/actions/garden";
import {
  FrameStep,
  LetterStep,
  SentenceStep,
  ShapeStep,
  VowelStep,
} from "@/components/lesson/LessonSteps";
import { getLesson, previousLessonId } from "@/data/garden";
import { useAppStore } from "@/store/useAppStore";

type VisitLessonProps = { lessonId: string };

export function VisitLesson({ lessonId }: VisitLessonProps) {
  const router = useRouter();
  const lesson = getLesson(lessonId);
  const completed = useAppStore((s) => s.completedLessonIds);
  const deck = useAppStore((s) => s.unlockedDeck);
  const status = useAppStore((s) => s.status);
  const markLesson = useAppStore((s) => s.markLessonCompleteOptimistic);
  const unlockDeck = useAppStore((s) => s.unlockDeckOptimistic);
  const setHibr = useAppStore((s) => s.setHibrBalance);
  const addHibr = useAppStore((s) => s.addHibrOptimistic);

  const [taskDone, setTaskDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!lesson) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10">
        <p className="text-white/80">That step is not here.</p>
        <Button asChild className="mt-4">
          <Link href="/">Garden</Link>
        </Button>
      </main>
    );
  }

  const previous = previousLessonId(lessonId);
  const previousMissing =
    previous != null && status === "ready" && !isStepDone(previous, completed, deck);

  async function save() {
    setSaving(true);
    setError(null);
    const result = await completeVisitAction(lessonId);
    if (!result.ok) {
      setSaving(false);
      setError(result.error ?? "Could not add it. Try again.");
      return;
    }
    markLesson(lessonId);
    if (result.wordId) unlockDeck([result.wordId], lessonId);
    if (typeof result.hibrBalance === "number") setHibr(result.hibrBalance);
    else if (result.bonusAwarded) addHibr(result.bonusAwarded);
    router.push(`/?grew=${lessonId}`);
    router.refresh();
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <Link href="/" className="text-sm text-white/55 hover:text-white">
        Garden
      </Link>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">{lesson.title}</h1>
        <p className="text-base leading-relaxed text-white/75">{lesson.teach}</p>
      </header>

      {previousMissing && previous ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-white/80">Finish the piece before this one.</p>
          <Button asChild className="mt-3">
            <Link href={`/lesson/${previous}`}>Open that piece</Link>
          </Button>
        </div>
      ) : (
        <>
          {lesson.kind === "letter" ? <LetterStep onDone={() => setTaskDone(true)} /> : null}
          {lesson.kind === "shapes" ? <ShapeStep onDone={() => setTaskDone(true)} /> : null}
          {lesson.kind === "vowel" ? <VowelStep onDone={() => setTaskDone(true)} /> : null}
          {lesson.kind === "frame" ? (
            <FrameStep lesson={lesson} done={taskDone} onDone={() => setTaskDone(true)} />
          ) : null}
          {lesson.kind === "sentence" ? (
            <SentenceStep lesson={lesson} done={taskDone} onDone={() => setTaskDone(true)} />
          ) : null}
          {taskDone ? (
            <div className="space-y-2">
              {error ? <p className="text-sm text-rose-200">{error}</p> : null}
              <Button className="h-12" disabled={saving} onClick={() => void save()}>
                {saving ? "Adding…" : "Add it to the garden"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}

function isStepDone(lessonId: string, completed: string[], deck: string[]): boolean {
  if (completed.includes(lessonId)) return true;
  const lesson = getLesson(lessonId);
  if (!lesson || lesson.kind !== "frame") return false;
  return deck.includes(lesson.frame.wordId);
}
