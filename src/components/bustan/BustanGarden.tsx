"use client";

import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Droplets,
  Flame,
  HelpCircle,
  Leaf,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import { updateTreeMastery } from "@/app/actions/progress";
import { RootTree } from "@/components/bustan/RootTree";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  type BustanTree,
  type MasteryLevel,
  useGamificationStore,
} from "@/store/useGamificationStore";

const STAGE_COPY: Record<
  MasteryLevel,
  { name: string; plain: string; next: string }
> = {
  0: {
    name: "Seed",
    plain: "You’ve met the root, but haven’t practiced its patterns yet.",
    next: "Water once to sprout — learn one pattern family.",
  },
  1: {
    name: "Sprout",
    plain: "The root is alive. A couple of word shapes are sticking.",
    next: "Keep watering to grow branches (more patterns).",
  },
  2: {
    name: "Branching",
    plain: "Several molds of this root feel familiar.",
    next: "One more push to a full canopy (mastery).",
  },
  3: {
    name: "Canopy",
    plain: "This root is mastered — it glows in your orchard.",
    next: "Revisit in Morph Forge to keep it sharp.",
  },
};

export function BustanGarden() {
  const trees = useGamificationStore((s) => s.trees);
  const hibrCurrency = useGamificationStore((s) => s.hibrCurrency);
  const growTree = useGamificationStore((s) => s.growTree);
  const progressHydrated = useGamificationStore((s) => s.progressHydrated);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [celebrateId, setCelebrateId] = useState<string | null>(null);
  const [waterQuiz, setWaterQuiz] = useState<{
    rootId: string;
    prompt: string;
    options: string[];
    answer: string;
  } | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<"ok" | "no" | null>(null);

  useEffect(() => {
    if (!selectedId && trees[0]) setSelectedId(trees[0].rootId);
  }, [trees, selectedId]);

  const selected = trees.find((t) => t.rootId === selectedId) ?? trees[0];
  const mastered = trees.filter((t) => t.masteryLevel === 3).length;
  const orchardPct =
    trees.length === 0
      ? 0
      : Math.round(
          (trees.reduce((sum, t) => sum + t.masteryLevel, 0) / (trees.length * 3)) * 100,
        );

  const planted = trees.filter((t) => t.masteryLevel > 0).length;
  const growthStreak = trees.filter((t) => t.masteryLevel >= 1 && t.masteryLevel < 3).length;
  const hibrGenerated = hibrCurrency; // live balance; lifetime ledger can replace later

  const dailyQuest = useMemo(() => {
    const seed = trees.find((t) => t.masteryLevel === 0);
    if (seed) {
      return {
        title: "Today’s quest",
        body: `Sprout the ${seed.letters} root (${seed.gloss}). Water it once below.`,
        rootId: seed.rootId,
      };
    }
    const branching = trees.find((t) => t.masteryLevel < 3);
    if (branching) {
      return {
        title: "Today’s quest",
        body: `Push ${branching.letters} closer to canopy.`,
        rootId: branching.rootId,
      };
    }
    return {
      title: "Orchard complete",
      body: "Every root has a canopy — keep sharp in Morph Forge.",
      rootId: trees[0]?.rootId ?? null,
    };
  }, [trees]);

  function startWater(tree: BustanTree) {
    if (tree.masteryLevel >= 3) return;
    setSelectedId(tree.rootId);
    setQuizFeedback(null);
    // Tiny gate: one easy question so watering feels earned
    const options = shuffle([
      tree.gloss,
      ...trees
        .filter((t) => t.rootId !== tree.rootId)
        .map((t) => t.gloss)
        .slice(0, 2),
    ]);
    setWaterQuiz({
      rootId: tree.rootId,
      prompt: `Quick check — the root ${tree.letters} is about…`,
      options,
      answer: tree.gloss,
    });
  }

  function answerWater(choice: string) {
    if (!waterQuiz) return;
    if (choice !== waterQuiz.answer) {
      setQuizFeedback("no");
      return;
    }
    setQuizFeedback("ok");
    const grown = growTree(waterQuiz.rootId);
    if (grown) {
      void updateTreeMastery(grown.rootId, grown.letters, grown.masteryLevel);
    }
    setCelebrateId(waterQuiz.rootId);
    void confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ["#86efac", "#fbbf24", "#34d399"],
    });
    window.setTimeout(() => {
      setWaterQuiz(null);
      setQuizFeedback(null);
      setCelebrateId(null);
    }, 900);
  }

  if (!progressHydrated && trees.length === 0) {
    return (
      <p className="text-muted-foreground py-16 text-center text-base">Loading your orchard…</p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary header */}
      <section className="glass-panel glow-emerald relative overflow-hidden rounded-3xl px-5 py-8 sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute -end-10 -top-10 size-56 rounded-full bg-emerald-400/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -start-8 bottom-0 size-44 rounded-full bg-amber-400/10 blur-3xl"
          aria-hidden
        />
        <div className="relative space-y-5">
          <Badge variant="secondary" className="gap-1.5 border-emerald-400/20 bg-emerald-500/10 text-emerald-200">
            <Leaf className="size-3.5" />
            <span className="font-arabic leading-loose" dir="rtl" lang="ar">
              البستان
            </span>
            <span>· The Bustān</span>
          </Badge>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Watch your Arabic roots grow into trees
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            Every tree is one three-letter root. Practice its patterns and it grows: seed → sprout →
            branches → glowing canopy.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatPill label="Trees planted" value={String(planted || trees.length)} hint="in orchard" />
            <StatPill label="Growth streak" value={String(growthStreak)} hint="actively growing" />
            <StatPill label="Fully rooted" value={`${mastered}/${trees.length}`} hint={`${orchardPct}% strength`} />
            <StatPill label="Hibr ink" value={String(hibrGenerated)} hint="current balance" amber />
          </div>
        </div>
      </section>

      {/* Daily quest */}
      <motion.div
        layout
        className="glass-panel flex flex-col gap-3 rounded-2xl border-amber-400/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
      >
        <div className="flex gap-3">
          <div className="bg-amber-500/15 text-amber-300 flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Target className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-amber-200 uppercase">
              {dailyQuest.title}
            </p>
            <p className="text-muted-foreground mt-0.5 text-base leading-snug">{dailyQuest.body}</p>
          </div>
        </div>
        {dailyQuest.rootId ? (
          <Button
            size="sm"
            className="shrink-0 gap-1"
            onClick={() => {
              const t = trees.find((x) => x.rootId === dailyQuest.rootId);
              if (t) startWater(t);
            }}
          >
            Focus quest
            <ArrowRight className="size-4" />
          </Button>
        ) : null}
      </motion.div>

      {/* How growth works */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="text-muted-foreground size-4" />
          <h2 className="text-lg font-semibold sm:text-xl">How a tree grows</h2>
        </div>
        <ol className="grid gap-2 sm:grid-cols-4">
          {(
            [
              [0, "Seed", "Just planted"],
              [1, "Sprout", "First patterns"],
              [2, "Branching", "Several molds"],
              [3, "Canopy", "Mastered"],
            ] as const
          ).map(([lvl, name, hint]) => (
            <li
              key={lvl}
              className="glass-panel rounded-xl px-3 py-3 text-center text-sm sm:text-base"
            >
              <p className="font-semibold">{name}</p>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">{hint}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Orchard plot */}
        <section className="glass-panel relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-950/40 via-emerald-950/20 to-emerald-950/50" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-950/80 to-transparent" />
          <div className="relative px-3 pb-6 pt-5 sm:px-5">
            <div className="mb-4 flex items-center justify-between gap-2 px-1">
              <p className="text-sm font-medium text-emerald-100/90 sm:text-base">Your orchard</p>
              <p className="text-muted-foreground text-xs sm:text-sm">Tap a tree to inspect</p>
            </div>
            <div className="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trees.map((tree, i) => (
                <motion.div
                  key={tree.rootId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 220, damping: 24 }}
                  className="flex justify-center"
                >
                  <RootTree
                    letters={tree.letters}
                    masteryLevel={tree.masteryLevel}
                    patternsMastered={tree.patternsMastered}
                    patternsTotal={tree.patternsTotal}
                    gloss={tree.gloss}
                    selected={selected?.rootId === tree.rootId}
                    celebrating={celebrateId === tree.rootId}
                    onSelect={() => setSelectedId(tree.rootId)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {selected ? (
            <motion.aside
              key={selected.rootId}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="glass-panel-strong flex flex-col gap-4 rounded-3xl p-5"
            >
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">Focused root</p>
                <p
                  className="font-arabic mt-1 text-4xl font-semibold tracking-wide sm:text-5xl"
                  dir="rtl"
                  lang="ar"
                >
                  {selected.letters}
                </p>
                <p className="mt-2 text-lg font-medium capitalize sm:text-xl">{selected.gloss}</p>
                <Badge className="mt-2" variant="outline">
                  {STAGE_COPY[selected.masteryLevel].name}
                </Badge>
              </div>

              <p className="text-muted-foreground text-base leading-relaxed">
                {STAGE_COPY[selected.masteryLevel].plain}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pattern progress</span>
                  <span className="font-medium">
                    {selected.patternsMastered}/{selected.patternsTotal}
                  </span>
                </div>
                <Progress
                  value={(selected.patternsMastered / Math.max(1, selected.patternsTotal)) * 100}
                />
                <p className="text-muted-foreground text-sm leading-snug">
                  <Sparkles className="text-primary me-1 inline size-3.5" />
                  {STAGE_COPY[selected.masteryLevel].next}
                </p>
              </div>

              {waterQuiz?.rootId === selected.rootId ? (
                <div className="space-y-3 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-sky-200">
                    <Droplets className="size-4" />
                    Watering quiz
                  </p>
                  <p className="text-base">{waterQuiz.prompt}</p>
                  <div className="grid gap-2">
                    {waterQuiz.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => answerWater(opt)}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-start text-sm transition-colors sm:text-base",
                          "hover:bg-muted/50",
                          quizFeedback === "no" && opt !== waterQuiz.answer && "opacity-60",
                          quizFeedback === "ok" &&
                            opt === waterQuiz.answer &&
                            "border-emerald-500/50 bg-emerald-500/15",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {quizFeedback === "no" ? (
                    <p className="text-sm text-red-300">Not quite — try again.</p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-auto flex flex-col gap-2">
                  <Button
                    size="lg"
                    className="gap-2"
                    disabled={selected.masteryLevel >= 3}
                    onClick={() => startWater(selected)}
                  >
                    <Droplets className="size-4" />
                    {selected.masteryLevel >= 3 ? "Fully grown" : "Water this root"}
                  </Button>
                  <Button asChild variant="outline" size="lg" className="gap-2">
                    <Link href="/forge">
                      <Flame className="size-4" />
                      Drill patterns in Morph Forge
                    </Link>
                  </Button>
                </div>
              )}
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  hint,
  amber,
}: {
  label: string;
  value: string;
  hint?: string;
  amber?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl px-3 py-3",
        amber ? "glow-amber border-amber-400/20" : "border-emerald-400/10",
      )}
    >
      <p className="text-[10px] tracking-wide text-white/45 uppercase">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-xl font-semibold tabular-nums",
          amber ? "text-glow-amber text-amber-100" : "text-emerald-50",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-white/35">{hint}</p> : null}
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}
