"use client";

import { ROOTS } from "@/data/mockRoots";
import { SpeakButton } from "@/components/common/SpeakButton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNawaStore } from "@/store/nawa-store";

type RootSelectorProps = {
  /** When set (lesson mode), only this root is shown — no free browsing. */
  lockedRootId?: string;
};

export function RootSelector({ lockedRootId }: RootSelectorProps) {
  const selectedRootId = useNawaStore((s) => s.selectedRootId);
  const setRootId = useNawaStore((s) => s.setRootId);
  const activeId = lockedRootId ?? selectedRootId;
  const root = ROOTS.find((r) => r.id === activeId) ?? ROOTS[0];
  const choices = lockedRootId ? ROOTS.filter((r) => r.id === lockedRootId) : ROOTS;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold tracking-wide uppercase">Root · جذر</h3>
        <p className="text-muted-foreground text-sm">
          {lockedRootId
            ? "This lesson locks the root so you can focus."
            : "Three consonants that carry the meaning."}
        </p>
      </div>

      <div className="flex justify-center gap-3" dir="rtl">
        {root.consonants.map((letter, i) => (
          <div
            key={`${root.id}-${letter.arabic}-${i}`}
            className="bg-primary/10 border-primary/30 flex size-16 flex-col items-center justify-center rounded-xl border-2 sm:size-20"
          >
            <span className="font-arabic text-3xl font-semibold sm:text-4xl">{letter.arabic}</span>
            <span className="text-muted-foreground text-[10px]">{letter.latin}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">{root.transliteration}</span>
          {" — "}
          {root.gloss}
        </p>
        <SpeakButton
          text={root.consonants.map((c) => c.arabic).join(" ")}
          latinFallback={root.transliteration.replace(/-/g, " ")}
          label="Hear letters"
          size="sm"
        />
      </div>

      {!lockedRootId ? (
        <div className="flex flex-wrap justify-center gap-2">
          {choices.map((r) => {
            const active = r.id === selectedRootId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRootId(r.id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10 ring-primary/40 ring-2"
                    : "border-border hover:bg-muted/60",
                )}
              >
                <div className="font-arabic text-lg leading-none" dir="rtl">
                  {r.consonants.map((c) => c.arabic).join(" ")}
                </div>
                <div className="text-muted-foreground mt-1 text-[11px]">{r.transliteration}</div>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex justify-center">
        <Badge variant="secondary">{root.semanticField}</Badge>
      </div>
    </div>
  );
}
