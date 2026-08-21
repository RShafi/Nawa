"use client";

import { PATTERNS } from "@/data/mockPatterns";
import { DERIVED_WORDS } from "@/data/mockRoots";
import { ArabicText } from "@/components/common/ArabicText";
import { hasDerivedWord } from "@/lib/arabic-utils";
import { cn } from "@/lib/utils";
import { useNawaStore } from "@/store/nawa-store";

export function PatternMatrix() {
  const selectedRootId = useNawaStore((s) => s.selectedRootId);
  const selectedPatternId = useNawaStore((s) => s.selectedPatternId);
  const setPatternId = useNawaStore((s) => s.setPatternId);

  const verbs = PATTERNS.filter((p) => p.kind === "verb");
  const nouns = PATTERNS.filter((p) => p.kind === "noun");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold tracking-wide uppercase">Pattern</h3>
        <p className="text-muted-foreground text-sm">وزن — verb forms & noun templates</p>
      </div>

      <div className="space-y-3">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Verbs</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {verbs.map((pattern) => {
            const available = hasDerivedWord(selectedRootId, pattern.id, DERIVED_WORDS);
            const active = selectedPatternId === pattern.id;
            return (
              <button
                key={pattern.id}
                type="button"
                disabled={!available}
                onClick={() => setPatternId(pattern.id)}
                className={cn(
                  "rounded-lg border px-2 py-3 text-center transition-colors",
                  active && available && "border-primary bg-primary/10 ring-primary/40 ring-2",
                  !active && available && "border-border hover:bg-muted/60",
                  !available && "cursor-not-allowed opacity-40",
                )}
                title={available ? pattern.description : "No sample for this root"}
              >
                <div className="text-xs font-medium">{pattern.templateName}</div>
                <ArabicText className="mt-1 block text-lg leading-snug">{pattern.templateArabic}</ArabicText>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Nouns</p>
        <div className="grid grid-cols-3 gap-2">
          {nouns.map((pattern) => {
            const available = hasDerivedWord(selectedRootId, pattern.id, DERIVED_WORDS);
            const active = selectedPatternId === pattern.id;
            return (
              <button
                key={pattern.id}
                type="button"
                disabled={!available}
                onClick={() => setPatternId(pattern.id)}
                className={cn(
                  "rounded-lg border px-2 py-3 text-center transition-colors",
                  active && available && "border-primary bg-primary/10 ring-primary/40 ring-2",
                  !active && available && "border-border hover:bg-muted/60",
                  !available && "cursor-not-allowed opacity-40",
                )}
                title={available ? pattern.description : "No sample for this root"}
              >
                <ArabicText className="block text-lg leading-snug">{pattern.templateArabic}</ArabicText>
                <div className="text-muted-foreground mt-1 text-[11px]">{pattern.templateName}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
