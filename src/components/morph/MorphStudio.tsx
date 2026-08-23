"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, HelpCircle, RotateCcw } from "lucide-react";
import { getPatternById, PATTERNS } from "@/data/mockPatterns";
import { DERIVED_WORDS, getRootById, ROOTS } from "@/data/mockRoots";
import { ArabicText } from "@/components/common/ArabicText";
import { SpeakButton } from "@/components/common/SpeakButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatPhonetic,
  getDerivedWord,
  hasDerivedWord,
} from "@/lib/arabic-utils";
import { speakArabic } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { useNawaStore } from "@/store/nawa-store";
import type { TashkeelMode } from "@/types/arabic";

type MorphStudioProps = {
  focusPatternId?: string;
  lockedRootId?: string;
  teachFocus?: "root" | "word" | "pattern";
  onComplete?: () => void;
};

type Phase = "learn" | "confirm";

/**
 * You build the word: tap root letters into empty pattern slots.
 * Then hear the result and confirm the meaning.
 */
export function MorphStudio({
  focusPatternId,
  lockedRootId,
  teachFocus = "word",
  onComplete,
}: MorphStudioProps) {
  const selectedRootId = useNawaStore((s) => s.selectedRootId);
  const selectedPatternId = useNawaStore((s) => s.selectedPatternId);
  const tashkeelMode = useNawaStore((s) => s.tashkeelMode);
  const setPatternId = useNawaStore((s) => s.setPatternId);
  const setTashkeelMode = useNawaStore((s) => s.setTashkeelMode);

  const [phase, setPhase] = useState<Phase>("learn");
  const [slotReset, setSlotReset] = useState(0);
  const [assembled, setAssembled] = useState(false);
  const [quizChoice, setQuizChoice] = useState<string | null>(null);
  const [heard, setHeard] = useState(false);
  const [showVowelHelp, setShowVowelHelp] = useState(false);

  const rootId = lockedRootId ?? selectedRootId;
  const root = getRootById(rootId);
  const patternId = focusPatternId ?? selectedPatternId;
  const pattern = getPatternById(patternId);
  const word = getDerivedWord(rootId, patternId, DERIVED_WORDS);

  useEffect(() => {
    if (focusPatternId) setPatternId(focusPatternId);
  }, [focusPatternId, setPatternId]);

  useEffect(() => {
    setAssembled(false);
    setHeard(false);
    setQuizChoice(null);
    setSlotReset((n) => n + 1);
  }, [rootId, patternId]);

  const availablePatterns = useMemo(
    () => PATTERNS.filter((p) => hasDerivedWord(rootId, p.id, DERIVED_WORDS)),
    [rootId],
  );

  const quiz = useMemo(() => {
    if (!root || !word) return null;

    if (teachFocus === "root") {
      const answer = root.gloss;
      const otherGlosses = ROOTS.map((r) => r.gloss)
        .filter((g) => g !== answer)
        .slice(0, 2);
      return {
        prompt: `These three letters (${root.transliteration}) are the Thread for…`,
        options: shuffleStable([answer, ...otherGlosses], root.id.length),
        answer,
        hint: "The Thread’s family idea (like “writing”), not one finished sentence.",
      };
    }

    if (teachFocus === "pattern") {
      return {
        prompt: `With this Frame, the woven word means…`,
        options: shuffleStable(
          [
            word.translation,
            ...DERIVED_WORDS.filter((w) => w.translation !== word.translation)
              .map((w) => w.translation)
              .filter((t, i, arr) => arr.indexOf(t) === i)
              .slice(0, 2),
          ],
          word.arabic.length + 3,
        ),
        answer: word.translation,
        hint: "Same Thread, different Frame — what English meaning did you just hear?",
      };
    }

    const answer = word.translation;
    const distractors = DERIVED_WORDS.filter((w) => w.translation !== answer)
      .map((w) => w.translation)
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .slice(0, 2);
    return {
      prompt: "What does the word you just wove mean?",
      options: shuffleStable([answer, ...distractors], word.arabic.length),
      answer,
      hint: "Same meaning you saw after you finished weaving.",
    };
  }, [root, word, teachFocus]);

  useEffect(() => {
    if (quiz && quizChoice === quiz.answer && heard) onComplete?.();
  }, [quiz, quizChoice, heard, onComplete]);

  if (!root || !pattern) return null;

  const canConfirm = Boolean(word) && assembled && heard;

  const focusBlurb =
    teachFocus === "root"
      ? "Today’s goal: meet the Thread — three consonants that carry a family of meanings."
      : teachFocus === "pattern"
        ? "Today’s goal: same Thread, new Frame → a new finished word."
        : "Today’s goal: weave the Thread into the Frame, then learn the word you made.";

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardContent className="space-y-5 p-4 sm:p-6">
        <div className="space-y-2">
          <p className="text-primary text-sm font-medium tracking-wide uppercase">
            Weave a word
          </p>
          <p className="text-base leading-relaxed sm:text-lg">{focusBlurb}</p>
          <p className="text-muted-foreground text-base leading-relaxed">
            The <span className="text-foreground font-medium">Root is the raw Thread</span> (the
            core meaning). The{" "}
            <span className="text-foreground font-medium">Pattern is the Frame</span> (the final
            shape). Weave the thread into the frame to build the word.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["learn", "1 · Weave", "Thread into frame"],
              ["confirm", "2 · Check", "Confirm the meaning"],
            ] as const
          ).map(([id, label, sub]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (id === "confirm" && !canConfirm) return;
                setPhase(id);
              }}
              className={cn(
                "rounded-xl border px-3 py-2 text-start transition-colors",
                phase === id ? "border-primary bg-primary/10" : "hover:bg-muted/50",
                id === "confirm" && !canConfirm && "cursor-not-allowed opacity-50",
              )}
            >
              <span className="block text-sm font-semibold sm:text-base">{label}</span>
              <span className="text-muted-foreground text-xs sm:text-sm">{sub}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {phase === "learn" ? (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-5"
            >
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-3 rounded-xl border p-4">
                  <p className="text-sm font-semibold tracking-wide uppercase sm:text-base">
                    Your Thread (root)
                  </p>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Tap each letter in order into the Frame below (right to left).
                  </p>
                  <div className="flex items-center gap-2" dir="rtl">
                    {root.consonants.map((letter, i) => (
                      <div
                        key={letter.arabic}
                        className="bg-muted/50 flex size-14 flex-col items-center justify-center rounded-lg border sm:size-16"
                      >
                        <span className="font-arabic text-3xl font-semibold sm:text-4xl">
                          {letter.arabic}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          #{i + 1} · {letter.latin}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-base sm:text-lg">
                    <span className="font-semibold">{root.transliteration}</span> — family meaning:{" "}
                    <span className="font-semibold">{root.gloss}</span>
                  </p>
                </div>

                <div className="space-y-3 rounded-xl border p-4">
                  <p className="text-sm font-semibold tracking-wide uppercase sm:text-base">
                    The Frame (pattern)
                  </p>
                  {focusPatternId ? (
                    <div className="bg-muted/40 rounded-lg border px-3 py-3">
                      <p className="text-base font-medium">{pattern.templateName}</p>
                      <ArabicText className="mt-1 block text-2xl sm:text-3xl">
                        {pattern.templateArabic}
                      </ArabicText>
                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
                        ف · ع · ل mark where your Thread letters weave into this Frame.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availablePatterns.map((p) => {
                        const active = patternId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPatternId(p.id)}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-start transition-colors",
                              active && "border-primary bg-primary/10 ring-primary/30 ring-1",
                              !active && "hover:bg-muted/50",
                            )}
                          >
                            <span className="block text-sm font-medium">{p.templateName}</span>
                            <ArabicText className="text-lg">{p.templateArabic}</ArabicText>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <InteractiveSlots
                key={`${root.id}-${pattern.id}-${slotReset}`}
                template={pattern.templateArabic}
                consonants={root.consonants.map((c) => c.arabic)}
                latin={root.consonants.map((c) => c.latin)}
                onComplete={() => setAssembled(true)}
                onReset={() => {
                  setAssembled(false);
                  setHeard(false);
                  setSlotReset((n) => n + 1);
                }}
              />

              {assembled && word ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-5 text-center"
                >
                  <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase sm:text-base">
                    You built this word
                  </p>
                  <ArabicText className="block text-5xl font-semibold leading-normal sm:text-6xl">
                    {word.arabic}
                  </ArabicText>
                  <p className="text-xl font-semibold sm:text-2xl">{word.translation}</p>
                  <p className="text-muted-foreground text-base">
                    {formatPhonetic(word.transliteration, word.ipa)}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <SpeakButton
                      text={word.arabic}
                      latinFallback={word.transliteration}
                      label={heard ? "Heard ✓ — play again" : "Hear it"}
                      onSpoke={() => setHeard(true)}
                      size="default"
                    />
                    <TashkeelChips value={tashkeelMode} onChange={setTashkeelMode} />
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      {word.grammaticalCategory}
                    </Badge>
                  </div>
                </motion.div>
              ) : (
                <p className="text-muted-foreground text-center text-base">
                  Finish placing all three letters to unlock the finished word.
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm sm:text-base"
                  onClick={() => setShowVowelHelp((v) => !v)}
                >
                  <HelpCircle className="size-4" />
                  {showVowelHelp ? "Hide vowel help" : "What are the little marks?"}
                </button>
                <Button
                  type="button"
                  onClick={() => setPhase("confirm")}
                  disabled={!canConfirm}
                  className="gap-1"
                  size="lg"
                >
                  {!assembled
                    ? "Finish slotting first"
                    : !heard
                      ? "Hear the word first"
                      : "Check yourself"}
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              {showVowelHelp ? <VowelHelpInline /> : null}
            </motion.div>
          ) : null}

          {phase === "confirm" && word && quiz ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-4"
            >
              <div className="text-center">
                <ArabicText className="block text-4xl font-semibold sm:text-5xl">
                  {word.arabic}
                </ArabicText>
                <p className="mt-3 text-base font-medium sm:text-lg">{quiz.prompt}</p>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">{quiz.hint}</p>
              </div>
              <div className="mx-auto grid max-w-xl gap-2">
                {quiz.options.map((opt) => {
                  const selected = quizChoice === opt;
                  const correct = opt === quiz.answer;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setQuizChoice(opt)}
                      className={cn(
                        "rounded-lg border px-4 py-3 text-start text-base transition-colors sm:text-lg",
                        !selected && "hover:bg-muted/60",
                        selected && correct && "border-emerald-600/50 bg-emerald-600/10",
                        selected && !correct && "border-destructive/50 bg-destructive/10",
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <SpeakButton
                  text={word.arabic}
                  latinFallback={word.transliteration}
                  label="Hear again"
                  onSpoke={() => setHeard(true)}
                />
                <Button type="button" variant="outline" onClick={() => setPhase("learn")}>
                  Back to build
                </Button>
              </div>
              {quizChoice === quiz.answer && heard ? (
                <p className="text-center text-base font-medium text-emerald-700 dark:text-emerald-300 sm:text-lg">
                  Nice — lesson complete.
                </p>
              ) : quizChoice && quizChoice !== quiz.answer ? (
                <p className="text-muted-foreground text-center text-base">
                  Not yet — go back and re-read the English gloss, then try again.
                </p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function InteractiveSlots({
  template,
  consonants,
  latin,
  onComplete,
  onReset,
}: {
  template: string;
  consonants: string[];
  latin: string[];
  onComplete: () => void;
  onReset: () => void;
}) {
  const [filled, setFilled] = useState<(string | null)[]>([null, null, null]);
  const nextIndex = filled.findIndex((x) => x === null);
  const done = filled.every(Boolean);

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const parts = useMemo(() => buildSlotParts(template), [template]);

  function placeNext(letter: string, index: number) {
    if (done) return;
    // Must place in order: 1st, 2nd, then 3rd root letter
    if (index !== nextIndex) return;
    setFilled((prev) => {
      const copy = [...prev] as (string | null)[];
      copy[index] = letter;
      return copy;
    });
    void speakArabic(letter, { latinFallback: latin[index] });
  }

  return (
    <div className="space-y-4 rounded-xl border border-dashed bg-muted/30 px-4 py-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-base font-semibold sm:text-lg">Weave the Thread into the Frame</p>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed sm:text-base">
            Select each root letter in order (right to left) to complete the weave.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" className="gap-1" onClick={onReset}>
          <RotateCcw className="size-3.5" />
          Clear
        </Button>
      </div>

      <div
        className="font-arabic flex flex-wrap items-center justify-center gap-1.5 text-3xl sm:text-4xl"
        dir="rtl"
      >
        {parts.map((part) =>
          part.isSlot ? (
            <span
              key={part.key}
              className={cn(
                "mx-0.5 inline-flex min-w-11 items-center justify-center rounded-md border-2 border-dashed px-2.5 py-1.5",
                filled[part.slotIndex!]
                  ? "border-primary bg-primary text-primary-foreground border-solid"
                  : part.slotIndex === nextIndex
                    ? "border-primary/60 bg-primary/5"
                    : "border-muted-foreground/30 text-muted-foreground",
              )}
            >
              {filled[part.slotIndex!] ?? "·"}
            </span>
          ) : (
            <span key={part.key} className="text-muted-foreground px-0.5">
              {part.label}
            </span>
          ),
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {consonants.map((letter, index) => {
          const used = filled[index] !== null;
          const isNext = index === nextIndex;
          return (
            <button
              key={`${letter}-${index}`}
              type="button"
              disabled={used || (!isNext && !done)}
              onClick={() => placeNext(letter, index)}
              className={cn(
                "rounded-xl border px-4 py-3 text-center transition-all",
                used && "opacity-40",
                isNext && !used && "border-primary bg-primary/10 ring-primary/40 scale-[1.02] ring-2",
                !isNext && !used && "opacity-60",
              )}
            >
              <span className="font-arabic block text-3xl" dir="rtl">
                {letter}
              </span>
              <span className="text-muted-foreground text-xs">
                {used ? "placed" : isNext ? "tap me" : `wait · #${index + 1}`}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-muted-foreground text-center text-sm">
        {done
          ? "All three seats filled."
          : `Next: place letter #${nextIndex + 1} (${latin[nextIndex]})`}
      </p>
    </div>
  );
}

function buildSlotParts(template: string) {
  let fUsed = false;
  let aUsed = false;
  let lUsed = false;
  const parts: { key: string; label: string; isSlot: boolean; slotIndex?: number }[] = [];

  for (let i = 0; i < template.length; i++) {
    const ch = template[i];
    if (ch === "ف" && !fUsed) {
      parts.push({ key: `f-${i}`, label: "ف", isSlot: true, slotIndex: 0 });
      fUsed = true;
    } else if (ch === "ع" && !aUsed) {
      parts.push({ key: `a-${i}`, label: "ع", isSlot: true, slotIndex: 1 });
      aUsed = true;
    } else if (ch === "ل" && !lUsed) {
      parts.push({ key: `l-${i}`, label: "ل", isSlot: true, slotIndex: 2 });
      lUsed = true;
    } else {
      parts.push({ key: `ch-${i}`, label: ch, isSlot: false });
    }
  }
  return parts;
}

function shuffleStable(items: string[], seed: number) {
  return [...items]
    .map((opt, i) => ({ opt, rank: (seed * 17 + i * 13) % 97 }))
    .sort((a, b) => a.rank - b.rank)
    .map((x) => x.opt);
}

function VowelHelpInline() {
  return (
    <div className="bg-muted/40 space-y-3 rounded-xl border px-4 py-4">
      <p className="text-base font-semibold sm:text-lg">Little vowel marks</p>
      <p className="text-muted-foreground text-base leading-relaxed">
        These aren’t extra root letters. They add a short a / i / u sound on top of a consonant.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <DemoGlyph arabic="كَ" caption="short a (like cat)" latin="ka" />
        <DemoGlyph arabic="كِ" caption="short i (like kit)" latin="ki" />
        <DemoGlyph arabic="كُ" caption="short u (like put)" latin="ku" />
      </div>
    </div>
  );
}

function TashkeelChips({
  value,
  onChange,
}: {
  value: TashkeelMode;
  onChange: (m: TashkeelMode) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border">
      {(["full", "minimal", "none"] as TashkeelMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={cn(
            "px-2.5 py-1.5 text-xs capitalize sm:text-sm",
            value === mode ? "bg-primary text-primary-foreground" : "hover:bg-muted/60",
          )}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}

function DemoGlyph({
  arabic,
  caption,
  latin,
}: {
  arabic: string;
  caption: string;
  latin: string;
}) {
  return (
    <button
      type="button"
      onClick={() => void speakArabic(arabic, { latinFallback: latin })}
      className="rounded-xl text-center transition-transform hover:scale-[1.03]"
    >
      <div
        className="font-arabic border-primary/30 bg-primary/10 mx-auto flex size-16 items-center justify-center rounded-xl border text-3xl sm:size-[4.5rem] sm:text-4xl"
        dir="rtl"
        lang="ar"
      >
        {arabic}
      </div>
      <p className="text-foreground mt-2 text-sm font-medium sm:text-base">{caption}</p>
    </button>
  );
}
