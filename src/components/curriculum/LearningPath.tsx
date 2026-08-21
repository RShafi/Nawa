"use client";

import { Check, Lock, Play, Circle } from "lucide-react";
import { CURRICULUM_STAGES } from "@/data/mockCurriculum";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  getLessonStatus,
  getNextActiveLessonId,
  withDerivedStageFlags,
} from "@/lib/curriculum-utils";
import { cn } from "@/lib/utils";
import { useNawaStore } from "@/store/nawa-store";
import type { LessonStatus } from "@/types/arabic";

export function LearningPath() {
  const userProgress = useNawaStore((s) => s.userProgress);
  const activeLessonId = useNawaStore((s) => s.activeLessonId);
  const launchLesson = useNawaStore((s) => s.launchLesson);
  const completeLesson = useNawaStore((s) => s.completeLesson);

  const stages = withDerivedStageFlags(CURRICULUM_STAGES, userProgress);
  const nextId = getNextActiveLessonId(userProgress);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning path</CardTitle>
        <CardDescription>
          A guided curriculum from phonetics to dialect fluency. Active nodes open the Morph Engine or
          Dialect Bridge.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-8 border-s-2 border-dashed ps-6 sm:ps-8">
          {stages.map((stage, stageIndex) => (
            <li key={stage.stageId} className="relative">
              <span
                className={cn(
                  "absolute -start-[1.4rem] top-1 flex size-6 items-center justify-center rounded-full border-2 bg-background text-[10px] font-bold sm:-start-[1.65rem] sm:size-7",
                  stage.stageId === userProgress.currentStageId
                    ? "border-primary text-primary"
                    : "border-muted-foreground/40 text-muted-foreground",
                )}
              >
                {stageIndex}
              </span>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold sm:text-lg">{stage.title}</h3>
                <Badge variant="outline" className="capitalize">
                  {stage.level}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4 max-w-2xl text-sm">{stage.description}</p>

              <div className="space-y-4">
                {stage.units.map((unit) => (
                  <div
                    key={unit.id}
                    className={cn(
                      "rounded-xl border p-3 sm:p-4",
                      unit.unlocked ? "bg-card" : "bg-muted/30 opacity-80",
                    )}
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{unit.title}</p>
                        <p className="text-muted-foreground text-xs sm:text-sm">{unit.description}</p>
                      </div>
                      <div className="flex gap-1.5">
                        {!unit.unlocked ? <Badge variant="muted">Locked</Badge> : null}
                        {unit.completed ? <Badge variant="success">Completed</Badge> : null}
                        {unit.unlocked && !unit.completed ? <Badge variant="secondary">Open</Badge> : null}
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {unit.lessons.map((lesson) => {
                        const status = getLessonStatus(lesson.id, userProgress, activeLessonId ?? nextId);
                        const isCurrent = activeLessonId === lesson.id || nextId === lesson.id;
                        const clickable = status !== "locked";

                        const node = (
                          <button
                            type="button"
                            disabled={!clickable}
                            onClick={() => clickable && launchLesson(lesson.id)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-start transition-colors",
                              status === "locked" && "cursor-not-allowed opacity-50",
                              status === "completed" && "border-emerald-600/30 bg-emerald-600/5 hover:bg-emerald-600/10",
                              status === "active" &&
                                isCurrent &&
                                "border-primary bg-primary/5 ring-primary/30 ring-2",
                              status === "active" && !isCurrent && "hover:bg-muted/60",
                            )}
                          >
                            <StatusIcon status={status} />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium">{lesson.title}</span>
                              <span className="text-muted-foreground block text-xs">{lesson.description}</span>
                              <span className="text-muted-foreground mt-1 block text-[10px] tracking-wide uppercase">
                                Opens · {lesson.target}
                              </span>
                            </span>
                            {clickable ? <Play className="text-muted-foreground mt-0.5 size-4 shrink-0" /> : null}
                          </button>
                        );

                        return (
                          <li key={lesson.id}>
                            {status === "locked" ? (
                              <Tooltip>
                                <TooltipTrigger asChild>{node}</TooltipTrigger>
                                <TooltipContent>Complete earlier lessons to unlock</TooltipContent>
                              </Tooltip>
                            ) : (
                              node
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>

        {activeLessonId ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed p-3">
            <p className="text-sm">
              Active lesson: <span className="font-medium">{activeLessonId}</span>
            </p>
            <Button size="sm" onClick={() => completeLesson(activeLessonId)}>
              Mark complete
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: LessonStatus }) {
  if (status === "completed") {
    return (
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-300">
        <Check className="size-3.5" />
      </span>
    );
  }
  if (status === "locked") {
    return (
      <span className="bg-muted text-muted-foreground mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
        <Lock className="size-3.5" />
      </span>
    );
  }
  return (
    <span className="bg-primary/15 text-primary mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
      <Circle className="size-3.5 fill-current" />
    </span>
  );
}
