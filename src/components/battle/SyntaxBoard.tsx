"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { InkPoolBar } from "@/components/battle/InkPoolBar";
import { HUD_HAND, HUD_MIDDLE } from "@/components/battle/BattleStage";
import { WordCardView } from "@/components/battle/WordCardView";
import { Button } from "@/components/ui/button";
import { syntaxMultiplier } from "@/data/combatDictionary";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";
import { useBattleStore } from "@/store/useBattleStore";

/** Syntax / Spell Chamber — arcane hextech receptacle; overflow visible for diacritics & glows. */
export const SYNTAX_SHELL =
  "relative flex h-[15vh] min-h-[100px] max-h-[140px] w-full flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-black/40 p-2 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]";

/** Grid rows 2–3 for free-play Arena. */
export function SyntaxBoard() {
  const hand = useBattleStore((s) => s.hand);
  const currentSentence = useBattleStore((s) => s.currentSentence);
  const syntaxValid = useBattleStore((s) => s.syntaxValid);
  const syntaxError = useBattleStore((s) => s.syntaxError);
  const ink = useBattleStore((s) => s.ink);
  const maxInk = useBattleStore((s) => s.maxInk);
  const playCard = useBattleStore((s) => s.playCard);
  const removeCardFromSyntax = useBattleStore((s) => s.removeCardFromSyntax);
  const clearSentence = useBattleStore((s) => s.clearSentence);
  const redrawHand = useBattleStore((s) => s.redrawHand);
  const castSentence = useBattleStore((s) => s.castSentence);
  const victory = useBattleStore((s) => s.victory);
  const defeat = useBattleStore((s) => s.defeat);
  const combatState = useBattleStore((s) => s.combatState);
  const locked = victory || defeat || combatState !== "idle";
  const { playTap, playSnap, playCast, playError } = useSoundEffects();

  const mult = currentSentence.length ? syntaxMultiplier(currentSentence.length) : 0;

  return (
    <LayoutGroup id="syntax-chamber">
      <div className={HUD_MIDDLE}>
        <SyntaxChamber
          cards={currentSentence}
          mult={mult}
          syntaxValid={syntaxValid}
          syntaxError={syntaxError}
          onClear={() => {
            playTap();
            clearSentence();
          }}
          onRemove={(cardId) => {
            playTap();
            removeCardFromSyntax(cardId);
          }}
        />
      </div>

      <div className={HUD_HAND}>
        <div className="mb-2 flex flex-row flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={locked || currentSentence.length === 0}
            className={cn(
              "font-display h-8 min-w-[8rem] shrink-0 gap-1.5 text-xs font-bold tracking-wide sm:h-9 sm:text-sm",
              syntaxValid
                ? "bg-celestial-amber text-obsidian shadow-[0_0_18px_rgba(245,158,11,0.35)] hover:bg-amber-400"
                : "bg-rose-600 text-white hover:bg-rose-500",
            )}
            onClick={() => {
              playCast();
              if (!syntaxValid) playError();
              castSentence();
            }}
          >
            <Sparkles className="size-3.5" />
            Cast{mult > 0 ? ` (${mult}×)` : ""}
          </Button>

          <InkPoolBar
            ink={ink}
            maxInk={maxInk}
            redrawDisabled={locked}
            className="w-auto max-w-none"
            onRedraw={() => {
              playTap();
              const res = redrawHand();
              if (!res.ok) playError();
              else playSnap();
            }}
          />
        </div>

        <div className="mx-auto flex w-full flex-nowrap items-end justify-center gap-0 overflow-visible md:gap-2">
          {hand.map((card) => (
            <WordCardView
              key={card.id}
              card={card}
              compact
              inHand
              layoutId={`syntax-card-${card.id}`}
              dimmed={locked || ink < 1}
              onClick={() => {
                if (locked) return;
                playTap();
                const res = playCard(card.id);
                if (!res.ok) playError();
                else playSnap();
              }}
            />
          ))}
          {hand.length === 0 ? (
            <p className="py-2 text-sm text-white/35">Hand empty — try Redraw</p>
          ) : null}
        </div>
      </div>
    </LayoutGroup>
  );
}

export function SyntaxChamber({
  cards,
  mult = 0,
  syntaxValid = true,
  syntaxError = null,
  onClear,
  onRemove,
  className,
}: {
  cards: import("@/data/combatDictionary").WordCard[];
  mult?: number;
  syntaxValid?: boolean;
  syntaxError?: string | null;
  onClear?: () => void;
  onRemove?: (cardId: string) => void;
  className?: string;
}) {
  const [slotFlash, setSlotFlash] = useState(false);
  const prevCount = useRef(cards.length);

  useEffect(() => {
    if (cards.length > prevCount.current) {
      setSlotFlash(true);
      const timer = window.setTimeout(() => setSlotFlash(false), 450);
      prevCount.current = cards.length;
      return () => window.clearTimeout(timer);
    }
    prevCount.current = cards.length;
  }, [cards.length]);

  return (
    <div
      className={cn(
        SYNTAX_SHELL,
        cards.length > 0 && syntaxValid && "border-amber-400/45 shadow-[inset_0_0_40px_rgba(0,0,0,0.8),0_0_24px_-8px_rgba(16,185,129,0.35)]",
        cards.length > 0 && !syntaxValid && "border-rose-400/45 shadow-[inset_0_0_40px_rgba(0,0,0,0.8),0_0_20px_-8px_rgba(244,63,94,0.3)]",
        className,
      )}
    >
      <AnimatePresence>
        {slotFlash ? (
          <motion.div
            key="slot-flash"
            initial={{ opacity: 0.65 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-amber-500/10"
          />
        ) : null}
      </AnimatePresence>

      <div className="mb-0.5 flex shrink-0 items-center justify-between gap-2">
        <p className="font-display text-[clamp(0.55rem,1.2vh,0.65rem)] tracking-[0.18em] text-amber-200/70 uppercase">
          Spell Chamber
        </p>
        <div className="flex items-center gap-2">
          {mult > 0 ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[clamp(0.65rem,1.4vh,0.75rem)] font-bold",
                syntaxValid ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200",
              )}
            >
              {mult}×
            </span>
          ) : null}
          {cards.length > 0 && onClear ? (
            <button
              type="button"
              className="text-[clamp(0.55rem,1.2vh,0.65rem)] text-white/40 hover:text-white/70"
              onClick={onClear}
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div
        dir="rtl"
        className="flex h-full min-h-0 w-full flex-1 flex-row flex-wrap items-center justify-center gap-2 p-2 md:gap-4"
      >
        <AnimatePresence mode="popLayout">
          {cards.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 text-center text-[clamp(0.7rem,1.6vh,0.875rem)] text-amber-100/70"
            >
              Spell Chamber — tap cards to weave
            </motion.p>
          ) : (
            cards.map((card) => (
              <motion.button
                key={card.id}
                type="button"
                layout
                layoutId={`syntax-card-${card.id}`}
                initial={{ opacity: 0, scale: 0.88, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.82, y: 12 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                title="Tap to unsocket"
                disabled={!onRemove}
                onClick={onRemove ? () => onRemove(card.id) : undefined}
                className={cn(
                  "group relative h-full max-h-full shrink-0 rounded-xl outline-none",
                  onRemove &&
                    "cursor-pointer focus-visible:ring-2 focus-visible:ring-red-400/60",
                )}
              >
                <WordCardView
                  card={card}
                  compact
                  inSlot
                  isSlotted
                  unsocketable={Boolean(onRemove)}
                  as="div"
                />
                {onRemove ? (
                  <span className="pointer-events-none absolute inset-0 rounded-xl bg-red-500/0 transition group-hover:bg-red-500/10" />
                ) : null}
                {onRemove ? (
                  <span className="pointer-events-none absolute -top-5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[9px] text-red-200/0 opacity-0 transition group-hover:text-red-200/90 group-hover:opacity-100">
                    Tap to unsocket
                  </span>
                ) : null}
                {onRemove ? (
                  <span className="pointer-events-none absolute top-0.5 end-0.5 flex size-4 items-center justify-center rounded-full bg-red-950/80 text-red-200/80 opacity-0 transition group-hover:opacity-100">
                    <X className="size-2.5" />
                  </span>
                ) : null}
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>
      {!syntaxValid && syntaxError ? (
        <p className="shrink-0 truncate text-center text-[clamp(0.55rem,1.2vh,0.65rem)] text-rose-200">
          {syntaxError}
        </p>
      ) : null}
    </div>
  );
}
