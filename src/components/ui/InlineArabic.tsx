"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Inline Arabic inside English copy — Naskh, bumped size, Celestial Amber.
 */
export function InlineArabic({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span
      dir="rtl"
      lang="ar"
      className={cn(
        "font-arabic text-celestial-amber mx-0.5 inline-block align-middle text-2xl leading-none",
        className,
      )}
    >
      {children}
    </span>
  );
}

const ARABIC_SPLIT =
  /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u064B-\u065F\u0670ـ_]+)/;

const ARABIC_TEST = /[\u0600-\u06FF]/;

/** Split English instructions and wrap Arabic runs in InlineArabic. */
export function InstructionText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parts = text.split(ARABIC_SPLIT);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (ARABIC_TEST.test(part)) {
          return <InlineArabic key={`ar-${i}`}>{part}</InlineArabic>;
        }
        return <Fragment key={`en-${i}`}>{part}</Fragment>;
      })}
    </span>
  );
}
