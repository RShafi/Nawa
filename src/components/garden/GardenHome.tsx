"use client";

import { useEffect } from "react";
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
} from "@/data/garden";
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
  const hydrate = useAppStore((s) => s.hydrate);

  useEffect(() => {
    if (status === "idle") void hydrate();
  }, [status, hydrate]);

  const nextId = nextLessonId(completed, deck);
  const nextLesson = nextId ? getLesson(nextId) : null;
  const visible = PLANTS.filter((plant) => plantIsVisible(plant, completed, deck));

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      <header className="space-y-2">
        <p className="text-xs tracking-wide text-emerald-200/80 uppercase">Bustan</p>
        <h1 className="text-3xl font-semibold text-white">The garden</h1>
        <p className="max-w-xl text-sm text-white/65">
          Each root is a plant. A visit adds one frame to a family you already started.
        </p>
      </header>

      {status === "error" ? (
        <p className="text-sm text-rose-200">Could not load your garden. Refresh and try again.</p>
      ) : null}

      {nextLesson ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-100/80">Next visit</p>
          <p className="mt-1 text-lg text-white">{nextLesson.title}</p>
          <Button asChild className="mt-3">
            <Link href={`/lesson/${nextLesson.id}`}>
              {nextLesson.kind === "frame" ? "Grow this frame" : "Start this step"}
            </Link>
          </Button>
        </div>
      ) : status === "ready" ? (
        <p className="text-sm text-white/70">Every frame you own is grown. Review them, or cast a sentence.</p>
      ) : (
        <p className="text-sm text-white/50">Loading your plants…</p>
      )}

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
                  <p className="text-xs text-white/40">Not planted yet</p>
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
                        <span className="text-white">
                          <ArabicText size="sm" mode={mode} className="text-amber-50">
                            {displayArabic(card.word, plant.rootId, fsrs, trees)}
                          </ArabicText>
                          <span className="ms-2 text-white/50">{frame.title}</span>
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
                <p className="mt-3 text-xs text-white/45">Two frames, then you can hear this root in a dialect.</p>
              ) : null}
              {ready ? (
                <p className="mt-3 text-xs text-white/60">
                  This root can be heard in Damascus or Cairo.{" "}
                  <Link href="/passports" className="text-emerald-200 underline">
                    Open a register
                  </Link>
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </main>
  );
}
