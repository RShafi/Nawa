"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  curriculumStages,
  deriveLessonStatus,
  getNextCurriculumLessonId,
  INITIAL_USER_PROGRESS,
} from "@/data/curriculumData";
import { PathNode } from "@/components/curriculum/PathNode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNawaStore } from "@/store/nawa-store";
import { cn } from "@/lib/utils";
import type { LessonStatus } from "@/types/arabic";

export function CurriculumMap() {
  const router = useRouter();
  const progress = useNawaStore((s) => s.userProgress);
  const setActiveLesson = useNawaStore((s) => s.setActiveLessonId);
  const resetProgressIfStale = useNawaStore((s) => s.resetProgressIfStale);

  useEffect(() => {
    resetProgressIfStale();
    const finish = () => useNawaStore.getState().setHasHydrated(true);
    if (useNawaStore.persist.hasHydrated()) {
      finish();
      return;
    }
    return useNawaStore.persist.onFinishHydration(finish);
  }, [resetProgressIfStale]);

  const nextId = getNextCurriculumLessonId(progress.completedLessonIds);
  const activeId =
    nextId ?? progress.activeLessonId ?? INITIAL_USER_PROGRESS.activeLessonId;
  const hydrated = useNawaStore((s) => s._hasHydrated);
  const hasProgress = progress.completedLessonIds.length > 0;
  const ctaLabel = !nextId
    ? "Path complete — review"
    : hasProgress
      ? "Continue learning"
      : "Start first lesson";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Learning path</h2>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm sm:text-base">
            Follow the glowing play button — that’s your next lesson. Unit pins mark sections; they
            aren’t lessons themselves.
          </p>
        </div>
        {hydrated ? (
          <Button asChild size="lg" className="shrink-0">
            <Link
              href={`/lesson/${activeId}`}
              onClick={() => setActiveLesson(activeId)}
            >
              {ctaLabel}
            </Link>
          </Button>
        ) : (
          <Button size="lg" className="shrink-0" disabled>
            Loading…
          </Button>
        )}
      </div>

      <ol className="space-y-12">
        {curriculumStages.map((stage, stageIndex) => (
          <li key={stage.id} className="relative">
            <Card
              className="mb-8 overflow-hidden border-s-4"
              style={{ borderInlineStartColor: stage.themeColor }}
            >
              <CardHeader className="gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Stage {stageIndex}</Badge>
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: stage.themeColor }}
                      aria-hidden
                    />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl">{stage.title}</CardTitle>
                  <CardDescription className="mt-1 max-w-2xl">{stage.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <div className="relative mx-auto max-w-3xl">
              <div
                className="absolute start-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full opacity-80"
                style={{ backgroundColor: stage.themeColor }}
                aria-hidden
              />

              <ul className="relative space-y-10 pb-4">
                {stage.units.map((unit, unitIndex) => {
                  const zigLeft = unitIndex % 2 === 0;
                  const lessonStatuses = unit.lessons.map((l) => deriveLessonStatus(l.id, progress));
                  const unitStatus = deriveUnitHubStatus(lessonStatuses);
                  const firstPlayable = unit.lessons.find(
                    (l) => deriveLessonStatus(l.id, progress) === "active",
                  );

                  return (
                    <li key={unit.id} className="relative">
                      <div
                        className={cn(
                          "grid items-start gap-4 sm:gap-6",
                          "grid-cols-1 sm:grid-cols-[1fr_auto_1fr]",
                        )}
                      >
                        <div
                          className={cn(
                            "order-2 sm:order-1",
                            zigLeft ? "sm:text-end sm:pe-2" : "sm:invisible sm:pointer-events-none",
                          )}
                        >
                          {zigLeft ? <UnitCopy unit={unit} /> : null}
                        </div>

                        <div className="order-1 flex flex-col items-center gap-4 sm:order-2">
                          <div className="bg-background relative z-10 rounded-full p-1">
                            <PathNode
                              kind="unit"
                              status={unitStatus}
                              title={unit.title}
                              description={`${unit.description} (section marker — open a lesson below)`}
                              themeColor={stage.themeColor}
                              size="md"
                              onClick={() => {
                                if (!firstPlayable) return;
                                setActiveLesson(firstPlayable.id);
                                router.push(`/lesson/${firstPlayable.id}`);
                              }}
                            />
                          </div>

                          <ul className="flex flex-col items-center gap-5">
                            {unit.lessons.map((lesson) => {
                              const status = deriveLessonStatus(lesson.id, progress);
                              return (
                                <li key={lesson.id} className="flex flex-col items-center gap-1">
                                  <PathNode
                                    kind="lesson"
                                    status={status}
                                    title={lesson.title}
                                    description={lesson.description}
                                    themeColor={stage.themeColor}
                                    size="sm"
                                    onClick={() => {
                                      if (status === "locked") return;
                                      setActiveLesson(lesson.id);
                                      router.push(`/lesson/${lesson.id}`);
                                    }}
                                  />
                                  <span
                                    className={cn(
                                      "max-w-[9rem] text-center text-[10px] leading-tight sm:max-w-[11rem]",
                                      status === "active"
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground",
                                    )}
                                  >
                                    {lesson.title}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        <div
                          className={cn(
                            "order-3",
                            !zigLeft ? "sm:ps-2" : "sm:invisible sm:pointer-events-none",
                            zigLeft && "hidden sm:block",
                          )}
                        >
                          {!zigLeft ? <UnitCopy unit={unit} /> : null}
                        </div>
                      </div>

                      <div className="mt-3 sm:hidden">
                        <UnitCopy unit={unit} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function deriveUnitHubStatus(statuses: LessonStatus[]): LessonStatus {
  if (statuses.length > 0 && statuses.every((s) => s === "completed")) return "completed";
  if (statuses.some((s) => s === "active")) return "active";
  if (statuses.some((s) => s === "completed")) return "active";
  return "locked";
}

function UnitCopy({ unit }: { unit: { title: string; description: string } }) {
  return (
    <div className="space-y-1">
      <p className="font-semibold leading-snug">{unit.title}</p>
      <p className="text-muted-foreground text-sm leading-relaxed">{unit.description}</p>
    </div>
  );
}
