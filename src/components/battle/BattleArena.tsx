"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { awardBattleWinHibrAction } from "@/app/actions/economy";
import { ArenaMuteButton } from "@/components/battle/ArenaMuteButton";
import { BattleResultOverlay } from "@/components/battle/BattleResultOverlay";
import { BattleStage, CombatPhaseBanner, HUD_BOSS, HUD_HAND, HUD_MIDDLE } from "@/components/battle/BattleStage";
import { BossEntity, PlayerHero, type CombatFloat } from "@/components/battle/BattleEntities";
import { CombatTurnBanner } from "@/components/battle/CombatTurnBanner";
import { BossAttackFlash, SpellCastVFX, type SpellProjectile } from "@/components/battle/SpellCastVFX";
import { ResonanceCheck } from "@/components/battle/ResonanceCheck";
import { SyntaxBoard } from "@/components/battle/SyntaxBoard";
import { TutorialArena } from "@/components/battle/TutorialArena";
import {
  markArenaTutorialDone,
  resetArenaTutorialProgress,
  useShouldAutoStartTutorial,
} from "@/components/battle/TutorialOverlay";
import { ArabicText } from "@/components/common/ArabicText";
import { Button } from "@/components/ui/button";
import { useBGM } from "@/hooks/useBGM";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useAppStore } from "@/store/useAppStore";
import { useBattleStore } from "@/store/useBattleStore";
import { cn } from "@/lib/utils";

export function BattleArena() {
  const router = useRouter();
  const [railTutorial, setRailTutorial] = useState(false);
  const [projectile, setProjectile] = useState<SpellProjectile | null>(null);
  const [floats, setFloats] = useState<CombatFloat[]>([]);
  const [bossHit, setBossHit] = useState(false);
  const [bossAttacking, setBossAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [playerDamageFloat, setPlayerDamageFloat] = useState<string | null>(null);
  const [bossFlash, setBossFlash] = useState(false);
  const [maxCombo, setMaxCombo] = useState(0);
  const [spellsCast, setSpellsCast] = useState(0);
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
  const burnTicks = useBattleStore((s) => s.burnTicks);
  const frostSkip = useBattleStore((s) => s.frostSkip);
  const weakTo = useBattleStore((s) => s.weakTo);
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
  const hasRustDebuff = useAppStore((s) => s.hasRustDebuff);
  const addHibrOptimistic = useAppStore((s) => s.addHibrOptimistic);
  const setHibrBalance = useAppStore((s) => s.setHibrBalance);
  const appStatus = useAppStore((s) => s.status);

  const autoTutorial = useShouldAutoStartTutorial();
  const [, startTransition] = useTransition();
  const { fadeOut } = useBGM("/sounds/battle-theme.mp3", started && !railTutorial);

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
    const wordCount = lastResult.arabic.trim().split(/\s+/).filter(Boolean).length;
    setSpellsCast((n) => n + 1);
    setMaxCombo((m) => Math.max(m, Math.max(1, wordCount)));

    const hitT = window.setTimeout(() => {
      setBossHit(true);
      const id = `flt-${Date.now()}`;
      const crit = Boolean(lastResult.critical);
      const list: CombatFloat[] = [
        {
          id,
          text:
            lastResult.kind === "shield-break"
              ? "✨ STAGGERED"
              : crit
                ? `−${lastResult.damage} CRITICAL!`
                : `−${lastResult.damage} DMG`,
          tone: lastResult.kind === "shield-break" ? "mind" : crit ? "critical" : "damage",
        },
      ];
      if (lastResult.schools.includes("FLAME")) {
        list.push({ id: `${id}-b`, text: "🔥 BURN", tone: "burn" });
      }
      if (lastResult.schools.includes("FROST")) {
        list.push({ id: `${id}-f`, text: "❄ WARD", tone: "frost" });
      }
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
          setPlayerDamageFloat("BLOCKED!");
        } else if (typeof dmg === "number" && dmg > 0) {
          setPlayerHit(true);
          setPlayerDamageFloat(`−${dmg} DMG`);
        } else {
          setPlayerHit(true);
          setPlayerDamageFloat("−? DMG");
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
    setMaxCombo(0);
    setSpellsCast(0);
    startEncounter({
      deck: unlockedDeck,
      rustActive: hasRustDebuff(),
    });
  }

  function rematch() {
    setMaxCombo(0);
    setSpellsCast(0);
    resetBattle();
    startEncounter({
      deck: unlockedDeck,
      rustActive: hasRustDebuff(),
    });
  }

  function handleRetreat() {
    resetBattle();
    router.push("/");
  }

  const retreatButton = (
    <button
      type="button"
      onClick={handleRetreat}
      className="fixed left-4 top-4 z-[100] rounded-md border border-slate-700 bg-black/40 px-4 py-2 text-sm text-slate-300 backdrop-blur-sm transition-colors hover:border-red-500 hover:bg-red-500/20 hover:text-red-100"
    >
      Retreat
    </button>
  );

  if (railTutorial) {
    return (
      <>
        {retreatButton}
        <TutorialArena
          onExit={() => setRailTutorial(false)}
          onComplete={() => {
            markArenaTutorialDone();
            setRailTutorial(false);
          }}
        />
      </>
    );
  }

  if (!started) {
    const canFight = unlockedDeck.length > 0;
    const loading = appStatus === "loading" || appStatus === "idle";

    return (
      <>
        {retreatButton}
        <div className="mx-auto flex h-full max-w-5xl flex-col items-center justify-center gap-4 overflow-hidden px-4 py-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-tablet glow-amber relative overflow-hidden border-amber-400/25 px-8 py-12 shadow-2xl"
        >
          <ArabicText size="lg" className="relative text-amber-100/90">
            حَرْبُ الْجُمَل
          </ArabicText>
          <h1 className="relative mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Sentence Arena
          </h1>
          <ol className="relative mx-auto mt-5 max-w-sm space-y-2 text-start text-sm text-white/65">
            <li className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <span className="font-semibold text-emerald-200">1.</span> Forge Word Cards on the
              Learning Path.
            </li>
            <li className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <span className="font-semibold text-amber-200">2.</span> Chain cards into a correct
              Arabic sentence (VSO; adjectives after nouns).
            </li>
            <li className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <span className="font-semibold text-violet-200">3.</span> Cast — grammar multiplies
              power; schools apply Burn, Frost Ward, Mind, Kinetic.
            </li>
          </ol>
          <div className="relative mt-8 flex flex-col items-center gap-3">
            {canFight ? (
              <Button
                size="lg"
                className="bg-celestial-amber h-12 px-8 text-base font-semibold text-obsidian hover:bg-amber-400"
                onClick={beginFreePlay}
              >
                Enter the Arena
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                className="h-12 bg-emerald-500 px-8 font-semibold text-black hover:bg-emerald-400"
              >
                <Link href="/path">Forge cards on the Path</Link>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/15 bg-white/5 text-white/80"
              onClick={openRailTutorial}
            >
              <RotateCcw className="size-3.5" />
              How to play
            </Button>
            {loading ? <p className="text-xs text-white/40">Syncing deck…</p> : null}
          </div>
          {canFight ? (
            <p className="relative mt-3 text-xs text-white/40">
              Deck: {unlockedDeck.length} card{unlockedDeck.length === 1 ? "" : "s"}
              {hasRustDebuff() ? " · Rust active" : ""}
              {autoTutorial ? " · Tutorial recommended" : ""}
            </p>
          ) : null}
        </motion.div>
        </div>
      </>
    );
  }

  const blockedBanner = lastEnemyHit === 0 && combatState === "enemy_attacking";

  return (
    <>
      {retreatButton}
      <BattleStage
      shake={screenShake || playerHit || Boolean(lastResult?.critical && combatState === "player_attacking")}
      combatState={combatState}
    >
      <ArenaMuteButton />
      <ResonanceCheck />
      <SpellCastVFX projectile={projectile} onDone={() => setProjectile(null)} />
      <BossAttackFlash active={bossFlash} />
      <CombatPhaseBanner combatState={combatState} blocked={blockedBanner} />

      {/* Row 1 — Boss Zone */}
      <div className={HUD_BOSS}>
        <div className="mb-1 flex w-full items-center justify-between gap-2 px-1 pe-12">
          <p className="text-[clamp(0.55rem,1.2vh,0.65rem)] tracking-wide text-white/40 uppercase">
            Sentence battle
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-white/45"
            disabled={combatState !== "idle"}
            onClick={() => {
              resetBattle();
              openRailTutorial();
            }}
          >
            <RotateCcw className="size-3.5" />
            How to play
          </Button>
        </div>
        <CombatTurnBanner />
        <div
          className={cn(
            "flex w-full items-start justify-center gap-3 px-1 md:gap-6",
            combatState === "enemy_attacking" && "relative z-[75]",
          )}
        >
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
            burn={burnTicks}
            frost={frostSkip}
            weakTo={weakTo}
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
            maxCombo={Math.max(1, maxCombo)}
            spellsCast={Math.max(1, spellsCast)}
            hibrAwarded={victory ? hibrAwarded : null}
            onRematch={rematch}
            pathHref="/path"
            pathLabel="Return to Path"
            onMountAudio={fadeOut}
          />
        </>
      )}

      {!victory && !defeat ? <SyntaxBoard /> : null}
    </BattleStage>
    </>
  );
}
