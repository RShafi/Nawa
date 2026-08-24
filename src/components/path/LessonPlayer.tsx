"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Map } from "lucide-react";
import { completeLessonAction } from "@/app/actions/progress";
import { SlideRenderer } from "@/components/path/slides/SlideRenderer";
import { InstructionText } from "@/components/ui/InlineArabic";
import { Button } from "@/components/ui/button";
import {
  findCurriculumLesson,
  getNextLessonId,
  lessonPathHref,
  type CurriculumLesson,
} from "@/data/curriculum";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

export function LessonPlayer({ lesson }: { lesson: CurriculumLesson }) {
  const router = useRouter();
  const markComplete = useAppStore((s) => s.markLessonCompleteOptimistic);
  const unlockDeck = useAppStore((s) => s.unlockDeckOptimistic);
  const setHibr = useAppStore((s) => s.setHibrBalance);
  const { playSuccess, playTap } = useSoundEffects();

  const meta = findCurriculumLesson(lesson.id);
  const [index, setIndex] = useState(0);
  const [slideDone, setSlideDone] = useState(false);
  const [finished, setFinished] = useState(false);
  const [pending, startTransition] = useTransition();

  const slide = lesson.slides[index];
  const isLast = index >= lesson.slides.length - 1;
  const nextId = getNextLessonId(lesson.id);

  const onSlideComplete = useCallback(() => {
    playSuccess();
    setSlideDone(true);
  }, [playSuccess]);

  function continueLesson() {
    if (!slideDone) return;
    playTap();
    if (!isLast) {
      setIndex((i) => i + 1);
      setSlideDone(false);
      return;
    }
    setFinished(true);
    void confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#F59E0B", "#38BDF8", "#10B981"],
    });
    markComplete(lesson.id);
    if (lesson.deckWordIds?.length) {
      unlockDeck(lesson.deckWordIds);
    }
    startTransition(async () => {
      const res = await completeLessonAction(lesson.id);
      if (res.ok && typeof res.currency === "number") setHibr(res.currency);
    });
  }

  if (finished) {
    return (
      <div className="bg-obsidian flex h-[100dvh] flex-col overflow-hidden lg:h-full lg:items-center lg:justify-center lg:p-6">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 text-center lg:flex-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-tablet glow-amber border-emerald-400/25 px-8 py-10"
          >
            <CheckCircle2 className="mx-auto size-10 text-emerald-400" />
            <h1 className="mt-3 text-2xl font-semibold text-white">Lesson complete</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              You practiced: {lesson.summary}
            </p>
            {lesson.deckWordIds?.length ? (
              <p className="mt-4 text-sm text-emerald-200/80">
                New words have been added to your Arena deck.
              </p>
            ) : (
              <p className="mt-4 text-sm text-white/45">Keep going — each lesson builds the next.</p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button asChild variant="outline" className="border-amber-500/20">
                <Link href="/path">
                  <Map className="size-4" />
                  Back to Path
                </Link>
              </Button>
              {nextId ? (
                <Button
                  className="bg-celestial-amber font-semibold text-obsidian hover:bg-amber-400"
                  onClick={() => {
                    playTap();
                    router.push(lessonPathHref(nextId));
                  }}
                >
                  Next lesson
                  <ArrowRight className="size-4" />
                </Button>
              ) : null}
            </div>
            {pending ? <p className="mt-2 text-xs text-white/35">Saving…</p> : null}
          </motion.div>
        </div>
      </div>
    );
  }

  if (!slide) return null;

  return (
    <div className="bg-obsidian flex h-[100dvh] flex-col overflow-hidden lg:h-full lg:items-center lg:justify-center lg:p-4">
      <div
        className={cn(
          "relative flex min-h-0 w-full flex-1 flex-col overflow-hidden",
          "lg:h-[85vh] lg:max-w-2xl lg:flex-none lg:rounded-3xl lg:border lg:border-amber-500/20 lg:bg-slate-900/50 lg:shadow-[0_0_60px_-20px_rgba(245,158,11,0.35)] lg:backdrop-blur-md",
        )}
      >
        <header className="shrink-0 border-b border-amber-500/10 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Button asChild variant="ghost" size="sm" className="-ms-2 text-white/60">
              <Link href="/path">
                <ArrowLeft className="size-4" />
                Path
              </Link>
            </Button>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-sm font-semibold text-white">{lesson.title}</p>
              <p className="truncate text-[11px] text-white/40">
                {meta?.unit.title} · {meta?.module.title}
              </p>
            </div>
            <span className="font-mono text-[11px] text-white/40">
              {index + 1}/{lesson.slides.length}
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="bg-celestial-amber h-full rounded-full transition-all"
              style={{ width: `${((index + (slideDone ? 1 : 0)) / lesson.slides.length) * 100}%` }}
            />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-28 lg:pb-5">
          <p className="mb-5 text-center text-base leading-relaxed text-white/75 sm:text-lg">
            <InstructionText text={slide.instruction} />
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <SlideRenderer slide={slide} onComplete={onSlideComplete} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile: sticky footer · Desktop: flows under the lesson card */}
        <footer
          className={cn(
            "glass-panel-strong border-t border-amber-500/15 px-4 py-3",
            "fixed inset-x-0 bottom-0 z-30 lg:static lg:inset-auto",
          )}
        >
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <p className="text-sm text-white/45">
              {slideDone ? "Nice — continue when ready." : "Finish the step above to continue."}
            </p>
            <Button
              size="lg"
              disabled={!slideDone}
              className="bg-celestial-amber gap-1 font-semibold text-obsidian hover:bg-amber-400 disabled:opacity-40"
              onClick={continueLesson}
            >
              {isLast ? "Finish lesson" : "Continue"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
