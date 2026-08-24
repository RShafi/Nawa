"use client";

/**
 * Syntax Bridge — arrange Word Cards into correct Arabic word order.
 */

import { useMemo, useState } from "react";
import { Reorder } from "framer-motion";
import { getWordCard, type WordCard } from "@/data/combatDictionary";
import { WordCardView } from "@/components/battle/WordCardView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { validateSyntax } from "@/lib/syntax";
import { cn } from "@/lib/utils";

const DRILLS: Record<
  string,
  { title: string; intro: string; cardIds: string[]; answerIds: string[] }
> = {
  "syntax-na-1": {
    title: "Noun before adjective",
    intro:
      "In Arabic, adjectives follow nouns. Drag (or tap) the cards into the correct order.",
    cardIds: ["nsr-active-participle", "slm-active-participle"],
    // نَاصِر سَالِم — helper that is safe (noun then adj)
    answerIds: ["nsr-active-participle", "slm-active-participle"],
  },
  "syntax-vso-1": {
    title: "Verb → Noun → Adjective",
    intro:
      "Arabic often leads with the verb (VSO). Put Verb, then Noun, then Adjective. Correct grammar multiplies Arena power.",
    cardIds: ["drb-form-1", "drs-noun-of-place", "ktb-passive-participle"],
    answerIds: ["drb-form-1", "drs-noun-of-place", "ktb-passive-participle"],
  },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function SyntaxBridgeLesson({
  lessonId,
  onComplete,
}: {
  lessonId: string;
  onComplete?: () => void;
}) {
  const drill = DRILLS[lessonId] ?? DRILLS["syntax-na-1"]!;

  const initial = useMemo(() => {
    const cards = drill.cardIds
      .map((id) => getWordCard(id))
      .filter((c): c is WordCard => Boolean(c));
    return shuffle(cards);
  }, [drill.cardIds]);

  const [order, setOrder] = useState<WordCard[]>(initial);
  const [checked, setChecked] = useState(false);
  const [passed, setPassed] = useState(false);

  const answerOk =
    order.length === drill.answerIds.length &&
    order.every((c, i) => c.id === drill.answerIds[i]);

  const syntax = validateSyntax(order);

  function check() {
    setChecked(true);
    if (answerOk && syntax.ok) {
      setPassed(true);
      onComplete?.();
    }
  }

  return (
    <Card className="border-amber-400/25 overflow-hidden">
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div>
          <p className="text-amber-200/90 text-sm font-medium tracking-wide uppercase">
            Syntax Bridge
          </p>
          <h2 className="mt-1 text-xl font-semibold">{drill.title}</h2>
          <p className="text-muted-foreground mt-2 text-base leading-relaxed">{drill.intro}</p>
        </div>

        <p className="text-center text-xs text-white/45">
          Drag cards to reorder (play order: first = leftmost in English reading / first in chain)
        </p>

        <Reorder.Group
          axis="x"
          values={order}
          onReorder={setOrder}
          className="flex flex-wrap justify-center gap-2"
        >
          {order.map((card) => (
            <Reorder.Item key={card.id} value={card} className="list-none">
              <WordCardView card={card} />
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <div
          className={cn(
            "rounded-xl border px-3 py-2 text-center text-sm",
            checked && !passed && "border-rose-400/40 bg-rose-500/10 text-rose-100",
            passed && "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
            !checked && "border-white/10 text-white/50",
          )}
        >
          {passed
            ? "Correct order — syntax unlocked for the Arena."
            : checked
              ? answerOk
                ? syntax.error ?? "Almost — check adjective placement."
                : "Not yet — adjectives follow nouns; verbs often lead."
              : "Arrange the cards, then Check."}
        </div>

        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOrder(shuffle([...initial]));
              setChecked(false);
              setPassed(false);
            }}
          >
            Shuffle
          </Button>
          <Button
            type="button"
            className="bg-amber-500 font-semibold text-black hover:bg-amber-400"
            onClick={check}
            disabled={passed}
          >
            Check order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
