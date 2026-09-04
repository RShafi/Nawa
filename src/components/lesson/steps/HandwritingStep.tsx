"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LoomHudFooterPortal } from "@/components/lesson/LoomHudFooter";
import { LoomStepFrame } from "@/components/lesson/LoomStepFrame";
import { LOOM_STAGE_ARENA } from "@/components/lesson/loomShared";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import {
  buildGlyphScene,
  resolveCalligraphyPlan,
  type CalligraphyMode,
  type InkStroke,
} from "@/lib/arabicGlyphPaths";
import { CALLIGRAPHY_VIEWBOX } from "@/lib/calligraphyPaths";
import type { ArabicRoot, InteractiveStep, VocabularyItem } from "@/types/curriculum";
import { cn } from "@/lib/utils";

export type HandwritingStepProps = {
  step: InteractiveStep;
  handwritingText: string;
  onComplete: () => void;
  hudLayout?: boolean;
};

const BODY_STROKE_DURATION = 2.2;
const MARK_POP_DURATION = 0.45;
const STROKE_EASE = "easeInOut" as const;
/** Wait for step entrance + user eye to settle before the first stroke. */
const INTRO_HOLD_MS = 1400;
/** Extra beat after fonts settle so the first RTL stroke is never clipped by the enter fade. */
const STEP_ENTRANCE_MS = 400;

type StrokePhase = "pending" | "active" | "done";

function strokePhase(globalIndex: number, cursor: number, finished: boolean): StrokePhase {
  if (finished || globalIndex < cursor) return "done";
  if (globalIndex === cursor) return "active";
  return "pending";
}

type AnimatedBodyStrokeProps = {
  d: string;
  phase: StrokePhase;
  delay?: number;
  onDrawn?: () => void;
};

function AnimatedBodyStroke({ d, phase, delay = 0, onDrawn }: AnimatedBodyStrokeProps) {
  const drawnRef = useRef(false);

  useEffect(() => {
    if (phase !== "active") drawnRef.current = false;
  }, [phase]);

  const showFill = phase === "done";
  const showTrace = phase !== "pending";

  return (
    <g>
      <motion.path
        d={d}
        fill="currentColor"
        stroke="none"
        className="text-amber-300/90"
        initial={false}
        animate={{ opacity: showFill ? 1 : 0 }}
        transition={{ duration: 0.35 }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
        className={cn(
          phase === "done"
            ? "stroke-amber-300/40"
            : phase === "active"
              ? "stroke-amber-400"
              : "stroke-amber-500/10",
        )}
        initial={false}
        animate={{
          pathLength: showTrace ? 1 : 0,
          opacity: phase === "pending" ? 0.06 : 1,
        }}
        transition={{
          pathLength: {
            duration: phase === "active" ? BODY_STROKE_DURATION : 0,
            ease: STROKE_EASE,
            delay: phase === "active" ? delay : 0,
          },
          opacity: { duration: 0.25, delay: phase === "active" ? delay : 0 },
        }}
        style={{
          filter:
            phase === "active"
              ? "drop-shadow(0 0 14px rgba(245,158,11,0.8))"
              : phase === "done"
                ? "drop-shadow(0 0 6px rgba(245,158,11,0.25))"
                : undefined,
        }}
        onAnimationComplete={() => {
          if (phase === "active" && !drawnRef.current) {
            drawnRef.current = true;
            onDrawn?.();
          }
        }}
      />
    </g>
  );
}

type AnimatedMarkStrokeProps = {
  d: string;
  cx: number;
  cy: number;
  phase: StrokePhase;
  onDrawn?: () => void;
};

function AnimatedMarkStroke({ d, cx, cy, phase, onDrawn }: AnimatedMarkStrokeProps) {
  const drawnRef = useRef(false);

  useEffect(() => {
    if (phase !== "active") drawnRef.current = false;
  }, [phase]);

  return (
    <motion.g
      initial={false}
      animate={{
        opacity: phase === "pending" ? 0 : 1,
        scale: phase === "pending" ? 0 : 1,
      }}
      transition={{
        duration: phase === "active" ? MARK_POP_DURATION : 0,
        ease: STROKE_EASE,
      }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
      onAnimationComplete={() => {
        if (phase === "active" && !drawnRef.current) {
          drawnRef.current = true;
          onDrawn?.();
        }
      }}
    >
      <path
        d={d}
        fill="currentColor"
        stroke="none"
        className={cn(
          phase === "done"
            ? "text-amber-300/95"
            : phase === "active"
              ? "text-amber-400"
              : "text-amber-500/10",
        )}
        style={{
          filter:
            phase === "active"
              ? "drop-shadow(0 0 8px rgba(251,191,36,0.85))"
              : undefined,
        }}
      />
    </motion.g>
  );
}

function RenderInkStroke({
  stroke,
  phase,
  onDrawn,
}: {
  stroke: InkStroke;
  phase: StrokePhase;
  onDrawn?: () => void;
}) {
  if (stroke.kind === "mark") {
    const center = stroke.markCenter ?? { cx: stroke.centerX, cy: 0 };
    return (
      <AnimatedMarkStroke
        d={stroke.d}
        cx={center.cx}
        cy={center.cy}
        phase={phase}
        onDrawn={onDrawn}
      />
    );
  }

  return (
    <AnimatedBodyStroke
      d={stroke.d}
      phase={phase}
      delay={stroke.letterDelay}
      onDrawn={onDrawn}
    />
  );
}

export function HandwritingStep({
  step,
  handwritingText,
  onComplete,
  hudLayout = false,
}: HandwritingStepProps) {
  const { playTap, playSnap, playQuillStroke } = useSoundEffects();

  const plan = useMemo(() => resolveCalligraphyPlan(handwritingText), [handwritingText]);
  const { letters, mode, displayText } = plan;

  const [inkStrokes, setInkStrokes] = useState<InkStroke[]>([]);
  const [baselineY, setBaselineY] = useState<number | null>(null);
  const [letterCount, setLetterCount] = useState(0);
  const [sceneMode, setSceneMode] = useState<CalligraphyMode>(mode);
  const [fontError, setFontError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFontError(null);
    setInkStrokes([]);
    setBaselineY(null);
    setLetterCount(0);

    buildGlyphScene(letters, mode, displayText)
      .then((scene) => {
        if (cancelled) return;
        setInkStrokes(scene.strokes);
        setBaselineY(scene.baselineY);
        setLetterCount(scene.letterCount);
        setSceneMode(scene.mode);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("[HandwritingStep] glyph scene failed:", error);
        setFontError("Could not render calligraphy for this lesson.");
      });

    return () => {
      cancelled = true;
    };
  }, [displayText, letters, mode]);

  /** -1 = intro hold (visible blank canvas); then 0…n-1 active strokes. */
  const [cursor, setCursor] = useState(-1);
  const [finished, setFinished] = useState(false);
  const [playbackReady, setPlaybackReady] = useState(false);

  useEffect(() => {
    setCursor(-1);
    setFinished(false);
    setPlaybackReady(false);
  }, [inkStrokes]);

  const fontReady = inkStrokes.length > 0 && baselineY != null;

  useEffect(() => {
    if (!fontReady || finished) return;

    let cancelled = false;
    const start = window.setTimeout(() => {
      if (cancelled) return;
      // Double-rAF ensures the SVG is painted before pathLength begins.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          setPlaybackReady(true);
          setCursor(0);
        });
      });
    }, INTRO_HOLD_MS + STEP_ENTRANCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(start);
    };
  }, [fontReady, finished, inkStrokes]);

  const totalStrokes = inkStrokes.length;
  const activeStroke = cursor >= 0 ? inkStrokes[cursor] : undefined;
  const playing = playbackReady && cursor >= 0 && !finished;

  const completedLetterOrders = useMemo(() => {
    const done = new Set<number>();
    for (const stroke of inkStrokes) {
      if (finished || stroke.globalIndex < cursor) {
        done.add(stroke.rtlLetterOrder);
      }
    }
    return done;
  }, [cursor, finished, inkStrokes]);

  useEffect(() => {
    if (!playing || !activeStroke) return;
    playQuillStroke();
  }, [activeStroke, cursor, playing, playQuillStroke]);

  const advanceCursor = useCallback(() => {
    setCursor((prev) => {
      if (prev < 0) return prev;
      const next = prev + 1;
      if (next >= totalStrokes) {
        setFinished(true);
        return totalStrokes;
      }
      return next;
    });
  }, [totalStrokes]);

  const handleSkip = useCallback(() => {
    playTap();
    setCursor(totalStrokes);
    setFinished(true);
    setPlaybackReady(true);
  }, [playTap, totalStrokes]);

  const handleContinue = useCallback(() => {
    playSnap();
    onComplete();
  }, [onComplete, playSnap]);

  const footer = (
    <Button
      type="button"
      size="lg"
      disabled={!finished}
      className="font-serif w-full bg-amber-500 font-semibold text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
      onClick={handleContinue}
    >
      Continue
    </Button>
  );

  const stageLabel = !fontReady
    ? "Loading Amiri calligraphy…"
    : !playbackReady
      ? sceneMode === "word"
        ? "Watch the word take shape…"
        : "Watch the quill prepare…"
      : activeStroke
        ? activeStroke.kind === "body"
          ? sceneMode === "word"
            ? `Writing · letter ${activeStroke.rtlLetterOrder + 1} of ${letterCount}`
            : `Letter ${activeStroke.rtlLetterOrder + 1} of ${letterCount} · ${activeStroke.letter} · main stroke`
          : sceneMode === "word"
            ? `Writing · marks on letter ${activeStroke.rtlLetterOrder + 1}`
            : `Letter ${activeStroke.rtlLetterOrder + 1} of ${letterCount} · ${activeStroke.letter} · nuqat`
        : "Preparing…";

  const stage = (
    <div className={LOOM_STAGE_ARENA}>
      <div className="flex w-full max-w-4xl flex-col items-center gap-8">
        <div className="relative w-full">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)]"
          />

          <div className="relative overflow-visible rounded-3xl border border-amber-500/25 bg-slate-950/60 px-4 py-6 md:px-8 md:py-8">
            <svg
              viewBox={CALLIGRAPHY_VIEWBOX}
              overflow="visible"
              className="mx-auto h-48 w-full overflow-visible md:h-56 lg:h-64"
              role="img"
              aria-label={`Calligraphy of ${handwritingText}`}
            >
              {baselineY != null ? (
                <line
                  x1={64}
                  y1={baselineY}
                  x2={736}
                  y2={baselineY}
                  stroke="rgba(245,158,11,0.18)"
                  strokeWidth={1}
                  strokeDasharray="6 10"
                />
              ) : null}

              {inkStrokes.map((stroke) => {
                const phase =
                  cursor < 0
                    ? "pending"
                    : strokePhase(stroke.globalIndex, cursor, finished);
                return (
                  <RenderInkStroke
                    key={stroke.id}
                    stroke={stroke}
                    phase={phase}
                    onDrawn={
                      playing && phase === "active" && stroke.globalIndex === cursor
                        ? advanceCursor
                        : undefined
                    }
                  />
                );
              })}
            </svg>

            {sceneMode === "word" ? (
              <motion.p
                className="font-amiri pointer-events-none mt-3 text-center text-5xl font-bold text-amber-100 md:text-6xl"
                dir="rtl"
                lang="ar"
                initial={{ opacity: 0.12 }}
                animate={{
                  opacity: finished
                    ? 0.95
                    : 0.12 + (completedLetterOrders.size / Math.max(letterCount, 1)) * 0.55,
                }}
                transition={{ duration: 0.45 }}
              >
                {displayText}
              </motion.p>
            ) : (
              <p
                className="font-amiri pointer-events-none mt-2 text-center text-4xl font-bold text-amber-100/10 md:text-5xl"
                dir="rtl"
                lang="ar"
              >
                {letters.join(" · ")}
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-slate-400">
          {fontError
            ? fontError
            : finished
              ? sceneMode === "word"
                ? "Word complete — study the strokes, then continue."
                : "Study the stroke order — then continue."
              : fontReady
                ? playing
                  ? `Stroke ${cursor + 1} of ${totalStrokes} · ${stageLabel} · right to left`
                  : stageLabel
                : "Loading Amiri calligraphy…"}
        </p>

        {!finished && fontReady ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-amber-400/80"
            onClick={handleSkip}
          >
            Skip animation
          </Button>
        ) : null}
      </div>
    </div>
  );

  if (hudLayout) {
    return (
      <>
        {stage}
        <LoomHudFooterPortal>{footer}</LoomHudFooterPortal>
      </>
    );
  }

  return (
    <LoomStepFrame phaseLabel="Calligraphy Quill" step={step} titleId="handwriting-title" footer={footer}>
      {stage}
    </LoomStepFrame>
  );
}

type ResolveHandwritingOptions = {
  forgeVocab?: VocabularyItem;
  lessonRoot?: ArabicRoot;
};

/** Resolve ink target from step metadata — works for roots, vocab words, and future lessons. */
export function resolveHandwritingText(
  step: InteractiveStep,
  options?: ResolveHandwritingOptions,
): string {
  if (step.forgeVocab?.arabic) return step.forgeVocab.arabic;
  if (options?.forgeVocab?.arabic) return options.forgeVocab.arabic;
  if (step.targetRoot?.letters.length) return step.targetRoot.letters.join(" · ");
  if (options?.lessonRoot?.letters.length) return options.lessonRoot.letters.join(" · ");
  return "ب";
}
