"use client";

import { useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { completePathNodeAction } from "@/app/actions/path";
import { completeLessonAction } from "@/app/actions/progress";
import { LessonAdvanceCard } from "@/components/lessons/LessonAdvanceCard";
import { LessonBody } from "@/components/lessons/LessonBody";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { findCurriculumLesson } from "@/data/curriculumData";
import {
  areNodeLessonsComplete,
  getNextLessonForNode,
  getPathNode,
  getPathNodeForLesson,
} from "@/data/learningPath";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useNawaStore } from "@/store/nawa-store";

type LessonPageClientProps = {
  id: string;
};

/**
 * Strict viewport lesson shell: header + scrollable body + sticky action footer.
 * Core Continue / Return controls never fall below the fold.
 */
export function LessonPageClient({ id }: LessonPageClientProps) {
  const searchParams = useSearchParams();
  const hydrateLessonTools = useNawaStore((s) => s.hydrateLessonTools);
  const setActiveLessonId = useNawaStore((s) => s.setActiveLessonId);
  const completeLesson = useNawaStore((s) => s.completeLesson);
  const completed = useNawaStore((s) => s.userProgress.completedLessonIds);
  const storeCompleted = useAppStore((s) => s.completedLessonIds);

  const found = findCurriculumLesson(id);
  const pathLessonMeta = useMemo(() => {
    const node = getPathNodeForLesson(id);
    const ref = node?.lessons.find((l) => l.id === id);
    return ref && node ? { node, ref } : null;
  }, [id]);

  const syntheticLesson =
    !found && pathLessonMeta
      ? ({
          id,
          title: pathLessonMeta.ref.title,
          description:
            pathLessonMeta.ref.kind === "syntax"
              ? "Arrange Word Cards into correct Arabic order."
              : "Forge a Word Card for your deck.",
          type: pathLessonMeta.ref.kind === "syntax" ? "quiz" : "morph-engine",
          isCompleted: false,
        } as const)
      : null;

  const pathNodeFromQuery = searchParams.get("node");
  const pathNode = useMemo(() => {
    if (pathNodeFromQuery) {
      const byQuery = getPathNode(pathNodeFromQuery);
      if (byQuery?.lessons.some((l) => l.id === id)) return byQuery;
    }
    return getPathNodeForLesson(id) ?? null;
  }, [id, pathNodeFromQuery]);

  useEffect(() => {
    setActiveLessonId(id);
    hydrateLessonTools(id);
  }, [id, setActiveLessonId, hydrateLessonTools]);

  const onActivitiesComplete = useCallback(() => {
    completeLesson(id);
    void (async () => {
      const result = await completeLessonAction(id);
      if (result.ok && typeof result.currency === "number") {
        useAppStore.getState().setHibrBalance(result.currency);
      }
      useAppStore.getState().markLessonCompleteOptimistic(id);

      if (!pathNode) return;

      const lessonIds = [
        ...new Set([
          ...useNawaStore.getState().userProgress.completedLessonIds,
          ...useAppStore.getState().completedLessonIds,
          id,
        ]),
      ];

      if (!areNodeLessonsComplete(pathNode, lessonIds)) return;
      if (lessonIds.includes(pathNode.id)) return;

      const pathResult = await completePathNodeAction(pathNode.id);
      if (!pathResult.ok) return;

      useAppStore.getState().markLessonCompleteOptimistic(pathNode.id);
      if (pathResult.unlockedWordIds?.length) {
        useAppStore.getState().unlockDeckOptimistic(pathResult.unlockedWordIds, pathNode.id);
      } else if (pathResult.unlockedPairs?.length) {
        useAppStore.getState().unlockVocabOptimistic(
          pathResult.unlockedPairs.map((p) => ({
            rootId: p.rootId,
            patternId: p.patternId,
            sourceNodeId: pathNode.id,
          })),
        );
      }
      void useAppStore.getState().hydrate();
    })();
  }, [completeLesson, id, pathNode]);

  if (!found && !syntheticLesson) {
    return (
      <main className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg font-medium">Lesson not found</p>
        <Button asChild variant="outline">
          <Link href="/path">Back to Learning Path</Link>
        </Button>
      </main>
    );
  }

  const lesson = found?.lesson ?? {
    id: syntheticLesson!.id,
    title: syntheticLesson!.title,
    description: syntheticLesson!.description,
    type: syntheticLesson!.type as "morph-engine" | "quiz",
    isCompleted: false,
  };
  const unit = found?.unit ?? { title: pathNode?.unit ?? "Learning Path" };
  const stage = found?.stage ?? { title: pathNode?.title ?? "Path" };
  const isDone =
    completed.includes(lesson.id) ||
    storeCompleted.includes(lesson.id) ||
    lesson.isCompleted;

  const nextOnPath = pathNode
    ? getNextLessonForNode(pathNode, [
        ...new Set([...completed, ...storeCompleted, ...(isDone ? [lesson.id] : [])]),
      ]) ?? undefined
    : undefined;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <header className="shrink-0 border-b border-border/60 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
          <Button asChild variant="ghost" size="sm" className="-ms-2 gap-1">
            <Link href="/path">
              <ArrowLeft className="size-4" />
              Path
            </Link>
          </Button>
          <div className="min-w-0 flex-1 text-center sm:text-start">
            <h1 className="truncate text-base font-semibold sm:text-lg">{lesson.title}</h1>
            <p className="text-muted-foreground truncate text-xs">
              {stage.title} · {unit.title}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {isDone ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="size-3" />
                Done
              </Badge>
            ) : (
              <Badge variant="outline">In progress</Badge>
            )}
          </div>
        </div>
      </header>

      <div
        className={cn(
          "mx-auto w-full max-w-5xl flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6",
        )}
      >
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed sm:text-base">
          {lesson.description}
        </p>
        <LessonBody key={lesson.id} lesson={lesson} onActivitiesComplete={onActivitiesComplete} />
      </div>

      <LessonAdvanceCard
        lessonId={lesson.id}
        pathNodeId={pathNode?.id}
        nextOnPath={nextOnPath}
        sticky
      />
    </div>
  );
}
