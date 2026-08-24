"use client";

import { useEffect, useRef } from "react";
import type { InfoInteraction } from "@/data/curriculum";
import { ArabicText } from "@/components/ui/ArabicText";
import { InstructionText } from "@/components/ui/InlineArabic";
import { HearButton } from "@/components/path/HearButton";
import { Button } from "@/components/ui/button";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export function InfoSlide({
  data,
  onComplete,
}: {
  data: InfoInteraction;
  onComplete: () => void;
}) {
  const doneRef = useRef(false);
  const { playTap } = useSoundEffects();

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onComplete();
      }
    }, 1200);
    return () => window.clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 py-2">
      <div className="glass-tablet space-y-3 px-5 py-4">
        {data.paragraphs.map((p, i) => (
          <p key={i} className="text-base leading-relaxed text-white/75">
            <InstructionText text={p} />
          </p>
        ))}
      </div>

      {data.bullets && data.bullets.length > 0 ? (
        <ul className="glass-tablet space-y-2 px-4 py-3">
          {data.bullets.map((b) => (
            <li key={b} className="flex gap-2 text-sm text-white/70">
              <span
                className="bg-celestial-amber mt-1.5 size-1.5 shrink-0 rounded-full"
                aria-hidden
              />
              <span>
                <InstructionText text={b} />
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {data.exampleArabic ? (
        <div className="glass-tablet glow-amber flex flex-col items-center gap-3 px-4 py-5">
          <ArabicText forceFull className="text-amber-50">
            {data.exampleArabic}
          </ArabicText>
          {data.exampleCaption ? (
            <p className="text-center text-sm text-white/50">{data.exampleCaption}</p>
          ) : null}
          <HearButton text={data.exampleArabic} label="Hear example" size="sm" />
        </div>
      ) : null}

      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-white/40"
          onClick={() => {
            playTap();
            if (!doneRef.current) {
              doneRef.current = true;
              onComplete();
            }
          }}
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
