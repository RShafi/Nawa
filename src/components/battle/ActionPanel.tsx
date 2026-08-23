"use client";

import { Droplets, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBattleStore } from "@/store/useBattleStore";

const REDRAW_COST = 2;

export function ActionPanel({
  locked = false,
  forceHighlightRedraw = false,
  onRedraw,
  onFlickInk,
}: {
  locked?: boolean;
  forceHighlightRedraw?: boolean;
  onRedraw?: () => void;
  onFlickInk?: () => void;
}) {
  const currentInk = useBattleStore((s) => s.currentInk);
  const maxInk = useBattleStore((s) => s.maxInk);
  const redrawHand = useBattleStore((s) => s.redrawHand);
  const flickInk = useBattleStore((s) => s.flickInk);
  const victory = useBattleStore((s) => s.victory);
  const defeat = useBattleStore((s) => s.defeat);
  const started = useBattleStore((s) => s.started);

  const disabled = locked || !started || victory || defeat;
  const canRedraw = currentInk >= REDRAW_COST;

  return (
    <div
      className={cn(
        "glass-panel flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 px-2.5 py-1.5",
        forceHighlightRedraw && "ring-2 ring-amber-400/70",
      )}
    >
      <div className="flex items-center gap-1.5 text-xs text-amber-100/90">
        <Droplets className="size-3.5 text-amber-300" />
        <span className="font-mono tabular-nums">
          Ink {currentInk}/{maxInk}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || !canRedraw}
          className={cn(
            "h-7 border-white/15 bg-white/5 px-2 text-[11px]",
            forceHighlightRedraw && "border-amber-400/60 bg-amber-500/15 text-amber-50",
          )}
          onClick={() => (onRedraw ? onRedraw() : redrawHand())}
        >
          <RefreshCw className="size-3" />
          Redraw (−{REDRAW_COST})
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          className="h-7 border-white/15 bg-white/5 px-2 text-[11px]"
          onClick={() => (onFlickInk ? onFlickInk() : flickInk())}
        >
          <Sparkles className="size-3" />
          Flick (2)
        </Button>
      </div>
    </div>
  );
}

export { REDRAW_COST };
