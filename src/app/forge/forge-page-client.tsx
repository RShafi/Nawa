"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Flame, Timer } from "lucide-react";
import { MorphForge } from "@/components/forge/MorphForge";
import { Button } from "@/components/ui/button";
import { useGamificationStore } from "@/store/useGamificationStore";

export function ForgePageClient() {
  const [started, setStarted] = useState(false);
  const startGame = useGamificationStore((s) => s.startGame);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <Button asChild variant="ghost" size="sm" className="-ms-2 gap-1">
        <Link href="/">
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      </Button>

      {!started ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel glow-forge relative space-y-6 overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-10"
        >
          <div className="ambient-aura opacity-70" aria-hidden />
          <div className="relative z-[1] mx-auto flex size-14 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300">
            <Flame className="size-7" />
          </div>
          <div className="relative z-[1] space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Morph Forge</h1>
            <p className="text-muted-foreground mx-auto max-w-md text-base leading-relaxed sm:text-lg">
              Sixty seconds. Match English meanings to Arabic patterns. Chain combos — miss and you
              lose three seconds.
            </p>
          </div>
          <ul className="relative z-[1] text-muted-foreground mx-auto flex max-w-sm flex-col gap-2 text-sm sm:text-base">
            <li className="flex items-center justify-center gap-2">
              <Timer className="size-4 text-orange-400" /> 60s clock
            </li>
            <li>Correct = 100 × combo</li>
            <li>Wrong = combo resets + −3s</li>
          </ul>
          <motion.div className="relative z-[1]" whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}>
            <Button
              size="lg"
              className="h-12 bg-orange-500 px-8 text-base text-black hover:bg-orange-400"
              onClick={() => {
                startGame();
                setStarted(true);
              }}
            >
              Ready? Start Game
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <MorphForge
          onReplay={() => {
            startGame();
          }}
          onExitToLobby={() => setStarted(false)}
        />
      )}
    </main>
  );
}
