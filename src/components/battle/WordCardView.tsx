"use client";

import { motion } from "framer-motion";
import { SCHOOL_META, type WordCard } from "@/data/combatDictionary";
import { InlineArabic } from "@/components/ui/InlineArabic";
import { cn } from "@/lib/utils";

export function WordCardView({
  card,
  selected = false,
  dimmed = false,
  highlight = false,
  compact = false,
  elevated = false,
  locked = false,
  /** Hand row: overlap on mobile, gap on desktop, hover pop. */
  inHand = false,
  /** Syntax chamber: horizontal rune tile. */
  inSlot = false,
  /** Alias for chamber seating — same as inSlot. */
  isSlotted = false,
  as = "button",
  onClick,
  className,
}: {
  card: WordCard;
  selected?: boolean;
  dimmed?: boolean;
  highlight?: boolean;
  compact?: boolean;
  elevated?: boolean;
  locked?: boolean;
  inHand?: boolean;
  inSlot?: boolean;
  isSlotted?: boolean;
  as?: "button" | "div";
  onClick?: () => void;
  className?: string;
}) {
  /** Chamber mode: flexible horizontal "rune tile" (not playing-card aspect). */
  const runeTile = inSlot || isSlotted || (compact && !inHand);
  const meta = SCHOOL_META[card.school];
  const interactive = Boolean(onClick) && !locked && !dimmed;
  const Tag = as === "div" ? "div" : "button";

  return (
    <motion.div
      className={cn(
        "relative",
        inHand &&
          "z-0 -ml-4 shrink-0 first:ml-0 sm:-ml-2 sm:first:ml-0 md:ml-0 md:px-0.5",
        runeTile && "h-full max-h-full shrink-0",
        !inHand && !runeTile && "shrink-0",
        elevated && "z-50",
        dimmed && !elevated && "opacity-35",
      )}
      whileHover={
        inHand || interactive
          ? { y: -12, zIndex: 50, transition: { type: "spring", stiffness: 400, damping: 22 } }
          : undefined
      }
      style={elevated || highlight ? { zIndex: 50 } : undefined}
    >
      <Tag
        type={as === "button" ? "button" : undefined}
        role={as === "div" && interactive ? "button" : undefined}
        tabIndex={as === "div" && interactive ? 0 : undefined}
        disabled={as === "button" ? !interactive : undefined}
        onClick={interactive ? onClick : undefined}
        onKeyDown={
          as === "div" && interactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        className={cn(
          "glass-tablet relative text-center transition",
          meta.glow,
          runeTile
            ? "flex h-full w-auto min-w-[100px] flex-col items-center justify-center px-4 md:min-w-[120px] md:px-6"
            : "flex h-[22vh] min-h-[110px] max-h-[180px] w-full aspect-[2.5/3.5] flex-col justify-between overflow-hidden p-2 md:p-3",
          selected && "scale-[1.02] ring-2 ring-amber-300/90",
          highlight &&
            "z-[60] animate-pulse ring-4 ring-amber-400 shadow-[0_0_28px_-2px_rgba(245,158,11,0.85)]",
          interactive && "cursor-pointer hover:brightness-110",
          !interactive && "cursor-default",
          className,
        )}
      >
        {!runeTile ? (
          <span
            className={cn(
              "self-start rounded px-1 py-0.5 text-[clamp(0.55rem,1.2vh,0.65rem)] font-bold tracking-wide uppercase",
              meta.color,
            )}
          >
            {meta.label}
          </span>
        ) : null}

        <div
          className={cn(
            "flex flex-col items-center",
            runeTile ? "justify-center gap-1" : "min-h-0 flex-1 justify-center gap-0.5 px-0.5",
          )}
        >
          <InlineArabic
            className={cn(
              "block text-amber-50",
              runeTile
                ? "text-2xl leading-relaxed whitespace-nowrap md:text-3xl"
                : "text-[clamp(1.5rem,3.5vh,2.5rem)] leading-tight whitespace-nowrap",
            )}
          >
            {card.word}
          </InlineArabic>
          {!runeTile ? (
            <span className="line-clamp-2 w-full pb-1 text-[clamp(0.65rem,1.5vh,0.875rem)] leading-tight text-slate-300">
              {card.translation}
            </span>
          ) : null}
        </div>

        <span
          className={cn(
            "tracking-wide uppercase",
            runeTile
              ? "mt-0.5 text-[clamp(0.55rem,1.2vh,0.7rem)] font-semibold text-white/55"
              : "text-[clamp(0.55rem,1.1vh,0.65rem)] text-white/40",
          )}
        >
          {card.partOfSpeech}
        </span>
      </Tag>
    </motion.div>
  );
}

export function WordCardUnlockCelebration({
  card,
  onDone,
}: {
  card: WordCard;
  onDone?: () => void;
}) {
  const meta = SCHOOL_META[card.school];

  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <div className={cn("rounded-2xl border px-6 py-5 shadow-lg", meta.glow)}>
        <p className={cn("text-xs font-semibold tracking-wide uppercase", meta.color)}>
          {meta.label} · {card.partOfSpeech}
        </p>
        <InlineArabic className="mt-2 block text-4xl">{card.word}</InlineArabic>
        <p className="mt-2 text-sm">{card.translation}</p>
        <p className="text-muted-foreground mt-1 text-[11px]">{meta.effect}</p>
      </div>
      <p className="text-base font-semibold text-emerald-300">Card unlocked and added to your Deck!</p>
      {onDone ? (
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black"
        >
          Continue
        </button>
      ) : null}
    </div>
  );
}
