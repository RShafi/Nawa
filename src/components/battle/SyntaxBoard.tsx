"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { InkPoolBar } from "@/components/battle/InkPoolBar";
import { HUD_HAND, HUD_MIDDLE } from "@/components/battle/BattleStage";
import { WordCardView } from "@/components/battle/WordCardView";
import { Button } from "@/components/ui/button";
import { syntaxMultiplier } from "@/data/combatDictionary";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";
import { useBattleStore } from "@/store/useBattleStore";

/** Syntax / Spell Chamber — vh-scaled; overflow visible for diacritics & glows. */
export const SYNTAX_SHELL =
  "flex h-[15vh] min-h-[100px] max-h-[140px] w-full flex-col rounded-xl border-2 border-dashed border-amber-500/40 bg-slate-900/50 p-2";

/** Grid rows 2–3 for free-play Arena. */
export function SyntaxBoard() {
  const hand = useBattleStore((s) => s.hand);
  const currentSentence = useBattleStore((s) => s.currentSentence);
  const syntaxValid = useBattleStore((s) => s.syntaxValid);
  const syntaxError = useBattleStore((s) => s.syntaxError);
  const ink = useBattleStore((s) => s.ink);
  const maxInk = useBattleStore((s) => s.maxInk);
  const playCard = useBattleStore((s) => s.playCard);
  const removeFromSentence = useBattleStore((s) => s.removeFromSentence);
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
    <>
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
          onRemove={(i) => {
            playTap();
            removeFromSentence(i);
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
              "h-8 min-w-[8rem] shrink-0 gap-1.5 text-xs font-bold sm:h-9 sm:text-sm",
              syntaxValid
                ? "bg-celestial-amber text-obsidian hover:bg-amber-400"
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
    </>
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
  onRemove?: (index: number) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        SYNTAX_SHELL,
        cards.length > 0 && syntaxValid && "border-solid border-emerald-400/45",
        cards.length > 0 && !syntaxValid && "border-solid border-rose-400/55",
        className,
      )}
    >
      <div className="mb-0.5 flex shrink-0 items-center justify-between gap-2">
        <p className="text-[clamp(0.55rem,1.2vh,0.65rem)] tracking-[0.14em] text-amber-200/55 uppercase">
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
            cards.map((card, i) => (
              <motion.div
                key={`${card.id}-${i}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="relative h-full max-h-full shrink-0"
              >
                <WordCardView
                  card={card}
                  compact
                  inSlot
                  isSlotted
                  as="div"
                  onClick={onRemove ? () => onRemove(i) : undefined}
                />
                {onRemove ? (
                  <span className="pointer-events-none absolute top-0.5 end-0.5 flex size-3 items-center justify-center rounded-full bg-black/70 text-white/70">
                    <X className="size-2" />
                  </span>
                ) : null}
              </motion.div>
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
