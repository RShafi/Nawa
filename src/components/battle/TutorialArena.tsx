"use client";

/**
 * Isolated rail tutorial — no RNG. Locks incorrect actions until the scripted step is done.
 */

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Droplets,
  Eye,
  Heart,
  RefreshCw,
  Shield,
  Swords,
  X,
} from "lucide-react";
import { ArabicText } from "@/components/common/ArabicText";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { markArenaTutorialDone } from "@/components/battle/TutorialOverlay";

type Phase = "intro" | 1 | 2 | 3 | 4 | "victory";

type RootCard = { id: string; letters: string; gloss: string };
type PatternCard = { id: string; template: string; name: string };

const ALL_ROOTS: RootCard[] = [
  { id: "drs", letters: "د-ر-س", gloss: "studying" },
  { id: "drb", letters: "ض-ر-ب", gloss: "striking" },
  { id: "hfz", letters: "ح-ف-ظ", gloss: "guarding" },
  { id: "slm", letters: "س-ل-م", gloss: "peace" },
];

const ALL_PATTERNS: PatternCard[] = [
  { id: "noun-of-place", template: "مَفْعَل", name: "Place noun" },
  { id: "form-1", template: "فَعَلَ", name: "Form I" },
  { id: "active-participle", template: "فَاعِل", name: "Doer" },
];

const SPELLS: Record<string, { arabic: string; english: string; damage: number }> = {
  "drs:noun-of-place": {
    arabic: "مَدْرَسَة",
    english: "school / place of learning",
    damage: 10,
  },
  "drb:form-1": { arabic: "ضَرَبَ", english: "he struck", damage: 28 },
  "slm:form-1": { arabic: "سَلِمَ", english: "he was safe", damage: 12 },
};

type TutorialArenaProps = {
  onExit: () => void;
  onComplete: () => void;
};

export function TutorialArena({ onExit, onComplete }: TutorialArenaProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [coachOpen, setCoachOpen] = useState(true);
  const [playerHp] = useState(40);
  const [enemyHp, setEnemyHp] = useState(80);
  const [ink, setInk] = useState(10);
  const [wardUp, setWardUp] = useState(true);
  const [staggered, setStaggered] = useState(false);
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const [forged, setForged] = useState<{ root: string; pattern: string } | null>(null);
  const [tafsir, setTafsir] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [handRoots, setHandRoots] = useState<RootCard[]>(() => [
    ALL_ROOTS[0]!,
    ALL_ROOTS[1]!,
    ALL_ROOTS[2]!,
  ]);

  const intentLabel =
    phase === 1 || phase === "intro"
      ? "Enemy next turn: Heavy Strike (20 damage)"
      : staggered
        ? "Enemy next turn: Weak hit (6 damage)"
        : "Enemy next turn: Heavy Strike (20 damage)";

  const required = useMemo(() => {
    if (phase === 1) return { root: "drs", pattern: "noun-of-place" };
    if (phase === 2) return { root: "drb", pattern: "form-1" };
    if (phase === 3) return null;
    if (phase === 4) return { root: "slm", pattern: "form-1" };
    return null;
  }, [phase]);

  const coach = useMemo(() => {
    switch (phase) {
      case "intro":
        return {
          title: "How this fight works",
          body: (
            <div className="space-y-2 text-sm leading-snug text-white/80">
              <p>
                <span className="font-semibold text-white">Goal:</span> Drop the enemy’s HP to 0
                before yours hits 0.
              </p>
              <p>
                <span className="font-semibold text-white">How you attack:</span> Tap a{" "}
                <span className="text-emerald-200">Root</span> (3 Arabic letters) then a{" "}
                <span className="text-amber-200">Pattern</span> (word shape). That builds a word.
                Tap <span className="font-semibold">Cast</span> to use it.
              </p>
              <p>
                <span className="font-semibold text-white">Wards:</span> English locks on the enemy.
                Cast the Arabic word that matches a lock to break it. Break every lock to{" "}
                <span className="font-semibold">Stagger</span> the enemy (they take more damage).
              </p>
              <p>
                <span className="font-semibold text-white">Ink:</span> Resource above your cards.
                Redraw costs 2 Ink and replaces your Roots. Flick Ink costs 0 and deals 2 damage.
              </p>
            </div>
          ),
        };
      case 1:
        return {
          title: "Step 1 — Break the Ward",
          body: (
            <div className="space-y-1.5 text-sm leading-snug text-white/80">
              <p>
                The enemy has one Ward: <span className="font-semibold">“A place of learning.”</span>
              </p>
              <p>
                1. Tap the glowing Root <ArabicInline>د-ر-س</ArabicInline> (studying).
              </p>
              <p>
                2. Tap the glowing Pattern <ArabicInline>مَفْعَل</ArabicInline> (place noun).
              </p>
              <p>
                3. That makes <ArabicInline>مَدْرَسَة</ArabicInline>. Tap Cast to break the Ward.
              </p>
            </div>
          ),
        };
      case 2:
        return {
          title: "Step 2 — Hit while Staggered",
          body: (
            <div className="space-y-1.5 text-sm leading-snug text-white/80">
              <p>The Ward is gone. The enemy is Staggered, so attacks deal extra damage.</p>
              <p>
                Tap Root <ArabicInline>ض-ر-ب</ArabicInline>, then Pattern{" "}
                <ArabicInline>فَعَلَ</ArabicInline>, then Cast.
              </p>
            </div>
          ),
        };
      case 3:
        return {
          title: "Step 3 — Redraw your hand",
          body: (
            <div className="space-y-1.5 text-sm leading-snug text-white/80">
              <p>Your Roots are useless on purpose.</p>
              <p>
                Tap <span className="font-semibold text-amber-200">Redraw (−2 Ink)</span> to get a
                new set of Roots. You need this before you can attack again.
              </p>
            </div>
          ),
        };
      case 4:
        return {
          title: "Step 4 — Reveal, then finish",
          body: (
            <div className="space-y-1.5 text-sm leading-snug text-white/80">
              <p>
                Some Roots hide their meaning (mastered words). Tap the{" "}
                <span className="font-semibold">Eye / Reveal</span> button on{" "}
                <ArabicInline>س-ل-م</ArabicInline> first.
              </p>
              <p>
                Revealing cuts that word’s damage in half for this fight. Then tap Pattern{" "}
                <ArabicInline>فَعَلَ</ArabicInline> and Cast to win.
              </p>
            </div>
          ),
        };
      default:
        return {
          title: "Tutorial done",
          body: (
            <p className="text-sm text-white/80">
              You know the loop: Root → Pattern → Cast. Break Wards, Stagger, manage Ink, Reveal when
              needed.
            </p>
          ),
        };
    }
  }, [phase]);

  function flash(msg: string) {
    setBanner(msg);
    setShake(Date.now());
    window.setTimeout(() => setBanner(null), 1600);
  }

  function trySelectRoot(id: string) {
    if (phase === "intro" || phase === 3 || phase === "victory") return;
    if (required && id !== required.root) {
      flash("Wrong Root — tap the glowing one.");
      return;
    }
    setSelectedRoot(id);
    setForged(null);
  }

  function trySelectPattern(id: string) {
    if (phase === "intro" || phase === 3 || phase === "victory" || !selectedRoot) return;
    if (required && id !== required.pattern) {
      flash("Wrong Pattern — tap the glowing one.");
      return;
    }
    if (phase === 4 && !tafsir) {
      flash("Tap Reveal (Eye) on the Root first.");
      return;
    }
    setForged({ root: selectedRoot, pattern: id });
    setSelectedRoot(null);
  }

  function cast() {
    if (!forged) return;
    const key = `${forged.root}:${forged.pattern}`;
    const spell = SPELLS[key];
    if (!spell) {
      flash("That combination is not a valid word.");
      setForged(null);
      return;
    }

    if (phase === 1) {
      if (key !== "drs:noun-of-place") {
        flash("Build مَدْرَسَة to break the Ward.");
        return;
      }
      setWardUp(false);
      setStaggered(true);
      setEnemyHp((h) => h - spell.damage);
      flash("Ward broken — enemy Staggered!");
      setForged(null);
      setPhase(2);
      setCoachOpen(true);
      return;
    }

    if (phase === 2) {
      if (key !== "drb:form-1") {
        flash("Build ضَرَبَ for this step.");
        return;
      }
      const dmg = Math.round(spell.damage * 2.2);
      setEnemyHp((h) => Math.max(12, h - dmg));
      flash(`Stagger hit −${dmg} HP`);
      setForged(null);
      setHandRoots([ALL_ROOTS[2]!, ALL_ROOTS[2]!, ALL_ROOTS[2]!]);
      setPhase(3);
      setCoachOpen(true);
      return;
    }

    if (phase === 4) {
      if (key !== "slm:form-1" || !tafsir) {
        flash("Reveal first, then Cast سَلِمَ.");
        return;
      }
      setEnemyHp(0);
      flash("Victory!");
      setForged(null);
      setPhase("victory");
      markArenaTutorialDone();
      onComplete();
    }
  }

  function doRedraw() {
    if (phase !== 3) {
      flash("Redraw is only needed on this step.");
      return;
    }
    if (ink < 2) {
      flash("Need 2 Ink.");
      return;
    }
    setInk((n) => n - 2);
    setHandRoots([ALL_ROOTS[3]!, ALL_ROOTS[1]!, ALL_ROOTS[0]!]);
    flash("New Roots drawn (−2 Ink)");
    setPhase(4);
    setCoachOpen(true);
    setTafsir(false);
  }

  const forgedSpell = forged ? SPELLS[`${forged.root}:${forged.pattern}`] : null;
  const enemyPct = (enemyHp / 80) * 100;
  const playerPct = (playerHp / 40) * 100;
  const playLocked = coachOpen || phase === "intro" || phase === "victory";

  return (
    <motion.div
      animate={shake ? { x: [0, -4, 4, -2, 2, 0] } : { x: 0 }}
      className="relative mx-auto flex h-full max-w-3xl flex-col gap-2 overflow-hidden px-3 py-2 sm:px-4"
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <p className="text-[10px] tracking-wide text-amber-200/80 uppercase">Tutorial</p>
        <Button type="button" variant="ghost" size="sm" className="h-8 text-white/50" onClick={onExit}>
          <X className="size-4" />
          Exit
        </Button>
      </div>

      <div className="shrink-0 rounded-xl border border-rose-400/40 bg-rose-500/15 px-2.5 py-1.5 text-center text-[11px] font-semibold text-rose-50 sm:text-xs">
        {intentLabel}
      </div>

      <section className="glass-panel shrink-0 space-y-2 rounded-2xl px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Swords className="size-4 shrink-0 text-violet-300" />
            <h2 className="truncate text-sm font-semibold text-white">Shadow of Ignorance</h2>
            {staggered ? (
              <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-200 uppercase">
                Staggered
              </span>
            ) : null}
          </div>
          <div className="w-28 shrink-0 space-y-0.5 sm:w-36">
            <div className="flex justify-between text-[10px] text-white/50">
              <span>HP</span>
              <span className="font-mono">
                {enemyHp}/80
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-black/40">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-rose-500"
                animate={{ width: `${enemyPct}%` }}
              />
            </div>
          </div>
        </div>
        {wardUp ? (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border border-violet-400/40 bg-violet-500/15 px-2 py-1 text-xs text-violet-50",
              phase === 1 && !coachOpen && "ring-2 ring-amber-400/70",
            )}
          >
            <Shield className="size-3" />
            Ward: A place of learning
          </div>
        ) : (
          <p className="text-[10px] text-white/40 line-through">Ward broken</p>
        )}
      </section>

      <AnimatePresence>
        {banner ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-panel-strong shrink-0 rounded-xl px-3 py-2 text-center text-xs font-semibold text-white"
          >
            {banner}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {coachOpen || phase === "intro" || phase === "victory" ? (
        <div className="glass-panel-strong min-h-0 flex-1 overflow-y-auto rounded-2xl border border-amber-400/25 p-3">
          <p className="text-[10px] font-semibold tracking-wide text-amber-200 uppercase">
            {coach.title}
          </p>
          <div className="mt-2">{coach.body}</div>
          {phase === "victory" ? (
            <Button
              className="mt-4 bg-amber-500 font-semibold text-black hover:bg-amber-400"
              onClick={onExit}
            >
              Back to Arena
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="mt-3 bg-amber-500 font-semibold text-black hover:bg-amber-400"
              onClick={() => {
                if (phase === "intro") {
                  setPhase(1);
                  setCoachOpen(true);
                  return;
                }
                setCoachOpen(false);
              }}
            >
              {phase === "intro" ? "Start step 1" : "Got it — play"}
            </Button>
          )}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          <div
            className={cn(
              "glass-panel flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl px-2.5 py-2",
              phase === 3 && "ring-2 ring-amber-400/70",
            )}
          >
            <span className="inline-flex items-center gap-1 text-xs text-amber-100">
              <Droplets className="size-3.5 text-amber-300" />
              Ink {ink}/10
            </span>
            <div className="flex gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={cn(
                  "h-8 border-white/15 text-xs",
                  phase === 3 && "border-amber-400/60 bg-amber-500/20 text-amber-50",
                )}
                disabled={phase !== 3 || ink < 2}
                onClick={doRedraw}
              >
                <RefreshCw className="size-3" />
                Redraw (−2)
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 border-white/15 text-xs opacity-50"
                disabled
              >
                Flick Ink
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain">
            <p className="text-center text-[9px] tracking-wide text-white/40 uppercase">
              1 · Roots
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {handRoots.map((r, i) => {
                const dim = phase !== 3 && required && r.id !== required.root;
                const mastered = phase === 4 && r.id === "slm";
                const showReveal = mastered && !tafsir;
                return (
                  <div
                    key={`${r.id}-${i}`}
                    className={cn(
                      "glass-panel-strong flex w-[5.75rem] shrink-0 flex-col items-center gap-0.5 rounded-xl px-1.5 py-1.5",
                      selectedRoot === r.id && "border-emerald-300/80 bg-emerald-500/15",
                      required?.root === r.id && phase !== 3 && "ring-2 ring-emerald-400/80",
                      dim && "opacity-25",
                    )}
                  >
                    <button
                      type="button"
                      disabled={playLocked || phase === 3 || !!forged}
                      onClick={() => trySelectRoot(r.id)}
                      className="flex w-full flex-col items-center gap-0.5 rounded-lg py-0.5 disabled:opacity-60"
                    >
                      <ArabicText
                        size="inherit"
                        className="battle-arabic whitespace-nowrap text-base leading-none text-emerald-50"
                      >
                        {r.letters}
                      </ArabicText>
                      {!showReveal ? (
                        <span className="text-[9px] text-white/45">
                          {mastered && tafsir ? "peace" : r.gloss}
                        </span>
                      ) : null}
                    </button>
                    {showReveal ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-0.5 rounded-full border border-white/20 px-1.5 py-0.5 text-[9px] text-white/70 ring-2 ring-amber-400/60"
                        onClick={() => {
                          setTafsir(true);
                          flash("Meaning shown — this Root deals half damage");
                        }}
                      >
                        <Eye className="size-2.5" />
                        Reveal
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <p className="text-center text-[9px] tracking-wide text-white/40 uppercase">
              2 · Patterns
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {ALL_PATTERNS.map((p) => {
                const dim =
                  phase === 3 || (required && p.id !== required.pattern) || !selectedRoot;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={playLocked || phase === 3 || !selectedRoot || !!forged}
                    onClick={() => trySelectPattern(p.id)}
                    className={cn(
                      "glass-panel rounded-xl px-1 py-1.5",
                      selectedRoot && required?.pattern === p.id && "ring-2 ring-amber-400/80",
                      dim && "opacity-30",
                    )}
                  >
                    <ArabicText
                      size="inherit"
                      className="battle-arabic block whitespace-nowrap text-sm leading-none text-amber-50"
                    >
                      {p.template}
                    </ArabicText>
                    <span className="mt-0.5 block text-[8px] text-white/40 uppercase">{p.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex min-h-[3.5rem] flex-col items-center justify-center gap-1.5 py-1">
              {forged && forgedSpell ? (
                <>
                  <div className="glass-panel-strong w-full max-w-[14rem] rounded-xl border border-amber-400/35 px-3 py-2 text-center">
                    <ArabicText
                      size="inherit"
                      className="battle-arabic whitespace-nowrap text-xl leading-none text-amber-50"
                    >
                      {forgedSpell.arabic}
                    </ArabicText>
                    <p className="mt-0.5 text-[10px] text-white/50">{forgedSpell.english}</p>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 bg-amber-500 font-semibold text-black hover:bg-amber-400"
                    onClick={cast}
                  >
                    <ArrowUp className="size-3.5" />
                    Cast
                  </Button>
                </>
              ) : (
                <p className="text-xs text-white/35">
                  {phase === 3 ? "Tap Redraw above" : "Root → Pattern → Cast"}
                </p>
              )}
            </div>
          </div>

          <section className="glass-panel shrink-0 rounded-xl px-2.5 py-2">
            <div className="flex items-center gap-2 text-xs text-white">
              <Heart className="size-3.5 text-rose-400" />
              You
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/40">
                <div className="h-full bg-rose-500" style={{ width: `${playerPct}%` }} />
              </div>
              <span className="font-mono text-[10px] text-white/60">
                {playerHp}/40
              </span>
            </div>
          </section>
        </div>
      )}
    </motion.div>
  );
}

function ArabicInline({ children }: { children: string }) {
  return (
    <ArabicText size="inherit" className="inline whitespace-nowrap text-[0.95em] text-amber-100">
      {children}
    </ArabicText>
  );
}
