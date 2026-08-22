"use client";

import { PATTERNS } from "@/data/mockPatterns";
import { DERIVED_WORDS } from "@/data/mockRoots";
import { ArabicText } from "@/components/common/ArabicText";
import { hasDerivedWord } from "@/lib/arabic-utils";
import { cn } from "@/lib/utils";
import { useNawaStore } from "@/store/nawa-store";

type PatternMatrixProps = {
  /** Lesson focus — highlighted, but other available patterns stay clickable. */
  focusPatternId?: string;
};

export function PatternMatrix({ focusPatternId }: PatternMatrixProps) {
  const selectedRootId = useNawaStore((s) => s.selectedRootId);
  const selectedPatternId = useNawaStore((s) => s.selectedPatternId);
  const setPatternId = useNawaStore((s) => s.setPatternId);

  const visible = PATTERNS.filter((p) => hasDerivedWord(selectedRootId, p.id, DERIVED_WORDS));
  const verbs = visible.filter((p) => p.kind === "verb");
  const nouns = visible.filter((p) => p.kind === "noun");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold tracking-wide uppercase">Pattern · وزن</h3>
        <p className="text-muted-foreground text-sm">
          {focusPatternId
            ? "Start with the highlighted pattern, then try others for this root."
            : "Patterns with a sample for this root."}
        </p>
      </div>

      {verbs.length > 0 ? (
        <PatternGroup
          label="Verbs"
          patterns={verbs}
          selectedPatternId={selectedPatternId}
          focusPatternId={focusPatternId}
          onSelect={setPatternId}
        />
      ) : null}

      {nouns.length > 0 ? (
        <PatternGroup
          label="Nouns"
          patterns={nouns}
          selectedPatternId={selectedPatternId}
          focusPatternId={focusPatternId}
          onSelect={setPatternId}
        />
      ) : null}
    </div>
  );
}

function PatternGroup({
  label,
  patterns,
  selectedPatternId,
  focusPatternId,
  onSelect,
}: {
  label: string;
  patterns: typeof PATTERNS;
  selectedPatternId: string;
  focusPatternId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <div className={cn("grid gap-2", patterns.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-4")}>
        {patterns.map((pattern) => {
          const active = selectedPatternId === pattern.id;
          const focused = focusPatternId === pattern.id;
          return (
            <button
              key={pattern.id}
              type="button"
              onClick={() => onSelect(pattern.id)}
              className={cn(
                "rounded-lg border px-2 py-3 text-center transition-colors",
                active && "border-primary bg-primary/10 ring-primary/40 ring-2",
                !active && "border-border hover:bg-muted/60",
                focused && !active && "border-primary/40",
              )}
              title={pattern.description}
            >
              <div className="text-xs font-medium">
                {pattern.templateName}
                {focused ? <span className="text-primary"> · lesson</span> : null}
              </div>
              <ArabicText className="mt-1 block text-lg leading-snug">{pattern.templateArabic}</ArabicText>
            </button>
          );
        })}
      </div>
    </div>
  );
}
