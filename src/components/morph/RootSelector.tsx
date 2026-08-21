"use client";

import { motion } from "framer-motion";
import { ROOTS } from "@/data/mockRoots";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNawaStore } from "@/store/nawa-store";

export function RootSelector() {
  const selectedRootId = useNawaStore((s) => s.selectedRootId);
  const setRootId = useNawaStore((s) => s.setRootId);
  const root = ROOTS.find((r) => r.id === selectedRootId) ?? ROOTS[0];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold tracking-wide uppercase">Root</h3>
        <p className="text-muted-foreground text-sm">Choose a triliteral جذر</p>
      </div>

      <div className="flex justify-center gap-3" dir="rtl">
        {root.consonants.map((letter, i) => (
          <motion.div
            key={`${root.id}-${letter.arabic}-${i}`}
            layoutId={`root-letter-${i}`}
            className="bg-primary/10 border-primary/30 flex size-16 items-center justify-center rounded-xl border-2 sm:size-20"
          >
            <span className="font-arabic text-3xl font-semibold sm:text-4xl">{letter.arabic}</span>
          </motion.div>
        ))}
      </div>

      <p className="text-muted-foreground text-center text-sm">
        <span className="text-foreground font-medium">{root.transliteration}</span>
        {" — "}
        {root.gloss}
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {ROOTS.map((r) => {
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

      <div className="flex justify-center">
        <Badge variant="secondary">{root.semanticField}</Badge>
      </div>
    </div>
  );
}
