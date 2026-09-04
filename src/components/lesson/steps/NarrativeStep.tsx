"use client";

import { Button } from "@/components/ui/button";
import { InstructionText, LessonTooltip } from "@/components/ui/InlineArabic";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import type { InteractiveStep } from "@/types/curriculum";
import { cn } from "@/lib/utils";

export type NarrativeStepProps = {
  step: InteractiveStep;
  onComplete: (markComplete?: boolean) => void;
  /** @deprecated Use variant="fullscreen" */
  hudLayout?: boolean;
  variant?: "default" | "fullscreen";
};

export function NarrativeStep({
  step,
  onComplete,
  hudLayout = false,
  variant,
}: NarrativeStepProps) {
  const { playSnap } = useSoundEffects();
  const isFullscreen = variant === "fullscreen" || hudLayout;

  const button = (
    <Button
      type="button"
      size="lg"
      className={cn(
        "font-serif min-w-[14rem] bg-amber-500 font-semibold tracking-wide text-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.35)] hover:bg-amber-400",
        isFullscreen && "mx-auto mt-10",
      )}
      onClick={() => {
        playSnap();
        onComplete(true);
      }}
    >
      I understand
    </Button>
  );

  if (isFullscreen) {
    return (
      <div className="space-y-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-400/80 uppercase">
          Introduction
        </p>
        <h2 className="font-serif text-4xl font-semibold text-amber-50 md:text-5xl lg:text-6xl">
          {step.promptTitle}
        </h2>
        <InstructionText
          text={step.promptDescription}
          className="mx-auto block max-w-2xl text-xl leading-loose text-slate-300 md:text-2xl md:leading-loose"
        />
        {step.explanation ? (
          <div className="mx-auto max-w-2xl text-left">
            <LessonTooltip text={step.explanation} />
          </div>
        ) : null}
        <div className="flex justify-center">{button}</div>
      </div>
    );
  }

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12 text-center md:px-10 md:py-16">
      <p className="text-xs font-semibold tracking-[0.2em] text-amber-400/80 uppercase">
        Introduction
      </p>
      <h2 className="font-serif mt-3 text-3xl font-semibold text-amber-50 md:text-4xl lg:text-5xl">
        {step.promptTitle}
      </h2>
      <InstructionText
        text={step.promptDescription}
        className="mt-5 block max-w-2xl text-lg leading-loose text-slate-300 md:text-xl md:leading-loose"
      />
      {step.explanation ? (
        <div className="mt-8 w-full max-w-2xl text-left">
          <LessonTooltip text={step.explanation} />
        </div>
      ) : null}
      {button}
    </section>
  );
}
