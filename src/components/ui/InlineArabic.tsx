"use client";

import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const ARABIC_INLINE =
  "font-arabic text-2xl font-bold text-amber-400 mx-2 align-middle drop-shadow-[0_0_8px_rgba(245,158,11,0.25)]";

/**
 * Inline Arabic inside English copy.
 */
export function InlineArabic({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span dir="rtl" lang="ar" className={cn(ARABIC_INLINE, className)}>
      {children}
    </span>
  );
}

const ARABIC_RUN =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u064B-\u065F\u0670ـ_]+/;

const TOKEN_SPLIT = /(\*\*[^*]+\*\*|[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u064B-\u065F\u0670ـ_]+)/;

function parseInstructionTokens(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const parts = text.split(TOKEN_SPLIT);

  parts.forEach((part, index) => {
    if (!part) return;

    if (part.startsWith("**") && part.endsWith("**")) {
      const anchor = part.slice(2, -2);
      nodes.push(
        <strong key={`bold-${index}`} className="font-bold text-amber-400">
          {ARABIC_RUN.test(anchor) ? (
            <InlineArabic className="mx-0">{anchor}</InlineArabic>
          ) : (
            anchor
          )}
        </strong>,
      );
      return;
    }

    if (ARABIC_RUN.test(part)) {
      nodes.push(<InlineArabic key={`ar-${index}`}>{part}</InlineArabic>);
      return;
    }

    nodes.push(<Fragment key={`en-${index}`}>{part}</Fragment>);
  });

  return nodes;
}

/** Instruction copy: **bold anchors** + inline Arabic that wraps naturally. */
export function InstructionText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={cn("leading-relaxed text-lg text-slate-300", className)}>
      {parseInstructionTokens(text)}
    </span>
  );
}

/** Explanation panel for step copy — supports `•` bullet lines. */
export function LessonTooltip({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const isBullets = lines.length > 1 && lines.every((line) => /^[•\-]\s/.test(line));

  return (
    <div className={cn("border-s border-amber-500/30 ps-4", className)}>
      <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-amber-500/80 uppercase">
        How it works
      </p>
      {isBullets ? (
        <ul className="space-y-2.5 text-base leading-relaxed text-slate-300">
          {lines.map((line, index) => (
            <li key={index} className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-amber-500/70" aria-hidden>
                •
              </span>
              <span>{parseInstructionTokens(line.replace(/^[•\-]\s*/, ""))}</span>
            </li>
          ))}
        </ul>
      ) : (
        <InstructionText text={text} />
      )}
    </div>
  );
}
