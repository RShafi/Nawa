"use client";

import { cn } from "@/lib/utils";
import { stripDiacritics } from "@/lib/arabic-utils";
import { useNawaStore } from "@/store/nawa-store";

type ArabicTextProps = {
  children: string;
  className?: string;
  as?: "span" | "p" | "div";
};

export function ArabicText({ children, className, as: Tag = "span" }: ArabicTextProps) {
  const mode = useNawaStore((s) => s.tashkeelMode);
  const text = stripDiacritics(children, mode);

  return (
    <Tag dir="rtl" lang="ar" className={cn("font-arabic", className)}>
      {text}
    </Tag>
  );
}
