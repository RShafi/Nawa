"use client";

import { Check, Lock, MapPin, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LessonStatus } from "@/types/arabic";

type PathNodeProps = {
  status: LessonStatus;
  title: string;
  description: string;
  themeColor?: string;
  size?: "sm" | "md";
  /** Unit hubs use a pin marker; lessons use play/lock/check. */
  kind?: "lesson" | "unit";
  onClick?: () => void;
};

export function PathNode({
  status,
  title,
  description,
  themeColor = "var(--primary)",
  size = "md",
  kind = "lesson",
  onClick,
}: PathNodeProps) {
  const dim = size === "sm" ? "size-11 sm:size-12" : "size-14 sm:size-16";
  const locked = status === "locked";
  const completed = status === "completed";
  const active = status === "active";
  const isUnit = kind === "unit";

  const node = (
    <motion.button
      type="button"
      disabled={locked && !isUnit}
      onClick={onClick}
      whileHover={locked && !isUnit ? undefined : { scale: 1.06 }}
      whileTap={locked && !isUnit ? undefined : { scale: 0.96 }}
      className={cn(
        "relative z-10 flex items-center justify-center rounded-full border-2 shadow-sm transition-colors",
        dim,
        locked && !isUnit && "cursor-not-allowed border-muted-foreground/25 bg-muted text-muted-foreground",
        isUnit && locked && "border-muted-foreground/30 bg-background text-muted-foreground",
        isUnit && !locked && !completed && "bg-background",
        completed && "border-transparent text-primary-foreground",
        active && !isUnit && "border-transparent text-primary-foreground",
        isUnit && active && "text-foreground",
      )}
      style={
        completed || (active && !isUnit)
          ? {
              backgroundColor: themeColor,
              boxShadow:
                active && !isUnit
                  ? `0 0 0 6px color-mix(in oklab, ${themeColor} 25%, transparent)`
                  : undefined,
            }
          : isUnit && !locked
            ? { borderColor: themeColor, color: themeColor }
            : undefined
      }
      aria-label={title}
    >
      {active && !isUnit ? (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${themeColor}` }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      {isUnit ? (
        completed ? (
          <Check className="size-5 stroke-[2.5]" />
        ) : (
          <MapPin className="size-5" />
        )
      ) : null}
      {!isUnit && locked ? <Lock className="size-4" /> : null}
      {!isUnit && completed ? <Check className="size-5 stroke-[2.5]" /> : null}
      {!isUnit && active ? <Play className="size-5 fill-current ps-0.5" /> : null}
    </motion.button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <p className="font-medium">{title}</p>
        <p className="text-background/80 mt-0.5 text-xs">{description}</p>
        <p className="mt-1 text-[10px] tracking-wide uppercase opacity-70">
          {isUnit ? "unit" : status}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
