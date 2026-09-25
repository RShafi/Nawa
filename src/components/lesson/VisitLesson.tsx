"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HearButton } from "@/components/path/HearButton";
import { ArabicText } from "@/components/common/ArabicText";
import { Button } from "@/components/ui/button";
import { completeVisitAction } from "@/app/actions/garden";
import {
  cardForFrame,
  getLesson,
  nextLessonId,
  previousLessonId,
  rootLetters,
  type FrameLesson,
} from "@/data/garden";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

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
        <p className="text-white/80">That step is not on the path.</p>
        <Button asChild className="mt-4">
          <Link href="/">Back to the garden</Link>
        </Button>
      </main>
    );
  }

  const previous = previousLessonId(lessonId);
  const previousOpen = previous && !completed.includes(previous) && status === "ready";
  const blocked =
    previousOpen &&
    !(previous && deck.includes(frameWord(previous)));

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
      const card = lesson && lesson.kind === "frame" ? cardForFrame(lesson.frame) : undefined;
      setSavedWord(card?.word ?? result.wordId);
    }
    setSaved(true);
    if (typeof result.hibrBalance === "number") setHibr(result.hibrBalance);
    else if (result.bonusAwarded) addHibr(result.bonusAwarded);
    void hydrate();
    router.refresh();
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <Link href="/" className="text-sm text-white/60 hover:text-white">
        Garden
      </Link>
      <header className="space-y-1">
        <p className="text-xs tracking-wide text-emerald-200/80 uppercase">One step</p>
        <h1 className="text-2xl font-semibold text-white">{lesson.title}</h1>
      </header>

      {status === "loading" || status === "idle" ? (
        <p className="text-sm text-white/50">Loading your garden…</p>
      ) : null}

      {blocked && previous && !saved ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-white/80">Finish the previous step first.</p>
          <Button asChild className="mt-3">
            <Link href={`/lesson/${previous}`}>Go to that step</Link>
          </Button>
        </div>
      ) : saved ? (
        <SavedPanel
          word={savedWord}
          nextId={nextLessonId([...completed, lessonId], savedWord && lesson.kind === "frame" ? [...deck, lesson.frame.wordId] : deck)}
          error={error}
        />
      ) : (
        <>
          {lesson.kind === "letter" ? <LetterStep onDone={() => setTaskDone(true)} /> : null}
          {lesson.kind === "shapes" ? <ShapeStep onDone={() => setTaskDone(true)} /> : null}
          {lesson.kind === "vowel" ? <VowelStep onDone={() => setTaskDone(true)} /> : null}
          {lesson.kind === "frame" ? (
            <FrameStep lesson={lesson} done={taskDone} onDone={() => setTaskDone(true)} />
          ) : null}
          {taskDone ? (
            <div className="space-y-2">
              {error ? <p className="text-sm text-rose-200">{error}</p> : null}
              <Button disabled={saving} onClick={() => void save()}>
                {saving ? "Saving…" : lesson.kind === "frame" ? "Save this word" : "Save this step"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}

function frameWord(lessonId: string): string {
  const lesson = getLesson(lessonId);
  if (!lesson || lesson.kind !== "frame") return "";
  return lesson.frame.wordId;
}

function SavedPanel({
  word,
  nextId,
  error,
}: {
  word: string | null;
  nextId: string | null;
  error: string | null;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
      <p className="text-white">Saved.</p>
      {word ? (
        <p className="text-white/80">
          <ArabicText size="md" forceFull className="text-emerald-50">
            {word}
          </ArabicText>{" "}
          is in your deck.
        </p>
      ) : (
        <p className="text-white/70">This step is on your path.</p>
      )}
      {error ? <p className="text-sm text-rose-200">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/">Back to the garden</Link>
        </Button>
        {nextId ? (
          <Button asChild>
            <Link href={`/lesson/${nextId}`}>Next step</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ChoiceGrid({
  options,
  answer,
  onCorrect,
}: {
  options: Array<{ id: string; label: string; arabic?: string }>;
  answer: string;
  onCorrect: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="grid gap-2">
      {options.map((option) => {
        const selected = picked === option.id;
        const correct = option.id === answer;
        return (
          <button
            key={option.id}
            type="button"
            className={cn(
              "rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-start text-white",
              selected && correct && "border-emerald-400/60 bg-emerald-500/15",
              selected && !correct && "border-rose-400/60 bg-rose-500/10",
            )}
            onClick={() => {
              setPicked(option.id);
              if (correct) onCorrect();
            }}
          >
            {option.arabic ? (
              <ArabicText size="md" forceFull className="me-2 text-amber-50">
                {option.arabic}
              </ArabicText>
            ) : null}
            <span className="text-sm text-white/80">{option.label}</span>
          </button>
        );
      })}
      {picked && picked !== answer ? (
        <p className="text-sm text-white/60">Not that one. Try again.</p>
      ) : null}
    </div>
  );
}

function LetterStep({ onDone }: { onDone: () => void }) {
  return (
    <section className="space-y-4">
      <ArabicText size="lg" forceFull className="text-amber-50">
        ب
      </ArabicText>
      <p className="text-white/75">This letter is a soft b. Hear it, then tap it.</p>
      <HearButton text="بَ" label="Hear ب" />
      <ChoiceGrid
        answer="ba"
        onCorrect={onDone}
        options={[
          { id: "ba", arabic: "ب", label: "b" },
          { id: "ta", arabic: "ت", label: "t" },
          { id: "kaf", arabic: "ك", label: "k" },
        ]}
      />
    </section>
  );
}

function ShapeStep({ onDone }: { onDone: () => void }) {
  return (
    <section className="space-y-4">
      <p className="text-white/75">ب changes shape when it joins a word. Which shape sits in the middle?</p>
      <ChoiceGrid
        answer="med"
        onCorrect={onDone}
        options={[
          { id: "iso", arabic: "ب", label: "alone" },
          { id: "ini", arabic: "بـ", label: "at the start" },
          { id: "med", arabic: "ـبـ", label: "in the middle" },
          { id: "fin", arabic: "ـب", label: "at the end" },
        ]}
      />
    </section>
  );
}

function VowelStep({ onDone }: { onDone: () => void }) {
  return (
    <section className="space-y-4">
      <p className="text-white/75">A short line above the letter is a short a. Hear it, then tap the mark.</p>
      <HearButton text="بَ" label="Hear ba" />
      <ChoiceGrid
        answer="ba"
        onCorrect={onDone}
        options={[
          { id: "ba", arabic: "بَ", label: "ba" },
          { id: "bi", arabic: "بِ", label: "bi" },
          { id: "bu", arabic: "بُ", label: "bu" },
        ]}
      />
    </section>
  );
}

function FrameStep({
  lesson,
  done,
  onDone,
}: {
  lesson: FrameLesson;
  done: boolean;
  onDone: () => void;
}) {
  const card = cardForFrame(lesson.frame);
  const letters = rootLetters(lesson.plant.rootId);
  if (lesson.frame.kind === "build") {
    return (
      <section className="space-y-4">
        <p className="text-white/75">{lesson.frame.teach}</p>
        <p className="text-sm text-white/55">
          Frame <ArabicText size="sm" forceFull>{lesson.frame.frameTemplate}</ArabicText>
        </p>
        <BuildLetters letters={letters} onCorrect={onDone} />
        {done && card ? (
          <div className="space-y-2 rounded-2xl border border-white/10 p-4">
            <ArabicText size="lg" forceFull className="text-amber-50">
              {card.word}
            </ArabicText>
            <p className="text-white/80">{card.translation}</p>
            <HearButton text={card.word} label="Hear the word" />
          </div>
        ) : null}
      </section>
    );
  }
  if (!card) return <p className="text-white/70">This word is missing from the deck list.</p>;
  return (
    <HearFrame cardWord={card.word} gloss={card.translation} teach={lesson.frame.teach} template={lesson.frame.frameTemplate} root={lesson.plant.letters} onDone={onDone} />
  );
}

function HearFrame({
  cardWord,
  gloss,
  teach,
  template,
  root,
  onDone,
}: {
  cardWord: string;
  gloss: string;
  teach: string;
  template: string;
  root: string;
  onDone: () => void;
}) {
  const options = useMemo(() => {
    const pool = ["He wrote", "The writer", "The desk", "The book", "He studied", "The school", "He was safe", "He greeted", "He taught", "The student", "Safe", "He made someone write"];
    const wrong = pool.filter((item) => item !== gloss).slice(0, 2);
    return shuffle([gloss, ...wrong]);
  }, [gloss]);

  return (
    <section className="space-y-4">
      <p className="text-sm text-white/55">
        Root <ArabicText size="sm" forceFull>{root}</ArabicText>
        {" · "}
        frame <ArabicText size="sm" forceFull>{template}</ArabicText>
      </p>
      <p className="text-white/75">{teach}</p>
      <ArabicText size="lg" forceFull className="text-amber-50">
        {cardWord}
      </ArabicText>
      <HearButton text={cardWord} label="Hear the word" />
      <p className="text-sm text-white/60">What does it mean?</p>
      <ChoiceGrid
        answer={gloss}
        onCorrect={onDone}
        options={options.map((label) => ({ id: label, label }))}
      />
    </section>
  );
}

function BuildLetters({ letters, onCorrect }: { letters: string[]; onCorrect: () => void }) {
  const bank = useMemo(() => shuffle(letters.map((letter, index) => ({ id: `${letter}-${index}`, letter }))), [letters]);
  const [placed, setPlaced] = useState<Array<{ id: string; letter: string }>>([]);
  const [wrong, setWrong] = useState(false);

  function tap(item: { id: string; letter: string }) {
    if (placed.some((p) => p.id === item.id)) return;
    const next = [...placed, item];
    setPlaced(next);
    if (next.length < letters.length) {
      setWrong(false);
      return;
    }
    const ok = next.every((part, index) => part.letter === letters[index]);
    setWrong(!ok);
    if (ok) onCorrect();
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {letters.map((_, index) => (
          <div
            key={index}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/20"
          >
            {placed[index] ? (
              <ArabicText size="md" forceFull className="text-amber-50">
                {placed[index].letter}
              </ArabicText>
            ) : (
              <span className="text-white/30">{index + 1}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {bank.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={placed.some((p) => p.id === item.id)}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 disabled:opacity-30"
            onClick={() => tap(item)}
          >
            <ArabicText size="md" forceFull className="text-white">
              {item.letter}
            </ArabicText>
          </button>
        ))}
      </div>
      {wrong ? (
        <button type="button" className="text-sm text-white/60 underline" onClick={() => { setPlaced([]); setWrong(false); }}>
          Clear and try again
        </button>
      ) : null}
    </div>
  );
}

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const left = copy[i];
    const right = copy[j];
    if (left === undefined || right === undefined) continue;
    copy[i] = right;
    copy[j] = left;
  }
  return copy;
}
