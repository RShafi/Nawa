"use client";

import { useState, type ReactNode } from "react";
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

const SOUND: Record<string, string> = {
  ك: "k",
  ت: "t",
  ب: "b",
  د: "d",
  ر: "r",
  س: "s",
  ل: "l",
  م: "m",
};

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
  const previousOpen = previous && !completed.includes(previous) && status === "ready";
  const blocked = previousOpen && !(previous && deck.includes(frameWord(previous)));
  const heading =
    lesson.kind === "frame"
      ? lesson.frame.kind === "build"
        ? "Build one word"
        : "A new word"
      : lesson.title;

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
        Home
      </Link>
      <header className="space-y-1">
        <p className="text-xs tracking-wide text-emerald-200/80 uppercase">One step</p>
        <h1 className="text-2xl font-semibold text-white">{heading}</h1>
      </header>

      {blocked && previous && !saved ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-white/80">Do the previous step first.</p>
          <Button asChild className="mt-3">
            <Link href={`/lesson/${previous}`}>Go to that step</Link>
          </Button>
        </div>
      ) : saved ? (
        <SavedPanel
          word={savedWord}
          meaning={lesson.kind === "frame" ? cardForFrame(lesson.frame)?.translation ?? null : null}
          nextId={nextLessonId(
            [...completed, lessonId],
            savedWord && lesson.kind === "frame" ? [...deck, lesson.frame.wordId] : deck,
          )}
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
                {saving ? "Saving…" : "Save and continue"}
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
  meaning,
  nextId,
  error,
}: {
  word: string | null;
  meaning: string | null;
  nextId: string | null;
  error: string | null;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
      <p className="text-white">Saved.</p>
      {word ? (
        <div className="space-y-1">
          <ArabicText size="md" forceFull className="text-emerald-50">
            {word}
          </ArabicText>
          <p className="text-white/80">{meaning ? `It means ${meaning}.` : "It is in your word list."}</p>
        </div>
      ) : (
        <p className="text-white/70">This step is done.</p>
      )}
      {error ? <p className="text-sm text-rose-200">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/">Back home</Link>
        </Button>
        {nextId ? (
          <Button asChild>
            <Link href={`/lesson/${nextId}`}>Continue</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function LookFirst({
  children,
  then,
}: {
  children: ReactNode;
  then: ReactNode;
}) {
  const [ready, setReady] = useState(false);
  if (!ready) {
    return (
      <div className="space-y-4">
        {children}
        <Button type="button" onClick={() => setReady(true)}>
          Continue
        </Button>
      </div>
    );
  }
  return <div className="space-y-4">{then}</div>;
}

function ChoiceButton({
  arabic,
  label,
  selected,
  wrong,
  onClick,
}: {
  arabic?: string;
  label?: string;
  selected: boolean;
  wrong: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      dir="ltr"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center",
        selected && !wrong && "border-emerald-400/60 bg-emerald-500/15",
        wrong && "border-rose-400/60 bg-rose-500/10",
      )}
    >
      {arabic ? (
        <span dir="rtl" lang="ar" className="font-arabic text-3xl leading-relaxed text-amber-50 [unicode-bidi:isolate]">
          {arabic}
        </span>
      ) : null}
      {label ? (
        <span dir="ltr" className="text-sm text-white/85 [unicode-bidi:isolate]">
          {label}
        </span>
      ) : null}
    </button>
  );
}

function ChoiceGrid({
  options,
  answer,
  onCorrect,
}: {
  options: Array<{ id: string; label?: string; arabic?: string }>;
  answer: string;
  onCorrect: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const solved = picked === answer;
  return (
    <div className="grid gap-2">
      {options.map((option) => (
        <ChoiceButton
          key={option.id}
          arabic={option.arabic}
          label={option.label}
          selected={picked === option.id || (solved && option.id === answer)}
          wrong={picked === option.id && option.id !== answer}
          onClick={() => {
            if (solved) return;
            setPicked(option.id);
            if (option.id === answer) onCorrect();
          }}
        />
      ))}
      {picked && picked !== answer ? (
        <p className="text-sm text-white/60">Not that one. Try another.</p>
      ) : null}
    </div>
  );
}

function LetterStep({ onDone }: { onDone: () => void }) {
  return (
    <LookFirst
      then={
        <>
          <p className="text-white/80">Which letter says b?</p>
          <ChoiceGrid
            answer="ba"
            onCorrect={onDone}
            options={[
              { id: "ta", arabic: "ت", label: "t" },
              { id: "ba", arabic: "ب", label: "b" },
              { id: "kaf", arabic: "ك", label: "k" },
            ]}
          />
        </>
      }
    >
      <ArabicText size="lg" forceFull className="text-amber-50">
        ب
      </ArabicText>
      <p className="text-white/80">This letter says b, as in book.</p>
      <HearButton text="ب" label="Play the sound" />
    </LookFirst>
  );
}

const SHAPES = [
  { id: "iso", arabic: "ب", label: "Alone" },
  { id: "ini", arabic: "بـ", label: "At the start" },
  { id: "med", arabic: "ـبـ", label: "In the middle" },
  { id: "fin", arabic: "ـب", label: "At the end" },
];

function ShapeStep({ onDone }: { onDone: () => void }) {
  return (
    <LookFirst
      then={
        <>
          <p className="text-white/80">Which shape sits in the middle of a word?</p>
          <ChoiceGrid
            answer="med"
            onCorrect={onDone}
            options={SHAPES.map((shape) => ({ id: shape.id, arabic: shape.arabic }))}
          />
        </>
      }
    >
      <p className="text-white/80">The letter b changes shape when it joins the letters beside it.</p>
      <div className="grid grid-cols-2 gap-2">
        {SHAPES.map((shape) => (
          <div key={shape.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
            <span dir="rtl" lang="ar" className="font-arabic block text-3xl text-amber-50 [unicode-bidi:isolate]">
              {shape.arabic}
            </span>
            <span dir="ltr" className="mt-1 block text-sm text-white/70 [unicode-bidi:isolate]">
              {shape.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-sm text-white/60">The middle shape has a join on both sides.</p>
    </LookFirst>
  );
}

function VowelStep({ onDone }: { onDone: () => void }) {
  return (
    <LookFirst
      then={
        <>
          <p className="text-white/80">Which one says ba?</p>
          <ChoiceGrid
            answer="ba"
            onCorrect={onDone}
            options={[
              { id: "bi", arabic: "بِ", label: "bi" },
              { id: "ba", arabic: "بَ", label: "ba" },
              { id: "bu", arabic: "بُ", label: "bu" },
            ]}
          />
        </>
      }
    >
      <ArabicText size="lg" forceFull className="text-amber-50">
        بَ
      </ArabicText>
      <p className="text-white/80">The short line above the letter is a short a. Together they say ba.</p>
      <HearButton text="بَ" label="Play ba" />
    </LookFirst>
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
      <LookFirst
        then={
          <>
            <p className="text-white/80">Tap the letters in that order. The first tap goes on the right.</p>
            <BuildLetters letters={letters} onCorrect={onDone} />
            {done && card ? (
              <div className="space-y-2 rounded-2xl border border-white/10 p-4 text-center">
                <ArabicText size="lg" forceFull className="text-amber-50">
                  {card.word}
                </ArabicText>
                <p className="text-white/80">It means {card.translation}.</p>
                <HearButton text={card.word} label="Play the word" />
              </div>
            ) : null}
          </>
        }
      >
        <p className="text-white/80">{lesson.frame.teach}</p>
        <div dir="rtl" className="flex justify-center gap-2">
          {letters.map((letter) => (
            <div key={letter} className="w-16 rounded-xl border border-white/10 bg-white/5 py-2 text-center">
              <span lang="ar" className="font-arabic block text-3xl text-amber-50">
                {letter}
              </span>
              <span dir="ltr" className="text-sm text-white/70">
                {SOUND[letter] ?? ""}
              </span>
            </div>
          ))}
        </div>
        {card ? (
          <div className="space-y-2 text-center">
            <ArabicText size="lg" forceFull className="text-amber-50">
              {card.word}
            </ArabicText>
            <p className="text-white/80">With the vowel marks, it means {card.translation}.</p>
            <HearButton text={card.word} label="Play the word" />
          </div>
        ) : null}
      </LookFirst>
    );
  }
  if (!card) return <p className="text-white/70">This word is missing from the list.</p>;
  return <HearFrame lesson={lesson} done={done} onDone={onDone} />;
}

function hearOptions(lesson: FrameLesson): Array<{ id: string; arabic: string }> {
  const answer = cardForFrame(lesson.frame);
  if (!answer) return [];
  const others = lesson.plant.frames
    .filter((frame) => frame.wordId !== lesson.frame.wordId)
    .map((frame) => cardForFrame(frame))
    .filter((card): card is NonNullable<ReturnType<typeof cardForFrame>> => Boolean(card));
  const picked = [others[0], answer, others[1] ?? others[2]].filter(
    (card): card is NonNullable<typeof answer> => Boolean(card),
  );
  return picked.map((card) => ({ id: card.id, arabic: card.word }));
}

function HearFrame({
  lesson,
  done,
  onDone,
}: {
  lesson: FrameLesson;
  done: boolean;
  onDone: () => void;
}) {
  const answer = cardForFrame(lesson.frame);
  const known = cardForFrame(lesson.plant.frames[0]!);
  if (!answer) return <p className="text-white/70">This word is missing from the list.</p>;
  return (
    <LookFirst
      then={
        <>
          <p className="text-white/80">Which word is {lesson.frame.frameName}?</p>
          <ChoiceGrid answer={answer.id} onCorrect={onDone} options={hearOptions(lesson)} />
          {done ? (
            <div className="space-y-2 rounded-2xl border border-white/10 p-4 text-center">
              <ArabicText size="lg" forceFull className="text-amber-50">
                {answer.word}
              </ArabicText>
              <p className="text-white/80">It means {answer.translation}.</p>
              <HearButton text={answer.word} label="Play the word" />
            </div>
          ) : null}
        </>
      }
    >
      <p className="text-white/80">{lesson.frame.teach}</p>
      {known && known.id !== answer.id ? (
        <div className="space-y-1 text-center">
          <ArabicText size="lg" forceFull className="text-amber-50">
            {known.word}
          </ArabicText>
          <p className="text-white/70">You already have this one. It means {known.translation}.</p>
        </div>
      ) : null}
    </LookFirst>
  );
}

function BuildLetters({ letters, onCorrect }: { letters: string[]; onCorrect: () => void }) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);
  const solved = placed.length === letters.length && placed.every((part, index) => part === letters[index]);

  function tap(letter: string) {
    if (solved || placed.includes(letter)) return;
    const next = [...placed, letter];
    setPlaced(next);
    if (next.length < letters.length) {
      setWrong(false);
      return;
    }
    const ok = next.every((part, index) => part === letters[index]);
    setWrong(!ok);
    if (ok) onCorrect();
  }

  return (
    <div className="space-y-3">
      <div dir="rtl" className="flex justify-center gap-2">
        {letters.map((letter, index) => (
          <div
            key={`${letter}-slot`}
            className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-white/25 bg-black/20"
          >
            {placed[index] ? (
              <span lang="ar" className="font-arabic text-3xl text-amber-50">
                {placed[index]}
              </span>
            ) : (
              <span className="text-white/30">{index + 1}</span>
            )}
          </div>
        ))}
      </div>
      <div dir="rtl" className="flex justify-center gap-2">
        {letters.map((letter) => (
          <button
            key={letter}
            type="button"
            disabled={placed.includes(letter) || solved}
            className="w-16 rounded-xl border border-white/15 bg-white/5 py-2 text-center disabled:opacity-30"
            onClick={() => tap(letter)}
          >
            <span lang="ar" className="font-arabic block text-3xl text-white">
              {letter}
            </span>
            <span dir="ltr" className="text-xs text-white/60">
              {SOUND[letter] ?? ""}
            </span>
          </button>
        ))}
      </div>
      {wrong ? (
        <button
          type="button"
          className="text-sm text-white/70 underline"
          onClick={() => {
            setPlaced([]);
            setWrong(false);
          }}
        >
          Clear and try again
        </button>
      ) : null}
    </div>
  );
}
