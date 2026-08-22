"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { previewRatings } from "@/lib/fsrs";
import { useReviewStore } from "@/store/useReviewStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PopulatedSrsItem, SrsRating } from "@/types/srs";

const RATING_STYLES: Record<
  SrsRating,
  { className: string; label: string }
> = {
  1: {
    label: "Again",
    className:
      "border-red-600/40 bg-red-600/10 text-red-800 hover:bg-red-600/20 dark:text-red-200",
  },
  2: {
    label: "Hard",
    className:
      "border-orange-500/40 bg-orange-500/10 text-orange-900 hover:bg-orange-500/20 dark:text-orange-200",
  },
  3: {
    label: "Good",
    className: "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20",
  },
  4: {
    label: "Easy",
    className:
      "border-emerald-600/40 bg-emerald-600/10 text-emerald-800 hover:bg-emerald-600/20 dark:text-emerald-200",
  },
};

export function Flashcard() {
  const queue = useReviewStore((s) => s.queue);
  const currentIndex = useReviewStore((s) => s.currentIndex);
  const isRevealed = useReviewStore((s) => s.isRevealed);
  const revealAnswer = useReviewStore((s) => s.revealAnswer);
  const submitRating = useReviewStore((s) => s.submitRating);

  const item = queue[currentIndex] as PopulatedSrsItem | undefined;

  const previews = useMemo(() => (item ? previewRatings(item) : []), [item]);

  if (!item) return null;

  const { content } = item;
  const typeLabel =
    content.kind === "root" ? "Root" : content.kind === "pattern" ? "Pattern" : "Word";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <Card className="min-h-[22rem] overflow-hidden border-primary/20">
        <CardContent className="flex min-h-[22rem] flex-col p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{typeLabel}</Badge>
            {content.kind === "word" ? (
              <Badge variant="outline">{content.grammaticalCategory}</Badge>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p
              className="font-arabic text-5xl leading-tight font-semibold sm:text-6xl"
              dir="rtl"
              lang="ar"
            >
              {content.arabic}
            </p>
            {!isRevealed ? (
              <p className="text-muted-foreground text-base sm:text-lg">
                Recall the meaning, then reveal.
              </p>
            ) : null}

            <AnimatePresence>
              {isRevealed ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 w-full space-y-3 border-t pt-5"
                >
                  <p className="text-2xl font-semibold sm:text-3xl">{content.translation}</p>
                  <p className="text-muted-foreground text-lg">{content.transliteration}</p>
                  {content.kind === "root" ? (
                    <p className="text-muted-foreground text-base">
                      Consonants:{" "}
                      <span className="font-arabic text-xl" dir="rtl">
                        {content.consonants.map((c) => c.arabic).join(" · ")}
                      </span>
                    </p>
                  ) : null}
                  {content.kind === "pattern" ? (
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {content.description}
                    </p>
                  ) : null}
                  {content.dialectTags.length ? (
                    <div className="flex flex-wrap justify-center gap-2 pt-1">
                      {content.dialectTags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {!isRevealed ? (
        <Button size="lg" className="h-14 w-full text-base" onClick={revealAnswer}>
          Reveal answer
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {previews.map((p) => {
            const style = RATING_STYLES[p.rating];
            return (
              <button
                key={p.rating}
                type="button"
                onClick={() => submitRating(p.rating)}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border px-2 py-3 transition-colors",
                  style.className,
                )}
              >
                <span className="text-sm font-semibold sm:text-base">
                  {style.label} ({p.rating})
                </span>
                <span className="mt-1 text-xs opacity-80 sm:text-sm">{p.dueLabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
