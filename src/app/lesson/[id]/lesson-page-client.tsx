"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { findCurriculumLesson } from "@/data/curriculumData";
import { completeLessonAction } from "@/app/actions/progress";
import { LessonAdvanceCard } from "@/components/lessons/LessonAdvanceCard";
import { LessonBody } from "@/components/lessons/LessonBody";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGamificationStore } from "@/store/useGamificationStore";
import { useNawaStore } from "@/store/nawa-store";

type LessonPageClientProps = {
  id: string;
};

export function LessonPageClient({ id }: LessonPageClientProps) {
  const hydrateLessonTools = useNawaStore((s) => s.hydrateLessonTools);
  const setActiveLessonId = useNawaStore((s) => s.setActiveLessonId);
  const completeLesson = useNawaStore((s) => s.completeLesson);
  const completed = useNawaStore((s) => s.userProgress.completedLessonIds);

  const found = findCurriculumLesson(id);

  useEffect(() => {
    setActiveLessonId(id);
    hydrateLessonTools(id);
  }, [id, setActiveLessonId, hydrateLessonTools]);

  const onActivitiesComplete = useCallback(() => {
    completeLesson(id);
    void completeLessonAction(id).then((result) => {
      if (result.ok && typeof result.currency === "number") {
        useGamificationStore.getState().setHibrCurrency(result.currency);
      }
    });
  }, [completeLesson, id]);

  if (!found) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <p className="text-lg font-medium">Lesson not found</p>
        <Button asChild variant="outline">
          <Link href="/">Back to map</Link>
        </Button>
      </main>
    );
  }

  const { lesson, unit, stage } = found;
  const isDone = completed.includes(lesson.id) || lesson.isCompleted;

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ms-2 gap-1">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to map
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{stage.title}</Badge>
          <Badge variant="secondary">{unit.title}</Badge>
          <Badge>{lesson.type}</Badge>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{lesson.title}</CardTitle>
          <CardDescription className="mt-1 text-lg leading-relaxed">
            {lesson.description}
          </CardDescription>
          {!isDone ? (
            <p className="text-muted-foreground pt-1 text-sm sm:text-base">
              Finish the activities below — the lesson completes automatically.
            </p>
          ) : null}
        </CardHeader>
      </Card>

      <LessonBody key={lesson.id} lesson={lesson} onActivitiesComplete={onActivitiesComplete} />

      <LessonAdvanceCard lessonId={lesson.id} />
    </main>
  );
}
