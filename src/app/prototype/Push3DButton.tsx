"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "amber" | "neutral" | "danger";

interface Push3DButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { face: string; edge: string }> = {
  primary: {
    face: "bg-primary text-primary-foreground",
    // darker emerald edge for the pressable depth
    edge: "0 6px 0 0 oklch(0.55 0.13 160), 0 6px 24px -4px oklch(0.78 0.14 160 / 55%)",
  },
  amber: {
    face: "bg-[oklch(0.82_0.14_85)] text-[oklch(0.2_0.04_85)]",
    edge: "0 6px 0 0 oklch(0.58 0.13 70), 0 6px 24px -4px oklch(0.82 0.14 85 / 55%)",
  },
  danger: {
    face: "bg-destructive text-white",
    edge: "0 6px 0 0 oklch(0.48 0.16 25), 0 6px 24px -4px oklch(0.68 0.18 25 / 55%)",
  },
  neutral: {
    face: "bg-secondary text-secondary-foreground border border-border",
    edge: "0 6px 0 0 oklch(0.13 0.02 265), 0 6px 20px -6px oklch(0 0 0 / 60%)",
  },
};

/**
 * Tactile 3D button — a heavy colored "edge" box-shadow makes the button look
 * raised; on :active it translates down and the shadow collapses so it reads as
 * a physical press.
 */
export function Push3DButton({
  children,
  variant = "primary",
  fullWidth,
  className,
  style,
  ...props
}: Push3DButtonProps) {
  const v = variantStyles[variant];
  return (
    <button
      {...props}
      className={cn(
        "group relative inline-flex select-none items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold tracking-wide",
        "transition-[transform,box-shadow] duration-100 ease-out will-change-transform",
        "translate-y-0 active:translate-y-[6px] active:[box-shadow:none]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0",
        v.face,
        fullWidth && "w-full",
        className,
      )}
      style={{ boxShadow: v.edge, ...style }}
    >
      {children}
    </button>
  );
}
