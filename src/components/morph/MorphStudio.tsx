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
  stripDiacritics,
} from "@/lib/arabic-utils";
import { speakArabic } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { useNawaStore } from "@/store/nawa-store";
import type { TashkeelMode } from "@/types/arabic";

type MorphStudioProps = {
  focusPatternId?: string;
  lockedRootId?: string;
  /**
   * What this lesson emphasizes:
   * - root: three consonants carry meaning (Meet the Root)
   * - word: assemble and learn this word’s gloss
   * - pattern: notice how the pattern changes the word
   */
  teachFocus?: "root" | "word" | "pattern";
  onComplete?: () => void;
};

type Phase = "learn" | "confirm";

/**
 * Guided morph lesson: learn (root + pattern → word + meaning) then confirm.
 * Not a free sandbox — one clear job per step.
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
  const [replay, setReplay] = useState(0);
  const [quizChoice, setQuizChoice] = useState<string | null>(null);
  const [heard, setHeard] = useState(false);
  const [showVowelHelp, setShowVowelHelp] = useState(false);

  const rootId = lockedRootId ?? selectedRootId;
  const root = getRootById(rootId);
  const patternId = focusPatternId ?? selectedPatternId;
  const pattern = getPatternById(patternId);
  const word = getDerivedWord(rootId, patternId, DERIVED_WORDS);

  // Keep store pattern in sync with the lesson focus
  useEffect(() => {
    if (focusPatternId) setPatternId(focusPatternId);
  }, [focusPatternId, setPatternId]);

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
      const options = shuffleStable([answer, ...otherGlosses], root.id.length);
      return {
        prompt: `The three letters ${root.consonants.map((c) => c.arabic).join(" ")} (root ${root.transliteration}) are about…`,
        options,
        answer,
        hint: "Use the root gloss from Learn (the family meaning) — not a full dictionary sentence.",
      };
    }

    const answer = word.translation;
    const distractors = DERIVED_WORDS.filter((w) => w.translation !== answer)
      .map((w) => w.translation)
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .slice(0, 2);
    return {
      prompt: "You just saw this word with its English meaning. What does it mean?",
      options: shuffleStable([answer, ...distractors], word.arabic.length),
      answer,
      hint: "This is a memory check of the gloss shown in Learn — not a cold vocab test.",
    };
  }, [root, word, teachFocus]);

  useEffect(() => {
    if (quiz && quizChoice === quiz.answer && heard) onComplete?.();
  }, [quiz, quizChoice, heard, onComplete]);

  if (!root || !pattern) return null;

  const assemblyKey = `${root.id}-${pattern.id}-${replay}`;
  const canConfirm = Boolean(word) && heard;

  const focusBlurb =
    teachFocus === "root"
      ? "Job this lesson: see how three root letters carry a family of meanings."
      : teachFocus === "pattern"
        ? "Job this lesson: same root, new pattern → new word shape and meaning."
        : "Job this lesson: slot the root into a pattern and learn the resulting word.";

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardContent className="space-y-5 p-4 sm:p-6">
        <div className="space-y-2">
          <p className="text-primary text-sm font-medium tracking-wide uppercase">
            Morph engine
          </p>
          <p className="text-base leading-relaxed sm:text-lg">{focusBlurb}</p>
          <p className="text-muted-foreground text-base leading-relaxed">
            Arabic words are built like{" "}
            <span className="text-foreground font-medium">root + pattern</span>. The root is
            three consonants (meaning). The pattern is the “mold” (vowels and extra letters) that
            turns the root into a real word.
          </p>
        </div>

        {/* Sequential steps — not interchangeable topics */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["learn", "1 · Learn", "See root + pattern → word"],
              ["confirm", "2 · Confirm", "Quick memory check"],
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
                phase === id
                  ? "border-primary bg-primary/10"
                  : "hover:bg-muted/50",
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
                {/* Root */}
                <div className="space-y-3 rounded-xl border p-4">
                  <p className="text-sm font-semibold tracking-wide uppercase sm:text-base">
                    Root · جذر{" "}
                    <span className="text-muted-foreground font-normal normal-case">
                      (the meaning carriers)
                    </span>
                  </p>
                  <div className="flex items-center gap-2" dir="rtl">
                    {root.consonants.map((letter) => (
                      <button
                        key={letter.arabic}
                        type="button"
                        onClick={() =>
                          void speakArabic(letter.arabic, { latinFallback: letter.latin })
                        }
                        className="bg-primary/10 border-primary/25 hover:bg-primary/15 flex size-14 flex-col items-center justify-center rounded-lg border sm:size-16"
                      >
                        <span className="font-arabic text-3xl leading-none font-semibold sm:text-4xl">
                          {letter.arabic}
                        </span>
                        <span className="text-muted-foreground text-xs">{letter.latin}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-base leading-relaxed sm:text-lg">
                    <span className="font-semibold">{root.transliteration}</span>
                    {" — "}
                    about <span className="font-semibold">{root.gloss}</span>
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                    Example: English “write / writer / written” share a writing idea. Arabic packs
                    that idea into three letters, then dresses them with patterns.
                  </p>
                </div>

                {/* Pattern */}
                <div className="space-y-3 rounded-xl border p-4">
                  <p className="text-sm font-semibold tracking-wide uppercase sm:text-base">
                    Pattern · وزن{" "}
                    <span className="text-muted-foreground font-normal normal-case">
                      (the mold)
                    </span>
                  </p>
                  {focusPatternId ? (
                    <div className="bg-muted/40 rounded-lg border px-3 py-3">
                      <p className="text-base font-medium">{pattern.templateName}</p>
                      <p className="font-arabic mt-1 text-2xl sm:text-3xl" dir="rtl">
                        {stripDiacritics(pattern.templateArabic, "full")}
                      </p>
                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
                        Placeholder letters ف ع ل stand for your three root consonants, in order.
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
                            <span className="font-arabic text-lg" dir="rtl">
                              {stripDiacritics(p.templateArabic, "full")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Assembly */}
              <div className="bg-muted/35 rounded-xl border border-dashed px-4 py-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-base font-medium">
                    Watch the root letters slot into the pattern
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-sm"
                    onClick={() => setReplay((n) => n + 1)}
                  >
                    <RotateCcw className="size-3.5" />
                    Replay
                  </Button>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={assemblyKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <TemplateSlots
                      template={pattern.templateArabic}
                      consonants={root.consonants.map((c) => c.arabic)}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {word ? (
                <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-5 text-center">
                  <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase sm:text-base">
                    Resulting word — learn this gloss
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
                      label={heard ? "Heard ✓ — play again" : "Hear the word"}
                      onSpoke={() => setHeard(true)}
                      size="default"
                    />
                    <TashkeelChips value={tashkeelMode} onChange={setTashkeelMode} />
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      {word.grammaticalCategory}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mx-auto max-w-lg text-sm leading-relaxed sm:text-base">
                    {teachFocus === "root"
                      ? `Remember: the root is about “${root.gloss}.” The full word “${word.translation}” is that root wearing this pattern.`
                      : `Read the English line above once, then hear the Arabic. You’ll confirm the meaning next.`}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground py-4 text-center text-base">
                  No sample for this pattern — pick another.
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm sm:text-base"
                  onClick={() => setShowVowelHelp((v) => !v)}
                >
                  <HelpCircle className="size-4" />
                  {showVowelHelp ? "Hide vowel-mark help" : "What are the little marks on the letters?"}
                </button>
                <Button
                  type="button"
                  onClick={() => setPhase("confirm")}
                  disabled={!canConfirm}
                  className="gap-1"
                  size="lg"
                >
                  {canConfirm ? "Continue to confirm" : "Hear the word first"}
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
              <div className="mx-auto grid max-w-xl gap-2 sm:grid-cols-1">
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
                  Back to Learn
                </Button>
              </div>
              {quizChoice === quiz.answer && heard ? (
                <p className="text-center text-base font-medium text-emerald-700 dark:text-emerald-300 sm:text-lg">
                  Correct — lesson complete.
                </p>
              ) : quizChoice && quizChoice !== quiz.answer ? (
                <p className="text-muted-foreground text-center text-base">
                  Not quite — tap Back to Learn and re-read the gloss, then try again.
                </p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
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
      <p className="text-base font-semibold sm:text-lg">Vowel marks (tashkeel) — optional reminder</p>
      <p className="text-muted-foreground text-base leading-relaxed">
        These are not new root letters. Short a / i / u sit as tiny marks on consonants. Tap to hear:
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <DemoGlyph arabic="كَ" caption="Fatha · short a" latin="ka" />
        <DemoGlyph arabic="كِ" caption="Kasra · short i" latin="ki" />
        <DemoGlyph arabic="كُ" caption="Damma · short u" latin="ku" />
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
      title={`Listen: ${latin}`}
    >
      <div
        className="font-arabic border-primary/30 bg-primary/10 mx-auto flex size-16 items-center justify-center rounded-xl border text-3xl sm:size-[4.5rem] sm:text-4xl"
        dir="rtl"
        lang="ar"
      >
        {arabic}
      </div>
      <p className="text-foreground mt-2 text-sm font-medium sm:text-base">{caption}</p>
      <p className="text-muted-foreground text-xs tracking-wide uppercase sm:text-sm">Tap to hear</p>
    </button>
  );
}

function TemplateSlots({
  template,
  consonants,
}: {
  template: string;
  consonants: string[];
}) {
  const [f, a, l] = consonants;
  let fUsed = false;
  let aUsed = false;
  let lUsed = false;
  const parts: { key: string; label: string; isSlot: boolean; slotIndex?: number }[] = [];

  for (let i = 0; i < template.length; i++) {
    const ch = template[i];
    if (ch === "ف" && !fUsed) {
      parts.push({ key: `f-${i}`, label: f, isSlot: true, slotIndex: 0 });
      fUsed = true;
    } else if (ch === "ع" && !aUsed) {
      parts.push({ key: `a-${i}`, label: a, isSlot: true, slotIndex: 1 });
      aUsed = true;
    } else if (ch === "ل" && !lUsed) {
      parts.push({ key: `l-${i}`, label: l, isSlot: true, slotIndex: 2 });
      lUsed = true;
    } else {
      parts.push({ key: `ch-${i}`, label: ch, isSlot: false });
    }
  }

  return (
    <div
      className="font-arabic flex flex-wrap items-center justify-center gap-1.5 text-3xl sm:text-4xl"
      dir="rtl"
    >
      {parts.map((part, index) =>
        part.isSlot ? (
          <motion.span
            key={`${part.key}-${part.label}`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: (part.slotIndex ?? index) * 0.07, duration: 0.25 }}
            className="bg-primary text-primary-foreground mx-0.5 inline-flex min-w-10 items-center justify-center rounded-md px-2.5 py-1.5"
          >
            {part.label}
          </motion.span>
        ) : (
          <span key={part.key} className="text-muted-foreground px-0.5">
            {part.label}
          </span>
        ),
      )}
    </div>
  );
}
