"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  getConnectedForm,
  type CursivePosition,
} from "@/lib/arabic-utils";
import { cn } from "@/lib/utils";

/** Deliberate morph timing — slow enough to track each shape change. */
export const CURSIVE_MORPH_DURATION = 1.2;

export type CursiveMorphNodeProps = {
  letter: string;
  position: CursivePosition;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Gentle horizontal slide (px) — used when a letter joins its neighbor. */
  slideX?: number;
};

const SIZE_CLASS: Record<NonNullable<CursiveMorphNodeProps["size"]>, string> = {
  sm: "text-3xl md:text-4xl",
  md: "text-4xl md:text-5xl",
  lg: "text-6xl md:text-7xl lg:text-8xl",
  xl: "text-7xl md:text-8xl lg:text-9xl",
};

function showsConnectingArm(position: CursivePosition): boolean {
  return position === "initial" || position === "medial";
}

export function CursiveMorphNode({
  letter,
  position,
  className,
  size = "lg",
  slideX = 0,
}: CursiveMorphNodeProps) {
  const glyph = getConnectedForm(letter, position);
  const arm = showsConnectingArm(position);

  return (
    <motion.span
      layout={false}
      animate={{ x: slideX }}
      transition={{ duration: CURSIVE_MORPH_DURATION, ease: "easeInOut" }}
      className={cn("font-arabic relative inline-flex items-center justify-center", className)}
      dir="rtl"
    >
      <AnimatePresence>
        {arm ? (
          <motion.span
            key="connect-arm"
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-0 z-0 -translate-y-1/2"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: CURSIVE_MORPH_DURATION, ease: "easeInOut" }}
            style={{ transformOrigin: "right center" }}
          >
            <span className="block h-[2px] w-8 -translate-x-full rounded-full bg-gradient-to-l from-amber-400/90 via-amber-500/50 to-transparent shadow-[0_0_10px_rgba(245,158,11,0.45)] md:w-10" />
            <motion.span
              className="absolute top-1/2 left-0 size-1.5 -translate-x-[105%] -translate-y-1/2 rounded-full bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.85 }}
              transition={{
                duration: CURSIVE_MORPH_DURATION,
                ease: "easeInOut",
                delay: CURSIVE_MORPH_DURATION * 0.4,
              }}
            />
          </motion.span>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        <motion.span
          key={`${letter}-${position}-${glyph}`}
          initial={{ opacity: 0.85, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.85, scale: 1 }}
          transition={{ duration: CURSIVE_MORPH_DURATION, ease: "easeInOut" }}
          className={cn(
            "relative z-10 block font-bold",
            SIZE_CLASS[size],
            arm
              ? "text-amber-50 drop-shadow-[0_0_16px_rgba(245,158,11,0.45)]"
              : position === "final"
                ? "text-amber-100 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                : "text-amber-200/90 drop-shadow-[0_0_10px_rgba(245,158,11,0.25)]",
          )}
        >
          {glyph}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
