"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

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

/**
 * Astral action button — a refined frosted control with a warm gradient face,
 * a thin luminous top highlight, a soft ambient glow, and a subtle spring press
 * (translate + glow collapse) rather than a heavy cartoon edge shadow.
 */
const variantStyles: Record<
  Variant,
  { face: string; edge: string; glow: string }
> = {
  // gold / amber — primary astral action
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
  // lapis / celestial cyan
  cyan: {
    face: "text-[#04121C] bg-gradient-to-b from-[#7DD3FC] to-[#0EA5E9]",
    edge: "inset 0 1px 0 0 rgba(255,255,255,0.5), 0 3px 0 0 #075985",
    glow: "0 10px 30px -8px rgba(56,189,248,0.55)",
  },
  // muted emerald — success
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

export function Push3DButton({
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
