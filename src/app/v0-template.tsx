"use client";

/**
 * ============================================================================
 * Nawā — Responsive "Centered Game Stage" UI Template (v0 export)
 * ============================================================================
 * Single-file consolidation of the /prototype UI so it can be pasted whole
 * into Cursor Composer. Contains all 5 pieces in one file:
 *   1. Push3DButton   — shared astral action button
 *   2. PathView       — constellation syllabus map
 *   3. LessonView     — interactive inscription lesson
 *   4. ArenaView      — syntactic card battler
 *   5. V0Template     — responsive shell (default export)
 *
 * Dependencies (all standard in this project):
 *   - framer-motion
 *   - lucide-react
 *   - cn helper from "@/lib/utils"
 *
 * Responsive architecture:
 *   - Mobile: sleek stacked layout, top segmented toggle, sticky bottom footer.
 *   - Desktop (lg): left sidebar nav, views locked to a centered max-w-2xl
 *     glass stage over a full-bleed celestial background, action buttons sit
 *     statically below the stage (no sticky screen-bottom footer).
 * ============================================================================
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  Compass,
  Feather,
  Swords,
  Check,
  Lock,
  Sparkles,
  Crown,
  Star,
  Heart,
  X,
  Volume2,
  Flame,
  Snowflake,
  Brain,
  Droplet,
  Skull,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ==========================================================================
 * 1. Push3DButton — refined astral action control
 * ======================================================================== */

type Variant = "primary" | "amber" | "cyan" | "emerald" | "neutral" | "danger";

interface Push3DButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"
  > {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { face: string; edge: string; glow: string }> = {
  primary: {
    face: "text-[#160D02] bg-gradient-to-b from-[#FBBF24] to-[#D97706]",
    edge: "inset 0 1px 0 0 rgba(255,255,255,0.45), 0 3px 0 0 #92400E",
    glow: "0 10px 30px -8px rgba(245,158,11,0.55)",
  },
  amber: {
    face: "text-[#160D02] bg-gradient-to-b from-[#FBBF24] to-[#D97706]",
    edge: "inset 0 1px 0 0 rgba(255,255,255,0.45), 0 3px 0 0 #92400E",
    glow: "0 12px 36px -8px rgba(245,158,11,0.6)",
  },
  cyan: {
    face: "text-[#04121C] bg-gradient-to-b from-[#7DD3FC] to-[#0EA5E9]",
    edge: "inset 0 1px 0 0 rgba(255,255,255,0.5), 0 3px 0 0 #075985",
    glow: "0 10px 30px -8px rgba(56,189,248,0.55)",
  },
  emerald: {
    face: "text-[#04140D] bg-gradient-to-b from-[#4ADE80] to-[#059669]",
    edge: "inset 0 1px 0 0 rgba(255,255,255,0.4), 0 3px 0 0 #065F46",
    glow: "0 10px 30px -8px rgba(16,185,129,0.5)",
  },
  danger: {
    face: "text-[#1B0606] bg-gradient-to-b from-[#FB7185] to-[#E11D48]",
    edge: "inset 0 1px 0 0 rgba(255,255,255,0.35), 0 3px 0 0 #9F1239",
    glow: "0 10px 30px -8px rgba(225,29,72,0.5)",
  },
  neutral: {
    face: "text-[#E7ECF5] bg-white/[0.06] border border-white/12",
    edge: "inset 0 1px 0 0 rgba(255,255,255,0.12), 0 3px 0 0 rgba(0,0,0,0.5)",
    glow: "0 8px 24px -10px rgba(0,0,0,0.6)",
  },
};

function Push3DButton({
  children,
  variant = "primary",
  fullWidth,
  className,
  style,
  disabled,
  ...props
}: Push3DButtonProps) {
  const v = variantStyles[variant];
  return (
    <motion.button
      {...props}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { y: 3 }}
      transition={{ type: "spring", stiffness: 600, damping: 26 }}
      className={cn(
        "group relative inline-flex select-none items-center justify-center gap-2 rounded-2xl px-6 py-3.5",
        "text-base font-semibold tracking-wide",
        "disabled:cursor-not-allowed disabled:opacity-45",
        v.face,
        fullWidth && "w-full",
        className,
      )}
      style={{ boxShadow: `${v.edge}, ${v.glow}`, ...style }}
    >
      {children}
    </motion.button>
  );
}

/* ==========================================================================
 * 2. PathView — constellation syllabus map
 * ======================================================================== */

type NodeState = "done" | "active" | "locked";

interface PathNode {
  id: string;
  label: string;
  state: NodeState;
  icon?: "star" | "crown";
}

interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  nodes: PathNode[];
}

const CHAPTERS: Chapter[] = [
  {
    id: "c1",
    title: "Chapter I: The Core Inscriptions",
    subtitle: "The letterforms & first sacred sounds",
    nodes: [
      { id: "n1", label: "The Alphabet", state: "done" },
      { id: "n2", label: "Short Vowels", state: "done" },
      { id: "n3", label: "Intro to Verbs", state: "active", icon: "star" },
      { id: "n4", label: "Sun & Moon Letters", state: "locked" },
      { id: "n5", label: "The First Trial", state: "locked", icon: "crown" },
    ],
  },
  {
    id: "c2",
    title: "Chapter II: Root & Pattern",
    subtitle: "Trilateral roots and the loom of forms",
    nodes: [
      { id: "n6", label: "The Root System", state: "locked" },
      { id: "n7", label: "Form I Verbs", state: "locked" },
      { id: "n8", label: "Active Participles", state: "locked", icon: "star" },
      { id: "n9", label: "Building Nouns", state: "locked" },
      { id: "n10", label: "The Second Trial", state: "locked", icon: "crown" },
    ],
  },
];

const OFFSETS = ["0%", "22%", "6%", "-18%", "0%"];

function NodeGlyph({ node }: { node: PathNode }) {
  if (node.state === "done") return <Check className="h-6 w-6" strokeWidth={3} />;
  if (node.state === "locked") return <Lock className="h-5 w-5" strokeWidth={2.5} />;
  if (node.icon === "crown") return <Crown className="h-6 w-6" strokeWidth={2.5} />;
  return <Sparkles className="h-6 w-6" strokeWidth={2.5} />;
}

function ConstellationNode({ node, index }: { node: PathNode; index: number }) {
  const isActive = node.state === "active";
  const isDone = node.state === "done";
  const isLocked = node.state === "locked";

  return (
    <div
      className="flex flex-col items-center gap-2.5"
      style={{ transform: `translateX(${OFFSETS[index % OFFSETS.length]})` }}
    >
      <motion.button
        whileTap={isLocked ? undefined : { scale: 0.92, y: 2 }}
        whileHover={isLocked ? undefined : { scale: 1.06 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
        className={cn(
          "relative flex h-[68px] w-[68px] items-center justify-center rounded-full",
          isDone && "text-[#04140D]",
          isActive && "text-[#160D02]",
          isLocked && "text-slate-500",
        )}
        style={{
          background: isDone
            ? "linear-gradient(160deg, #4ADE80, #059669)"
            : isActive
              ? "linear-gradient(160deg, #FBBF24, #D97706)"
              : "rgba(148,163,184,0.06)",
          border: isLocked
            ? "1px solid rgba(148,163,184,0.18)"
            : "1px solid rgba(255,255,255,0.35)",
          boxShadow: isDone
            ? "inset 0 1px 0 rgba(255,255,255,0.4), 0 8px 22px -6px rgba(16,185,129,0.5)"
            : isActive
              ? "inset 0 1px 0 rgba(255,255,255,0.5), 0 10px 26px -6px rgba(245,158,11,0.6)"
              : "inset 0 1px 0 rgba(255,255,255,0.06)",
          backdropFilter: isLocked ? "blur(8px)" : undefined,
        }}
      >
        {isActive && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(245,158,11,0.5)",
                "0 0 0 16px rgba(245,158,11,0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <NodeGlyph node={node} />
      </motion.button>

      <span
        className={cn(
          "max-w-[120px] text-center text-xs font-medium leading-tight text-balance",
          isLocked ? "text-slate-500" : "text-slate-200",
        )}
      >
        {node.label}
      </span>

      {isActive && (
        <motion.span
          initial={{ y: -3, opacity: 0.7 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300"
        >
          Begin
        </motion.span>
      )}
    </div>
  );
}

function PathView() {
  return (
    <div className="relative mx-auto h-full max-w-md overflow-y-auto pb-16 lg:max-w-none lg:rounded-[1.75rem] lg:border lg:border-[rgba(56,189,248,0.14)] lg:bg-[rgba(15,23,42,0.4)] lg:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] lg:[backdrop-filter:blur(16px)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 12%, rgba(226,232,240,0.6), transparent), radial-gradient(1px 1px at 68% 22%, rgba(125,211,252,0.5), transparent), radial-gradient(1.5px 1.5px at 42% 44%, rgba(226,232,240,0.4), transparent), radial-gradient(1px 1px at 82% 60%, rgba(251,191,36,0.4), transparent), radial-gradient(1px 1px at 30% 78%, rgba(226,232,240,0.5), transparent)",
        }}
      />

      {CHAPTERS.map((chapter) => (
        <section key={chapter.id}>
          <div className="sticky top-0 z-10 px-4 py-3">
            <div
              className="flex items-center justify-between rounded-2xl px-5 py-4"
              style={{
                background: "rgba(15,23,42,0.72)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(245,158,11,0.18)",
                boxShadow: "0 8px 30px -12px rgba(0,0,0,0.7)",
              }}
            >
              <div>
                <h2 className="text-base font-semibold tracking-tight text-slate-100">
                  {chapter.title}
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">{chapter.subtitle}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>
          </div>

          <div className="relative flex flex-col items-center gap-11 px-4 py-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-6 left-1/2 -z-0 w-px -translate-x-1/2"
              style={{
                background:
                  "repeating-linear-gradient(rgba(125,211,252,0.35) 0 6px, transparent 6px 16px)",
              }}
            />
            {chapter.nodes.map((node, i) => (
              <div key={node.id} className="relative z-[1]">
                <ConstellationNode node={node} index={i} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ==========================================================================
 * 3. LessonView — interactive inscription lesson
 * ======================================================================== */

interface Tile {
  id: string;
  arabic: string;
  translit: string;
}

const TILES: Tile[] = [
  { id: "t1", arabic: "كَتَبَ", translit: "kataba" },
  { id: "t2", arabic: "قَرَأَ", translit: "qara'a" },
  { id: "t3", arabic: "دَرَسَ", translit: "darasa" },
  { id: "t4", arabic: "شَرِبَ", translit: "shariba" },
];

const CORRECT_ID = "t1";
const PROGRESS = 0.4;

function LessonView() {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const isCorrect = selected === CORRECT_ID;

  function handleCheck() {
    if (!selected) return;
    setChecked(true);
  }

  function reset() {
    setChecked(false);
    setSelected(null);
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col lg:max-w-none lg:gap-4 lg:py-1">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:rounded-[1.75rem] lg:border lg:border-[rgba(245,158,11,0.14)] lg:bg-[rgba(15,23,42,0.5)] lg:pb-2 lg:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] lg:[backdrop-filter:blur(20px)]">
        <div className="flex items-center gap-3 px-4 py-4 lg:px-6 lg:pt-6">
          <button
            className="text-slate-500 transition-colors hover:text-slate-200"
            aria-label="Leave the chamber"
          >
            <X className="h-6 w-6" strokeWidth={2.5} />
          </button>
          <div
            className="relative h-3 flex-1 overflow-hidden rounded-full"
            style={{ background: "rgba(148,163,184,0.14)" }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, #F59E0B, #FBBF24)",
                boxShadow: "0 0 14px rgba(245,158,11,0.6)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${PROGRESS * 100}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <span className="absolute inset-x-1 top-0.5 h-1 rounded-full bg-white/40" />
            </motion.div>
          </div>
          <div className="flex items-center gap-1 font-semibold text-rose-400">
            <Heart className="h-5 w-5 fill-current" />
            <span className="text-sm">5</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center px-4 lg:px-8">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-cyan-300/80">
            Translate the inscription
          </p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-col items-center gap-4 rounded-3xl px-6 py-10 lg:py-14"
            style={{
              background:
                "linear-gradient(160deg, rgba(30,41,59,0.75), rgba(11,15,25,0.85))",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(245,158,11,0.16)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 50px -24px rgba(0,0,0,0.8)",
            }}
          >
            <button
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-amber-300 transition-transform active:scale-90"
              style={{
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.35)",
                boxShadow: "0 0 18px -4px rgba(245,158,11,0.5)",
              }}
              aria-label="Hear the inscription"
            >
              <Volume2 className="h-5 w-5" />
            </button>
            <span
              dir="rtl"
              lang="ar"
              className="font-arabic text-6xl font-bold text-amber-200 lg:text-7xl"
              style={{ textShadow: "0 0 26px rgba(245,158,11,0.45)" }}
            >
              {"يَكْتُبُ"}
            </span>
            <span className="text-sm text-slate-400">{"he writes"}</span>
          </motion.div>

          <div className="mt-8 grid grid-cols-2 gap-3 lg:mx-auto lg:w-full lg:max-w-xl lg:gap-4">
            {TILES.map((tile) => {
              const isSel = selected === tile.id;
              const showState = checked && isSel;
              const correctState = showState && isCorrect;
              const wrongState = showState && !isCorrect;
              return (
                <motion.button
                  key={tile.id}
                  disabled={checked}
                  onClick={() => setSelected(tile.id)}
                  whileTap={checked ? undefined : { scale: 0.96, y: 2 }}
                  whileHover={checked ? undefined : { y: -2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 24 }}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl px-4 py-5 transition-colors lg:py-6",
                    correctState && "text-[#04140D]",
                    wrongState && "text-[#1B0606]",
                    !showState && "text-slate-100",
                  )}
                  style={{
                    background: correctState
                      ? "linear-gradient(160deg, #4ADE80, #059669)"
                      : wrongState
                        ? "linear-gradient(160deg, #FB7185, #E11D48)"
                        : "rgba(148,163,184,0.05)",
                    border: isSel
                      ? "1px solid rgba(56,189,248,0.7)"
                      : "1px solid rgba(148,163,184,0.14)",
                    backdropFilter: "blur(10px)",
                    boxShadow: isSel
                      ? "0 0 20px -4px rgba(56,189,248,0.55), inset 0 1px 0 rgba(255,255,255,0.08)"
                      : "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  <span
                    dir="rtl"
                    lang="ar"
                    className="font-arabic battle-arabic text-2xl font-semibold"
                  >
                    {tile.arabic}
                  </span>
                  <span className="text-xs opacity-70">{tile.translit}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 lg:static">
        <AnimatePresence mode="wait">
          {checked ? (
            <motion.div
              key="feedback"
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              className={cn(
                "px-4 pb-6 pt-5 lg:rounded-2xl lg:border lg:px-6",
                isCorrect
                  ? "border-t border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.12)] lg:border-[rgba(16,185,129,0.3)]"
                  : "border-t border-[rgba(225,29,72,0.3)] bg-[rgba(225,29,72,0.12)] lg:border-[rgba(225,29,72,0.3)]",
              )}
            >
              <p
                className={cn(
                  "mb-3 text-lg font-semibold",
                  isCorrect ? "text-emerald-300" : "text-rose-300",
                )}
              >
                {isCorrect ? "Beautifully inscribed." : "The truth was: kataba"}
              </p>
              <Push3DButton
                variant={isCorrect ? "emerald" : "danger"}
                fullWidth
                onClick={reset}
              >
                Continue
              </Push3DButton>
            </motion.div>
          ) : (
            <motion.div key="check" className="px-4 pb-6 pt-5 lg:px-0 lg:pb-0 lg:pt-0">
              <Push3DButton
                variant="primary"
                fullWidth
                disabled={!selected}
                onClick={handleCheck}
              >
                Confirm Inscription
              </Push3DButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ==========================================================================
 * 4. ArenaView — syntactic card battler
 * ======================================================================== */

type ElementKind = "flame" | "frost" | "mind";

interface Card {
  id: string;
  arabic: string;
  gloss: string;
  cost: number;
  element: ElementKind;
}

const HAND: Card[] = [
  { id: "c1", arabic: "ضَرَبَ", gloss: "strike", cost: 2, element: "flame" },
  { id: "c2", arabic: "نَارٌ", gloss: "fire", cost: 3, element: "flame" },
  { id: "c3", arabic: "بِسَيْفٍ", gloss: "with a sword", cost: 1, element: "mind" },
  { id: "c4", arabic: "قَوِيّ", gloss: "strong", cost: 2, element: "frost" },
  { id: "c5", arabic: "دِرْعٌ", gloss: "shield", cost: 1, element: "frost" },
];

const ELEMENTS: Record<
  ElementKind,
  { icon: typeof Flame; color: string; edge: string; glow: string }
> = {
  flame: {
    icon: Flame,
    color: "#FB923C",
    edge: "rgba(251,146,60,0.6)",
    glow: "rgba(251,146,60,0.4)",
  },
  frost: {
    icon: Snowflake,
    color: "#7DD3FC",
    edge: "rgba(125,211,252,0.6)",
    glow: "rgba(56,189,248,0.4)",
  },
  mind: {
    icon: Brain,
    color: "#C4B5FD",
    edge: "rgba(196,181,253,0.6)",
    glow: "rgba(167,139,250,0.4)",
  },
};

const ENEMY_HP = 0.68;
const PLAYER_HP = 0.82;
const MAX_MANA = 6;

function ArenaView() {
  const [slots, setSlots] = useState<Card[]>([]);
  const manaUsed = slots.reduce((sum, c) => sum + c.cost, 0);

  function toggleCard(card: Card) {
    setSlots((prev) => {
      if (prev.some((c) => c.id === card.id)) return prev.filter((c) => c.id !== card.id);
      if (manaUsed + card.cost > MAX_MANA) return prev;
      return [...prev, card];
    });
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col lg:max-w-none lg:gap-4 lg:py-1">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-4 lg:rounded-[1.75rem] lg:border lg:border-[rgba(56,189,248,0.14)] lg:bg-[rgba(15,23,42,0.5)] lg:px-8 lg:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] lg:[backdrop-filter:blur(20px)]">
        <div className="relative flex flex-col items-center gap-3 pt-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-4 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(225,29,72,0.22), transparent 65%)",
              filter: "blur(30px)",
            }}
          />
          <div className="relative z-[1] flex w-full items-center gap-4">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-rose-300"
              style={{
                background: "linear-gradient(160deg, rgba(76,29,45,0.8), rgba(30,41,59,0.8))",
                border: "1px solid rgba(251,113,133,0.4)",
                boxShadow: "0 0 30px -6px rgba(225,29,72,0.5)",
              }}
            >
              <Skull className="h-10 w-10" strokeWidth={1.75} />
            </motion.div>
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-100">
                  {"al-Ghūl · الغُول"}
                </span>
                <span className="text-xs font-semibold text-rose-300">136 / 200</span>
              </div>
              <div
                className="relative h-3 overflow-hidden rounded-full"
                style={{ background: "rgba(148,163,184,0.14)" }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #E11D48, #FB7185)",
                    boxShadow: "0 0 12px rgba(225,29,72,0.6)",
                  }}
                  initial={{ width: "100%" }}
                  animate={{ width: `${ENEMY_HP * 100}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          </div>

          <motion.div
            animate={{
              boxShadow: [
                "0 0 12px rgba(251,113,133,0.25)",
                "0 0 22px rgba(251,113,133,0.55)",
                "0 0 12px rgba(251,113,133,0.25)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="relative z-[1] flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-rose-200"
            style={{
              background: "rgba(76,29,45,0.5)",
              border: "1px solid rgba(251,113,133,0.4)",
            }}
          >
            <Flame className="h-4 w-4" />
            Ember Wrath — 20 damage next turn
          </motion.div>
        </div>

        <div className="flex flex-1 flex-col justify-center py-6">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-[0.22em] text-cyan-300/80">
            Syntax Chamber — weave your sentence
          </p>
          <motion.div
            animate={{
              boxShadow: slots.length
                ? [
                    "0 0 24px -6px rgba(56,189,248,0.4)",
                    "0 0 40px -6px rgba(56,189,248,0.6)",
                    "0 0 24px -6px rgba(56,189,248,0.4)",
                  ]
                : "0 0 0 0 rgba(0,0,0,0)",
            }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="relative flex min-h-[104px] items-center justify-center gap-2 rounded-3xl p-3 lg:min-h-[132px]"
            style={{
              border: slots.length
                ? "1.5px solid rgba(56,189,248,0.55)"
                : "1.5px dashed rgba(148,163,184,0.28)",
              background: slots.length
                ? "rgba(56,189,248,0.06)"
                : "rgba(148,163,184,0.03)",
            }}
          >
            <AnimatePresence>
              {slots.length === 0 ? (
                <motion.span key="empty" exit={{ opacity: 0 }} className="text-sm text-slate-500">
                  Tap cards to inscribe them here
                </motion.span>
              ) : (
                slots.map((card) => {
                  const el = ELEMENTS[card.element];
                  return (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ scale: 0.6, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      className="flex flex-col items-center rounded-xl px-3 py-2 text-slate-100"
                      style={{
                        background: "rgba(15,23,42,0.85)",
                        border: `1px solid ${el.edge}`,
                        boxShadow: `0 0 16px -4px ${el.glow}`,
                      }}
                    >
                      <span
                        dir="rtl"
                        lang="ar"
                        className="font-arabic battle-arabic text-xl font-semibold"
                      >
                        {card.arabic}
                      </span>
                      <span className="text-[10px] opacity-70">{card.gloss}</span>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <div className="px-4 pb-2 lg:px-0 lg:pb-0">
        <div className="flex items-end justify-center gap-2 lg:gap-3">
          {HAND.map((card) => {
            const el = ELEMENTS[card.element];
            const ElIcon = el.icon;
            const active = slots.some((c) => c.id === card.id);
            const affordable = active || manaUsed + card.cost <= MAX_MANA;
            return (
              <motion.button
                key={card.id}
                onClick={() => toggleCard(card)}
                whileHover={affordable ? { y: -14, scale: 1.05 } : undefined}
                whileTap={affordable ? { y: -6 } : undefined}
                animate={{ y: active ? -10 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                disabled={!affordable}
                className={cn(
                  "relative flex h-28 w-[62px] flex-col items-center justify-between rounded-xl p-2 text-slate-100 lg:h-32 lg:w-[72px]",
                  !affordable && "opacity-40",
                )}
                style={{
                  background: "linear-gradient(160deg, rgba(30,41,59,0.9), rgba(11,15,25,0.95))",
                  border: active ? `1.5px solid ${el.edge}` : "1px solid rgba(148,163,184,0.16)",
                  boxShadow: active
                    ? `0 0 22px -4px ${el.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`
                    : "0 8px 18px -8px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <span
                  className="flex items-center gap-0.5 self-start text-[11px] font-bold"
                  style={{ color: el.color }}
                >
                  <ElIcon className="h-3 w-3" />
                  {card.cost}
                </span>
                <span
                  dir="rtl"
                  lang="ar"
                  className="font-arabic battle-arabic text-xl font-semibold"
                >
                  {card.arabic}
                </span>
                <span className="text-[9px] leading-none opacity-70">{card.gloss}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 pb-6 lg:pb-0">
          <Push3DButton variant="amber" fullWidth disabled={slots.length === 0} className="text-lg">
            <Sparkles className="h-5 w-5" />
            Weave Sentence
          </Push3DButton>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2">
              <Heart className="h-5 w-5 shrink-0 fill-rose-400 text-rose-400" />
              <div
                className="relative h-2.5 flex-1 overflow-hidden rounded-full"
                style={{ background: "rgba(148,163,184,0.14)" }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${PLAYER_HP * 100}%`,
                    background: "linear-gradient(90deg, #E11D48, #FB7185)",
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-200">41/50</span>
            </div>
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1 font-bold text-cyan-300"
              style={{
                background: "rgba(56,189,248,0.12)",
                border: "1px solid rgba(56,189,248,0.3)",
              }}
            >
              <Droplet className="h-4 w-4 fill-current" />
              <span className="text-sm">
                {MAX_MANA - manaUsed}
                <span className="opacity-60">/{MAX_MANA}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
 * 5. V0Template — responsive shell (default export)
 * ======================================================================== */

type View = "path" | "lesson" | "arena";

const VIEWS = [
  { id: "path", label: "Path", icon: Compass, hint: "Your journey" },
  { id: "lesson", label: "Lesson", icon: Feather, hint: "Inscribe" },
  { id: "arena", label: "Arena", icon: Swords, hint: "Do battle" },
] as const;

const CELESTIAL_BG =
  "radial-gradient(ellipse 42% 34% at 14% 6%, rgba(245,158,11,0.10), transparent), radial-gradient(ellipse 38% 32% at 88% 10%, rgba(56,189,248,0.10), transparent), radial-gradient(ellipse 60% 45% at 50% 112%, rgba(217,119,6,0.08), transparent), #0B0F19";

const STARS =
  "radial-gradient(1px 1px at 12% 18%, rgba(226,232,240,0.7), transparent), radial-gradient(1px 1px at 32% 62%, rgba(125,211,252,0.6), transparent), radial-gradient(1.5px 1.5px at 55% 28%, rgba(226,232,240,0.5), transparent), radial-gradient(1px 1px at 72% 72%, rgba(251,191,36,0.5), transparent), radial-gradient(1px 1px at 85% 35%, rgba(226,232,240,0.6), transparent), radial-gradient(1px 1px at 22% 85%, rgba(226,232,240,0.5), transparent), radial-gradient(1.5px 1.5px at 65% 92%, rgba(125,211,252,0.4), transparent)";

export default function V0Template() {
  const [view, setView] = useState<View>("path");

  return (
    <main
      className="relative min-h-[100dvh] overflow-hidden"
      style={{ background: CELESTIAL_BG }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ backgroundImage: STARS }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/4 hidden h-96 w-96 rounded-full lg:block"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.10), transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-1/4 hidden h-96 w-96 rounded-full lg:block"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.10), transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <div className="relative z-[1] flex min-h-[100dvh] flex-col lg:flex-row">
        {/* Desktop sidebar navigation */}
        <aside
          className="hidden shrink-0 flex-col justify-between border-r border-[rgba(148,163,184,0.12)] px-5 py-8 lg:flex lg:w-72"
          style={{ background: "rgba(11,15,25,0.55)", backdropFilter: "blur(16px)" }}
        >
          <div>
            <div className="mb-10 flex flex-col items-start">
              <h1
                className="font-arabic text-3xl font-bold text-amber-200"
                dir="rtl"
                lang="ar"
              >
                {"نَوَاة"}
              </h1>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.4em] text-slate-400">
                Nawā
              </p>
            </div>
            <nav className="flex flex-col gap-2">
              {VIEWS.map(({ id, label, icon: Icon, hint }) => {
                const active = view === id;
                return (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors",
                      active ? "text-[#160D02]" : "text-slate-300 hover:text-white",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill-desktop"
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: "linear-gradient(160deg, #FBBF24, #D97706)",
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.45), 0 10px 26px -8px rgba(245,158,11,0.6)",
                        }}
                        transition={{ type: "spring", stiffness: 480, damping: 32 }}
                      />
                    )}
                    <span className="relative z-[1] flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold leading-tight">{label}</span>
                        <span
                          className={cn(
                            "text-[11px] leading-tight",
                            active ? "text-[#160D02]/70" : "text-slate-500",
                          )}
                        >
                          {hint}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            A gamified path to reading the Qur&apos;an in its own tongue.
          </p>
        </aside>

        {/* Mobile top bar + toggle */}
        <div className="flex flex-col items-center px-3 pt-5 lg:hidden">
          <div className="mb-4 flex flex-col items-center">
            <h1
              className="font-arabic text-2xl font-bold text-amber-200"
              dir="rtl"
              lang="ar"
            >
              {"نَوَاة"}
            </h1>
            <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-slate-400">
              Nawā
            </p>
          </div>
          <div
            className="flex w-full max-w-md items-center gap-1 rounded-2xl p-1.5"
            style={{
              background: "rgba(15,23,42,0.7)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(245,158,11,0.18)",
            }}
          >
            {VIEWS.map(({ id, label, icon: Icon }) => {
              const active = view === id;
              return (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                    active ? "text-[#160D02]" : "text-slate-400 hover:text-slate-200",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill-mobile"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "linear-gradient(160deg, #FBBF24, #D97706)",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 20px -6px rgba(245,158,11,0.6)",
                      }}
                      transition={{ type: "spring", stiffness: 480, damping: 32 }}
                    />
                  )}
                  <span className="relative z-[1] flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Centered game stage */}
        <div className="flex flex-1 items-stretch justify-center px-3 py-4 lg:items-center lg:px-8 lg:py-8">
          <div className="relative h-[calc(100dvh-9.5rem)] w-full max-w-md overflow-hidden rounded-[2rem] border border-[rgba(148,163,184,0.14)] bg-[rgba(11,15,25,0.6)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_30px_70px_-30px_rgba(0,0,0,0.9)] lg:h-[calc(100dvh-4rem)] lg:max-w-2xl lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="h-full"
              >
                {view === "path" && <PathView />}
                {view === "lesson" && <LessonView />}
                {view === "arena" && <ArenaView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
