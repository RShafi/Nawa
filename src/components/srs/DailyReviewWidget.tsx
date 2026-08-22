"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brain, Loader2 } from "lucide-react";
import { getDueCount } from "@/app/actions/srs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_SRS_USER_ID } from "@/lib/srs-constants";

export function DailyReviewWidget({ userId = DEMO_SRS_USER_ID }: { userId?: string }) {
  const [due, setDue] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getDueCount(userId).then((n) => {
      if (!cancelled) setDue(n);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const loading = due === null;

  return (
    <Card className="border-primary/25 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Brain className="text-primary size-5" />
          <CardTitle className="text-lg sm:text-xl">Daily review</CardTitle>
        </div>
        <CardDescription className="text-base leading-relaxed">
          Spaced repetition (FSRS) keeps roots, words, and patterns fresh — a few minutes a day
          compounds.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-base">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Checking due cards…
            </span>
          ) : due === 0 ? (
            "You’re caught up — nothing due right now."
          ) : (
            <>
              <span className="text-foreground font-semibold">{due}</span> card
              {due === 1 ? "" : "s"} ready for review
            </>
          )}
        </p>
        <Button asChild size="lg" disabled={loading || due === 0} className="shrink-0">
          <Link href="/review">
            {loading
              ? "Loading…"
              : due === 0
                ? "All clear"
                : `Start Daily Review (${due} due)`}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
