"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { LayoutGroup, motion, useMotionValue, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CursiveMorphNode, CURSIVE_MORPH_DURATION } from "@/components/common/CursiveMorphNode";
import { LoomHudFooterPortal } from "@/components/lesson/LoomHudFooter";
import { LoomStepFrame } from "@/components/lesson/LoomStepFrame";
import { LOOM_STAGE_ARENA, RUNE_STONE } from "@/components/lesson/loomShared";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { speakArabic } from "@/lib/audio";
import { cursivePositionInRoot, type CursivePosition } from "@/lib/arabic-utils";
import {
  isRootSlot,
  type ArabicRoot,
  type InteractiveStep,
  type PatternMold,
  type VocabularyItem,
} from "@/types/curriculum";
import { cn } from "@/lib/utils";

export type CosmicLoomStepProps = {
  step: InteractiveStep;
  root: ArabicRoot;
  mold: PatternMold;
  forgeVocab: VocabularyItem;
  onComplete: () => void;
  hudLayout?: boolean;
};

const FORGE_STEP_MS = Math.round(CURSIVE_MORPH_DURATION * 1000);

type ForgePhase =
  | "idle"
  | "hold"
  | "initial"
  | "medial"
  | "final"
  | "lock"
  | "forged";

function rectsOverlap(a: DOMRect, b: DOMRect, padding = 20): boolean {
  return !(
    a.right + padding < b.left ||
    a.left - padding > b.right ||
    a.bottom + padding < b.top ||
    a.top - padding > b.bottom
  );
}

function morphLevel(phase: ForgePhase): number {
  if (phase === "initial") return 1;
  if (phase === "medial") return 2;
  if (phase === "final" || phase === "lock" || phase === "forged") return 3;
  return 0;
}

function slotMorphPosition(
  letterIndex: number,
  filled: boolean,
  phase: ForgePhase,
  total: number,
): CursivePosition {
  if (!filled) return "isolated";
  const level = morphLevel(phase);
  if (level === 0) return "isolated";
  if (letterIndex === 0 && level >= 1) return cursivePositionInRoot(0, total);
  if (letterIndex === 1 && level >= 2) return cursivePositionInRoot(1, total);
  if (letterIndex === 2 && level >= 3) return cursivePositionInRoot(2, total);
  return "isolated";
}

function slideForLetter(letterIndex: number, phase: ForgePhase): number {
  if (phase === "idle" || phase === "hold") return 0;
  if (letterIndex === 0 && morphLevel(phase) >= 1) return -18;
  if (letterIndex === 1 && morphLevel(phase) >= 2) return -10;
  if (letterIndex === 2 && morphLevel(phase) >= 3) return -4;
  return 0;
}

function bridgeActive(betweenIndex: number, phase: ForgePhase): boolean {
  if (betweenIndex === 0) return morphLevel(phase) >= 1;
  if (betweenIndex === 1) return morphLevel(phase) >= 2;
  return false;
}

type DropResult = "accepted" | "wrong-slot" | "miss";

function findOverlappedSlot(runeRect: DOMRect, slots: readonly (HTMLSpanElement | null)[]): number | null {
  for (let index = 0; index < slots.length; index++) {
    const slotEl = slots[index];
    if (slotEl && rectsOverlap(runeRect, slotEl.getBoundingClientRect())) {
      return index;
    }
  }
  return null;
}

type DraggableRuneProps = {
  letterIndex: number;
  letter: string;
  runeRef: (el: HTMLDivElement | null) => void;
  onDrop: (letterIndex: number, runeRect: DOMRect) => DropResult;
  onWrongSlot: () => void;
  onDragStart: () => void;
};

function DraggableRune({
  letterIndex,
  letter,
  runeRef,
  onDrop,
  onWrongSlot,
  onDragStart,
}: DraggableRuneProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      nodeRef.current = el;
      runeRef(el);
    },
    [runeRef],
  );

  const snapHome = useCallback(() => {
    animate(x, 0, { type: "spring", stiffness: 420, damping: 34 });
    animate(y, 0, { type: "spring", stiffness: 420, damping: 34 });
  }, [x, y]);

  return (
    <motion.div
      ref={setRef}
      style={{ x, y, zIndex: 20 }}
      drag
      dragElastic={0.08}
      dragMomentum={false}
      onDragStart={onDragStart}
      onDragEnd={() => {
        const el = nodeRef.current;
        if (!el) {
          snapHome();
          return;
        }

        const result = onDrop(letterIndex, el.getBoundingClientRect());
        if (result === "accepted") {
          x.set(0);
          y.set(0);
          return;
        }
        if (result === "wrong-slot") onWrongSlot();
        snapHome();
      }}
      whileHover={{ scale: 1.06 }}
      whileDrag={{ scale: 1.12, zIndex: 200 }}
      className={cn(RUNE_STONE, "relative cursor-grab touch-none active:cursor-grabbing")}
      dragPropagation={false}
    >
      <CursiveMorphNode letter={letter} position="isolated" size="sm" />
    </motion.div>
  );
}

const PHASE_HINT: Partial<Record<ForgePhase, string>> = {
  hold: "Letters rest in their slots — isolated forms.",
  initial: "The rightmost letter slides left as the bridge grows.",
  medial: "The middle letter morphs along the golden connector.",
  final: "The leftmost letter closes the cursive chain.",
  lock: "Letters lock into one seamless word…",
  forged: "Word complete — listen and continue.",
};

/** Golden baseline connector — grows RTL (scaleX 0 → 1, origin right). */
function GoldenBridge({ active }: { active: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none relative flex h-4 w-14 shrink-0 items-end self-end pb-3 md:w-16"
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <motion.div
        className="relative h-[3px] w-full origin-right rounded-full bg-gradient-to-l from-amber-200 via-amber-400 to-amber-600/40 shadow-[0_0_14px_rgba(251,191,36,0.75)]"
        initial={false}
        animate={{ scaleX: active ? 1 : 0 }}
        transition={{ duration: CURSIVE_MORPH_DURATION, ease: "easeInOut" }}
        style={{ transformOrigin: "right center" }}
      />
      <motion.span
        className="absolute right-0 bottom-[7px] size-2 rounded-full bg-amber-100 shadow-[0_0_10px_rgba(255,255,255,0.6)]"
        initial={false}
        animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ duration: CURSIVE_MORPH_DURATION * 0.5, delay: CURSIVE_MORPH_DURATION * 0.35 }}
      />
    </motion.div>
  );
}

export function CosmicLoomStep({
  step,
  root,
  mold,
  forgeVocab,
  onComplete,
  hudLayout = false,
}: CosmicLoomStepProps) {
  const { playTap, playCast, playSnap, playError } = useSoundEffects();
  const slotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const runeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const forgeStartedRef = useRef(false);

  const [placed, setPlaced] = useState<Set<number>>(() => new Set());
  const [isForging, setIsForging] = useState(false);
  const [forgePhase, setForgePhase] = useState<ForgePhase>("idle");
  const [speaking, setSpeaking] = useState(false);

  const allPlaced = placed.size >= root.letters.length;
  const letterTotal = root.letters.length;
  const morphing = isForging && forgePhase !== "idle";

  useEffect(() => {
    if (!allPlaced || forgeStartedRef.current) return;
    forgeStartedRef.current = true;
    setIsForging(true);
    setForgePhase("hold");

    const timers: number[] = [];
    const schedule = (fn: () => void, delay: number) => {
      timers.push(window.setTimeout(fn, delay));
    };

    schedule(() => setForgePhase("initial"), FORGE_STEP_MS);
    schedule(() => setForgePhase("medial"), FORGE_STEP_MS * 2);
    schedule(() => setForgePhase("final"), FORGE_STEP_MS * 3);
    schedule(() => setForgePhase("lock"), FORGE_STEP_MS * 4);
    schedule(() => {
      setForgePhase("forged");
      playCast();
      setSpeaking(true);
      void speakArabic(forgeVocab.arabic, { ttsOverride: forgeVocab.ttsOverride }).finally(
        () => setSpeaking(false),
      );
    }, FORGE_STEP_MS * 5);

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [allPlaced, forgeVocab.arabic, forgeVocab.ttsOverride, playCast]);

  const handleDrop = useCallback(
    (letterIndex: number, runeRect: DOMRect): DropResult => {
      if (placed.has(letterIndex) || isForging) return "miss";

      const overlappedSlot = findOverlappedSlot(runeRect, slotRefs.current);
      if (overlappedSlot === null) return "miss";
      if (overlappedSlot !== letterIndex) return "wrong-slot";

      playSnap();
      setPlaced((prev) => new Set(prev).add(letterIndex));
      return "accepted";
    },
    [isForging, placed, playSnap],
  );

  const handleWrongSlot = useCallback(() => {
    playError();
  }, [playError]);

  const slotGap = useMemo(() => {
    if (forgePhase === "lock" || forgePhase === "forged") return "0rem";
    if (morphing && morphLevel(forgePhase) >= 1) return "0.1rem";
    return "0.55rem";
  }, [forgePhase, morphing]);

  const rowSlideX = useMemo(() => {
    if (!morphing) return 0;
    const level = morphLevel(forgePhase);
    if (level >= 3) return 12;
    if (level >= 2) return 8;
    if (level >= 1) return 4;
    return 0;
  }, [forgePhase, morphing]);

  const footer = useMemo(
    () =>
      forgePhase === "forged" ? (
        <Button
          type="button"
          size="lg"
          disabled={speaking}
          className="font-serif w-full bg-amber-500 font-semibold text-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.45)] hover:bg-amber-400"
          onClick={() => {
            playSnap();
            onComplete();
          }}
        >
          Word forged — continue →
        </Button>
      ) : undefined,
    [forgePhase, onComplete, playSnap, speaking],
  );

  const stage = (
    <div className={cn(LOOM_STAGE_ARENA, "overflow-visible")}>
      <div className="flex w-full max-w-3xl flex-col items-center gap-8 overflow-visible">
        <div className="text-center">
          <p className="text-xs tracking-[0.16em] text-amber-300/75 uppercase">
            Pattern: {mold.meaning}
          </p>
          <p className="font-mono text-sm text-slate-500">{mold.name}</p>
        </div>

        <div className="relative z-10 w-full overflow-visible">
          <motion.div
            className={cn(
              "relative z-10 overflow-visible rounded-2xl border px-6 py-6 md:px-8 md:py-8",
              forgePhase === "forged"
                ? "border-amber-400/40 bg-amber-950/15 shadow-[0_0_32px_-10px_rgba(245,158,11,0.45)]"
                : "border-amber-500/25 bg-slate-950/50",
            )}
            animate={{
              boxShadow:
                forgePhase === "forged"
                  ? "0 0 40px -8px rgba(245,158,11,0.5)"
                  : morphing
                    ? "0 0 24px -12px rgba(245,158,11,0.25)"
                    : "0 0 0px transparent",
            }}
            transition={{ duration: CURSIVE_MORPH_DURATION, ease: "easeInOut" }}
          >
            <motion.div
              style={{ gap: slotGap }}
              animate={{ x: rowSlideX }}
              transition={{ duration: CURSIVE_MORPH_DURATION, ease: "easeInOut" }}
              className="flex flex-row-reverse flex-wrap items-end justify-center transition-[gap] duration-[1200ms] ease-in-out"
            >
              {(() => {
                let slotCursor = 0;
                let rootSlotCursor = 0;
                const elements: ReactElement[] = [];

                mold.visualSlots.forEach((token, index) => {
                  if (isRootSlot(token)) {
                    const letterIndex = slotCursor;
                    slotCursor += 1;
                    const letter = root.letters[letterIndex];
                    const filled = placed.has(letterIndex);

                    if (rootSlotCursor > 0) {
                      elements.push(
                        <GoldenBridge
                          key={`bridge-before-${letterIndex}`}
                          active={morphing && bridgeActive(rootSlotCursor - 1, forgePhase)}
                        />,
                      );
                    }

                    rootSlotCursor += 1;

                    elements.push(
                      <motion.span
                        key={`socket-${index}`}
                        ref={(el) => {
                          slotRefs.current[letterIndex] = el;
                        }}
                        className={cn(
                          "flex size-14 items-end justify-center rounded-lg border border-dashed pb-1 md:size-16 lg:size-[4.5rem]",
                          filled
                            ? forgePhase === "forged"
                              ? "border-transparent bg-transparent"
                              : "border-amber-400/40 bg-slate-900/70"
                            : "border-amber-500/35 bg-slate-900/30",
                        )}
                        animate={{
                          borderColor:
                            forgePhase === "forged"
                              ? "rgba(251,191,36,0.08)"
                              : "rgba(251,191,36,0.35)",
                        }}
                        transition={{ duration: CURSIVE_MORPH_DURATION }}
                      >
                        {filled ? (
                          <motion.span
                            key={`placed-${letterIndex}`}
                            initial={{ scale: 0.65, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 320, damping: 26 }}
                            className="flex items-end justify-center"
                          >
                            <CursiveMorphNode
                              letter={letter}
                              position={slotMorphPosition(
                                letterIndex,
                                filled,
                                forgePhase,
                                letterTotal,
                              )}
                              slideX={slideForLetter(letterIndex, forgePhase)}
                              size={forgePhase === "forged" ? "lg" : "md"}
                            />
                          </motion.span>
                        ) : (
                          <span className="mb-4 size-2 rounded-full bg-amber-500/30" />
                        )}
                      </motion.span>,
                    );
                    return;
                  }

                  elements.push(
                    <motion.span
                      key={`glyph-${index}`}
                      animate={{ opacity: morphing ? 0.55 : 0.85 }}
                      transition={{ duration: CURSIVE_MORPH_DURATION }}
                      className="font-arabic flex size-14 items-end justify-center pb-1 text-3xl text-slate-400/80 md:size-16 md:text-4xl lg:size-[4.5rem] lg:text-5xl"
                    >
                      {token}
                    </motion.span>,
                  );
                });

                return elements;
              })()}
            </motion.div>
          </motion.div>
        </div>

        <motion.p
          key={forgePhase}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="text-center text-sm text-amber-300/80"
        >
          {forgePhase === "forged"
            ? `${forgeVocab.arabic} · ${forgeVocab.transliteration} · ${forgeVocab.english}`
            : morphing
              ? (PHASE_HINT[forgePhase] ?? "Forging…")
              : "Drag each rune into its matching slot — right to left"}
        </motion.p>

        <motion.div
          animate={{ opacity: morphing ? 0 : 1, height: morphing ? 0 : "auto" }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="relative z-20 flex flex-row-reverse flex-wrap items-center justify-center gap-4 overflow-visible md:gap-6"
        >
          {root.letters.map((letter, index) => {
            if (placed.has(index)) return null;

            return (
              <DraggableRune
                key={`rune-drag-${index}`}
                letterIndex={index}
                letter={letter}
                runeRef={(el) => {
                  runeRefs.current[index] = el;
                }}
                onDrop={handleDrop}
                onWrongSlot={handleWrongSlot}
                onDragStart={() => playTap()}
              />
            );
          })}
        </motion.div>
      </div>
    </div>
  );

  if (hudLayout) {
    return (
      <LayoutGroup id="cosmic-loom">
        {stage}
        {footer ? <LoomHudFooterPortal>{footer}</LoomHudFooterPortal> : null}
      </LayoutGroup>
    );
  }

  return (
    <LayoutGroup id="cosmic-loom">
      <LoomStepFrame phaseLabel="Cosmic Loom" step={step} titleId="loom-title" footer={footer}>
        {stage}
      </LoomStepFrame>
    </LayoutGroup>
  );
}
