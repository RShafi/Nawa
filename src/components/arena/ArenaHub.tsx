"use client";

import Link from "next/link";
import { Flame, Swords, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  curriculumData,
  isLoomLessonComplete,
} from "@/content/curriculumData";
import { forgeTrialHref, forgeTrials, trialMilestoneId } from "@/content/forgeTrials";
import { useLessonStore } from "@/store/useLessonStore";
import { cn } from "@/lib/utils";

export function ArenaHub() {
  const masteredVocabIds = useLessonStore((s) => s.masteredVocabIds);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 bg-[radial-gradient(ellipse_at_top,_#1a1520_0%,_#0B0F19_45%,_#000_100%)] px-6 py-10">
      <div className="max-w-lg text-center">
        <p className="text-[10px] tracking-[0.22em] text-amber-400/70 uppercase">Arena</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-amber-50">Choose your battle</h1>
        <p className="mt-2 text-sm text-slate-400">
          The Forge is the new root × pattern wave mode. The Crucible is the classic syntax combat.
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        <Link
          href="/arena?mode=crucible"
          className="group rounded-2xl border border-rose-500/30 bg-slate-950/80 p-5 transition hover:border-rose-400/50 hover:bg-slate-900/90"
        >
          <Swords className="size-7 text-rose-300" />
          <p className="font-display mt-3 text-lg text-rose-50">The Crucible</p>
          <p className="mt-1 text-sm text-slate-400">
            Classic Djinn combat — build sentences from your forged deck.
          </p>
        </Link>

        <div className="rounded-2xl border border-amber-500/30 bg-slate-950/80 p-5">
          <Flame className="size-7 text-amber-300" />
          <p className="font-display mt-3 text-lg text-amber-50">The Forge</p>
          <p className="mt-1 text-sm text-slate-400">
            Drop roots into pattern molds to destroy descending targets.
          </p>
          <ul className="mt-4 space-y-2">
            {forgeTrials.map((trial) => {
              const unlockLesson = curriculumData.find(
                (l) => l.id === trial.unlockAfterLessonId,
              );
              const unlocked = unlockLesson
                ? isLoomLessonComplete(unlockLesson, masteredVocabIds)
                : false;
              const done = masteredVocabIds.includes(trialMilestoneId(trial.id));

              return (
                <li key={trial.id}>
                  {unlocked ? (
                    <Link
                      href={forgeTrialHref(trial.id)}
                      className={cn(
                        "block rounded-xl border px-3 py-2 transition",
                        done
                          ? "border-amber-400/40 bg-amber-500/10 text-amber-100"
                          : "border-amber-500/25 bg-black/40 text-amber-50 hover:border-amber-400/50",
                      )}
                    >
                      <p className="text-sm font-semibold">{trial.title}</p>
                      <p className="text-[11px] text-slate-500">{trial.subtitle}</p>
                    </Link>
                  ) : (
                    <div className="rounded-xl border border-slate-800 bg-black/30 px-3 py-2 opacity-60">
                      <p className="text-sm font-semibold text-slate-400">{trial.title}</p>
                      <p className="text-[11px] text-slate-600">
                        Locked — finish {unlockLesson?.title ?? "prior lesson"} first
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <Button asChild variant="ghost" className="gap-2 text-slate-400">
        <Link href="/learning-path">
          <Map className="size-4" />
          Back to Star Map
        </Link>
      </Button>
    </div>
  );
}
