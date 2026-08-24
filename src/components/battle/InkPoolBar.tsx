"use client";

import { Droplet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REDRAW_INK_COST } from "@/store/useBattleStore";
import { cn } from "@/lib/utils";

/** Compact Ink (حِبْر) counter + Redraw — sits inline with Cast in Row 3. */
export function InkPoolBar({
  ink,
  maxInk,
  onRedraw,
  redrawDisabled = false,
  highlight = false,
  className,
}: {
  ink: number;
  maxInk: number;
  onRedraw?: () => void;
  redrawDisabled?: boolean;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-row flex-wrap items-center justify-center gap-2",
        highlight &&
          "relative z-20 rounded-xl ring-4 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.55)] animate-pulse",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-500/10 px-2.5 py-1">
        <Droplet className="size-3.5 fill-amber-300 text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
        <span className="text-[clamp(0.65rem,1.4vh,0.75rem)] font-semibold tracking-wide text-amber-100/90">
          Ink{" "}
          <span className="font-mono text-amber-200">
            {ink}/{maxInk}
          </span>
        </span>
        <span className="text-[clamp(0.55rem,1.1vh,0.65rem)] text-amber-200/50" dir="rtl" lang="ar">
          حِبْر
        </span>
      </div>

      {onRedraw ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={redrawDisabled || ink < REDRAW_INK_COST}
          className={cn(
            "h-8 border-amber-400/30 bg-black/30 px-2.5 text-[clamp(0.65rem,1.4vh,0.75rem)] text-amber-100 hover:bg-amber-500/15",
            highlight && "ring-2 ring-amber-300/80",
          )}
          onClick={onRedraw}
        >
          <RefreshCw className="size-3.5" />
          Redraw ({REDRAW_INK_COST})
        </Button>
      ) : null}
    </div>
  );
}
