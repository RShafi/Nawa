"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { getPatternById } from "@/data/mockPatterns";
import { DERIVED_WORDS, getRootById } from "@/data/mockRoots";
import { ArabicText } from "@/components/common/ArabicText";
import { SpeakButton } from "@/components/common/SpeakButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPhonetic, getDerivedWord, stripDiacritics } from "@/lib/arabic-utils";
import { cn } from "@/lib/utils";
import { useNawaStore } from "@/store/nawa-store";
import type { TashkeelMode } from "@/types/arabic";

const VOWEL_LEGEND = [
  { name: "fatḥa", sound: "short a", example: "كَ" },
  { name: "kasra", sound: "short i", example: "كِ" },
  { name: "ḍamma", sound: "short u", example: "كُ" },
  { name: "long vowels", sound: "ā / ū / ī", example: "كَا" },
];

const TASHKEEL_CYCLE: TashkeelMode[] = ["full", "minimal", "none"];

type WordAssemblyCardProps = {
  /** When true, show a short practice checklist (lesson mode). */
  guided?: boolean;
};

export function WordAssemblyCard({ guided = false }: WordAssemblyCardProps) {
  const selectedRootId = useNawaStore((s) => s.selectedRootId);
  const selectedPatternId = useNawaStore((s) => s.selectedPatternId);
  const tashkeelMode = useNawaStore((s) => s.tashkeelMode);
  const setTashkeelMode = useNawaStore((s) => s.setTashkeelMode);
  const setPatternId = useNawaStore((s) => s.setPatternId);

  const [replay, setReplay] = useState(0);
  const [done, setDone] = useState({
    replay: false,
    heard: false,
    tashkeel: false,
    explore: false,
    quiz: false,
  });
  const [quizChoice, setQuizChoice] = useState<string | null>(null);

  const root = getRootById(selectedRootId);
  const pattern = getPatternById(selectedPatternId);
  const word = getDerivedWord(selectedRootId, selectedPatternId, DERIVED_WORDS);

  const relatedPatterns = useMemo(() => {
    if (!root) return [];
    return DERIVED_WORDS.filter((w) => w.rootId === root.id && w.patternId !== selectedPatternId).slice(
      0,
      3,
    );
  }, [root, selectedPatternId]);

  const quizOptions = useMemo(() => {
    if (!word) return [];
    const distractors = DERIVED_WORDS.filter((w) => w.translation !== word.translation)
      .map((w) => w.translation)
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .slice(0, 2);
    const opts = [word.translation, ...distractors];
    // Stable shuffle from word id (avoid hydration flicker)
    const seed = word.rootId.length + word.patternId.length;
    return opts
      .map((opt, i) => ({ opt, rank: (seed * 17 + i * 13) % 97 }))
      .sort((a, b) => a.rank - b.rank)
      .map((x) => x.opt);
  }, [word]);

  if (!root || !pattern) return null;

  const assemblyKey = `${root.id}-${pattern.id}-${replay}`;
  const practiceComplete =
    done.replay && done.heard && done.tashkeel && (relatedPatterns.length === 0 || done.explore) && done.quiz;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Your word</CardTitle>
        <CardDescription>
          Root letters fill {pattern.templateName} (
          <span className="font-arabic" dir="rtl">
            {stripDiacritics(pattern.templateArabic, "full")}
          </span>
          ). Try the practice steps — don’t just listen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
          {guided ? (
            <div className="rounded-lg border bg-muted/20 px-3 py-3">
              <p className="mb-2 text-xs font-medium tracking-wide uppercase">Practice checklist</p>
              <ul className="space-y-1.5 text-sm">
                <ChecklistItem done={done.replay} label="Replay how the root slots into the pattern" />
                <ChecklistItem done={done.heard} label="Hear the word (or its transliteration)" />
                <ChecklistItem done={done.tashkeel} label="Cycle tashkeel: Full → Minimal → None" />
                {relatedPatterns.length > 0 ? (
                  <ChecklistItem done={done.explore} label="Try one other pattern for this same root" />
                ) : null}
                <ChecklistItem done={done.quiz} label="Check the meaning" />
              </ul>
              {practiceComplete ? (
                <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Nice work — you can Complete lesson above.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="bg-muted/40 rounded-xl border border-dashed px-4 py-6">
            <div className="mb-3 flex items-center justify-center gap-2">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">Root → pattern</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => {
                  setReplay((n) => n + 1);
                  setDone((d) => ({ ...d, replay: true }));
                }}
              >
                <RotateCcw className="size-3.5" />
                Replay
              </Button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={assemblyKey}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <TemplateSlots
                  template={pattern.templateArabic}
                  consonants={root.consonants.map((c) => c.arabic)}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {word ? (
              <motion.div
                key={`${word.rootId}-${word.patternId}-${tashkeelMode}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3 text-center"
              >
                <ArabicText className="block text-4xl font-semibold sm:text-5xl">{word.arabic}</ArabicText>
                <p className="text-lg font-medium">{word.translation}</p>
                <p className="text-muted-foreground text-sm">{formatPhonetic(word.transliteration, word.ipa)}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <SpeakButton
                    text={word.arabic}
                    latinFallback={word.transliteration}
                    label="Hear word"
                    onSpoke={() => setDone((d) => ({ ...d, heard: true }))}
                  />
                  <Badge>{word.grammaticalCategory}</Badge>
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground py-6 text-center text-sm"
              >
                This root doesn’t have a sample for that pattern yet. Pick another pattern.
              </motion.p>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Vowels (tashkeel)
            </p>
            <div className="flex flex-wrap gap-2">
              {TASHKEEL_CYCLE.map((mode) => (
                <Button
                  key={mode}
                  type="button"
                  size="sm"
                  variant={tashkeelMode === mode ? "default" : "outline"}
                  className="capitalize"
                  onClick={() => {
                    setTashkeelMode(mode);
                    // Mark done once they've left full at least once, or clicked through
                    if (mode !== "full") setDone((d) => ({ ...d, tashkeel: true }));
                  }}
                >
                  {mode}
                </Button>
              ))}
            </div>
            {tashkeelMode !== "none" ? (
              <ul className="bg-muted/30 mt-2 grid gap-2 rounded-lg border px-3 py-3 sm:grid-cols-2">
                {VOWEL_LEGEND.map((v) => (
                  <li key={v.name} className="text-muted-foreground flex items-baseline gap-2 text-xs">
                    <span className="font-arabic text-foreground text-base leading-none" dir="rtl">
                      {v.example}
                    </span>
                    <span>
                      <span className="text-foreground font-medium">{v.sound}</span>
                      {" · "}
                      {v.name}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-xs">
                Short vowels are hidden — this is how many native texts look.
              </p>
            )}
          </div>

          {relatedPatterns.length > 0 ? (
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Same root, other patterns
              </p>
              <div className="flex flex-wrap gap-2">
                {relatedPatterns.map((w) => {
                  const p = getPatternById(w.patternId);
                  return (
                    <Button
                      key={w.patternId}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPatternId(w.patternId);
                        setDone((d) => ({ ...d, explore: true }));
                        setQuizChoice(null);
                        setDone((d) => ({ ...d, quiz: false }));
                      }}
                    >
                      <span className="font-arabic me-1.5" dir="rtl">
                        {stripDiacritics(w.arabic, "minimal")}
                      </span>
                      <span className="text-muted-foreground text-xs">{p?.templateName ?? w.patternId}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {word ? (
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium">What does this word mean?</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {quizOptions.map((opt) => {
                  const selected = quizChoice === opt;
                  const correct = opt === word.translation;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setQuizChoice(opt);
                        if (correct) setDone((d) => ({ ...d, quiz: true }));
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm transition-colors",
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
            </div>
          ) : null}
        </CardContent>
      </Card>
  );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className={cn("flex items-start gap-2", done ? "text-foreground" : "text-muted-foreground")}>
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
          done && "border-emerald-600 bg-emerald-600/15 text-emerald-700",
        )}
      >
        {done ? <Check className="size-2.5" /> : null}
      </span>
      <span>{label}</span>
    </li>
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
    <div className="font-arabic flex flex-wrap items-center justify-center gap-1 text-2xl sm:text-3xl" dir="rtl">
      {parts.map((part, index) =>
        part.isSlot ? (
          <motion.span
            key={`${part.key}-${part.label}`}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: (part.slotIndex ?? index) * 0.08, duration: 0.28 }}
            className="bg-primary text-primary-foreground mx-0.5 inline-flex min-w-10 items-center justify-center rounded-lg px-2 py-1"
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
