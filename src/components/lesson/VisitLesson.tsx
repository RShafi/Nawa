"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArabicText } from "@/components/common/ArabicText";
import { Button } from "@/components/ui/button";
import { completeVisitAction } from "@/app/actions/garden";
import {
  FrameStep,
  LetterStep,
  SentenceStep,
  ShapeStep,
  VowelStep,
} from "@/components/lesson/LessonSteps";
import { cardForFrame, getLesson, nextLessonId, previousLessonId } from "@/data/garden";
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
  const hydrate = useAppStore((s) => s.hydrate);

  const [taskDone, setTaskDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedWord, setSavedWord] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!lesson) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10">
        <p className="text-white/80">That step is not in the course.</p>
        <Button asChild className="mt-4">
          <Link href="/">Back home</Link>
        </Button>
      </main>
    );
  }

  const previous = previousLessonId(lessonId);
  const previousMissing =
    previous != null && status === "ready" && !isStepDone(previous, completed, deck);
  const card = lesson.kind === "frame" ? cardForFrame(lesson.frame) : undefined;

  async function save() {
    setSaving(true);
    setError(null);
    const result = await completeVisitAction(lessonId);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save.");
      return;
    }
    markLesson(lessonId);
    if (result.wordId) {
      unlockDeck([result.wordId], lessonId);
      setSavedWord(card?.word ?? result.wordId);
    }
    setSaved(true);
    if (typeof result.hibrBalance === "number") setHibr(result.hibrBalance);
    else if (result.bonusAwarded) addHibr(result.bonusAwarded);
    void hydrate();
    router.refresh();
  }

  const nextId = nextLessonId(
    [...completed, lessonId],
    savedWord && lesson.kind === "frame" ? [...deck, lesson.frame.wordId] : deck,
  );

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <Link href="/" className="text-sm text-white/60 hover:text-white">
        Home
      </Link>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">{lesson.title}</h1>
        <p className="text-sm text-white/75">{lesson.teach}</p>
      </header>

      {previousMissing && previous && !saved ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-white/80">Do the step before this one first.</p>
          <Button asChild className="mt-3">
            <Link href={`/lesson/${previous}`}>Go to that step</Link>
          </Button>
        </div>
      ) : saved ? (
        <SavedPanel
          win={lesson.win}
          word={savedWord}
          meaning={card?.translation ?? null}
          nextId={nextId}
        />
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
              <Button disabled={saving} onClick={() => void save()}>
                {saving ? "Saving…" : "Save this step"}
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

function SavedPanel({
  win,
  word,
  meaning,
  nextId,
}: {
  win: string;
  word: string | null;
  meaning: string | null;
  nextId: string | null;
}) {
  const next = nextId ? getLesson(nextId) : null;
  return (
    <div className="space-y-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
      <p className="text-lg text-white">{win}</p>
      {word ? (
        <div className="space-y-1">
          <ArabicText size="md" forceFull className="text-emerald-50">
            {word}
          </ArabicText>
          {meaning ? <p className="text-white/80">It means {meaning}.</p> : null}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/">Back home</Link>
        </Button>
        {next ? (
          <Button asChild>
            <Link href={`/lesson/${next.id}`}>{nextStepLabel(next)}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function nextStepLabel(lesson: { kind: string; title: string }): string {
  if (lesson.kind === "sentence") return "Make this sentence";
  if (lesson.kind === "frame") return `Next: ${lesson.title}`;
  return `Next: ${lesson.title}`;
}
