"use client";

import { motion } from "framer-motion";
import { InstructionText, LessonTooltip } from "@/components/ui/InlineArabic";
import { entrance, LOOM_NARRATIVE, LOOM_SHELL, LOOM_STAGE } from "@/components/lesson/loomShared";
import type { InteractiveStep } from "@/types/curriculum";

export type LoomStepFrameProps = {
  phaseLabel: string;
  step: InteractiveStep;
  titleId: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hideExplanation?: boolean;
};

export function LoomStepFrame({
  phaseLabel,
  step,
  titleId,
  children,
  footer,
  hideExplanation = false,
}: LoomStepFrameProps) {
  return (
    <motion.section {...entrance} className={LOOM_SHELL} aria-labelledby={titleId}>
      <aside className={LOOM_NARRATIVE}>
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-400/80 uppercase">
          {phaseLabel}
        </p>
        <h3 id={titleId} className="font-serif text-2xl font-semibold text-amber-50 lg:text-4xl">
          {step.promptTitle}
        </h3>
        <InstructionText text={step.promptDescription} className="block" />
        {!hideExplanation && step.explanation ? (
          <LessonTooltip text={step.explanation} className="mt-2" />
        ) : null}
        {footer ? <div className="mt-4 hidden w-full lg:mt-8 lg:block">{footer}</div> : null}
      </aside>

      <div className={LOOM_STAGE}>
        {children}
        {footer ? <div className="w-full lg:hidden">{footer}</div> : null}
      </div>
    </motion.section>
  );
}
