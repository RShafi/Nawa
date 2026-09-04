"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { CursiveConnectionStep } from "@/components/lesson/steps/CursiveConnectionStep";
import { CosmicLoomStep } from "@/components/lesson/steps/CosmicLoomStep";
import { EpiphanyStep } from "@/components/lesson/steps/EpiphanyStep";
import {
  HandwritingStep,
  resolveHandwritingText,
} from "@/components/lesson/steps/HandwritingStep";
import { NarrativeStep } from "@/components/lesson/steps/NarrativeStep";
import { ObservatoryStep } from "@/components/lesson/steps/ObservatoryStep";
import { TargetHud } from "@/components/lesson/TargetHud";
import { Button } from "@/components/ui/button";
import { LoomHudFooterProvider } from "@/components/lesson/LoomHudFooter";
import { LoomNarrativePanel } from "@/components/lesson/LoomNarrativePanel";
import { LOOM_HUD_GRID, LOOM_HUD_NARRATIVE, LOOM_HUD_STAGING } from "@/components/lesson/loomShared";
import { curriculumData, getNextLoomLessonId, loomLessonHref } from "@/content/curriculumData";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useBattleStore } from "@/store/useBattleStore";
import { useLessonStore } from "@/store/useLessonStore";
import { cn } from "@/lib/utils";
import type { CurriculumLesson, InteractiveStep } from "@/types/curriculum";

type LessonSnapshot = {
  lesson: CurriculumLesson;
  step: InteractiveStep;
  stepIndex: number;
};

export type CelestialLoomPlayerProps = {
  lessonId: string;
};

const PHASE_LABEL: Record<string, string> = {
  narrative: "Introduction",
  handwriting: "Calligraphy Quill",
  observatory: "Observatory",
  cursive_connection: "Cursive Morph",
  cosmic_loom: "Word Mold",
  epiphany: "Check",
};

function ProgressDots({
  total,
  current,
  className,
}: {
  total: number;
  current: number;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1.5", className)}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 rounded-full transition-all",
            index === current
              ? "w-8 bg-amber-400"
              : index < current
                ? "w-3 bg-amber-400/50"
                : "w-3 bg-slate-700",
          )}
        />
      ))}
    </div>
  );
}

export function CelestialLoomPlayer({ lessonId }: CelestialLoomPlayerProps) {
  const progress = useLessonProgress();
  const {
    isLoaded,
    activeLesson,
    currentStep,
    currentStepIndex,
    totalSteps,
    masteredVocabIds,
    startLesson,
    goToNextStep,
    submitStepAnswer,
    completeLesson,
  } = progress;

  const [lessonComplete, setLessonComplete] = useState(false);
  const [completedSnapshot, setCompletedSnapshot] = useState<LessonSnapshot | null>(null);
  const [footerHost, setFooterHost] = useState<HTMLElement | null>(null);
  const initializeBattleDeck = useBattleStore((s) => s.initializeDeck);

  const routeLesson = curriculumData.find((l) => l.id === lessonId) ?? null;

  useEffect(() => {
    setLessonComplete(false);
    setCompletedSnapshot(null);
    startLesson(lessonId);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (!isLoaded) return;
    initializeBattleDeck(masteredVocabIds);
  }, [isLoaded, initializeBattleDeck, masteredVocabIds]);

  const finishStep = useCallback(
    (markComplete = true) => {
      if (lessonComplete) return;

      if (markComplete && currentStep) {
        submitStepAnswer(currentStep.id, true);
      }

      const isLast = currentStepIndex >= totalSteps - 1;
      if (isLast && activeLesson && currentStep) {
        setCompletedSnapshot({
          lesson: activeLesson,
          step: currentStep,
          stepIndex: currentStepIndex,
        });
        setLessonComplete(true);
        completeLesson();
        initializeBattleDeck(useLessonStore.getState().masteredVocabIds);
        return;
      }
      goToNextStep();
    },
    [
      lessonComplete,
      completeLesson,
      activeLesson,
      currentStep,
      currentStepIndex,
      goToNextStep,
      initializeBattleDeck,
      submitStepAnswer,
      totalSteps,
    ],
  );

  const handleStepComplete = useCallback(
    (markComplete = true) => {
      finishStep(markComplete);
    },
    [finishStep],
  );

  const displayLesson =
    lessonComplete && completedSnapshot
      ? completedSnapshot.lesson
      : activeLesson ?? routeLesson;

  const storeMatchesRoute = activeLesson?.id === lessonId;

  const displayStepIndex =
    lessonComplete && completedSnapshot
      ? completedSnapshot.stepIndex
      : storeMatchesRoute
        ? currentStepIndex
        : 0;

  const displayStep: InteractiveStep | null =
    lessonComplete && completedSnapshot
      ? completedSnapshot.step
      : storeMatchesRoute
        ? currentStep
        : routeLesson?.steps[displayStepIndex] ?? null;

  const displayTotalSteps = displayLesson?.steps.length ?? 0;

  if (!isLoaded || !displayLesson) {
    return (
      <div className="flex h-[100dvh] items-center justify-center text-sm text-slate-400">
        Aligning the Loom…
      </div>
    );
  }

  if (!displayStep && !lessonComplete) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center text-sm text-slate-400">
        <p>Aligning the Loom…</p>
        <Link
          href="/learning-path"
          className="font-serif text-amber-400/90 underline-offset-4 hover:underline"
        >
          Return to Star Map
        </Link>
      </div>
    );
  }

  if (lessonComplete && !displayStep) {
    return (
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-transparent">
        <LoomCompletionBar lessonId={displayLesson.id} />
      </div>
    );
  }

  const root = displayLesson.root;
  const step = displayStep!;
  const isNarrative = step.type === "narrative";

  if (isNarrative) {
    return (
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-transparent">
        <TargetHud lesson={displayLesson} />

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="absolute inset-x-0 top-0 z-10 p-6 lg:p-10">
            <Button asChild variant="ghost" size="sm" className="-ms-2 gap-1 text-slate-300">
              <Link href="/learning-path">
                <ArrowLeft className="size-4" />
                Star Map
              </Link>
            </Button>
          </div>

          <div className="flex h-full flex-col items-center justify-center px-8 py-20 lg:px-24">
            <div className="w-full max-w-3xl space-y-8 text-center xl:max-w-4xl">
              <div className="space-y-3">
                <p className="font-serif text-sm font-medium text-slate-400">{displayLesson.title}</p>
                <ProgressDots
                  total={displayTotalSteps}
                  current={displayStepIndex}
                  className="justify-center"
                />
              </div>
              <NarrativeStep
                step={step}
                variant="fullscreen"
                onComplete={(markComplete) => handleStepComplete(markComplete !== false)}
              />
            </div>
          </div>
        </div>

        {lessonComplete ? <LoomCompletionBar lessonId={displayLesson.id} /> : null}
      </div>
    );
  }

  return (
    <LoomHudFooterProvider host={footerHost}>
      <div
        className={cn(
          "flex h-[100dvh] flex-col bg-transparent",
          step.type === "cosmic_loom" ? "overflow-visible" : "overflow-hidden",
        )}
      >
        <TargetHud lesson={displayLesson} />

        <div
          className={cn(
            LOOM_HUD_GRID,
            "min-h-0 flex-1",
            step.type === "cosmic_loom" && "overflow-visible",
          )}
        >
          <aside className={LOOM_HUD_NARRATIVE}>
            <div className="mb-4 shrink-0">
              <Button asChild variant="ghost" size="sm" className="-ms-2 gap-1 text-slate-300">
                <Link href="/learning-path">
                  <ArrowLeft className="size-4" />
                  Star Map
                </Link>
              </Button>
            </div>

            <LoomNarrativePanel
              phaseLabel={PHASE_LABEL[step.type] ?? "Loom"}
              titleId={`${step.id}-title`}
              step={step}
              hideExplanation={step.type === "epiphany"}
              lessonTitle={displayLesson.title}
              stepIndex={displayStepIndex}
              totalSteps={displayTotalSteps}
            />
            <div ref={setFooterHost} className="mt-4 shrink-0 empty:hidden" />
          </aside>

          <div
            className={cn(
              LOOM_HUD_STAGING,
              step.type === "cosmic_loom" && "overflow-visible!",
            )}
          >
            <motion.div
              key={step.id}
              className={cn("h-full w-full", step.type === "cosmic_loom" && "overflow-visible")}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
            >
              {step.type === "handwriting" ? (
                <HandwritingStep
                  step={step}
                  handwritingText={resolveHandwritingText(step, { lessonRoot: root })}
                  hudLayout
                  onComplete={() => handleStepComplete()}
                />
              ) : step.type === "observatory" ? (
                <ObservatoryStep
                  step={step}
                  root={root}
                  hudLayout
                  onComplete={() => handleStepComplete()}
                />
              ) : step.type === "cursive_connection" || step.type === "constellation" ? (
                <CursiveConnectionStep
                  step={step}
                  root={root}
                  hudLayout
                  onComplete={() => handleStepComplete()}
                />
              ) : step.type === "cosmic_loom" && step.patternMold && step.forgeVocab ? (
                <CosmicLoomStep
                  step={step}
                  root={root}
                  mold={step.patternMold}
                  forgeVocab={step.forgeVocab}
                  hudLayout
                  onComplete={() => handleStepComplete()}
                />
              ) : step.type === "epiphany" && step.forgeVocab ? (
                <EpiphanyStep
                  step={step}
                  forgeVocab={step.forgeVocab}
                  hudLayout
                  onComplete={() => handleStepComplete(false)}
                />
              ) : (
                <section className="text-center text-sm text-red-200">
                  Unknown loom phase: {step.type}
                </section>
              )}
            </motion.div>
          </div>
        </div>

        {lessonComplete ? <LoomCompletionBar lessonId={displayLesson.id} /> : null}
      </div>
    </LoomHudFooterProvider>
  );
}

function LoomCompletionBar({ lessonId }: { lessonId: string }) {
  const nextLessonId = getNextLoomLessonId(lessonId);

  return (
    <footer className="shrink-0 border-t border-amber-500/25 bg-[#0B0F19]/92 px-6 py-4 backdrop-blur-sm lg:px-10">
      <div className="mx-auto flex max-w-4xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        {nextLessonId ? (
          <Link
            href={loomLessonHref(nextLessonId)}
            className="font-serif inline-flex flex-1 items-center justify-center rounded-xl border border-amber-400/45 bg-gradient-to-b from-amber-500/25 to-amber-950/35 px-5 py-3.5 text-base font-semibold tracking-wide text-amber-50 transition hover:border-amber-300/60 hover:from-amber-500/35"
          >
            Continue to Next Lesson
          </Link>
        ) : null}

        <Link
          href="/learning-path"
          className="font-serif inline-flex flex-1 items-center justify-center rounded-xl border border-slate-600/50 bg-slate-800/40 px-5 py-3.5 text-base font-semibold tracking-wide text-slate-300 transition hover:border-slate-500/60 hover:bg-slate-800/60 hover:text-slate-100"
        >
          Return to Star Map
        </Link>
      </div>
    </footer>
  );
}
