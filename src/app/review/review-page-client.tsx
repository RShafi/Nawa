"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { getDueCards } from "@/app/actions/srs";
import { Flashcard } from "@/components/srs/Flashcard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DEMO_SRS_USER_ID } from "@/lib/srs-constants";
import { useReviewStore } from "@/store/useReviewStore";

export function ReviewPageClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeQueue = useReviewStore((s) => s.initializeQueue);
  const resetSession = useReviewStore((s) => s.resetSession);
  const queue = useReviewStore((s) => s.queue);
  const stats = useReviewStore((s) => s.sessionStats);

  const totalTouched = stats.reviewed;
  const remaining = queue.length;
  const progressMax = Math.max(totalTouched + remaining, 1);
  const progressValue = (totalTouched / progressMax) * 100;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getDueCards(DEMO_SRS_USER_ID)
      .then((items) => {
        if (cancelled) return;
        initializeQueue(items, DEMO_SRS_USER_ID);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load due cards");
        setLoading(false);
      });

    return () => {
      cancelled = true;
      resetSession();
    };
  }, [initializeQueue, resetSession]);

  const done = !loading && !error && remaining === 0;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ms-2 gap-1">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </Button>
        {!done && !loading ? (
          <p className="text-muted-foreground text-sm sm:text-base">
            {totalTouched} reviewed · {remaining} left
          </p>
        ) : null}
      </div>

      {!done && !loading && !error ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm sm:text-base">
            <span className="font-medium">Session progress</span>
            <span className="text-muted-foreground">
              {totalTouched} / {totalTouched + remaining}
            </span>
          </div>
          <Progress value={progressValue} />
        </div>
      ) : null}

      {loading ? (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-24 text-base">
          <Loader2 className="size-5 animate-spin" />
          Loading today’s queue…
        </div>
      ) : null}

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Couldn’t start review</CardTitle>
            <CardDescription className="text-base">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/">Return home</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!loading && !error && remaining > 0 ? <Flashcard /> : null}

      {done ? (
        <Card className="border-emerald-600/30 bg-emerald-600/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-600/15">
              <CheckCircle2 className="size-7 text-emerald-700 dark:text-emerald-300" />
            </div>
            <CardTitle className="text-2xl">Review complete</CardTitle>
            <CardDescription className="text-base">
              Nice work — FSRS updated each card’s next interval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="mx-auto grid max-w-lg grid-cols-2 gap-3 text-center sm:grid-cols-5">
              <Stat label="Reviewed" value={stats.reviewed} />
              <Stat label="Again" value={stats.again} />
              <Stat label="Hard" value={stats.hard} />
              <Stat label="Good" value={stats.good} />
              <Stat label="Easy" value={stats.easy} />
            </ul>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Button asChild variant="outline">
                <Link href="/">Back to map</Link>
              </Button>
              <Button asChild>
                <Link href="/review">Review again</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <li className="rounded-lg border bg-background/60 px-3 py-2">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </li>
  );
}
