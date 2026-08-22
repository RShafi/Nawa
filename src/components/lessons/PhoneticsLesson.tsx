"use client";

import { useEffect, useState } from "react";
import { Check, Circle } from "lucide-react";
import type { PhoneticsContent } from "@/data/lessonContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { speakArabic } from "@/lib/speech";
import { cn } from "@/lib/utils";

export function PhoneticsLesson({
  content,
  onComplete,
}: {
  content: PhoneticsContent;
  onComplete?: () => void;
}) {
  const [heard, setHeard] = useState<Record<string, boolean>>({});
  const [pairsHeard, setPairsHeard] = useState<Record<string, boolean>>({});

  const itemKeys = content.items.map((i) => i.arabic);
  const allItemsHeard = itemKeys.every((k) => heard[k]);
  const pairKeys =
    content.pairs?.flatMap((p) => [`${p.a.arabic}|a`, `${p.b.arabic}|b`]) ?? [];
  const allPairsHeard = pairKeys.length === 0 || pairKeys.every((k) => pairsHeard[k]);

  useEffect(() => {
    if (allItemsHeard && allPairsHeard) onComplete?.();
  }, [allItemsHeard, allPairsHeard, onComplete]);

  const heardCount = itemKeys.filter((k) => heard[k]).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Listen & compare</CardTitle>
          <CardDescription className="text-base leading-relaxed sm:text-lg">
            {content.intro}
          </CardDescription>
          <p className="text-muted-foreground text-sm sm:text-base">
            Heard {heardCount}/{itemKeys.length}
            {pairKeys.length ? " · then tap both sides of each minimal pair" : ""}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {content.items.map((item) => {
              const on = Boolean(heard[item.arabic]);
              return (
                <button
                  key={`${item.arabic}-${item.latin}`}
                  type="button"
                  onClick={() => {
                    setHeard((h) => ({ ...h, [item.arabic]: true }));
                    void speakArabic(item.arabic, { latinFallback: item.latin });
                  }}
                  className={cn(
                    "rounded-xl border px-4 py-4 text-start transition-colors",
                    on ? "border-primary/40 bg-primary/5" : "hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-arabic text-5xl leading-none sm:text-6xl" dir="rtl" lang="ar">
                      {item.arabic}
                    </span>
                    {on ? (
                      <Check className="text-primary size-4" />
                    ) : (
                      <Circle className="text-muted-foreground size-4" />
                    )}
                  </div>
                  <p className="mt-2 text-base font-medium">{item.latin}</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed sm:text-base">
                    {item.tip}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs tracking-wide uppercase sm:text-sm">
                    Tap to hear
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {content.pairs?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Minimal pairs</CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Same vowel mark, different consonant — like “sip” vs a darker “Sop.” Tap both sides.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {content.pairs.map((pair, idx) => (
              <div
                key={pair.note}
                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-2">
                  {(
                    [
                      [pair.a, "a"],
                      [pair.b, "b"],
                    ] as const
                  ).map(([side, sideKey]) => {
                    const key = `${side.arabic}|${sideKey}`;
                    const on = Boolean(pairsHeard[key]);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setPairsHeard((h) => ({ ...h, [key]: true }));
                          void speakArabic(side.arabic, { latinFallback: side.latin });
                        }}
                        className={cn(
                          "min-w-20 rounded-lg border px-3 py-2 text-center",
                          on ? "border-primary/40 bg-primary/5" : "bg-muted/40 hover:bg-muted",
                        )}
                      >
                        <span className="font-arabic block text-3xl sm:text-4xl" dir="rtl">
                          {side.arabic}
                        </span>
                        <span className="text-muted-foreground text-sm">{side.latin}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-muted-foreground text-sm sm:max-w-xs sm:text-end sm:text-base">
                  Pair {idx + 1}: {pair.note}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
