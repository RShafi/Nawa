"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, RotateCcw, Swords } from "lucide-react";
import { awardBattleWinHibrAction } from "@/app/actions/economy";
import { ActionLog } from "@/components/battle/ActionLog";
import { ActionPanel } from "@/components/battle/ActionPanel";
import { CombatTurnBanner } from "@/components/battle/CombatTurnBanner";
import { EnemyStatus } from "@/components/battle/EnemyStatus";
import { EnemyWards } from "@/components/battle/EnemyWards";
import { ForgeBoard } from "@/components/battle/ForgeBoard";
import { TutorialArena } from "@/components/battle/TutorialArena";
import {
  markArenaTutorialDone,
  resetArenaTutorialProgress,
  useShouldAutoStartTutorial,
} from "@/components/battle/TutorialOverlay";
import { ArabicText } from "@/components/common/ArabicText";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useBattleStore } from "@/store/useBattleStore";

export function BattleArena() {
  const [railTutorial, setRailTutorial] = useState(false);

  const started = useBattleStore((s) => s.started);
  const victory = useBattleStore((s) => s.victory);
  const defeat = useBattleStore((s) => s.defeat);
  const playerHp = useBattleStore((s) => s.playerHp);
  const playerMaxHp = useBattleStore((s) => s.playerMaxHp);
  const enemyHp = useBattleStore((s) => s.enemyHp);
  const enemyMaxHp = useBattleStore((s) => s.enemyMaxHp);
  const enemyName = useBattleStore((s) => s.enemyName);
  const enemyNameAr = useBattleStore((s) => s.enemyNameAr);
  const isStaggered = useBattleStore((s) => s.isStaggered);
  const lastResult = useBattleStore((s) => s.lastResult);
  const screenShake = useBattleStore((s) => s.screenShake);
  const hibrAwarded = useBattleStore((s) => s.hibrAwarded);
  const startEncounter = useBattleStore((s) => s.startEncounter);
  const resetBattle = useBattleStore((s) => s.resetBattle);
  const clearLastResult = useBattleStore((s) => s.clearLastResult);

  const hydrateApp = useAppStore((s) => s.hydrate);
  const unlockedVocab = useAppStore((s) => s.unlockedVocab);
  const fsrsItems = useAppStore((s) => s.fsrsItems);
  const hasRustDebuff = useAppStore((s) => s.hasRustDebuff);
  const addHibrOptimistic = useAppStore((s) => s.addHibrOptimistic);
  const setHibrBalance = useAppStore((s) => s.setHibrBalance);
  const appStatus = useAppStore((s) => s.status);

  const autoTutorial = useShouldAutoStartTutorial();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (appStatus === "idle") void hydrateApp();
  }, [appStatus, hydrateApp]);

  useEffect(() => {
    if (!lastResult) return;
    const t = window.setTimeout(() => clearLastResult(), 1600);
    return () => window.clearTimeout(t);
  }, [lastResult, clearLastResult]);

  useEffect(() => {
    if (!victory || hibrAwarded == null) return;
    void confetti({ particleCount: 90, spread: 70, origin: { y: 0.35 } });
    markArenaTutorialDone();
    startTransition(async () => {
      addHibrOptimistic(hibrAwarded);
      const res = await awardBattleWinHibrAction();
      if (res.ok && typeof res.hibrBalance === "number") {
        setHibrBalance(res.hibrBalance);
      }
    });
  }, [victory, hibrAwarded, addHibrOptimistic, setHibrBalance]);

  function openRailTutorial() {
    resetArenaTutorialProgress();
    resetBattle();
    setRailTutorial(true);
  }

  function beginFreePlay() {
    const masteryByWordId: Record<string, 1 | 2 | 3> = {};
    for (const item of fsrsItems) {
      masteryByWordId[item.wordId] = item.masteryLevel;
    }
    startEncounter({
      vocab: unlockedVocab.map((v) => ({ rootId: v.rootId, patternId: v.patternId })),
      masteryByWordId,
      rustActive: hasRustDebuff(),
      withTutorial: false,
    });
  }

  if (railTutorial) {
    return (
      <TutorialArena
        onExit={() => setRailTutorial(false)}
        onComplete={() => {
          markArenaTutorialDone();
          setRailTutorial(false);
        }}
      />
    );
  }

  if (!started) {
    const canFight = unlockedVocab.length > 0;
    const loading = appStatus === "loading" || appStatus === "idle";

    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-6 overflow-y-auto px-4 py-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel-strong glow-amber relative overflow-hidden rounded-3xl border border-amber-400/25 bg-[#12141c]/95 px-8 py-12 shadow-2xl"
        >
          <ArabicText size="lg" className="relative text-amber-100/90">
            حَرْبُ الْجُذُور
          </ArabicText>
          <h1 className="relative mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ward & Strike
          </h1>
          <ol className="relative mx-auto mt-5 max-w-sm space-y-2 text-start text-sm text-white/65">
            <li className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <span className="font-semibold text-violet-200">1.</span> Read the English Wards
              (locks).
            </li>
            <li className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <span className="font-semibold text-emerald-200">2.</span> Weave a Thread into a Frame,
              then Cast.
            </li>
            <li className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <span className="font-semibold text-amber-200">3.</span> Shatter locks to Stagger —
              use Ink to Redraw or Flick.
            </li>
          </ol>
          <div className="relative mt-8 flex flex-col items-center gap-3">
            {canFight ? (
              <Button
                size="lg"
                className="h-12 bg-amber-500 px-8 text-base font-semibold text-black hover:bg-amber-400"
                onClick={beginFreePlay}
              >
                Enter the Crucible
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                className="h-12 bg-emerald-500 px-8 font-semibold text-black hover:bg-emerald-400"
              >
                <Link href="/path">Learn on the Path first</Link>
              </Button>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/15 bg-white/5 text-white/80"
                onClick={openRailTutorial}
              >
                How to play
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white/45"
                onClick={openRailTutorial}
              >
                <RotateCcw className="size-3.5" />
                Reset tutorial
              </Button>
            </div>
            {loading ? (
              <p className="text-xs text-white/40">Syncing deck…</p>
            ) : !canFight ? (
              <p className="text-xs text-white/45">
                Finish Learning Path stops — or practice the tutorial anytime.
              </p>
            ) : null}
          </div>
          {canFight ? (
            <p className="relative mt-3 text-xs text-white/40">
              Deck: {unlockedVocab.length} weave{unlockedVocab.length === 1 ? "" : "s"}
              {hasRustDebuff() ? " · Rust active" : ""}
              {autoTutorial ? " · Try How to play first" : ""}
            </p>
          ) : null}
        </motion.div>
      </div>
    );
  }

  const enemyPct = (enemyHp / enemyMaxHp) * 100;
  const playerPct = (playerHp / playerMaxHp) * 100;

  return (
    <motion.div
      animate={screenShake ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      className="relative mx-auto flex h-full max-w-3xl flex-col gap-1.5 overflow-hidden px-3 py-1.5 sm:px-4"
    >
      <CombatTurnBanner />

      <div className="flex shrink-0 items-center justify-between gap-2">
        <p className="text-[10px] tracking-wide text-white/40 uppercase">Battle</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-white/45"
          onClick={() => {
            resetBattle();
            openRailTutorial();
          }}
        >
          <RotateCcw className="size-3.5" />
          How to play
        </Button>
      </div>

      <EnemyStatus />

      <section className="glass-panel shrink-0 space-y-1.5 rounded-2xl px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Swords className="size-4 shrink-0 text-violet-300" />
              <h2 className="truncate text-sm font-semibold text-white">{enemyName}</h2>
              {isStaggered ? (
                <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-200 uppercase">
                  Staggered
                </span>
              ) : null}
            </div>
            <ArabicText
              size="inherit"
              className="battle-arabic whitespace-nowrap text-xs leading-none text-white/55"
            >
              {enemyNameAr}
            </ArabicText>
          </div>
          <div className="w-28 shrink-0 space-y-0.5 sm:w-36">
            <div className="flex justify-between text-[10px] text-white/50">
              <span>HP</span>
              <span className="font-mono tabular-nums">
                {enemyHp}/{enemyMaxHp}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-black/40">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  isStaggered
                    ? "bg-gradient-to-r from-amber-500 to-rose-500"
                    : "bg-gradient-to-r from-violet-600 to-rose-500",
                )}
                animate={{ width: `${enemyPct}%` }}
              />
            </div>
          </div>
        </div>
        <EnemyWards />
      </section>

      <div className="pointer-events-none relative z-20 flex min-h-0 shrink-0 justify-center">
        <AnimatePresence>
          {lastResult ? (
            <motion.div
              key={`${lastResult.kind}-${lastResult.arabic}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-panel-strong pointer-events-none absolute top-0 w-full max-w-[16rem] rounded-xl px-3 py-1.5 text-center"
            >
              {lastResult.arabic ? (
                <ArabicText
                  size="inherit"
                  className="battle-arabic block whitespace-nowrap text-base leading-none text-amber-50"
                >
                  {lastResult.arabic}
                </ArabicText>
              ) : null}
              <p className="font-mono text-sm font-black text-rose-300">
                {lastResult.kind === "fizzle"
                  ? "FIZZLE"
                  : lastResult.kind === "ward-shatter"
                    ? `WARD −${lastResult.damage}`
                    : `−${lastResult.damage}`}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {(victory || defeat) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel-strong z-30 mx-auto w-full max-w-sm shrink-0 rounded-2xl px-5 py-4 text-center"
        >
          <p className="text-xl font-semibold text-white">{victory ? "Victory" : "Defeat"}</p>
          {victory && hibrAwarded ? (
            <p className="mt-1 text-sm text-amber-200">
              +{hibrAwarded} Hibr {pending ? "…" : ""}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button size="sm" onClick={() => resetBattle()}>
              Return to gate
            </Button>
            {victory ? (
              <Button asChild size="sm" variant="outline" className="border-white/15">
                <Link href="/passports">Spend Hibr</Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline" className="border-white/15">
                <Link href="/path">Back to Path</Link>
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {!victory && !defeat ? (
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
          <ActionPanel />
          <ForgeBoard />
        </div>
      ) : null}

      <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5">
        <Heart className="size-3.5 shrink-0 text-rose-400" />
        <span className="text-xs text-white">You</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/40">
          <motion.div
            className="h-full rounded-full bg-rose-500"
            animate={{ width: `${playerPct}%` }}
          />
        </div>
        <span className="font-mono text-[10px] tabular-nums text-white/60">
          {playerHp}/{playerMaxHp}
        </span>
        <div className="ms-1 hidden max-w-[10rem] truncate text-[10px] text-white/40 sm:block">
          <ActionLog compact />
        </div>
      </div>
    </motion.div>
  );
}
