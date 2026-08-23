"use client";

import { cn } from "@/lib/utils";
import { stripDiacritics } from "@/lib/arabic-utils";
import { useNawaStore } from "@/store/nawa-store";

type ArabicTextProps = {
  children: string;
  className?: string;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3";
  /**
   * Display size. Default `display` = text-4xl + leading-loose for crystal-clear tashkeel.
   * Use `inherit` when nesting inside battle chrome that already sets size.
   */
  size?: "display" | "lg" | "md" | "sm" | "inherit";
  /** Skip tashkeel stripping (always show full vowels) */
  forceFull?: boolean;
};

const SIZE: Record<Exclude<ArabicTextProps["size"], undefined>, string> = {
  display: "text-4xl leading-loose sm:text-5xl",
  lg: "text-3xl leading-loose sm:text-4xl",
  md: "text-2xl leading-relaxed",
  sm: "text-xl leading-relaxed",
  inherit: "",
};

/**
 * Dedicated Arabic typography — Naskh, large defaults, loose leading for diacritics.
 */
export function ArabicText({
  children,
  className,
  as: Tag = "span",
  size = "display",
  forceFull = false,
}: ArabicTextProps) {
  const mode = useNawaStore((s) => s.tashkeelMode);
  const text = forceFull ? children : stripDiacritics(children, mode);

  return (
    <Tag
      dir="rtl"
      lang="ar"
      className={cn(
        "font-arabic antialiased",
        SIZE[size ?? "display"],
        className,
      )}
    >
      {text}
    </Tag>
  );
}
