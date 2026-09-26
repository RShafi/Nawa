"use client";

import { useMemo, useState } from "react";
import { ArabicText } from "@/components/common/ArabicText";
import { previewRatings } from "@/lib/fsrs";
import { buildReviewPrompt } from "@/data/garden";
import { forgeWordCard } from "@/data/combatDictionary";
import { useAppStore } from "@/store/useAppStore";
import { useReviewStore } from "@/store/useReviewStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PopulatedSrsItem, SrsRating } from "@/types/srs";

const RATING_STYLES: Record<SrsRating, { className: string; label: string }> = {
  1: { label: "Missed", className: "border-red-600/40 bg-red-600/10 text-red-100 hover:bg-red-600/20" },
  2: { label: "Hard", className: "border-orange-500/40 bg-orange-500/10 text-orange-100 hover:bg-orange-500/20" },
  3: { label: "Got it", className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20" },
  4: { label: "Easy", className: "border-sky-500/40 bg-sky-500/10 text-sky-100 hover:bg-sky-500/20" },
};

export function Flashcard() {
  const deck = useAppStore((s) => s.unlockedDeck);
  const queue = useReviewStore((s) => s.queue);
  const currentIndex = useReviewStore((s) => s.currentIndex);
  const submitRating = useReviewStore((s) => s.submitRating);
  const item = queue[currentIndex] as PopulatedSrsItem | undefined;
  const [picked, setPicked] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const prompt = useMemo(() => {
    if (!item || item.content.kind !== "word") return null;
    const card = forgeWordCard(item.content.rootId, item.content.patternId);
    if (!card) return null;
    return buildReviewPrompt(card.id, item.reps + currentIndex + item.content.arabic.length, deck);
  }, [item, currentIndex, deck]);

  const previews = useMemo(() => (item ? previewRatings(item) : []), [item]);

  if (!item || !prompt) return null;

  const correct = picked === prompt.answer;

  function choose(option: string) {
    if (answered) return;
    setPicked(option);
    setAnswered(true);
  }

  function rate(rating: SrsRating) {
    setPicked(null);
    setAnswered(false);
    submitRating(rating);
  }

  const lead =
    prompt.mode === "root"
      ? "Which word do these letters make?"
      : prompt.mode === "frame"
        ? "Which word fits these vowels?"
        : "Which word is this?";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <Card className="overflow-hidden border-white/10 bg-white/5">
        <CardContent className="flex flex-col gap-4 p-6">
          <p className="text-sm text-white/60">{lead}</p>
          <ArabicText size="lg" forceFull className="text-center text-amber-50">
            {prompt.promptArabic}
          </ArabicText>
          <p className="text-center text-sm text-white/55">{prompt.promptHint}</p>
          <div className="grid gap-2">
            {prompt.choices.map((choice) => {
              const selected = picked === choice;
              const isAnswer = choice === prompt.answer;
              return (
                <button
                  key={choice}
                  type="button"
                  disabled={answered}
                  onClick={() => choose(choice)}
                  className={cn(
                    "rounded-xl border border-white/15 bg-black/20 px-3 py-3",
                    selected && isAnswer && "border-emerald-400/60 bg-emerald-500/15",
                    selected && !isAnswer && "border-rose-400/60 bg-rose-500/10",
                    answered && isAnswer && !selected && "border-emerald-400/40",
                  )}
                >
                  <ArabicText size="md" forceFull className="text-white">
                    {choice}
                  </ArabicText>
                </button>
              );
            })}
          </div>
          {answered ? (
            <p className="text-center text-white/80">
              {correct ? "Yes." : "Not quite."} It means {prompt.gloss}.
            </p>
          ) : null}
        </CardContent>
      </Card>
      {answered ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {previews.map((preview) => (
            <Button
              key={preview.rating}
              variant="outline"
              className={RATING_STYLES[preview.rating].className}
              onClick={() => rate(preview.rating)}
            >
              {RATING_STYLES[preview.rating].label}
            </Button>
          ))}
          <p className="col-span-2 text-center text-xs text-white/45 sm:col-span-4">
            Missed puts the vowel marks back. Got it and Easy take them off.
          </p>
        </div>
      ) : (
        <p className="text-center text-sm text-white/45">Choose the word. English comes after.</p>
      )}
    </div>
  );
}
