"use client";

import Link from "next/link";
import { AppStoreHydrator } from "@/components/progress/AppStoreHydrator";
import { ArabicText } from "@/components/common/ArabicText";
import { Button } from "@/components/ui/button";
import {
  PLANTS,
  cardForFrame,
  displayArabic,
  getLesson,
  grownFrames,
  nextLessonId,
  plantIsVisible,
  plantReadingLevel,
  readingLabel,
  readingModeFromLevel,
  registerReady,
  type LessonDef,
} from "@/data/garden";
import { StartOver } from "@/components/garden/StartOver";
import { useAppStore } from "@/store/useAppStore";

export function GardenHome() {
  return (
    <AppStoreHydrator>
      <GardenInner />
    </AppStoreHydrator>
  );
}

function GardenInner() {
  const status = useAppStore((s) => s.status);
  const completed = useAppStore((s) => s.completedLessonIds);
  const deck = useAppStore((s) => s.unlockedDeck);
  const fsrs = useAppStore((s) => s.fsrsItems);
  const trees = useAppStore((s) => s.trees);

  const nextId = nextLessonId(completed, deck);
  const nextLesson = nextId ? getLesson(nextId) : null;
  const visible = PLANTS.filter((plant) => plantIsVisible(plant, completed, deck));
  const firstVisit = completed.length === 0 && deck.length === 0;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      {status === "error" ? (
        <p className="text-sm text-rose-200">Could not load your words. Refresh and try again.</p>
      ) : status !== "ready" ? (
        <p className="text-sm text-white/50">Loading your words…</p>
      ) : firstVisit ? (
        <header className="space-y-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
          <h1 className="text-3xl font-semibold text-white">This is your garden.</h1>
          <p className="max-w-xl text-sm text-white/80">
            Words you learn stay here. You start with one letter.
          </p>
          <p className="max-w-xl text-sm text-white/80">
            Today you only learn the letter b. Then how it joins, a short a, and one word: he wrote.
          </p>
          <p className="max-w-xl text-sm text-white/70">When you see a speaker, it plays the sound.</p>
          <Button asChild className="mt-1">
            <Link href="/lesson/hour-letter">Hear the letter b</Link>
          </Button>
        </header>
      ) : (
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">Your words</h1>
          <p className="max-w-xl text-sm text-white/65">
            One step is waiting. Gray names are words you have not learned yet.
          </p>
        </header>
      )}

      {status === "ready" && !firstVisit && nextLesson ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-100/80">Next</p>
          <p className="mt-1 text-lg text-white">{nextLesson.title}</p>
          <p className="mt-1 text-sm text-white/70">{nextLesson.teach}</p>
          <Button asChild className="mt-3">
            <Link href={`/lesson/${nextLesson.id}`}>{nextAction(nextLesson)}</Link>
          </Button>
        </div>
      ) : status === "ready" && !firstVisit ? (
        <p className="text-sm text-white/70">You have learned every word here. Review them, or make a sentence.</p>
      ) : null}

      {status === "ready" ? (
      <div className="grid gap-4">
        {visible.map((plant) => {
          const grown = grownFrames(plant, completed, deck);
          const level = plantReadingLevel(plant.rootId, fsrs, trees);
          const mode = readingModeFromLevel(level);
          const nextFrame = plant.frames.find((frame) => !grown.some((g) => g.lessonId === frame.lessonId));
          const ready = registerReady(plant, completed, deck);
          return (
            <article key={plant.rootId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <ArabicText size="lg" forceFull className="text-emerald-50">
                    {plant.letters}
                  </ArabicText>
                  <p className="text-sm text-white/60">{plant.gloss}</p>
                </div>
                {grown.length > 0 ? (
                  <p className="text-xs text-white/50">{readingLabel(mode)}</p>
                ) : (
                  <p className="text-xs text-white/40">Still to come</p>
                )}
              </div>
              <ul className="mt-4 space-y-2">
                {plant.frames.map((frame) => {
                  const isGrown = grown.some((g) => g.lessonId === frame.lessonId);
                  const isNext = nextFrame?.lessonId === frame.lessonId && nextId === frame.lessonId;
                  const card = cardForFrame(frame);
                  return (
                    <li key={frame.lessonId} className="flex items-center gap-3 text-sm">
                      <span
                        className={
                          isGrown
                            ? "size-2.5 rounded-full bg-emerald-400"
                            : isNext
                              ? "size-2.5 rounded-full border border-emerald-300"
                              : "size-2.5 rounded-full bg-white/15"
                        }
                      />
                      {isGrown && card ? (
                        <span className="inline-flex items-baseline gap-2 text-white">
                          <ArabicText size="sm" mode={mode} className="text-amber-50">
                            {displayArabic(card.word, plant.rootId, fsrs, trees)}
                          </ArabicText>
                          <span dir="ltr" className="text-white/50 [unicode-bidi:isolate]">
                            {frame.title}
                          </span>
                        </span>
                      ) : isNext ? (
                        <Link href={`/lesson/${frame.lessonId}`} className="text-emerald-100">
                          Next: {frame.title}
                        </Link>
                      ) : (
                        <span className="text-white/35">{frame.title}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {grown.length > 0 && !ready ? (
                <p className="mt-3 text-xs text-white/45">
                  Learn two words from these letters, then you can hear them in Damascus or Cairo.
                </p>
              ) : null}
              {ready ? (
                <p className="mt-3 text-xs text-white/60">
                  You can hear these words in Damascus or Cairo.{" "}
                  <Link href="/passports" className="text-emerald-200 underline">
                    Hear them
                  </Link>
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
      ) : null}

      {status === "ready" && !firstVisit ? (
        <p className="text-sm text-white/45">
          <StartOver />
        </p>
      ) : null}
    </main>
  );
}

function nextAction(lesson: LessonDef): string {
  if (lesson.kind === "sentence") return "Make this sentence";
  if (lesson.kind === "frame") return "Learn this word";
  if (lesson.kind === "letter") return "Hear the letter b";
  if (lesson.kind === "shapes") return "See how b joins";
  if (lesson.kind === "vowel") return "Add a short a";
  return "Continue";
}
