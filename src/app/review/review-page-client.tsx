"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { awardReviewSessionHibrAction } from "@/app/actions/economy";
import { getDueCards } from "@/app/actions/srs";
import { Flashcard } from "@/components/srs/Flashcard";
import { AppStoreHydrator } from "@/components/progress/AppStoreHydrator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/store/useAppStore";
import { useReviewStore } from "@/store/useReviewStore";

export function ReviewPageClient() {
  return (
    <AppStoreHydrator>
      <ReviewInner />
    </AppStoreHydrator>
  );
}

function ReviewInner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hibrMsg, setHibrMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const initializeQueue = useReviewStore((s) => s.initializeQueue);
  const resetSession = useReviewStore((s) => s.resetSession);
  const queue = useReviewStore((s) => s.queue);
  const stats = useReviewStore((s) => s.sessionStats);
  const hydrate = useAppStore((s) => s.hydrate);
  const addHibrOptimistic = useAppStore((s) => s.addHibrOptimistic);
  const setHibrBalance = useAppStore((s) => s.setHibrBalance);

  const totalTouched = stats.reviewed;
  const remaining = queue.length;
  const progressMax = Math.max(totalTouched + remaining, 1);
  const progressValue = (totalTouched / progressMax) * 100;
  const done = !loading && !error && remaining === 0;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getDueCards()
      .then((items) => {
        if (cancelled) return;
        initializeQueue(items);
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

  useEffect(() => {
    if (!done || totalTouched === 0 || hibrMsg) return;
    startTransition(async () => {
      const res = await awardReviewSessionHibrAction(totalTouched);
      if (res.ok && res.awarded) {
        addHibrOptimistic(res.awarded);
        if (typeof res.hibrBalance === "number") setHibrBalance(res.hibrBalance);
        setHibrMsg(`+${res.awarded} Hibr earned for reviewing.`);
        void hydrate();
      } else if (res.ok) {
        setHibrMsg("Session complete.");
      }
    });
  }, [done, totalTouched, hibrMsg, addHibrOptimistic, setHibrBalance, hydrate]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ms-2 gap-1">
          <Link href="/path">
            <ArrowLeft className="size-4" />
            Back to Path
          </Link>
        </Button>
        {!done && !loading ? (
          <p className="text-muted-foreground text-sm">
            {totalTouched} reviewed · {remaining} left · Earn up to 50 Hibr
          </p>
        ) : null}
      </div>

      <header className="space-y-1">
        <p className="text-[11px] tracking-[0.2em] text-emerald-300/70 uppercase">
          Pillar 4 · Daily Review
        </p>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Maintain combat power</h1>
        <p className="text-sm text-white/55">
          Strong reviews raise mastery (harder tooltips, better fights). Neglecting cards applies
          Rust in the Arena.
        </p>
      </header>

      {!done && !loading && !error ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
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
              <Link href="/path">Return to Path</Link>
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
              {totalTouched === 0
                ? "Nothing due — check back tomorrow, or learn more on the Path."
                : "FSRS updated. Mastery also sharpens Arena tooltips."}
            </CardDescription>
            {hibrMsg ? (
              <p className="mt-2 inline-flex items-center justify-center gap-1 text-amber-200">
                <Sparkles className="size-4" />
                {pending ? "Awarding Hibr…" : hibrMsg}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {totalTouched > 0 ? (
              <ul className="mx-auto grid max-w-lg grid-cols-2 gap-3 text-center sm:grid-cols-5">
                <Stat label="Reviewed" value={stats.reviewed} />
                <Stat label="Again" value={stats.again} />
                <Stat label="Hard" value={stats.hard} />
                <Stat label="Good" value={stats.good} />
                <Stat label="Easy" value={stats.easy} />
              </ul>
            ) : null}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Button asChild variant="outline">
                <Link href="/path">Learning Path</Link>
              </Button>
              <Button asChild>
                <Link href="/arena">Enter Arena</Link>
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
      <p className="text-muted-foreground text-xs tracking-wide uppercase">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </li>
  );
}
