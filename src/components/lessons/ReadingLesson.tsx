"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Circle, Eye, Link2, Newspaper, Utensils } from "lucide-react";
import type { ReadingContent } from "@/data/lessonContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prefetchArabic, speakArabic } from "@/lib/audio";
import { stripDiacritics } from "@/lib/arabic-utils";
import { useNawaStore } from "@/store/nawa-store";
import { cn } from "@/lib/utils";

const MODE_ICON: Record<ReadingContent["mode"], typeof Eye> = {
  "shape-compare": Eye,
  "join-hunt": Link2,
  "fade-challenge": Eye,
  "menu-read": Utensils,
  headline: Newspaper,
};

export function ReadingLesson({
  content,
  onComplete,
}: {
  content: ReadingContent;
  onComplete?: () => void;
}) {
  const tashkeelMode = useNawaStore((s) => s.tashkeelMode);
  const [heard, setHeard] = useState<Record<string, boolean>>({});
  const gate = useRef(false);

  const keys = content.items.map((i) => i.arabic);
  const allHeard = keys.every((k) => heard[k]);
  const Icon = MODE_ICON[content.mode];

  useEffect(() => {
    prefetchArabic(content.items.map((i) => i.arabic));
  }, [content]);

  useEffect(() => {
    if (allHeard) onComplete?.();
  }, [allHeard, onComplete]);

  async function play(arabic: string, latin: string) {
    if (gate.current) return;
    gate.current = true;
    setHeard((h) => ({ ...h, [arabic]: true }));
    try {
      await speakArabic(arabic, { latinFallback: latin });
    } finally {
      window.setTimeout(() => {
        gate.current = false;
      }, 200);
    }
  }

  return (
    <Card
      className={cn(
        "border-s-4",
        content.mode === "menu-read" && "border-s-amber-600/40",
        content.mode === "headline" && "border-s-slate-500/40",
        content.mode === "fade-challenge" && "border-s-primary/40",
        content.mode === "join-hunt" && "border-s-emerald-600/40",
        content.mode === "shape-compare" && "border-s-amber-500/40",
      )}
    >
      <CardHeader>
        <div className="mb-1 flex items-center gap-2">
          <Icon className="text-primary size-5" />
          <CardTitle className="text-xl sm:text-2xl">{content.title}</CardTitle>
        </div>
        <CardDescription className="text-base leading-relaxed sm:text-lg">
          {content.intro}
        </CardDescription>
        <p className="text-muted-foreground text-sm sm:text-base">
          Heard {keys.filter((k) => heard[k]).length}/{keys.length} · tap each Arabic line
        </p>
      </CardHeader>
      <CardContent>
        <ul
          className={cn(
            "space-y-3",
            content.mode === "shape-compare" && "sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0",
          )}
        >
          {content.items.map((item) => {
            const shown = stripDiacritics(item.arabic, tashkeelMode);
            const on = Boolean(heard[item.arabic]);
            return (
              <li
                key={`${item.arabic}-${item.latin}`}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
                  on && "border-primary/40 bg-primary/5",
                  content.mode === "headline" && "bg-muted/20",
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
                      className={cn(
                        "font-arabic leading-none hover:opacity-80",
                        "text-4xl sm:text-5xl",
                      )}
                      dir="rtl"
                      lang="ar"
                      onClick={() => void play(item.arabic, item.latin)}
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
        {(content.mode === "fade-challenge" || content.mode === "headline") && (
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed sm:text-base">
            Tip: use the header tashkeel control (Full → Minimal → None) to practice without vowel
            marks.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
