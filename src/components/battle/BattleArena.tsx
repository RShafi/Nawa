"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { awardBattleWinHibrAction } from "@/app/actions/economy";
import { BattleResultOverlay } from "@/components/battle/BattleResultOverlay";
import { BattleStage, CombatPhaseBanner, HUD_BOSS, HUD_HAND, HUD_MIDDLE } from "@/components/battle/BattleStage";
import { BossEntity, PlayerHero, type CombatFloat } from "@/components/battle/BattleEntities";
import { CombatTurnBanner } from "@/components/battle/CombatTurnBanner";
import { BossAttackFlash, SpellCastVFX, type SpellProjectile } from "@/components/battle/SpellCastVFX";
import { ResonanceCheck } from "@/components/battle/ResonanceCheck";
import { SyntaxBoard } from "@/components/battle/SyntaxBoard";
import { ArabicText } from "@/components/common/ArabicText";
import { Button } from "@/components/ui/button";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { courseWordIds } from "@/data/garden";
import { useAppStore } from "@/store/useAppStore";
import { useBattleStore } from "@/store/useBattleStore";

export function BattleArena() {
  const [projectile, setProjectile] = useState<SpellProjectile | null>(null);
  const [floats, setFloats] = useState<CombatFloat[]>([]);
  const [bossHit, setBossHit] = useState(false);
  const [bossAttacking, setBossAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [playerDamageFloat, setPlayerDamageFloat] = useState<string | null>(null);
  const [bossFlash, setBossFlash] = useState(false);
  const prevCombat = useRef<string>("idle");
  const { playSuccess, playError, playImpact } = useSoundEffects();

  const started = useBattleStore((s) => s.started);
  const victory = useBattleStore((s) => s.victory);
  const defeat = useBattleStore((s) => s.defeat);
  const combatState = useBattleStore((s) => s.combatState);
  const playerHp = useBattleStore((s) => s.playerHp);
  const playerMaxHp = useBattleStore((s) => s.playerMaxHp);
  const playerShield = useBattleStore((s) => s.playerShield);
  const enemyHp = useBattleStore((s) => s.enemyHp);
  const enemyMaxHp = useBattleStore((s) => s.enemyMaxHp);
  const enemyName = useBattleStore((s) => s.enemyName);
  const enemyNameAr = useBattleStore((s) => s.enemyNameAr);
  const enemyShield = useBattleStore((s) => s.enemyShield);
  const lastResult = useBattleStore((s) => s.lastResult);
  const lastEnemyHit = useBattleStore((s) => s.lastEnemyHit);
  const screenShake = useBattleStore((s) => s.screenShake);
  const hibrAwarded = useBattleStore((s) => s.hibrAwarded);
  const enemyIntent = useBattleStore((s) => s.enemyIntent);
  const startEncounter = useBattleStore((s) => s.startEncounter);
  const resetBattle = useBattleStore((s) => s.resetBattle);
  const clearLastResult = useBattleStore((s) => s.clearLastResult);

  const hydrateApp = useAppStore((s) => s.hydrate);
  const unlockedDeck = useAppStore((s) => s.unlockedDeck);
  const addHibrOptimistic = useAppStore((s) => s.addHibrOptimistic);
  const setHibrBalance = useAppStore((s) => s.setHibrBalance);
  const appStatus = useAppStore((s) => s.status);
  const grownDeck = unlockedDeck.filter((id) => courseWordIds().includes(id));
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (appStatus === "idle") void hydrateApp();
  }, [appStatus, hydrateApp]);

  // Player cast VFX driven by combatState + lastResult
  useEffect(() => {
    if (combatState !== "player_attacking" || !lastResult) return;
    if (lastResult.kind === "syntax-fail" || lastResult.kind === "fizzle") {
      playError();
      return;
    }

    playSuccess();
    setProjectile({ id: `cast-${Date.now()}`, arabic: lastResult.arabic || "…" });

    const hitT = window.setTimeout(() => {
      setBossHit(true);
      const id = `flt-${Date.now()}`;
      const crit = Boolean(lastResult.critical);
      const list: CombatFloat[] = [
        {
          id,
          text: crit ? `−${lastResult.damage}` : `−${lastResult.damage}`,
          tone: crit ? "critical" : "damage",
        },
      ];
      setFloats(list);
      window.setTimeout(() => setBossHit(false), 500);
      window.setTimeout(() => setFloats([]), crit ? 2000 : 1600);
    }, 350);

    return () => window.clearTimeout(hitT);
  }, [combatState, lastResult, playSuccess, playError]);

  // Enemy phase VFX
  useEffect(() => {
    const prev = prevCombat.current;
    prevCombat.current = combatState;

    if (combatState === "enemy_attacking" && prev !== "enemy_attacking") {
      setBossAttacking(true);
      const hitAt = window.setTimeout(() => {
        playImpact();
        setBossFlash(true);
        const dmg = lastEnemyHit;
        if (dmg === 0) {
          setPlayerDamageFloat("Blocked");
        } else if (typeof dmg === "number" && dmg > 0) {
          setPlayerHit(true);
          setPlayerDamageFloat(`−${dmg}`);
        } else {
          setPlayerHit(true);
          setPlayerDamageFloat("Hit");
        }
      }, 200);
      const clearA = window.setTimeout(() => setBossAttacking(false), 700);
      const clearF = window.setTimeout(() => setBossFlash(false), 400);
      const clearH = window.setTimeout(() => {
        setPlayerHit(false);
        setPlayerDamageFloat(null);
      }, 1100);
      return () => {
        window.clearTimeout(hitAt);
        window.clearTimeout(clearA);
        window.clearTimeout(clearF);
        window.clearTimeout(clearH);
      };
    }

    if (combatState === "idle" && lastResult) {
      const t = window.setTimeout(() => clearLastResult(), 400);
      return () => window.clearTimeout(t);
    }
  }, [combatState, lastEnemyHit, lastResult, playImpact, clearLastResult]);

  useEffect(() => {
    if (!victory || hibrAwarded == null) return;
    void confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.35 },
      colors: ["#F59E0B", "#38BDF8", "#10B981"],
    });
    startTransition(async () => {
      addHibrOptimistic(hibrAwarded);
      const res = await awardBattleWinHibrAction();
      if (res.ok && typeof res.hibrBalance === "number") {
        setHibrBalance(res.hibrBalance);
      }
    });
  }, [victory, hibrAwarded, addHibrOptimistic, setHibrBalance]);

  function beginFreePlay() {
    startEncounter({ deck: grownDeck });
  }

  function rematch() {
    resetBattle();
    startEncounter({ deck: grownDeck });
  }

  if (!started) {
    const canFight = grownDeck.length > 0;
    const loading = appStatus === "loading" || appStatus === "idle";

    return (
      <div className="mx-auto flex h-full max-w-5xl flex-col items-center justify-center gap-4 overflow-hidden px-4 py-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-tablet relative overflow-hidden border-white/10 px-8 py-12 shadow-2xl"
        >
          <ArabicText size="lg" forceFull className="relative text-amber-100/90">
            حَرْبُ الْجُمَل
          </ArabicText>
          <h1 className="relative mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Sentence arena
          </h1>
          <ol className="relative mx-auto mt-5 max-w-sm space-y-2 text-start text-sm text-white/65">
            <li className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              1. Use words the garden has grown.
            </li>
            <li className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              2. Verb first. Adjectives follow nouns. A longer legal line hits harder.
            </li>
            <li className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              3. Cast, then pick the English. Ink refills after their turn.
            </li>
          </ol>
          <div className="relative mt-8 flex flex-col items-center gap-3">
            {canFight ? (
              <Button size="lg" className="h-12 px-8 text-base" onClick={beginFreePlay}>
                Start
              </Button>
            ) : (
              <Button asChild size="lg" className="h-12 px-8">
                <Link href="/">Grow a word first</Link>
              </Button>
            )}
            {loading ? <p className="text-xs text-white/40">Loading your deck…</p> : null}
          </div>
          {canFight ? (
            <p className="relative mt-3 text-xs text-white/40">
              {grownDeck.length} word{grownDeck.length === 1 ? "" : "s"} ready
            </p>
          ) : null}
        </motion.div>
      </div>
    );
  }

  const blockedBanner = lastEnemyHit === 0 && combatState === "enemy_attacking";

  return (
    <BattleStage
      shake={screenShake || playerHit || Boolean(lastResult?.critical && combatState === "player_attacking")}
      combatState={combatState}
    >
      <ResonanceCheck />
      <SpellCastVFX projectile={projectile} onDone={() => setProjectile(null)} />
      <BossAttackFlash active={bossFlash} />
      <CombatPhaseBanner combatState={combatState} blocked={blockedBanner} />

      {/* Row 1 — Boss Zone */}
      <div className={HUD_BOSS}>
        <div className="mb-1 flex w-full items-center justify-between gap-2 px-1">
          <p className="text-[clamp(0.55rem,1.2vh,0.65rem)] tracking-wide text-white/40 uppercase">
            Your sentence
          </p>
        </div>
        <CombatTurnBanner />
        <div className="flex w-full items-start justify-center gap-3 px-1 md:gap-6">
          <PlayerHero
            hp={playerHp}
            maxHp={playerMaxHp}
            shield={playerShield}
            hit={playerHit}
            damageFloat={playerDamageFloat}
          />
          <BossEntity
            name={enemyName}
            nameAr={enemyNameAr}
            hp={enemyHp}
            maxHp={enemyMaxHp}
            shield={enemyShield}
            hit={bossHit}
            attacking={bossAttacking || combatState === "enemy_attacking"}
            floats={floats}
            intentLabel={
              enemyIntent
                ? `${enemyIntent.label}${enemyIntent.damage ? ` for ${enemyIntent.damage}` : ""}`
                : undefined
            }
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[32%] z-20 flex justify-center">
        <AnimatePresence>
          {lastResult && combatState === "player_attacking" ? (
            <motion.div
              key={`${lastResult.kind}-${lastResult.arabic}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-tablet pointer-events-none w-full max-w-[16rem] px-3 py-1.5 text-center"
            >
              <ArabicText
                size="inherit"
                className="battle-arabic block whitespace-nowrap text-sm leading-none text-amber-50"
              >
                {lastResult.arabic}
              </ArabicText>
              <p className="font-mono text-sm font-black text-rose-300">
                {lastResult.multiplier > 1
                  ? `${lastResult.multiplier}× −${lastResult.damage}`
                  : `−${lastResult.damage}`}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {(victory || defeat) && (
        <>
          <div className={HUD_MIDDLE} aria-hidden />
          <div className={HUD_HAND} aria-hidden />
          <BattleResultOverlay
            outcome={victory ? "victory" : "defeat"}
            sentence={lastResult?.arabic}
            meaning={lastResult?.english}
            hibrAwarded={victory ? hibrAwarded : null}
            onRematch={rematch}
          />
        </>
      )}

      {!victory && !defeat ? <SyntaxBoard /> : null}
    </BattleStage>
  );
}
