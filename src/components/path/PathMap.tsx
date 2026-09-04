"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PathNode } from "@/components/path/PathNode";
import { usePageVisible } from "@/hooks/usePageVisible";
import {
  curriculumData,
  firstIncompleteLoomLesson,
  isLoomLessonComplete,
  isLoomLessonUnlocked,
  LOOM_CHAPTER_META,
  loomLessonHref,
} from "@/content/curriculumData";
import {
  forgeTrialHref,
  forgeTrials,
  trialMilestoneId,
} from "@/content/forgeTrials";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { registerLessons, useLessonStore } from "@/store/useLessonStore";
import type { CurriculumLesson } from "@/types/curriculum";
import type { ForgeTrial } from "@/types/forge";
import type { PathNodeKind, PathNodeState } from "@/components/path/PathNode";

const CANVAS_W = 320;
const ROW_H = 148;
const TOP_PAD = 96;
const CHAPTER_HEADER_H = 80;

type StarMapNode = PathNodeState & {
  chapterId: string;
  lane: -1 | 0 | 1;
};

function isLessonUnlockedByMastery(
  lesson: CurriculumLesson,
  lessonIndex: number,
  masteredVocabIds: readonly string[],
): boolean {
  return isLoomLessonUnlocked(lessonIndex, masteredVocabIds);
}

function isTrialUnlocked(
  trial: ForgeTrial,
  masteredVocabIds: readonly string[],
): boolean {
  const unlockLesson = curriculumData.find((l) => l.id === trial.unlockAfterLessonId);
  if (!unlockLesson) return false;
  return isLoomLessonComplete(unlockLesson, masteredVocabIds);
}

function isTrialComplete(
  trial: ForgeTrial,
  masteredVocabIds: readonly string[],
): boolean {
  return masteredVocabIds.includes(trialMilestoneId(trial.id));
}

function buildStarMapNodes(masteredVocabIds: readonly string[]): StarMapNode[] {
  const result: StarMapNode[] = [];
  let globalIndex = 0;

  curriculumData.forEach((lesson, lessonIndex) => {
    const lane = ((globalIndex % 3) - 1) as -1 | 0 | 1;
    const unlocked = isLessonUnlockedByMastery(lesson, lessonIndex, masteredVocabIds);
    const done = isLoomLessonComplete(lesson, masteredVocabIds);

    result.push({
      kind: "LESSON" as PathNodeKind,
      id: lesson.id,
      title: lesson.title,
      subtitle: lesson.subtitle,
      href: loomLessonHref(lesson.id),
      chapterId: lesson.chapterId,
      unlocked,
      done,
      isContinue: false,
      globalIndex,
      lane,
    });
    globalIndex += 1;

    for (const trial of forgeTrials) {
      if (trial.unlockAfterLessonId !== lesson.id) continue;
      const trialLane = ((globalIndex % 3) - 1) as -1 | 0 | 1;
      result.push({
        kind: "TRIAL",
        id: trial.id,
        title: trial.title,
        subtitle: trial.subtitle,
        href: forgeTrialHref(trial.id),
        chapterId: trial.chapterId,
        unlocked: isTrialUnlocked(trial, masteredVocabIds),
        done: isTrialComplete(trial, masteredVocabIds),
        isContinue: false,
        globalIndex,
        lane: trialLane,
      });
      globalIndex += 1;
    }
  });

  return result;
}

function laneCenterX(lane: StarMapNode["lane"]): number {
  if (lane === -1) return CANVAS_W * 0.28;
  if (lane === 1) return CANVAS_W * 0.72;
  return CANVAS_W * 0.5;
}

const STAR_LAYER_NEAR =
  "radial-gradient(1.5px 1.5px at 18px 24px, rgba(255,255,255,0.9), transparent)," +
  "radial-gradient(1px 1px at 64px 88px, rgba(255,255,255,0.55), transparent)," +
  "radial-gradient(1.5px 1.5px at 112px 42px, rgba(251,191,36,0.65), transparent)," +
  "radial-gradient(1px 1px at 156px 120px, rgba(255,255,255,0.45), transparent)," +
  "radial-gradient(1px 1px at 200px 68px, rgba(255,255,255,0.7), transparent)";

const STAR_LAYER_FAR =
  "radial-gradient(1px 1px at 32px 56px, rgba(255,255,255,0.35), transparent)," +
  "radial-gradient(1px 1px at 96px 140px, rgba(255,255,255,0.25), transparent)," +
  "radial-gradient(1px 1px at 168px 28px, rgba(255,255,255,0.3), transparent)," +
  "radial-gradient(1px 1px at 240px 96px, rgba(255,255,255,0.2), transparent)";

function ParallaxStarField({ paused }: { paused: boolean }) {
  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-50 nawa-starfield-far ${paused ? "nawa-motion-paused" : ""}`}
        style={{
          backgroundImage: STAR_LAYER_FAR,
          backgroundSize: "280px 280px",
          backgroundRepeat: "repeat",
        }}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-70 nawa-starfield-near ${paused ? "nawa-motion-paused" : ""}`}
        style={{
          backgroundImage: STAR_LAYER_NEAR,
          backgroundSize: "220px 220px",
          backgroundRepeat: "repeat",
        }}
      />
    </>
  );
}

export function PathMap() {
  const pageVisible = usePageVisible();
  const masteredVocabIds = useLessonStore((s) => s.masteredVocabIds);
  const hasHydrated = useLessonStore((s) => s.hasHydrated);
  const { playTap } = useSoundEffects();

  useEffect(() => {
    registerLessons(curriculumData);
    if (!hasHydrated) {
      useLessonStore.persist.rehydrate();
    }
  }, [hasHydrated]);

  const nodes = useMemo(
    () => (hasHydrated ? buildStarMapNodes(masteredVocabIds) : []),
    [hasHydrated, masteredVocabIds],
  );

  // Mark continue lesson on hydrated set
  const continueLesson = useMemo(
    () => (hasHydrated ? firstIncompleteLoomLesson(masteredVocabIds) : null),
    [hasHydrated, masteredVocabIds],
  );

  const highlightedNodes = useMemo(() => {
    return nodes.map((node) => {
      if (node.kind === "LESSON" && continueLesson?.id === node.id) {
        return { ...node, isContinue: true };
      }
      return { ...node, isContinue: node.kind === "TRIAL" ? node.isContinue : false };
    });
  }, [continueLesson?.id, nodes]);

  const totalLessons = highlightedNodes.filter((n) => n.kind === "LESSON").length;
  const doneCount = highlightedNodes.filter((n) => n.kind === "LESSON" && n.done).length;

  const chapterBoundaries = useMemo(() => {
    const map = new Map<string, number>();
    highlightedNodes.forEach((n, i) => {
      if (!map.has(n.chapterId)) map.set(n.chapterId, i);
    });
    return map;
  }, [highlightedNodes]);

  const nodeCenters = useMemo(() => {
    return highlightedNodes.map((node, index) => {
      let y = TOP_PAD;
      for (let i = 0; i < index; i++) {
        if (chapterBoundaries.get(highlightedNodes[i]!.chapterId) === i && i > 0) {
          y += CHAPTER_HEADER_H;
        }
        y += ROW_H;
      }
      if (chapterBoundaries.get(node.chapterId) === index && index > 0) {
        y += CHAPTER_HEADER_H;
      }
      return { x: laneCenterX(node.lane), y };
    });
  }, [chapterBoundaries, highlightedNodes]);

  const constellationPaths = useMemo(() => {
    return highlightedNodes.slice(0, -1).map((node, i) => {
      const next = highlightedNodes[i + 1]!;
      const from = nodeCenters[i]!;
      const to = nodeCenters[i + 1]!;
      const midY = (from.y + to.y) / 2;
      const lit = node.done && next.unlocked;
      return {
        id: `constellation-${node.id}`,
        d: `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`,
        lit,
      };
    });
  }, [nodeCenters, highlightedNodes]);
  const svgHeight = (nodeCenters.at(-1)?.y ?? TOP_PAD) + ROW_H;

  return (
    <div className="relative flex min-h-full w-full flex-col bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0B0F19] via-black to-black">
      <ParallaxStarField paused={!pageVisible} />

      <div className="relative z-10 border-b border-amber-500/10 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="text-celestial-amber size-5" />
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Celestial Path
            </h1>
          </div>
          <p className="mt-1 text-sm text-white/55">
            Follow the runestone constellation — each star unlocks Arabic power.
          </p>
          <p className="text-celestial-amber/70 mt-2 font-mono text-[11px]">
            {hasHydrated ? `${doneCount}/${totalLessons}` : "—"} runestones awakened
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md px-4 py-8 pb-8 sm:max-w-lg sm:px-6">
        <div
          className="relative mx-auto"
          style={{ width: CANVAS_W, maxWidth: "100%", minHeight: svgHeight }}
        >
          <svg
            viewBox={`0 0 ${CANVAS_W} ${svgHeight}`}
            className="pointer-events-none absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMin meet"
            aria-hidden
          >
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            {constellationPaths.map((segment, index) => (
              <path
                key={segment.id}
                d={segment.d}
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth={segment.lit ? 2.5 : 1.5}
                strokeLinecap="round"
                filter={
                  segment.lit
                    ? "drop-shadow(0px 0px 10px rgba(245,158,11,0.8))"
                    : undefined
                }
                className={segment.lit ? undefined : "opacity-30"}
              />
            ))}
          </svg>

          <div className="pointer-events-auto relative" style={{ minHeight: svgHeight }}>
            {highlightedNodes.map((node, index) => {
              const center = nodeCenters[index]!;
              const isChapterStart = chapterBoundaries.get(node.chapterId) === node.globalIndex;
              const chapterMeta = LOOM_CHAPTER_META[node.chapterId];

              return (
                <div
                  key={node.id}
                  className="absolute left-0 w-full"
                  style={{ top: center.y - 48 }}
                >
                  {isChapterStart ? (
                    <div className="pointer-events-none mb-6 -translate-y-16 text-center">
                      <div className="mx-auto mb-2 h-px w-24 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
                      <p className="font-display text-xs tracking-[0.2em] text-amber-300/70 uppercase">
                        {chapterMeta?.title ?? node.chapterId}
                      </p>
                      {chapterMeta?.summary ? (
                        <p className="mt-0.5 text-[11px] text-white/40">{chapterMeta.summary}</p>
                      ) : null}
                    </div>
                  ) : null}

                  <div
                    className="absolute flex -translate-x-1/2 flex-col items-center"
                    style={{ left: center.x, top: 0 }}
                  >
                    <PathNode node={node} onTap={() => playTap()} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-amber-500/15 bg-black/40 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg flex-wrap items-center justify-between gap-3">
          <AnimatePresence mode="wait">
            {continueLesson ? (
              <motion.p
                key={continueLesson.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-white/55"
              >
                Next rune:{" "}
                <span className="text-celestial-amber font-medium">{continueLesson.title}</span>
              </motion.p>
            ) : (
              <p className="text-sm text-emerald-200/80">Constellation complete — revisit anytime.</p>
            )}
          </AnimatePresence>
          {continueLesson ? (
            <Button
              asChild
              size="lg"
              className="bg-celestial-amber font-display font-semibold text-obsidian hover:bg-amber-400"
              onClick={() => playTap()}
            >
              <Link href={loomLessonHref(continueLesson.id)}>
                <Play className="size-4 fill-current" />
                Continue
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="border-amber-500/25">
              <Link href="/arena">Visit Arena</Link>
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
