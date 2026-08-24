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
        <button
          className="text-slate-500 transition-colors hover:text-slate-200"
          aria-label="Leave the chamber"
        >
          <X className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <div
          className="relative h-3 flex-1 overflow-hidden rounded-full"
          style={{ background: "rgba(148,163,184,0.14)" }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #F59E0B, #FBBF24)",
              boxShadow: "0 0 14px rgba(245,158,11,0.6)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${PROGRESS * 100}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <span className="absolute inset-x-1 top-0.5 h-1 rounded-full bg-white/40" />
          </motion.div>
        </div>
        <div className="flex items-center gap-1 font-semibold text-rose-400">
          <Heart className="h-5 w-5 fill-current" />
          <span className="text-sm">5</span>
        </div>
      </div>

      {/* Inscription tablet */}
      <div className="flex flex-1 flex-col justify-center px-4">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-cyan-300/80">
          Translate the inscription
        </p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col items-center gap-4 rounded-3xl px-6 py-10"
          style={{
            background:
              "linear-gradient(160deg, rgba(30,41,59,0.75), rgba(11,15,25,0.85))",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(245,158,11,0.16)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 50px -24px rgba(0,0,0,0.8)",
          }}
        >
          <button
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-amber-300 transition-transform active:scale-90"
            style={{
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.35)",
              boxShadow: "0 0 18px -4px rgba(245,158,11,0.5)",
            }}
            aria-label="Hear the inscription"
          >
            <Volume2 className="h-5 w-5" />
          </button>
          <span
            dir="rtl"
            lang="ar"
            className="font-arabic text-6xl font-bold text-amber-200"
            style={{ textShadow: "0 0 26px rgba(245,158,11,0.45)" }}
          >
            {"يَكْتُبُ"}
          </span>
          <span className="text-sm text-slate-400">{"he writes"}</span>
        </motion.div>

        {/* Word tiles */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          {TILES.map((tile) => {
            const isSel = selected === tile.id;
            const showState = checked && isSel;
            const correctState = showState && isCorrect;
            const wrongState = showState && !isCorrect;
            return (
              <motion.button
                key={tile.id}
                disabled={checked}
                onClick={() => setSelected(tile.id)}
                whileTap={checked ? undefined : { scale: 0.96, y: 2 }}
                whileHover={checked ? undefined : { y: -2 }}
                transition={{ type: "spring", stiffness: 500, damping: 24 }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-4 py-5 transition-colors",
                  correctState && "text-[#04140D]",
                  wrongState && "text-[#1B0606]",
                  !showState && "text-slate-100",
                )}
                style={{
                  background: correctState
                    ? "linear-gradient(160deg, #4ADE80, #059669)"
                    : wrongState
                      ? "linear-gradient(160deg, #FB7185, #E11D48)"
                      : "rgba(148,163,184,0.05)",
                  border: isSel
                    ? "1px solid rgba(56,189,248,0.7)"
                    : "1px solid rgba(148,163,184,0.14)",
                  backdropFilter: "blur(10px)",
                  boxShadow: isSel
                    ? "0 0 20px -4px rgba(56,189,248,0.55), inset 0 1px 0 rgba(255,255,255,0.08)"
                    : "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <span
                  dir="rtl"
                  lang="ar"
                  className="font-arabic battle-arabic text-2xl font-semibold"
                >
                  {tile.arabic}
                </span>
                <span className="text-xs opacity-70">{tile.translit}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Docked footer */}
      <div className="sticky bottom-0 mt-6">
        <AnimatePresence mode="wait">
          {checked ? (
            <motion.div
              key="feedback"
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              className="px-4 pb-6 pt-5"
              style={{
                background: isCorrect
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(225,29,72,0.12)",
                borderTop: isCorrect
                  ? "1px solid rgba(16,185,129,0.3)"
                  : "1px solid rgba(225,29,72,0.3)",
              }}
            >
              <p
                className={cn(
                  "mb-3 text-lg font-semibold",
                  isCorrect ? "text-emerald-300" : "text-rose-300",
                )}
              >
                {isCorrect ? "Beautifully inscribed." : "The truth was: kataba"}
              </p>
              <Push3DButton
                variant={isCorrect ? "emerald" : "danger"}
                fullWidth
                onClick={reset}
              >
                Continue
              </Push3DButton>
            </motion.div>
          ) : (
            <motion.div key="check" className="px-4 pb-6 pt-5">
              <Push3DButton
                variant="primary"
                fullWidth
                disabled={!selected}
                onClick={handleCheck}
              >
                Confirm Inscription
              </Push3DButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
