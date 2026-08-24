"use client";

import { useMemo, useState } from "react";
import { Reorder } from "framer-motion";
import type { SyntaxInteraction } from "@/data/curriculum";
import { ArabicText } from "@/components/ui/ArabicText";
import { Button } from "@/components/ui/button";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function SyntaxSlide({
  data,
  onComplete,
}: {
  data: SyntaxInteraction;
  onComplete: () => void;
}) {
  const initial = useMemo(() => shuffle(data.cards), [data.cards]);
  const [order, setOrder] = useState(initial);
  const [checked, setChecked] = useState(false);
  const [passed, setPassed] = useState(false);
  const { playTap, playSnap, playError } = useSoundEffects();

  function check() {
    playTap();
    const ok = order.every((c, i) => c.id === data.answerOrder[i]);
    setChecked(true);
    if (ok) {
      playSnap();
      setPassed(true);
      onComplete();
    } else {
      playError();
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 py-2">
      {data.tip ? <p className="text-center text-sm text-white/55">{data.tip}</p> : null}

      <p className="text-center text-xs text-white/40">
        Drag to reorder (first card = first in the phrase)
      </p>

      <Reorder.Group
        axis="x"
        values={order}
        onReorder={(next) => {
          if (passed) return;
          playTap();
          setOrder(next);
          setChecked(false);
        }}
        className="rune-chamber flex flex-wrap justify-center gap-2 px-3 py-4"
      >
        {order.map((card) => (
          <Reorder.Item
            key={card.id}
            value={card}
            className="glass-tablet list-none px-4 py-3"
            whileDrag={{ scale: 1.04 }}
          >
            <ArabicText forceFull size="md" className="block text-amber-50">
              {card.arabic}
            </ArabicText>
            <span className="mt-1 block text-center text-[10px] text-white/45">{card.english}</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <div
        className={cn(
          "glass-tablet px-3 py-2 text-center text-sm",
          passed && "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
          checked && !passed && "border-rose-400/40 bg-rose-500/10 text-rose-100",
          !checked && "text-white/45",
        )}
      >
        {passed
          ? "Correct order."
          : checked
            ? "Not yet — noun first, then the describing word."
            : "Arrange, then check."}
      </div>

      <div className="flex justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-amber-500/20"
          disabled={passed}
          onClick={() => {
            playTap();
            setOrder(shuffle([...data.cards]));
            setChecked(false);
          }}
        >
          Shuffle
        </Button>
        <Button
          type="button"
          size="sm"
          className="bg-celestial-amber font-semibold text-obsidian hover:bg-amber-400"
          disabled={passed}
          onClick={check}
        >
          Check order
        </Button>
      </div>
    </div>
  );
}
