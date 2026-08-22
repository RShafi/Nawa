"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { findCurriculumLesson, getNextCurriculumLessonId } from "@/data/curriculumData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNawaStore } from "@/store/nawa-store";

export function LessonAdvanceCard({ lessonId }: { lessonId: string }) {
  const completed = useNawaStore((s) => s.userProgress.completedLessonIds);
  const isDone = completed.includes(lessonId);
  const nextId = getNextCurriculumLessonId(
    isDone ? completed : [...completed, lessonId],
  );
  const nextTitle = nextId ? findCurriculumLesson(nextId)?.lesson.title : undefined;

  if (!isDone) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="text-primary mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">Lesson complete</p>
            <p className="text-muted-foreground text-sm">
              {nextId
                ? `Up next: ${nextTitle ?? "the following lesson"}.`
                : "You’ve finished the path — great work."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/">Back to map</Link>
          </Button>
          {nextId ? (
            <Button asChild size="sm" className="gap-1">
              <Link href={`/lesson/${nextId}`}>
                Next lesson
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
