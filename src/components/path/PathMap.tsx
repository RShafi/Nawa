"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, ChevronRight, Lock, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CURRICULUM,
  firstIncompleteLesson,
  isLessonComplete,
  isModuleUnlocked,
  lessonPathHref,
  type CurriculumUnit,
} from "@/data/curriculum";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const ACCENT: Record<
  CurriculumUnit["accent"],
  { bar: string; soft: string; badge: string; line: string }
> = {
  sky: {
    bar: "from-astral-cyan/80 to-astral-cyan/30",
    soft: "border-cyan-400/25 bg-cyan-500/10",
    badge: "bg-cyan-400 text-slate-950",
    line: "bg-gradient-to-b from-cyan-400/50 to-cyan-400/5",
  },
  emerald: {
    bar: "from-muted-emerald/80 to-muted-emerald/30",
    soft: "border-emerald-400/25 bg-emerald-500/10",
    badge: "bg-emerald-400 text-emerald-950",
    line: "bg-gradient-to-b from-emerald-400/50 to-emerald-400/5",
  },
  amber: {
    bar: "from-celestial-amber/80 to-celestial-gold/30",
    soft: "border-amber-400/25 bg-amber-500/10",
    badge: "bg-amber-400 text-amber-950",
    line: "bg-gradient-to-b from-amber-400/50 to-amber-400/5",
  },
  violet: {
    bar: "from-violet-500/80 to-violet-400/30",
    soft: "border-violet-400/25 bg-violet-500/10",
    badge: "bg-violet-400 text-violet-950",
    line: "bg-gradient-to-b from-violet-400/50 to-violet-400/5",
  },
};

type PathMapProps = {
  initialCompletedIds?: string[];
};

export function PathMap({ initialCompletedIds = [] }: PathMapProps) {
  const storeCompleted = useAppStore((s) => s.completedLessonIds);
  const hydrate = useAppStore((s) => s.hydrate);
  const status = useAppStore((s) => s.status);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playTap } = useSoundEffects();

  useEffect(() => {
    if (status === "idle") void hydrate();
  }, [status, hydrate]);

  const completedIds = useMemo(() => {
    return [...new Set([...initialCompletedIds, ...storeCompleted])];
  }, [initialCompletedIds, storeCompleted]);

  const continueLesson = firstIncompleteLesson(completedIds);
  const totalLessons = CURRICULUM.units.reduce(
    (n, u) => n + u.modules.reduce((m, mod) => m + mod.lessons.length, 0),
    0,
  );
  const doneCount = CURRICULUM.units.reduce(
    (n, u) =>
      n +
      u.modules.reduce(
        (m, mod) => m + mod.lessons.filter((l) => isLessonComplete(l.id, completedIds)).length,
        0,
      ),
    0,
  );

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden lg:h-full">
      <div className="shrink-0 border-b border-amber-500/10 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="text-celestial-amber size-5" />
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Constellation Path
            </h1>
          </div>
          <p className="mt-1 text-sm text-white/55">
            A vertical celestial journey — letters, meanings, and sentences under desert twilight.
          </p>
          <p className="text-celestial-amber/70 mt-2 font-mono text-[11px]">
            {doneCount}/{totalLessons} stars lit
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-2xl space-y-10 px-4 py-6 pb-28 sm:px-6">
          {CURRICULUM.units.map((unit, ui) => {
            const accent = ACCENT[unit.accent];
            return (
              <section key={unit.id} className="scroll-mt-4">
                <div
                  className={cn(
                    "sticky top-0 z-20 mb-5 rounded-2xl border px-4 py-3 backdrop-blur-xl",
                    "supports-[backdrop-filter]:bg-obsidian/90",
                    accent.soft,
                  )}
                >
                  <div className={cn("mb-2 h-1 w-16 rounded-full bg-gradient-to-r", accent.bar)} />
                  <h2 className="text-lg font-semibold text-white sm:text-xl">{unit.title}</h2>
                  <p className="mt-0.5 text-sm text-white/55">{unit.summary}</p>
                </div>

                <div className="space-y-6">
                  {unit.modules.map((mod, mi) => {
                    const unlocked = isModuleUnlocked(ui, mi, completedIds);
                    return (
                      <div key={mod.id} className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <BookOpen className="size-3.5 text-white/35" />
                          <h3 className="text-sm font-medium text-white/80">{mod.title}</h3>
                          <span className="text-[11px] text-white/35">— {mod.summary}</span>
                        </div>

                        <ul className="relative space-y-3 ps-2">
                          <div
                            className={cn(
                              "absolute top-3 bottom-3 start-[1.35rem] w-px",
                              accent.line,
                            )}
                            aria-hidden
                          />
                          {mod.lessons.map((lesson) => {
                            const done = isLessonComplete(lesson.id, completedIds);
                            const locked = !unlocked;
                            const isContinue = continueLesson?.id === lesson.id;

                            return (
                              <li key={lesson.id} className="relative flex items-stretch gap-3">
                                <span
                                  className={cn(
                                    "constellation-node z-10 mt-2",
                                    done && "constellation-node-done",
                                    isContinue && !done && "constellation-node-active",
                                    locked && "opacity-40",
                                  )}
                                >
                                  {locked ? (
                                    <Lock className="size-3.5 text-white/40" />
                                  ) : done ? (
                                    <Check className="size-3.5 text-emerald-200" />
                                  ) : (
                                    <Play className="size-3 fill-current text-amber-200" />
                                  )}
                                </span>

                                {locked ? (
                                  <div className="glass-tablet flex flex-1 items-center gap-3 px-4 py-3 opacity-45">
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-white/70">{lesson.title}</p>
                                      <p className="truncate text-xs text-white/35">{lesson.summary}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <motion.div
                                    whileTap={{ scale: 0.96 }}
                                    className="flex-1"
                                  >
                                    <Link
                                      href={lessonPathHref(lesson.id)}
                                      onClick={() => playTap()}
                                      className={cn(
                                        "glass-tablet group flex items-center gap-3 px-4 py-3 transition hover:bg-slate-800/70",
                                        isContinue &&
                                          "ring-celestial-amber/40 border-amber-400/40 ring-1",
                                        done && "border-emerald-400/25",
                                      )}
                                    >
                                      <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-white">{lesson.title}</p>
                                        <p className="truncate text-xs text-white/45">
                                          {lesson.summary}
                                        </p>
                                      </div>
                                      <ChevronRight className="size-4 shrink-0 text-white/30 transition group-hover:text-amber-300/80" />
                                    </Link>
                                  </motion.div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <footer className="glass-panel-strong shrink-0 border-t border-amber-500/15 px-4 py-3">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3">
          <AnimatePresence mode="wait">
            {continueLesson ? (
              <motion.p
                key={continueLesson.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-white/55"
              >
                Next star:{" "}
                <span className="text-celestial-amber font-medium">{continueLesson.title}</span>
              </motion.p>
            ) : (
              <p className="text-sm text-emerald-200/80">Constellation complete — revisit anytime.</p>
            )}
          </AnimatePresence>
          {continueLesson ? (
            <Button
              asChild
              size="lg"
              className="bg-celestial-amber font-semibold text-obsidian hover:bg-amber-400"
              onClick={() => playTap()}
            >
              <Link href={lessonPathHref(continueLesson.id)}>
                <Play className="size-4 fill-current" />
                Continue
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="border-amber-500/25">
              <Link href="/arena">Visit Arena</Link>
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
