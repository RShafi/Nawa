"use client";

import { useEffect, useState } from "react";
import { Check, Circle } from "lucide-react";
import type { ReadingContent } from "@/data/lessonContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { speakArabic } from "@/lib/speech";
import { stripDiacritics } from "@/lib/arabic-utils";
import { useNawaStore } from "@/store/nawa-store";
import { cn } from "@/lib/utils";

export function ReadingLesson({
  content,
  onComplete,
}: {
  content: ReadingContent;
  onComplete?: () => void;
}) {
  const tashkeelMode = useNawaStore((s) => s.tashkeelMode);
  const [heard, setHeard] = useState<Record<string, boolean>>({});

  const keys = content.items.map((i) => i.arabic);
  const allHeard = keys.every((k) => heard[k]);

  useEffect(() => {
    if (allHeard) onComplete?.();
  }, [allHeard, onComplete]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading drill</CardTitle>
        <CardDescription className="text-base leading-relaxed sm:text-lg">
          {content.intro}
        </CardDescription>
        <p className="text-muted-foreground text-sm sm:text-base">
          Heard {keys.filter((k) => heard[k]).length}/{keys.length} · tap each Arabic line
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {content.items.map((item) => {
            const shown = stripDiacritics(item.arabic, tashkeelMode);
            const on = Boolean(heard[item.arabic]);
            return (
              <li
                key={`${item.arabic}-${item.latin}`}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
                  on && "border-primary/40 bg-primary/5",
                )}
              >
                <div className="flex items-start gap-3">
                  {on ? (
                    <Check className="text-primary mt-2 size-4 shrink-0" />
                  ) : (
                    <Circle className="text-muted-foreground mt-2 size-4 shrink-0" />
                  )}
                  <div>
                    <button
                      type="button"
                      className="font-arabic text-4xl leading-none hover:opacity-80 sm:text-5xl"
                      dir="rtl"
                      lang="ar"
                      onClick={() => {
                        setHeard((h) => ({ ...h, [item.arabic]: true }));
                        void speakArabic(item.arabic, { latinFallback: item.latin });
                      }}
                    >
                      {shown}
                    </button>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                      {item.latin} · {item.gloss}
                    </p>
                  </div>
                </div>
                <span className="text-muted-foreground text-xs tracking-wide uppercase sm:text-sm">
                  Tap to hear
                </span>
              </li>
            );
          })}
        </ul>
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed sm:text-base">
          Tip: use the header tashkeel control (Full → Minimal → None) to practice without vowel
          marks — the way most real Arabic appears.
        </p>
      </CardContent>
    </Card>
  );
}
