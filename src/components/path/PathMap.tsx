"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, ChevronDown, Lock, Play, Sparkles } from "lucide-react";
import { completePathNodeAction } from "@/app/actions/path";
import { ArabicText } from "@/components/common/ArabicText";
import { Button } from "@/components/ui/button";
import {
  areNodeLessonsComplete,
  describeUnlock,
  getNextLessonForNode,
  isPathNodeAvailable,
  isPathNodeComplete,
  LEARNING_PATH_NODES,
  lessonHref,
  type PathNode,
} from "@/data/learningPath";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const ACCENT: Record<
  PathNode["accent"],
  { ring: string; fill: string; soft: string; badge: string }
> = {
  sky: {
    ring: "ring-sky-400/50",
    fill: "bg-sky-500",
    soft: "border-sky-400/30 bg-sky-500/10",
    badge: "bg-sky-400 text-sky-950",
  },
  emerald: {
    ring: "ring-emerald-400/50",
    fill: "bg-emerald-500",
    soft: "border-emerald-400/30 bg-emerald-500/10",
    badge: "bg-emerald-400 text-emerald-950",
  },
  amber: {
    ring: "ring-amber-400/50",
    fill: "bg-amber-500",
    soft: "border-amber-400/30 bg-amber-500/10",
    badge: "bg-amber-400 text-amber-950",
  },
  violet: {
    ring: "ring-violet-400/50",
    fill: "bg-violet-500",
    soft: "border-violet-400/30 bg-violet-500/10",
    badge: "bg-violet-400 text-violet-950",
  },
};

type PathMapProps = {
  initialCompletedIds?: string[];
};

export function PathMap({ initialCompletedIds = [] }: PathMapProps) {
  const router = useRouter();
  const storeCompleted = useAppStore((s) => s.completedLessonIds);
  const unlockVocabOptimistic = useAppStore((s) => s.unlockVocabOptimistic);
  const markLessonCompleteOptimistic = useAppStore((s) => s.markLessonCompleteOptimistic);
  const hydrate = useAppStore((s) => s.hydrate);
  const status = useAppStore((s) => s.status);

  const completedIds = useMemo(() => {
    const set = new Set([...initialCompletedIds, ...storeCompleted]);
    return [...set];
  }, [initialCompletedIds, storeCompleted]);

  const completedLessonIds = completedIds;

  const currentNode = useMemo(() => {
    return (
      LEARNING_PATH_NODES.find(
        (n) =>
          isPathNodeAvailable(n.id, completedIds) && !isPathNodeComplete(n.id, completedIds),
      ) ?? LEARNING_PATH_NODES.find((n) => !isPathNodeComplete(n.id, completedIds))
      ?? LEARNING_PATH_NODES[LEARNING_PATH_NODES.length - 1]
      ?? null
    );
  }, [completedIds]);

  const [expandedId, setExpandedId] = useState<string | null>(currentNode?.id ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    if (currentNode && !expandedId) setExpandedId(currentNode.id);
  }, [currentNode, expandedId]);

  const doneCount = LEARNING_PATH_NODES.filter((n) =>
    isPathNodeComplete(n.id, completedIds),
  ).length;

  const continueLesson =
    currentNode && !isPathNodeComplete(currentNode.id, completedIds)
      ? getNextLessonForNode(currentNode, completedLessonIds)
      : null;

  function claimNode(node: PathNode) {
    setMessage(null);
    startTransition(async () => {
      const result = await completePathNodeAction(node.id);
      if (!result.ok) {
        setMessage(result.error ?? "Could not finish this stop.");
        return;
      }

      markLessonCompleteOptimistic(node.id);
      if (result.unlockedPairs?.length) {
        unlockVocabOptimistic(
          result.unlockedPairs.map((p) => ({
            rootId: p.rootId,
            patternId: p.patternId,
            sourceNodeId: node.id,
          })),
        );
      }
      void hydrate();

      if (result.alreadyCompleted) {
        setMessage("Already finished — pick the next stop.");
      } else if (node.unlocks.length > 0) {
        setMessage(
          `Nice work. Bonus: ${node.unlocks.length} word${
            node.unlocks.length === 1 ? "" : "s"
          } ready for the Arena.`,
        );
      } else {
        setMessage("Stop complete — keep going.");
      }

      const next = LEARNING_PATH_NODES.find(
        (n) =>
          n.id !== node.id &&
          isPathNodeAvailable(n.id, result.completedNodeIds ?? [...completedIds, node.id]) &&
          !isPathNodeComplete(n.id, result.completedNodeIds ?? [...completedIds, node.id]),
      );
      if (next) setExpandedId(next.id);
    });
  }

  function openNode(node: PathNode, available: boolean, done: boolean) {
    if (!available && !done) return;
    setExpandedId(node.id);
    requestAnimationFrame(() => {
      document
        .getElementById(`path-panel-${node.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function startNode(node: PathNode) {
    const next = getNextLessonForNode(node, completedLessonIds);
    if (next) {
      router.push(lessonHref(next.id, node.id));
      return;
    }
    openNode(node, true, false);
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 pb-24 pt-6 sm:px-6">
      <header className="space-y-2 text-center">
        <p className="text-[11px] tracking-[0.22em] text-emerald-300/70 uppercase">
          Learning Path
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Learn Arabic, one stop at a time
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-white/55">
          Open a stop, tap a lesson, play. Arena words are a bonus when you finish.
        </p>
        <p className="text-xs text-white/40">
          {doneCount} / {LEARNING_PATH_NODES.length} stops finished
        </p>
        {status === "error" ? (
          <p className="text-xs text-rose-300">Progress sync issue — try refreshing.</p>
        ) : null}
      </header>

      {continueLesson && currentNode ? (
        <div className="sticky top-[4.5rem] z-20 -mx-1">
          <Button
            asChild
            size="lg"
            className="h-12 w-full bg-emerald-500 text-base font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
          >
            <Link href={lessonHref(continueLesson.id, currentNode.id)}>
              <Play className="size-5" />
              {currentNode.lessons.some((l) => completedLessonIds.includes(l.id))
                ? `Continue: ${continueLesson.title}`
                : `Start: ${continueLesson.title}`}
            </Link>
          </Button>
        </div>
      ) : null}

      <ol className="flex flex-col gap-3">
        {LEARNING_PATH_NODES.map((node, index) => {
          const done = isPathNodeComplete(node.id, completedIds);
          const available = isPathNodeAvailable(node.id, completedIds);
          const locked = !available && !done;
          const expanded = expandedId === node.id;
          const accent = ACCENT[node.accent];
          const nextLesson = getNextLessonForNode(node, completedLessonIds);
          const lessonsDone = areNodeLessonsComplete(node, completedLessonIds);

          return (
            <li key={node.id} className="relative">
              <div
                className={cn(
                  "overflow-hidden rounded-2xl border transition",
                  expanded ? cn("glass-panel-strong ring-2", accent.ring) : "glass-panel",
                  locked && "opacity-50",
                )}
              >
                <div className="flex items-stretch gap-0">
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (locked) return;
                      if (available && !done && nextLesson && !expanded) {
                        // First tap on current stop → open lesson immediately
                        startNode(node);
                        return;
                      }
                      openNode(node, available, done);
                    }}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-3 px-3 py-3.5 text-start",
                      locked && "cursor-not-allowed",
                    )}
                  >
                    <span
                      className={cn(
                        "relative flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                        done ? "bg-emerald-500" : locked ? "bg-white/10" : accent.fill,
                      )}
                    >
                      {done ? (
                        <Check className="size-5" />
                      ) : locked ? (
                        <Lock className="size-4 text-white/50" />
                      ) : (
                        index + 1
                      )}
                      {available && !done ? (
                        <span className="absolute inset-0 animate-ping rounded-full bg-white/15" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] tracking-wide text-white/40 uppercase">
                        {node.unit}
                      </span>
                      <span className="block truncate text-sm font-semibold text-white">
                        {node.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-white/45">
                        {done
                          ? "Finished — tap to replay"
                          : locked
                            ? "Locked"
                            : nextLesson
                              ? "Tap to open lesson"
                              : "Lessons done — finish stop"}
                      </span>
                    </span>
                  </button>

                  {!locked ? (
                    <button
                      type="button"
                      aria-label={expanded ? "Collapse" : "Show lessons"}
                      aria-expanded={expanded}
                      onClick={() =>
                        setExpandedId((id) => (id === node.id ? null : node.id))
                      }
                      className="flex w-11 shrink-0 items-center justify-center border-s border-white/10 text-white/50 hover:bg-white/5 hover:text-white"
                    >
                      <ChevronDown
                        className={cn(
                          "size-5 transition-transform",
                          expanded && "rotate-180",
                        )}
                      />
                    </button>
                  ) : null}
                </div>

                <AnimatePresence initial={false}>
                  {expanded && !locked ? (
                    <motion.div
                      id={`path-panel-${node.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-white/10"
                    >
                      <div className={cn("space-y-3 px-3 py-3 sm:px-4", accent.soft)}>
                        <p className="text-sm leading-relaxed text-white/60">{node.description}</p>

                        {!done && available && nextLesson ? (
                          <Button
                            asChild
                            className="w-full bg-emerald-500 font-semibold text-black hover:bg-emerald-400"
                          >
                            <Link href={lessonHref(nextLesson.id, node.id)}>
                              <Play className="size-4" />
                              {node.lessons.some((l) => completedLessonIds.includes(l.id))
                                ? "Continue lesson"
                                : "Start lesson"}
                            </Link>
                          </Button>
                        ) : null}

                        <div className="space-y-1.5">
                          <p className="text-[10px] tracking-wide text-white/40 uppercase">
                            Lessons — tap any to open
                          </p>
                          {node.lessons.map((lesson, i) => {
                            const lessonDone = completedLessonIds.includes(lesson.id);
                            return (
                              <Link
                                key={lesson.id}
                                href={lessonHref(lesson.id, node.id)}
                                className={cn(
                                  "flex items-center gap-3 rounded-xl border px-3 py-3 transition",
                                  lessonDone
                                    ? "border-emerald-400/25 bg-emerald-500/10"
                                    : "border-white/12 bg-black/30 hover:border-emerald-400/40 hover:bg-emerald-500/10",
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                    lessonDone
                                      ? "bg-emerald-500 text-white"
                                      : "bg-white/10 text-white/70",
                                  )}
                                >
                                  {lessonDone ? <Check className="size-4" /> : i + 1}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-medium text-white">
                                    {lesson.title}
                                  </span>
                                  <span className="text-[11px] text-emerald-300/80">
                                    {lessonDone ? "Replay" : "Open lesson →"}
                                  </span>
                                </span>
                                <BookOpen className="size-4 shrink-0 text-white/35" />
                              </Link>
                            );
                          })}
                        </div>

                        {node.unlocks.length > 0 ? (
                          <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
                            <p className="text-[10px] tracking-wide text-white/35 uppercase">
                              Arena bonus on finish
                            </p>
                            <ul className="mt-1.5 flex flex-wrap gap-1.5">
                              {node.unlocks.map((u) => {
                                const d = describeUnlock(u);
                                return (
                                  <li
                                    key={`${u.rootId}:${u.patternId}`}
                                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1"
                                  >
                                    <ArabicText className="battle-arabic text-sm text-amber-50/90">
                                      {d.arabic}
                                    </ArabicText>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ) : null}

                        {!done && available && lessonsDone ? (
                          <Button
                            disabled={pending}
                            className="w-full bg-emerald-500 font-semibold text-black hover:bg-emerald-400"
                            onClick={() => claimNode(node)}
                          >
                            <Sparkles className="size-4" />
                            {pending ? "Saving…" : "Finish this stop"}
                          </Button>
                        ) : null}

                        {message && expandedId === node.id ? (
                          <p className="text-sm text-emerald-200/90" role="status">
                            {message}
                          </p>
                        ) : null}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
