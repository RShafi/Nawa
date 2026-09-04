"use client";

import { InstructionText, LessonTooltip } from "@/components/ui/InlineArabic";
import type { InteractiveStep } from "@/types/curriculum";

export type LoomHudChrome = {
  phaseLabel: string;
  titleId: string;
  step: InteractiveStep;
  footer?: React.ReactNode;
  hideExplanation?: boolean;
};

export type LoomNarrativePanelProps = LoomHudChrome & {
  lessonTitle?: string;
  stepIndex?: number;
  totalSteps?: number;
};

export function LoomNarrativePanel({
  phaseLabel,
  titleId,
  step,
  footer,
  hideExplanation = false,
  lessonTitle,
  stepIndex,
  totalSteps,
}: LoomNarrativePanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col justify-center gap-5 overflow-hidden">
      {lessonTitle ? (
        <div className="shrink-0 space-y-2">
          <p className="font-serif text-sm font-medium text-slate-400">{lessonTitle}</p>
          {stepIndex != null && totalSteps != null ? (
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }, (_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === stepIndex
                      ? "w-8 bg-amber-400"
                      : index < stepIndex
                        ? "w-3 bg-amber-400/50"
                        : "w-3 bg-slate-700"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="text-xs font-semibold tracking-[0.2em] text-amber-400/80 uppercase">
        {phaseLabel}
      </p>
      <h3 id={titleId} className="font-serif text-2xl font-semibold text-amber-50 lg:text-3xl xl:text-4xl">
        {step.promptTitle}
      </h3>
      <InstructionText text={step.promptDescription} className="block" />
      {!hideExplanation && step.explanation ? (
        <LessonTooltip text={step.explanation} className="mt-1 shrink-0" />
      ) : null}
      {footer ? <div className="mt-4 shrink-0">{footer}</div> : null}
    </div>
  );
}
