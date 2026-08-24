"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, X, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Push3DButton } from "./Push3DButton";

interface Tile {
  id: string;
  arabic: string;
  translit: string;
}

const TILES: Tile[] = [
  { id: "t1", arabic: "كَتَبَ", translit: "kataba" },
  { id: "t2", arabic: "قَرَأَ", translit: "qara'a" },
  { id: "t3", arabic: "دَرَسَ", translit: "darasa" },
  { id: "t4", arabic: "شَرِبَ", translit: "shariba" },
];

const CORRECT_ID = "t1";
const PROGRESS = 0.4;

export function LessonView() {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const isCorrect = selected === CORRECT_ID;

  function handleCheck() {
    if (!selected) return;
    setChecked(true);
  }

  function reset() {
    setChecked(false);
    setSelected(null);
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col">
      {/* Top bar: quit, progress, hearts */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Quit lesson">
          <X className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${PROGRESS * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="absolute inset-x-1 top-1 h-1 rounded-full bg-white/40" />
          </motion.div>
        </div>
        <div className="flex items-center gap-1 font-bold text-destructive">
          <Heart className="h-5 w-5 fill-current" />
          <span className="text-sm">5</span>
        </div>
      </div>

      {/* Prompt card */}
      <div className="flex flex-1 flex-col justify-center px-4">
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Translate the word
        </p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel-strong relative flex flex-col items-center gap-4 rounded-3xl px-6 py-10"
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform active:scale-90"
            aria-label="Play pronunciation"
          >
            <Volume2 className="h-5 w-5" />
          </button>
          <span dir="rtl" lang="ar" className="font-arabic text-6xl font-bold text-glow-emerald">
            {"يَكْتُبُ"}
          </span>
          <span className="text-sm text-muted-foreground">{"he writes"}</span>
        </motion.div>

        {/* Word tiles */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          {TILES.map((tile) => {
            const isSel = selected === tile.id;
            const showState = checked && isSel;
            return (
              <motion.button
                key={tile.id}
                disabled={checked}
                onClick={() => setSelected(tile.id)}
                whileTap={checked ? undefined : { y: 5, boxShadow: "none" }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-4 py-5 transition-colors",
                  showState && isCorrect && "bg-primary text-primary-foreground",
                  showState && !isCorrect && "bg-destructive text-white",
                  !showState && isSel && "bg-primary/20 text-foreground ring-2 ring-primary",
                  !showState && !isSel && "glass-panel text-foreground",
                )}
                style={{
                  boxShadow:
                    showState || isSel
                      ? undefined
                      : "0 5px 0 0 oklch(0.13 0.02 265), 0 6px 16px -6px oklch(0 0 0 / 60%)",
                }}
              >
                <span dir="rtl" lang="ar" className="font-arabic text-2xl font-semibold battle-arabic">
                  {tile.arabic}
                </span>
                <span className="text-xs opacity-70">{tile.translit}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 mt-6">
        <AnimatePresence mode="wait">
          {checked ? (
            <motion.div
              key="feedback"
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              className={cn(
                "px-4 pb-6 pt-5",
                isCorrect ? "bg-primary/15" : "bg-destructive/15",
              )}
            >
              <p className={cn("mb-3 text-lg font-black", isCorrect ? "text-primary" : "text-destructive")}>
                {isCorrect ? "Excellent!" : "Correct answer: kataba"}
              </p>
              <Push3DButton variant={isCorrect ? "primary" : "danger"} fullWidth onClick={reset}>
                Continue
              </Push3DButton>
            </motion.div>
          ) : (
            <motion.div key="check" className="px-4 pb-6 pt-5">
              <Push3DButton variant="primary" fullWidth disabled={!selected} onClick={handleCheck}>
                Check
              </Push3DButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
