"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type GrammarLoreTooltipProps = {
  note: string;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
};

/** In-world grammar lore — dotted underline + amber lore panel on hover. */
export function GrammarLoreTooltip({
  note,
  children,
  className,
  side = "top",
}: GrammarLoreTooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "cursor-help border-b border-dotted border-amber-500/50 text-inherit transition hover:border-amber-400/80 hover:text-amber-100",
            className,
          )}
        >
          {children}
        </button>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={8}
          className={cn(
            "z-50 max-w-xs rounded-lg border border-amber-500/50 bg-slate-900 p-3 text-sm text-amber-100 shadow-[0_0_24px_-4px_rgba(245,158,11,0.45)]",
            "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            <p className="font-serif text-[10px] tracking-[0.18em] text-amber-400/80 uppercase">
              Scribe&apos;s Note
            </p>
            <p className="mt-1.5 leading-relaxed text-amber-50/95">{note}</p>
          </motion.div>
          <TooltipPrimitive.Arrow className="fill-slate-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
