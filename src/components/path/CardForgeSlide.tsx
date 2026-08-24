"use client";

/**
 * Path Card Forge — tap Root + Pattern to unlock a fully formed Word Card.
 */

import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import {
  COMBAT_PATTERNS,
  COMBAT_ROOTS,
  forgeWordCard,
  type CombatPattern,
  type CombatRoot,
} from "@/data/combatDictionary";
import { WordCardUnlockCelebration } from "@/components/battle/WordCardView";
import { ArabicText } from "@/components/common/ArabicText";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

export function CardForgeSlide({
  lockedRootId,
  focusPatternId,
  onComplete,
}: {
  lockedRootId?: string;
  focusPatternId?: string;
  onComplete?: () => void;
}) {
  const unlockDeckOptimistic = useAppStore((s) => s.unlockDeckOptimistic);
  const isCardUnlocked = useAppStore((s) => s.isCardUnlocked);

  const roots = useMemo(() => {
    if (lockedRootId) {
      const r = COMBAT_ROOTS.find((x) => x.id === lockedRootId);
      return r ? [r] : COMBAT_ROOTS.slice(0, 3);
    }
    return COMBAT_ROOTS.slice(0, 4);
  }, [lockedRootId]);

  const patterns = useMemo(() => {
    if (focusPatternId) {
      const p = COMBAT_PATTERNS.find((x) => x.id === focusPatternId);
      return p ? [p] : COMBAT_PATTERNS.slice(0, 3);
    }
    return COMBAT_PATTERNS.filter((p) =>
      ["form-1", "form-2", "noun-of-place", "passive-participle", "active-participle"].includes(
        p.id,
      ),
    ).slice(0, 4);
  }, [focusPatternId]);

  const [root, setRoot] = useState<CombatRoot | null>(roots[0] ?? null);
  const [pattern, setPattern] = useState<CombatPattern | null>(
    focusPatternId ? (patterns[0] ?? null) : null,
  );
  const [forged, setForged] = useState(false);

  const preview = root && pattern ? forgeWordCard(root.id, pattern.id) : null;
  const alreadyHave = preview ? isCardUnlocked(preview.id) : false;

  function forge() {
    if (!preview) return;
    unlockDeckOptimistic([preview.id]);
    setForged(true);
    void confetti({ particleCount: 70, spread: 65, origin: { y: 0.55 } });
  }

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div>
          <p className="text-primary text-sm font-medium tracking-wide uppercase">Card Forge</p>
          <p className="mt-1 text-base leading-relaxed sm:text-lg">
            Tap a <span className="font-semibold">Root</span> (Thread) and a{" "}
            <span className="font-semibold">Pattern</span> (Frame). Forge them into a Word Card for
            your Arena deck.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {forged && preview ? (
            <motion.div key="celebrate" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <WordCardUnlockCelebration card={preview} onDone={onComplete} />
            </motion.div>
          ) : (
            <motion.div
              key="forge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div>
                <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">1 · Root</p>
                <div className="flex flex-wrap gap-2">
                  {roots.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setRoot(r);
                        setForged(false);
                      }}
                      className={cn(
                        "rounded-xl border px-3 py-2 transition",
                        root?.id === r.id
                          ? "border-emerald-600/50 bg-emerald-500/10"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <ArabicText size="inherit" className="text-foreground block text-xl leading-none">
                        {r.letters}
                      </ArabicText>
                      <span className="text-muted-foreground text-[10px]">{r.gloss}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">2 · Pattern</p>
                <div className="flex flex-wrap gap-2">
                  {patterns.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPattern(p);
                        setForged(false);
                      }}
                      className={cn(
                        "rounded-xl border px-3 py-2 transition",
                        pattern?.id === p.id
                          ? "border-amber-600/50 bg-amber-500/10"
                          : "hover:bg-muted/50",
                        !root && "opacity-40",
                      )}
                    >
                      <ArabicText size="inherit" className="text-foreground block text-lg leading-none">
                        {p.template}
                      </ArabicText>
                      <span className="text-muted-foreground text-[10px]">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-muted/40 rounded-xl border border-dashed px-4 py-5 text-center">
                {preview ? (
                  <>
                    <ArabicText size="inherit" className="block text-3xl leading-none">
                      {preview.word}
                    </ArabicText>
                    <p className="mt-1 text-sm">{preview.translation}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {preview.school} · {preview.partOfSpeech}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Select Root + Pattern to preview</p>
                )}
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  disabled={!preview}
                  className="bg-amber-500 font-semibold text-black hover:bg-amber-400"
                  onClick={forge}
                >
                  {alreadyHave ? "Forge again (owned)" : "Forge Word Card"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
