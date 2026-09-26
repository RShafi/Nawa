"use client";

import { useState } from "react";
import { HearButton } from "@/components/path/HearButton";
import { ArabicText } from "@/components/common/ArabicText";
import { useNeuralAudio } from "@/hooks/useNeuralAudio";
import type { FrameLesson, SentenceLesson } from "@/data/garden";
import { cardForFrame, rootLetters } from "@/data/garden";
import { cn } from "@/lib/utils";

const SOUND: Record<string, string> = {
  ك: "k",
  ت: "t",
  ب: "b",
  د: "d",
  ر: "r",
  س: "s",
  ل: "l",
  م: "m",
  ا: "long a",
  و: "w",
  ي: "y",
};

const SHAPES = [
  { id: "alone", arabic: "ب", label: "By itself" },
  { id: "start", arabic: "بـ", label: "At the start" },
  { id: "middle", arabic: "ـبـ", label: "In the middle" },
  { id: "end", arabic: "ـب", label: "At the end" },
];

const SHAPE_BANK = [SHAPES[2]!, SHAPES[0]!, SHAPES[3]!, SHAPES[1]!];

const MARKS = [
  { id: "a", mark: "\u064E", label: "short a", shown: "بَ", sound: "بَ" },
  { id: "i", mark: "\u0650", label: "short i", shown: "بِ", sound: "بِ" },
  { id: "u", mark: "\u064F", label: "short u", shown: "بُ", sound: "بُ" },
];

function LookFirst({
  children,
  then,
}: {
  children: React.ReactNode;
  then: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  if (!ready) {
    return (
      <div className="space-y-4">
        {children}
        <button
          type="button"
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black"
          onClick={() => setReady(true)}
        >
          Try it
        </button>
      </div>
    );
  }
  return <div className="space-y-4">{then}</div>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-white/70">{children}</p>;
}

export function LetterStep({ onDone }: { onDone: () => void }) {
  return (
    <LookFirst
      then={
        <HearThenTap
          sound="ب"
          prompt="Play the sound, then tap that letter."
          answer="ب"
          options={[
            { id: "ت", arabic: "ت" },
            { id: "ب", arabic: "ب" },
            { id: "ك", arabic: "ك" },
          ]}
          wrong="Listen again. That letter is a different sound."
          onDone={onDone}
        />
      }
    >
      <ArabicText size="lg" forceFull className="text-amber-50">
        ب
      </ArabicText>
      <HearButton text="ب" label="Play the sound" />
    </LookFirst>
  );
}

export function ShapeStep({ onDone }: { onDone: () => void }) {
  return (
    <LookFirst
      then={
        <>
          <p className="text-white/80">Tap each shape into the next box.</p>
          <OrderIntoSlots
            slots={SHAPES.map((shape) => ({ id: shape.id, label: shape.label }))}
            bank={SHAPE_BANK.map((shape) => ({ id: shape.id, arabic: shape.arabic }))}
            onCorrect={onDone}
          />
        </>
      }
    >
      <HearButton text="ب" label="Play the sound" />
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
      <Hint>The middle shape has a join on both sides.</Hint>
    </LookFirst>
  );
}

export function VowelStep({ onDone }: { onDone: () => void }) {
  return (
    <LookFirst then={<PlaceMark onDone={onDone} />}>
      <ArabicText size="lg" forceFull className="text-amber-50">
        ب
      </ArabicText>
      <p className="text-white/80">Together, b and a short a say ba.</p>
      <Hint>You will put that mark on the letter yourself.</Hint>
    </LookFirst>
  );
}

export function FrameStep({
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
  if (!card && lesson.frame.kind !== "build") {
    return <p className="text-white/70">This word is missing from the list.</p>;
  }

  return (
    <LookFirst
      then={
        <>
          {lesson.frame.kind !== "hear" ? <p className="text-white/80">{lesson.task}</p> : null}
          {lesson.frame.kind === "build" ? (
            <BuildLetters letters={letters} onCorrect={onDone} />
          ) : null}
          {lesson.frame.kind === "insert" && lesson.frame.pieces && lesson.frame.gap ? (
            <InsertPiece
              letters={letters}
              gap={lesson.frame.gap}
              pieces={lesson.frame.pieces}
              onCorrect={onDone}
            />
          ) : null}
          {lesson.frame.kind === "strengthen" ? (
            <StrengthenMiddle letters={letters} onCorrect={onDone} />
          ) : null}
          {lesson.frame.kind === "hear" && card ? (
            <HearThenTap
              sound={card.word}
              prompt={lesson.task}
              answer={card.id}
              options={hearOptions(lesson)}
              wrong="Listen again. That is a different word."
              onDone={onDone}
            />
          ) : null}
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
      {lesson.frame.kind === "build" ? (
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
      ) : null}
      {lesson.frame.kind !== "build" ? <KnownWord lesson={lesson} /> : null}
    </LookFirst>
  );
}

export function SentenceStep({
  lesson,
  done,
  onDone,
}: {
  lesson: SentenceLesson;
  done: boolean;
  onDone: () => void;
}) {
  return (
    <LookFirst
      then={
        <>
          <p className="text-white/80">{lesson.task}</p>
          <OrderIntoSlots
            slots={lesson.words.map((word) => ({ id: word.id, label: word.label }))}
            bank={[lesson.words[1]!, lesson.words[0]!].map((word) => ({
              id: word.id,
              arabic: word.arabic,
              label: word.label,
            }))}
            onCorrect={onDone}
          />
          {done ? (
            <div className="space-y-2 rounded-2xl border border-white/10 p-4 text-center">
              <p dir="rtl" className="font-arabic text-3xl text-amber-50">
                {lesson.words.map((word) => word.arabic).join(" ")}
              </p>
              <p className="text-white/80">{lesson.meaning}</p>
              <HearButton text={lesson.words.map((word) => word.arabic).join(" ")} label="Play the sentence" />
            </div>
          ) : null}
        </>
      }
    >
      <div dir="rtl" className="flex justify-center gap-3">
        {lesson.words.map((word) => (
          <div key={word.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
            <span lang="ar" className="font-arabic block text-2xl text-amber-50">
              {word.arabic}
            </span>
            <span dir="ltr" className="text-sm text-white/70">
              {word.label}
            </span>
          </div>
        ))}
      </div>
    </LookFirst>
  );
}

function KnownWord({ lesson }: { lesson: FrameLesson }) {
  const known = cardForFrame(lesson.plant.frames[0]!);
  const answer = cardForFrame(lesson.frame);
  if (!known || known.id === answer?.id) return null;
  return (
    <div className="space-y-2 text-center">
      <ArabicText size="lg" forceFull className="text-amber-50">
        {known.word}
      </ArabicText>
      <p className="text-white/70">You already have this one. It means {known.translation}.</p>
      <HearButton text={known.word} label="Play the word" />
    </div>
  );
}

function hearOptions(lesson: FrameLesson): Array<{ id: string; arabic: string }> {
  const answer = cardForFrame(lesson.frame);
  if (!answer) return [];
  const others = lesson.plant.frames
    .map((frame) => cardForFrame(frame))
    .filter((card): card is NonNullable<ReturnType<typeof cardForFrame>> => Boolean(card))
    .filter((card) => card.id !== answer.id);
  const picked = [others[0], answer, others[1] ?? others[2]].filter(
    (card): card is NonNullable<typeof answer> => Boolean(card),
  );
  return picked.map((card) => ({ id: card.id, arabic: card.word }));
}

function HearThenTap({
  sound,
  prompt,
  answer,
  options,
  wrong,
  onDone,
}: {
  sound: string;
  prompt: string;
  answer: string;
  options: Array<{ id: string; arabic: string }>;
  wrong: string;
  onDone: () => void;
}) {
  const { play, isLoading, isPlaying, error } = useNeuralAudio(sound);
  const [played, setPlayed] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const solved = picked === answer;

  return (
    <div className="space-y-3">
      <p className="text-white/80">{prompt}</p>
      <button
        type="button"
        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white"
        onClick={() => {
          void play(sound).then((ok) => {
            if (ok) setPlayed(true);
          });
        }}
      >
        {isLoading ? "Preparing audio…" : isPlaying ? "Playing…" : "Play the sound"}
      </button>
      {error ? <Hint>{error}</Hint> : null}
      <div className="grid gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={!played || solved}
            className={cn(
              "rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center disabled:opacity-40",
              picked === option.id && option.id === answer && "border-emerald-400/60 bg-emerald-500/15",
              picked === option.id && option.id !== answer && "border-rose-400/60 bg-rose-500/10",
            )}
            onClick={() => {
              if (!played || solved) return;
              setPicked(option.id);
              if (option.id === answer) onDone();
            }}
          >
            <span dir="rtl" lang="ar" className="font-arabic text-3xl text-amber-50 [unicode-bidi:isolate]">
              {option.arabic}
            </span>
          </button>
        ))}
      </div>
      {!played ? <Hint>Play the sound before you tap.</Hint> : null}
      {picked && picked !== answer ? <Hint>{wrong}</Hint> : null}
    </div>
  );
}

function OrderIntoSlots({
  slots,
  bank,
  onCorrect,
}: {
  slots: Array<{ id: string; label: string }>;
  bank: Array<{ id: string; arabic: string; label?: string }>;
  onCorrect: () => void;
}) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const solved = placed.length === slots.length;

  function tap(id: string) {
    if (solved || placed.includes(id)) return;
    const expected = slots[placed.length];
    if (!expected || id !== expected.id) {
      setNote(`Not yet. The next box is “${expected?.label ?? "the next one"}”.`);
      return;
    }
    const next = [...placed, id];
    setPlaced(next);
    setNote(null);
    if (next.length === slots.length) onCorrect();
  }

  return (
    <div className="space-y-3">
      <div dir="rtl" className="flex justify-center gap-2">
        {slots.map((slot, index) => {
          const item = bank.find((entry) => entry.id === placed[index]);
          return (
            <div key={slot.id} className="w-28 text-center">
              <p dir="ltr" className="mb-1 text-xs text-white/50 [unicode-bidi:isolate]">
                {slot.label}
              </p>
              <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-white/25 bg-black/20">
                {item ? (
                  <span lang="ar" className="font-arabic text-3xl text-amber-50">
                    {item.arabic}
                  </span>
                ) : (
                  <span className="text-white/30">{index + 1}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div dir="rtl" className="flex flex-wrap justify-center gap-2">
        {bank.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={placed.includes(item.id) || solved}
            className="min-w-16 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-center disabled:opacity-30"
            onClick={() => tap(item.id)}
          >
            <span lang="ar" className="font-arabic block text-3xl text-white">
              {item.arabic}
            </span>
            {item.label ? (
              <span dir="ltr" className="text-xs text-white/60">
                {item.label}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      {note ? <Hint>{note}</Hint> : null}
    </div>
  );
}

function PlaceMark({ onDone }: { onDone: () => void }) {
  const [markId, setMarkId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const current = MARKS.find((mark) => mark.id === markId);
  const solved = markId === "a";

  return (
    <div className="space-y-4 text-center">
      <p className="text-white/80">Tap the short a mark onto the letter.</p>
      <ArabicText size="lg" forceFull className="text-amber-50">
        {current?.shown ?? "ب"}
      </ArabicText>
      <div className="flex justify-center gap-2">
        {MARKS.map((mark) => (
          <button
            key={mark.id}
            type="button"
            disabled={solved}
            className={cn(
              "rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white",
              markId === mark.id && mark.id === "a" && "border-emerald-400/60",
              markId === mark.id && mark.id !== "a" && "border-rose-400/60",
            )}
            onClick={() => {
              setMarkId(mark.id);
              if (mark.id === "a") {
                setNote("Yes. That mark is a short a.");
                onDone();
              } else {
                setNote("That mark is a different sound. Use the short line above.");
              }
            }}
          >
            <span lang="ar" className="font-arabic block text-2xl">
              {mark.shown}
            </span>
            <span>{mark.label}</span>
          </button>
        ))}
      </div>
      {solved ? <HearButton text="بَ" label="Play ba" /> : null}
      {note ? <Hint>{note}</Hint> : null}
    </div>
  );
}

function BuildLetters({ letters, onCorrect }: { letters: string[]; onCorrect: () => void }) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);
  const solved = placed.length === letters.length && placed.every((part, index) => part === letters[index]);
  const first = SOUND[letters[0] ?? ""] ?? "the first letter";

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
        <div className="space-y-1 text-center">
          <Hint>Arabic starts on the right. Tap {first} first.</Hint>
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
        </div>
      ) : null}
    </div>
  );
}

function InsertPiece({
  letters,
  gap,
  pieces,
  onCorrect,
}: {
  letters: string[];
  gap: "front" | "middle";
  pieces: Array<{ id: string; arabic: string; label: string }>;
  onCorrect: () => void;
}) {
  const correct = pieces[0];
  const [placed, setPlaced] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const solved = placed === correct?.id;
  const bank = [pieces[1], pieces[0], pieces[2]].filter(
    (piece): piece is NonNullable<typeof piece> => Boolean(piece),
  );

  const view =
    gap === "middle"
      ? [
          { kind: "fixed" as const, letter: letters[0] ?? "" },
          { kind: "gap" as const, letter: "" },
          ...letters.slice(1).map((letter) => ({ kind: "fixed" as const, letter })),
        ]
      : [{ kind: "gap" as const, letter: "" }, ...letters.map((letter) => ({ kind: "fixed" as const, letter }))];

  return (
    <div className="space-y-3">
      <div dir="rtl" className="flex justify-center gap-2">
        {view.map((cell, index) => (
          <div
            key={`${cell.kind}-${index}`}
            className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-white/25 bg-black/20"
          >
            {cell.kind === "gap" ? (
              solved && correct ? (
                <span lang="ar" className="font-arabic text-3xl text-emerald-200">
                  {correct.arabic}
                </span>
              ) : (
                <span className="text-white/30">?</span>
              )
            ) : (
              <span lang="ar" className="font-arabic text-3xl text-amber-50">
                {cell.letter}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {bank.map((piece) => (
          <button
            key={piece.id}
            type="button"
            disabled={solved}
            className="min-w-16 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-center disabled:opacity-40"
            onClick={() => {
              if (piece.id === correct?.id) {
                setPlaced(piece.id);
                setNote(null);
                onCorrect();
              } else {
                setNote(`Not that one. Use the ${correct?.label ?? "right piece"}.`);
              }
            }}
          >
            <span lang="ar" className="font-arabic block text-3xl text-white">
              {piece.arabic}
            </span>
            <span dir="ltr" className="text-xs text-white/60">
              {piece.label}
            </span>
          </button>
        ))}
      </div>
      {note ? <Hint>{note}</Hint> : null}
    </div>
  );
}

function StrengthenMiddle({ letters, onCorrect }: { letters: string[]; onCorrect: () => void }) {
  const [note, setNote] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const middle = letters[1] ?? "";

  return (
    <div className="space-y-3 text-center">
      <div dir="rtl" className="flex justify-center gap-2">
        {letters.map((letter, index) => (
          <button
            key={letter}
            type="button"
            disabled={solved}
            className={cn(
              "w-16 rounded-xl border border-white/15 bg-white/5 py-3",
              solved && index === 1 && "border-emerald-400/60 bg-emerald-500/15",
            )}
            onClick={() => {
              if (index === 1) {
                setSolved(true);
                setNote(null);
                onCorrect();
              } else {
                setNote(`Tap the middle letter, ${SOUND[middle] ?? "the middle one"}.`);
              }
            }}
          >
            <span lang="ar" className="font-arabic text-3xl text-amber-50">
              {letter}
            </span>
          </button>
        ))}
      </div>
      {note ? <Hint>{note}</Hint> : null}
    </div>
  );
}
