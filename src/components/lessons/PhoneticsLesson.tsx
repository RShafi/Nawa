"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Circle, Headphones, Swords, Sparkles, Wine } from "lucide-react";
import type { PhoneticsContent } from "@/data/lessonContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prefetchArabic, speakArabic } from "@/lib/audio";
import { cn } from "@/lib/utils";

const MODE_META: Record<
  PhoneticsContent["mode"],
  { icon: typeof Headphones; accent: string }
> = {
  "sound-lab": { icon: Headphones, accent: "border-sky-500/30" },
  "pair-duel": { icon: Swords, accent: "border-orange-500/30" },
  "vowel-lab": { icon: Sparkles, accent: "border-violet-500/30" },
  "hello-tasting": { icon: Wine, accent: "border-emerald-500/30" },
};

export function PhoneticsLesson({
  content,
  onComplete,
}: {
  content: PhoneticsContent;
  onComplete?: () => void;
}) {
  const [heard, setHeard] = useState<Record<string, boolean>>({});
  const [pairsHeard, setPairsHeard] = useState<Record<string, boolean>>({});
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const gate = useRef(false);

  const itemKeys = content.items.map((i) => i.arabic);
  const allItemsHeard = itemKeys.every((k) => heard[k]);
  const pairKeys =
    content.pairs?.flatMap((p) => [`${p.a.arabic}|a`, `${p.b.arabic}|b`]) ?? [];
  const allPairsHeard = pairKeys.length === 0 || pairKeys.every((k) => pairsHeard[k]);

  useEffect(() => {
    const texts = [
      ...content.items.map((i) => i.arabic),
      ...(content.pairs?.flatMap((p) => [p.a.arabic, p.b.arabic]) ?? []),
    ];
    prefetchArabic(texts);
  }, [content]);

  useEffect(() => {
    if (allItemsHeard && allPairsHeard) onComplete?.();
  }, [allItemsHeard, allPairsHeard, onComplete]);

  async function play(arabic: string, latin: string, mark: () => void) {
    if (gate.current) return;
    gate.current = true;
    setPlayingKey(arabic);
    mark();
    try {
      await speakArabic(arabic, { latinFallback: latin });
    } finally {
      setPlayingKey(null);
      window.setTimeout(() => {
        gate.current = false;
      }, 200);
    }
  }

  const heardCount = itemKeys.filter((k) => heard[k]).length;
  const meta = MODE_META[content.mode];
  const Icon = meta.icon;

  return (
    <div className="space-y-4">
      <Card className={cn("border-s-4", meta.accent)}>
        <CardHeader>
          <div className="mb-1 flex items-center gap-2">
            <Icon className="text-primary size-5" />
            <CardTitle className="text-xl sm:text-2xl">{content.title}</CardTitle>
          </div>
          <CardDescription className="text-base leading-relaxed sm:text-lg">
            {content.intro}
          </CardDescription>
          <p className="text-muted-foreground text-sm sm:text-base">
            Heard {heardCount}/{itemKeys.length}
            {pairKeys.length ? " · then finish both sides of each pair" : ""}
          </p>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "grid gap-3",
              content.mode === "vowel-lab"
                ? "sm:grid-cols-3"
                : content.mode === "hello-tasting"
                  ? "sm:grid-cols-3"
                  : "sm:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {content.items.map((item) => {
              const on = Boolean(heard[item.arabic]);
              const playing = playingKey === item.arabic;
              return (
                <button
                  key={`${item.arabic}-${item.latin}`}
                  type="button"
                  disabled={playing}
                  onClick={() =>
                    void play(item.arabic, item.latin, () =>
                      setHeard((h) => ({ ...h, [item.arabic]: true })),
                    )
                  }
                  className={cn(
                    "rounded-xl border px-4 py-4 text-start transition-colors",
                    on ? "border-primary/40 bg-primary/5" : "hover:bg-muted/50",
                    playing && "ring-2 ring-primary/40",
                    content.mode === "hello-tasting" && "min-h-36",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="font-arabic text-5xl leading-none sm:text-6xl"
                      dir="rtl"
                      lang="ar"
                    >
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
                    {playing ? "Playing…" : "Tap to hear"}
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
            <CardTitle className="text-lg sm:text-xl">Head-to-head pairs</CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Tap left, then right. Same vowel mark — different consonant color.
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
                    const playing = playingKey === side.arabic;
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={playing}
                        onClick={() =>
                          void play(side.arabic, side.latin, () =>
                            setPairsHeard((h) => ({ ...h, [key]: true })),
                          )
                        }
                        className={cn(
                          "min-w-24 rounded-lg border px-3 py-2 text-center",
                          on ? "border-primary/40 bg-primary/5" : "bg-muted/40 hover:bg-muted",
                          playing && "ring-2 ring-primary/40",
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
                  Round {idx + 1}: {pair.note}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
