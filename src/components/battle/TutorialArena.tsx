"use client";

/**
 * 4-round guided tutorial — Attack → Defend → Syntax → Resonance Crit.
 */

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { ArenaMuteButton } from "@/components/battle/ArenaMuteButton";
import { BattleResultOverlay } from "@/components/battle/BattleResultOverlay";
import { BattleStage, CombatPhaseBanner, HUD_BOSS, HUD_HAND, HUD_MIDDLE } from "@/components/battle/BattleStage";
import { BossEntity, PlayerHero, type CombatFloat } from "@/components/battle/BattleEntities";
import { InkPoolBar } from "@/components/battle/InkPoolBar";
import { ResonanceCheck } from "@/components/battle/ResonanceCheck";
import { SpellCastVFX, type SpellProjectile } from "@/components/battle/SpellCastVFX";
import {
  GuideBanner,
  markArenaTutorialDone,
  SpotlightElevate,
  TargetArrow,
  TutorialBlackout,
} from "@/components/battle/TutorialOverlay";
import { WordCardView } from "@/components/battle/WordCardView";
import { Button } from "@/components/ui/button";
import {
  getWordCard,
  syntaxMultiplier,
  type WordCard,
} from "@/data/combatDictionary";
import { useBGM } from "@/hooks/useBGM";
import { type CombatState, delay, RESONANCE_CRIT_MULT } from "@/lib/combatPacing";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { validateSyntax } from "@/lib/syntax";
import { MAX_BATTLE_INK } from "@/store/useBattleStore";
import { cn } from "@/lib/utils";
import { SyntaxChamber } from "@/components/battle/SyntaxBoard";

const FLAME_ID = "drb-noun-of-instrument";
const FROST_ID = "hfz-active-participle";
const NOUN_ID = "ktb-noun-book";
const ADJ_ID = "kbr-adjective";
const WEAK_A = "drs-active-participle";
const WEAK_B = "ktb-place-noun";

type Phase =
  | "prologue"
  | "r1_cast"
  | "r2_defend"
  | "r3_syntax"
  | "r4_resonance"
  | "victory";

type Props = { onExit: () => void; onComplete: () => void };

function card(id: string): WordCard | undefined {
  return getWordCard(id);
}

function cardsOf(...ids: string[]): WordCard[] {
  return ids.map((id) => card(id)).filter((c): c is WordCard => Boolean(c));
}

export function TutorialArena({ onExit, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("prologue");
  const [combatState, setCombatState] = useState<CombatState>("idle");
  const [sentence, setSentence] = useState<WordCard[]>([]);
  const [hand, setHand] = useState<WordCard[]>([]);
  const [ink, setInk] = useState(MAX_BATTLE_INK);
  const [playerHp, setPlayerHp] = useState(40);
  const [playerShield, setPlayerShield] = useState(0);
  const [enemyHp, setEnemyHp] = useState(120);
  const [enemyShield, setEnemyShield] = useState(15);
  const [intentLabel, setIntentLabel] = useState("Idle — studying you");
  const [intentDmg, setIntentDmg] = useState(8);
  const [bossHit, setBossHit] = useState(false);
  const [bossAttacking, setBossAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [playerFloat, setPlayerFloat] = useState<string | null>(null);
  const [projectile, setProjectile] = useState<SpellProjectile | null>(null);
  const [floats, setFloats] = useState<CombatFloat[]>([]);
  const [shake, setShake] = useState(false);
  const [blockedBanner, setBlockedBanner] = useState(false);
  const [resolvingUi, setResolvingUi] = useState(false);
  const [resonanceCards, setResonanceCards] = useState<WordCard[] | null>(null);
  const resolving = useRef(false);
  const { playTap, playSnap, playCast, playSuccess, playError, playImpact } = useSoundEffects();
  const { fadeOut } = useBGM("/sounds/battle-theme.mp3");

  const syntax = validateSyntax(sentence);
  const mult = sentence.length ? syntaxMultiplier(sentence.length) : 0;
  const busy = combatState !== "idle" || resolvingUi;

  const guide = useMemo(() => {
    switch (phase) {
      case "r1_cast":
        return {
          step: 1,
          total: 4,
          title: "Round 1 — The Basics",
          body: "Spend Ink (حِبْر) to play your FLAME card into the Spell Chamber, then Cast. Watch your strike land — then the Golem’s reply.",
        };
      case "r2_defend":
        return {
          step: 2,
          total: 4,
          title: "Round 2 — Defense",
          body: "The Golem is charging a massive hit! Play a Frost / Shield card to raise a Ward, then Cast so you survive the blow.",
        };
      case "r3_syntax":
        return {
          step: 3,
          total: 4,
          title: "Round 3 — Syntax Building",
          body: "Combine a Noun and an Adjective in the Spell Chamber. In Arabic, the adjective follows the noun — build a phrase that makes sense.",
        };
      case "r4_resonance":
        return {
          step: 4,
          total: 4,
          title: "Round 4 — Resonance Check",
          body: "Your spell is woven. Cast it, then translate its meaning to channel a Critical Strike and finish the Golem!",
        };
      default:
        return null;
    }
  }, [phase]);

  function begin() {
    playTap();
    setHand(cardsOf(FLAME_ID, WEAK_A, WEAK_B));
    setSentence([]);
    setInk(MAX_BATTLE_INK);
    setPlayerHp(40);
    setPlayerShield(0);
    setEnemyHp(120);
    setEnemyShield(15);
    setIntentLabel("Idle — studying you");
    setIntentDmg(8);
    setPhase("r1_cast");
    setCombatState("idle");
  }

  function allowedCard(c: WordCard): boolean {
    if (phase === "r1_cast") return c.id === FLAME_ID;
    if (phase === "r2_defend") return c.id === FROST_ID;
    if (phase === "r3_syntax" || phase === "r4_resonance") {
      const order = [NOUN_ID, ADJ_ID];
      return c.id === order[sentence.length];
    }
    return false;
  }

  function onHandTap(c: WordCard) {
    if (busy) {
      playError();
      return;
    }
    if (!allowedCard(c)) {
      playError();
      return;
    }
    if (ink < 1) {
      playError();
      return;
    }
    playSnap();
    setInk((v) => v - 1);
    setHand((h) => h.filter((x) => x.id !== c.id));
    const next = [...sentence, c];
    setSentence(next);
    // Once Noun+Adj are seated, advance narrative to Round 4 (cast + resonance)
    if (phase === "r3_syntax" && next.length === 2) {
      setPhase("r4_resonance");
    }
  }

  async function runCombatLoop(opts: {
    cards: WordCard[];
    damageToBoss: number;
    clearEnemyShield?: boolean;
    grantPlayerShield?: number;
    enemyDamage: number;
    afterIdle: () => void;
    finishVictory?: boolean;
    critical?: boolean;
  }) {
    if (resolving.current) return;
    resolving.current = true;
    setResolvingUi(true);
    const arabic = opts.cards.map((c) => c.word).join(" · ");
    const m = syntaxMultiplier(opts.cards.length);
    const dmg = opts.critical
      ? opts.damageToBoss * RESONANCE_CRIT_MULT
      : opts.damageToBoss;

    setCombatState("player_attacking");
    setProjectile({ id: `p-${Date.now()}`, arabic });
    playCast();
    await delay(350);
    playSuccess();
    setBossHit(true);
    setFloats([
      {
        id: `d-${Date.now()}`,
        text: opts.critical
          ? `−${dmg} CRITICAL!`
          : m > 1
            ? `${m}× −${dmg}`
            : `−${dmg} DMG`,
        tone: opts.critical ? "critical" : "damage",
      },
      ...(opts.grantPlayerShield
        ? [{ id: `s-${Date.now()}`, text: `+${opts.grantPlayerShield} WARD`, tone: "frost" as const }]
        : []),
    ]);
    if (opts.critical) setShake(true);
    await delay(650);

    setEnemyHp((hp) => Math.max(0, hp - dmg));
    if (opts.clearEnemyShield) setEnemyShield(0);
    let ward = playerShield;
    if (opts.grantPlayerShield) {
      ward += opts.grantPlayerShield;
      setPlayerShield(ward);
    }
    setBossHit(false);
    setShake(false);
    setSentence([]);

    if (opts.finishVictory) {
      setEnemyHp(0);
      setCombatState("idle");
      setFloats([]);
      setPhase("victory");
      markArenaTutorialDone();
      resolving.current = false;
      setResolvingUi(false);
      return;
    }

    await delay(200);
    setCombatState("enemy_turn_transition");
    await delay(800);
    setCombatState("enemy_idle");
    await delay(300);

    let incoming = opts.enemyDamage;
    let nextShield = ward;
    let blocked = false;
    if (nextShield > 0) {
      const abs = Math.min(nextShield, incoming);
      nextShield -= abs;
      incoming -= abs;
      blocked = abs > 0;
    }

    setBlockedBanner(blocked && incoming === 0);
    setCombatState("enemy_attacking");
    setBossAttacking(true);
    await delay(200);
    playImpact();
    if (blocked && incoming === 0) {
      setPlayerFloat("BLOCKED!");
    } else {
      setPlayerHit(true);
      setPlayerFloat(`−${incoming} DMG`);
      setShake(true);
    }
    await delay(800);
    setBossAttacking(false);
    setPlayerShield(nextShield);
    if (incoming > 0) setPlayerHp((hp) => Math.max(1, hp - incoming));
    await delay(200);
    setPlayerHit(false);
    setPlayerFloat(null);
    setShake(false);
    setBlockedBanner(false);
    setFloats([]);

    await delay(1000);
    setInk(MAX_BATTLE_INK);
    setCombatState("idle");
    resolving.current = false;
    setResolvingUi(false);
    opts.afterIdle();
  }

  async function onCast() {
    if (busy) return;

    if (phase === "r1_cast") {
      if (sentence.length !== 1 || sentence[0]?.id !== FLAME_ID) {
        playError();
        return;
      }
      await runCombatLoop({
        cards: sentence,
        damageToBoss: 28,
        clearEnemyShield: true,
        enemyDamage: 8,
        afterIdle: () => {
          setHand(cardsOf(FROST_ID, WEAK_A, WEAK_B));
          setIntentLabel("Charging: 30 DMG");
          setIntentDmg(30);
          setPhase("r2_defend");
        },
      });
      return;
    }

    if (phase === "r2_defend") {
      if (sentence.length !== 1 || sentence[0]?.id !== FROST_ID) {
        playError();
        return;
      }
      await runCombatLoop({
        cards: sentence,
        damageToBoss: 6,
        grantPlayerShield: 36,
        enemyDamage: 30,
        afterIdle: () => {
          setHand(cardsOf(NOUN_ID, ADJ_ID, WEAK_A));
          setIntentLabel("Staggered — vulnerable");
          setIntentDmg(12);
          setEnemyHp(72);
          setPhase("r3_syntax");
        },
      });
      return;
    }

    if (phase === "r3_syntax" || phase === "r4_resonance") {
      if (sentence.length !== 2 || !syntax.ok) {
        playError();
        return;
      }
      if (sentence[0]?.id !== NOUN_ID || sentence[1]?.id !== ADJ_ID) {
        playError();
        return;
      }
      playCast();
      setPhase("r4_resonance");
      setResonanceCards([...sentence]);
      setCombatState("resonance_check");
    }
  }

  function onResonanceResolve(success: boolean) {
    const cards = resonanceCards ?? [];
    setResonanceCards(null);
    void runCombatLoop({
      cards,
      damageToBoss: success ? 500 : 250,
      enemyDamage: 0,
      finishVictory: true,
      critical: success,
      afterIdle: () => undefined,
    });
  }

  const highlightId =
    phase === "r1_cast"
      ? FLAME_ID
      : phase === "r2_defend"
        ? FROST_ID
        : phase === "r3_syntax" || phase === "r4_resonance"
          ? [NOUN_ID, ADJ_ID][sentence.length] ?? null
          : null;

  const pulseCast =
    !busy &&
    ((phase === "r1_cast" && sentence.length === 1) ||
      (phase === "r2_defend" && sentence.length === 1) ||
      ((phase === "r3_syntax" || phase === "r4_resonance") &&
        sentence.length === 2 &&
        syntax.ok));

  const pulseHand =
    !busy &&
    (phase === "r1_cast" ||
      phase === "r2_defend" ||
      phase === "r3_syntax" ||
      phase === "r4_resonance") &&
    !pulseCast &&
    sentence.length < (phase === "r3_syntax" || phase === "r4_resonance" ? 2 : 1);

  const pulseSyntax =
    !busy &&
    (phase === "r1_cast" ||
      phase === "r2_defend" ||
      phase === "r3_syntax" ||
      phase === "r4_resonance") &&
    (sentence.length > 0 || pulseHand === false);

  const spotlightTarget: "syntax" | "cast" | null = busy
    ? null
    : pulseCast
      ? "cast"
      : pulseSyntax && !pulseHand
        ? "syntax"
        : null;

  const showBlackout = phase !== "prologue" && phase !== "victory" && !busy;
  const elevateHand = Boolean(pulseHand || spotlightTarget === "cast");
  const elevateMiddle = spotlightTarget === "syntax";

  if (phase === "prologue") {
    return (
      <BattleStage className="grid-rows-[minmax(0,1fr)] place-items-center">
        <ArenaMuteButton />
        <div className="relative z-10 flex min-h-0 w-full max-w-lg flex-col items-center justify-center px-2 lg:max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-tablet glow-amber w-full border-amber-400/30 px-6 py-8 text-center"
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-200">
              <Sparkles className="size-7" />
            </div>
            <h1 className="mt-3 text-xl font-semibold text-white md:text-2xl">
              Four Rounds in the Crucible
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
              Learn Attack & Ink, Defend with Frost, weave Noun + Adjective syntax, then Channel the
              Meaning for a Critical Strike.
            </p>
            <Button
              size="lg"
              className="bg-celestial-amber mt-6 h-12 w-full font-semibold text-obsidian hover:bg-amber-400"
              onClick={begin}
            >
              Begin 4-Round Tutorial
            </Button>
            <button
              type="button"
              className="mt-3 text-xs text-white/40 hover:text-white/60"
              onClick={onExit}
            >
              Exit
            </button>
          </motion.div>
        </div>
      </BattleStage>
    );
  }

  return (
    <BattleStage shake={shake || playerHit} combatState={combatState}>
      <ArenaMuteButton />
      <TutorialBlackout active={showBlackout} />
      {resonanceCards ? (
        <ResonanceCheck
          cards={resonanceCards}
          active={combatState === "resonance_check"}
          onResolve={onResonanceResolve}
          distractors={hand}
        />
      ) : null}
      <SpellCastVFX projectile={projectile} onDone={() => setProjectile(null)} />
      <CombatPhaseBanner combatState={combatState} blocked={blockedBanner} />

      <div className={HUD_BOSS}>
        <div className="relative z-40 mb-1 flex w-full items-center justify-between px-1 pe-12">
          <p className="text-[clamp(0.55rem,1.2vh,0.65rem)] tracking-wide text-amber-200/70 uppercase">
            Guided Tutorial
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 bg-slate-900/80 text-white/45"
            disabled={busy}
            onClick={onExit}
          >
            <X className="size-3.5" />
            Exit
          </Button>
        </div>

        <div
          className={cn(
            "flex w-full items-start justify-center gap-3 md:gap-6",
            combatState === "enemy_attacking" && "relative z-[75]",
          )}
        >
          <PlayerHero
            hp={playerHp}
            maxHp={40}
            shield={playerShield}
            hit={playerHit}
            damageFloat={playerFloat}
          />
          <BossEntity
            name="Rune Golem"
            nameAr="جِنّ الْجَهْل"
            hp={enemyHp}
            maxHp={120}
            shield={enemyShield}
            hit={bossHit}
            attacking={bossAttacking || combatState === "enemy_attacking"}
            floats={floats}
            weakTo="FLAME"
            intentLabel={`${intentLabel}${intentDmg ? ` · ${intentDmg}` : ""}`}
          />
        </div>
      </div>

      {phase === "victory" ? (
        <>
          <div className={HUD_MIDDLE} aria-hidden />
          <div className={HUD_HAND} aria-hidden />
          <BattleResultOverlay
            outcome="victory"
            maxCombo={2}
            spellsCast={4}
            onRematch={onComplete}
            rematchLabel="Back to Arena"
            pathHref="/path"
            pathLabel="Return to Path"
            onMountAudio={fadeOut}
          />
        </>
      ) : (
        <>
          <div className={cn(HUD_MIDDLE, elevateMiddle && "relative z-[70]")}>
            {guide ? (
              <GuideBanner
                step={guide.step}
                totalSteps={guide.total}
                title={guide.title}
                body={guide.body}
              />
            ) : null}

            <SpotlightElevate
              active={spotlightTarget === "syntax"}
              className="w-full max-w-3xl"
            >
              <TargetArrow show={spotlightTarget === "syntax"} />
              <SyntaxChamber
                cards={sentence}
                mult={mult}
                syntaxValid={syntax.ok || sentence.length === 0}
              />
            </SpotlightElevate>
          </div>

          <div className={cn(HUD_HAND, elevateHand && "relative z-[70]")}>
            <div className="mb-2 flex flex-row flex-wrap items-center justify-center gap-2">
              <SpotlightElevate active={spotlightTarget === "cast"}>
                <TargetArrow show={spotlightTarget === "cast"} />
                <Button
                  size="sm"
                  disabled={!pulseCast}
                  className={cn(
                    "font-display h-8 min-w-[8rem] gap-1.5 text-xs font-bold tracking-wide sm:h-9 sm:text-sm",
                    pulseCast
                      ? "bg-celestial-amber text-obsidian shadow-[0_0_18px_rgba(245,158,11,0.35)] hover:bg-amber-400"
                      : "bg-white/10 text-white/35",
                  )}
                  onClick={() => void onCast()}
                >
                  <Sparkles className="size-3.5" />
                  Cast Spell
                </Button>
              </SpotlightElevate>

              <InkPoolBar ink={ink} maxInk={MAX_BATTLE_INK} />
            </div>

            <div
              className={cn(
                "mx-auto flex w-full flex-nowrap items-end justify-center gap-0 overflow-visible md:gap-2",
                pulseHand && "relative z-[70]",
              )}
            >
              {hand.map((c) => {
                const glow = Boolean(pulseHand && highlightId === c.id);
                const lockedCard =
                  busy || (highlightId != null && c.id !== highlightId);
                return (
                  <WordCardView
                    key={c.id}
                    card={c}
                    compact
                    inHand
                    highlight={glow}
                    elevated={glow}
                    locked={lockedCard}
                    dimmed={highlightId != null && !glow}
                    onClick={() => onHandTap(c)}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}
    </BattleStage>
  );
}
