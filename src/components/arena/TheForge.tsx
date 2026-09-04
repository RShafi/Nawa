"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, animate } from "framer-motion";
import { ArrowLeft, Flame, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakArabic } from "@/lib/audio";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useArenaStore } from "@/store/arenaStore";
import { useLessonStore } from "@/store/useLessonStore";
import { trialMilestoneId } from "@/content/forgeTrials";
import { isRootSlot, type PatternMold } from "@/types/curriculum";
import { cn } from "@/lib/utils";

type DeckTab = "molds" | "roots";

function rectsOverlap(a: DOMRect, b: DOMRect, padding = 16): boolean {
  return !(
    a.right + padding < b.left ||
    a.left - padding > b.right ||
    a.bottom + padding < b.top ||
    a.top - padding > b.bottom
  );
}

type DraggableLetterProps = {
  letter: string;
  disabled?: boolean;
  onDropOnSlot: (letter: string, rect: DOMRect) => boolean;
};

function DraggableLetter({ letter, disabled, onDropOnSlot }: DraggableLetterProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const { playTap, playError } = useSoundEffects();

  const snapHome = useCallback(() => {
    animate(x, 0, { type: "spring", stiffness: 420, damping: 34 });
    animate(y, 0, { type: "spring", stiffness: 420, damping: 34 });
  }, [x, y]);

  return (
    <motion.div
      ref={nodeRef}
      style={{ x, y, zIndex: 30 }}
      drag={!disabled}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={() => playTap()}
      onDragEnd={() => {
        const el = nodeRef.current;
        if (!el) {
          snapHome();
          return;
        }
        const ok = onDropOnSlot(letter, el.getBoundingClientRect());
        if (!ok) {
          playError();
          snapHome();
        } else {
          x.set(0);
          y.set(0);
        }
      }}
      whileHover={disabled ? undefined : { scale: 1.06 }}
      whileDrag={{ scale: 1.12, zIndex: 80 }}
      className={cn(
        "font-arabic flex size-14 cursor-grab items-center justify-center rounded-xl border text-3xl touch-none active:cursor-grabbing md:size-16 md:text-4xl",
        disabled
          ? "border-slate-700 bg-slate-900/60 text-slate-600"
          : "border-amber-500/50 bg-slate-800/90 text-amber-100 shadow-[0_0_16px_rgba(245,158,11,0.28)]",
      )}
    >
      {letter}
    </motion.div>
  );
}

function GoldenBridge({ active }: { active: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none relative flex h-3 w-8 shrink-0 items-end self-end pb-2 md:w-10"
      animate={{ opacity: active ? 1 : 0 }}
    >
      <motion.div
        className="h-[2px] w-full origin-right rounded-full bg-gradient-to-l from-amber-200 via-amber-400 to-amber-600/40"
        animate={{ scaleX: active ? 1 : 0 }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
        style={{ transformOrigin: "right center" }}
      />
    </motion.div>
  );
}

export type TheForgeProps = {
  trialId: string;
};

export function TheForge({ trialId }: TheForgeProps) {
  const {
    trial,
    activeTargets,
    activeMold,
    slottedRoots,
    score,
    comboMultiplier,
    lives,
    gameStatus,
    lastCastArabic,
    initTrial,
    resetSession,
    setMold,
    slotRoot,
    clearMoldSlots,
    markTargetEscaped,
  } = useArenaStore();

  const { playSnap, playCast, playSuccess, playError, playTap } = useSoundEffects();
  const [deckTab, setDeckTab] = useState<DeckTab>("molds");
  const [castingFlash, setCastingFlash] = useState(false);
  const slotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const fallTimers = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const ok = initTrial(trialId);
    if (!ok) return;
    return () => {
      for (const id of fallTimers.current.values()) window.clearTimeout(id);
      fallTimers.current.clear();
      resetSession();
    };
  }, [initTrial, resetSession, trialId]);

  // Escape timers for falling targets.
  useEffect(() => {
    if (!trial || gameStatus !== "playing") return;

    for (const target of activeTargets) {
      if (target.status !== "falling") continue;
      if (fallTimers.current.has(target.id)) continue;

      const timer = window.setTimeout(() => {
        fallTimers.current.delete(target.id);
        markTargetEscaped(target.id);
        playError();
      }, trial.fallDurationMs);

      fallTimers.current.set(target.id, timer);
    }

    for (const [id, timer] of fallTimers.current) {
      const stillFalling = activeTargets.some((t) => t.id === id && t.status === "falling");
      if (!stillFalling) {
        window.clearTimeout(timer);
        fallTimers.current.delete(id);
      }
    }
  }, [activeTargets, gameStatus, markTargetEscaped, playError, trial]);

  // Cast flourish: TTS + morph flash.
  useEffect(() => {
    if (!lastCastArabic) return;
    if (gameStatus !== "casting" && gameStatus !== "victory") return;

    setCastingFlash(true);
    playCast();
    playSnap();
    void speakArabic(lastCastArabic);

    const t = window.setTimeout(() => setCastingFlash(false), 850);
    if (gameStatus === "victory") {
      playSuccess();
      useLessonStore.getState().unlockVocab(trialMilestoneId(trialId));
    }
    return () => window.clearTimeout(t);
  }, [gameStatus, lastCastArabic, playCast, playSnap, playSuccess, trialId]);

  const fallingTargets = useMemo(
    () => activeTargets.filter((t) => t.status === "falling"),
    [activeTargets],
  );

  const handleLetterDrop = useCallback(
    (letter: string, rect: DOMRect): boolean => {
      if (!activeMold || gameStatus === "casting" || gameStatus === "victory") return false;

      for (let slotIdx = 0; slotIdx < slottedRoots.length; slotIdx++) {
        if (slottedRoots[slotIdx]) continue;
        const el = slotRefs.current[slotIdx];
        if (!el) continue;
        if (rectsOverlap(rect, el.getBoundingClientRect())) {
          slotRoot(slotIdx, letter);
          playSnap();
          return true;
        }
      }
      return false;
    },
    [activeMold, gameStatus, playSnap, slotRoot, slottedRoots],
  );

  const selectMold = useCallback(
    (mold: PatternMold) => {
      if (gameStatus === "victory" || gameStatus === "defeat") return;
      playTap();
      setMold(mold);
      setDeckTab("roots");
    },
    [gameStatus, playTap, setMold],
  );
  if (!trial) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-slate-400">Trial not found.</p>
        <Button asChild variant="outline">
          <Link href="/learning-path">Return to Star Map</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,_#1a1520_0%,_#0B0F19_45%,_#000_100%)]">
      {/* HUD */}
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-amber-500/15 px-4 py-3 md:px-6">
        <Button asChild variant="ghost" size="sm" className="-ms-2 gap-1 text-slate-300">
          <Link href="/learning-path">
            <ArrowLeft className="size-4" />
            Star Map
          </Link>
        </Button>

        <div className="text-center">
          <p className="text-[10px] tracking-[0.2em] text-amber-400/70 uppercase">The Forge</p>
          <p className="font-display text-sm font-semibold text-amber-50 md:text-base">
            {trial.title}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs md:text-sm">
          <span className="flex items-center gap-1 text-rose-300/90">
            {Array.from({ length: 3 }, (_, i) => (
              <Heart
                key={i}
                className={cn(
                  "size-3.5",
                  i < lives ? "fill-rose-400 text-rose-400" : "text-slate-700",
                )}
              />
            ))}
          </span>
          <span className="font-mono text-amber-200">
            {score}
            {comboMultiplier > 1 ? (
              <span className="ms-1 text-amber-400">×{comboMultiplier}</span>
            ) : null}
          </span>
        </div>
      </header>

      {/* Target queue */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="relative mx-auto h-[38%] w-full max-w-3xl overflow-hidden px-4 pt-4">
          <p className="mb-2 text-center text-[10px] tracking-[0.18em] text-slate-500 uppercase">
            Descending targets
          </p>
          <div className="relative h-[calc(100%-1.5rem)] w-full">
            <AnimatePresence>
              {fallingTargets.map((target) => (
                <motion.div
                  key={target.id}
                  className="absolute left-1/2 w-[min(100%,20rem)] -translate-x-1/2"
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: ["0%", "110%"], opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0, filter: "brightness(2)" }}
                  transition={{
                    y: {
                      duration: (trial.fallDurationMs / 1000) * 0.95,
                      ease: "linear",
                    },
                    opacity: { duration: 0.25 },
                  }}
                >
                  <div className="rounded-2xl border border-amber-400/35 bg-slate-950/85 px-5 py-3 text-center shadow-[0_0_28px_rgba(245,158,11,0.2)] backdrop-blur-md">
                    <p className="font-display text-lg font-semibold text-amber-50 md:text-xl">
                      {target.english}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-amber-400/70">
                      {target.patternLabel} · {target.root.join(" · ")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Active mold */}
        <div className="relative z-20 mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-4 py-2">
          <div
            className={cn(
              "w-full rounded-2xl border px-4 py-5 transition-shadow md:px-8",
              castingFlash
                ? "border-amber-300/60 bg-amber-950/30 shadow-[0_0_40px_rgba(245,158,11,0.45)]"
                : "border-amber-500/25 bg-slate-950/70",
            )}
          >
            {!activeMold ? (
              <p className="text-center text-sm text-slate-400">
                Select a pattern mold from the deck below
              </p>
            ) : (
              <>
                <p className="mb-3 text-center text-[10px] tracking-[0.16em] text-amber-300/75 uppercase">
                  {activeMold.name} — {activeMold.meaning}
                </p>
                <div
                  className="flex flex-row-reverse flex-wrap items-end justify-center gap-1 md:gap-2"
                  dir="ltr"
                >
                  {(() => {
                    let rootCursor = 0;
                    return activeMold.visualSlots.map((token, index) => {
                      if (isRootSlot(token)) {
                        const slotIndex = rootCursor;
                        rootCursor += 1;
                        const filled = slottedRoots[slotIndex];

                        return (
                          <span key={`slot-${index}`} className="flex items-end">
                            {slotIndex > 0 ? <GoldenBridge active={castingFlash} /> : null}
                            <span
                              ref={(el) => {
                                slotRefs.current[slotIndex] = el;
                              }}
                              className={cn(
                                "flex size-12 items-end justify-center rounded-lg border border-dashed pb-1 md:size-14",
                                filled
                                  ? "border-amber-400/50 bg-slate-900/80"
                                  : "border-amber-500/35 bg-slate-900/40",
                              )}
                            >
                              {filled ? (
                                <motion.span
                                  layoutId={`forge-slot-${slotIndex}-${filled}`}
                                  className="font-arabic text-2xl text-amber-100 md:text-3xl"
                                  initial={{ scale: 0.6, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                >
                                  {filled}
                                </motion.span>
                              ) : (
                                <span className="mb-3 size-1.5 rounded-full bg-amber-500/35" />
                              )}
                            </span>
                          </span>
                        );
                      }

                      return (
                        <span
                          key={`affix-${index}`}
                          className="font-arabic flex size-12 items-end justify-center pb-1 text-2xl text-slate-400/80 md:size-14 md:text-3xl"
                        >
                          {token}
                        </span>
                      );
                    });
                  })()}
                </div>

                {lastCastArabic ? (
                  <motion.p
                    key={lastCastArabic}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-arabic mt-4 text-center text-3xl font-bold text-amber-200 md:text-4xl"
                    dir="rtl"
                  >
                    {lastCastArabic}
                  </motion.p>
                ) : (
                  <div className="mt-3 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-slate-500"
                      onClick={() => clearMoldSlots()}
                    >
                      Clear slots
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {(gameStatus === "victory" || gameStatus === "defeat") && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full flex-col items-center gap-3 rounded-2xl border border-amber-400/30 bg-slate-950/90 px-6 py-5 text-center"
            >
              <Sparkles className="size-6 text-amber-300" />
              <p className="font-display text-lg text-amber-50">
                {gameStatus === "victory" ? "Trial complete" : "Targets escaped"}
              </p>
              <p className="text-sm text-slate-400">Score {score}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                  <Link href="/learning-path">Star Map</Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => initTrial(trialId)}
                >
                  Retry
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Deck HUD */}
        <div className="relative z-20 mt-auto border-t border-amber-500/15 bg-black/55 px-4 py-3 backdrop-blur-md md:px-6 md:py-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeckTab("molds")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs tracking-wide uppercase transition",
                  deckTab === "molds"
                    ? "bg-amber-500/20 text-amber-200"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                Pattern Molds
              </button>
              <button
                type="button"
                onClick={() => setDeckTab("roots")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs tracking-wide uppercase transition",
                  deckTab === "roots"
                    ? "bg-amber-500/20 text-amber-200"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                Root Letters
              </button>
              <Flame className="ms-auto size-4 text-amber-500/50" />
            </div>

            {deckTab === "molds" ? (
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                {trial.deck.molds.map((mold) => {
                  const selected = activeMold?.id === mold.id;
                  return (
                    <button
                      key={mold.id}
                      type="button"
                      onClick={() => selectMold(mold)}
                      className={cn(
                        "min-w-[8rem] rounded-xl border px-3 py-2 text-start transition",
                        selected
                          ? "border-amber-400/60 bg-amber-500/15 shadow-[0_0_18px_rgba(245,158,11,0.25)]"
                          : "border-amber-500/20 bg-slate-900/80 hover:border-amber-500/40",
                      )}
                    >
                      <p className="text-xs font-semibold text-amber-100">{mold.name}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">{mold.meaning}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-row-reverse flex-wrap items-center justify-center gap-3 md:gap-4">
                {!activeMold ? (
                  <p className="text-sm text-slate-500">Place a mold first, then drag letters in.</p>
                ) : (
                  trial.deck.roots.flatMap((root) =>
                    root.letters.map((letter, i) => (
                      <DraggableLetter
                        key={`${root.id}-${i}-${letter}`}
                        letter={letter}
                        disabled={
                          gameStatus === "victory" ||
                          gameStatus === "defeat" ||
                          gameStatus === "casting"
                        }
                        onDropOnSlot={handleLetterDrop}
                      />
                    )),
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
