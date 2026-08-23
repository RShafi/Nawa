"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Map } from "lucide-react";
import { lessonHref, type PathLessonRef } from "@/data/learningPath";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNawaStore } from "@/store/nawa-store";

type LessonAdvanceCardProps = {
  lessonId: string;
  pathNodeId?: string;
  nextOnPath?: PathLessonRef;
  /** When true, render as sticky bottom footer */
  sticky?: boolean;
};

export function LessonAdvanceCard({
  lessonId,
  pathNodeId,
  nextOnPath,
  sticky = false,
}: LessonAdvanceCardProps) {
  const completed = useNawaStore((s) => s.userProgress.completedLessonIds);
  const isDone = completed.includes(lessonId);

  if (!isDone) {
    if (!sticky) return null;
    return (
      <footer
        className={cn(
          "glass-panel-strong shrink-0 border-t border-white/10 px-4 py-3 backdrop-blur-xl",
          "supports-[backdrop-filter]:bg-[#0a0c12]/80",
        )}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-white/55">Finish the activities above to continue.</p>
          <Button asChild variant="outline" size="sm" className="border-white/15 bg-white/5">
            <Link href="/path">
              <Map className="size-4" />
              Return to Path
            </Link>
          </Button>
        </div>
      </footer>
    );
  }

  const body = (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        sticky
          ? "mx-auto max-w-5xl"
          : "rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-4",
      )}
    >
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" />
        <div>
          <p className="font-semibold text-white">Lesson complete</p>
          <p className="text-sm text-white/55">
            {nextOnPath
              ? `Up next: ${nextOnPath.title}`
              : pathNodeId
                ? "This stop is ready — return to the Path to claim your progress."
                : "Return to the Learning Path when you’re ready."}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="border-white/15 bg-white/5">
          <Link href="/path">
            <Map className="size-4" />
            Return to Path
          </Link>
        </Button>
        {nextOnPath && pathNodeId ? (
          <Button asChild size="sm" className="gap-1 bg-emerald-500 font-semibold text-black hover:bg-emerald-400">
            <Link href={lessonHref(nextOnPath.id, pathNodeId)}>
              Next lesson
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );

  if (sticky) {
    return (
      <footer className="glass-panel-strong shrink-0 border-t border-emerald-400/20 px-4 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0c12]/85">
        {body}
      </footer>
    );
  }

  return body;
}
