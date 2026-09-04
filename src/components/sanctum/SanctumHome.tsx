"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Lock, Map, Sparkles, Swords } from "lucide-react";
import { curriculumData } from "@/content/curriculumData";
import {
  countCatalogRoots,
  countCatalogVocab,
  countDiscoveredRoots,
} from "@/content/ttsOverrides";
import { registerLessons } from "@/store/useLessonStore";
import { useBattleStore } from "@/store/useBattleStore";
import { useLessonStore } from "@/store/useLessonStore";
import { cn } from "@/lib/utils";

const ASTROLABE_SIZE = "min(92vw, 32rem)";

function AstrolabeRing({
  size,
  dashed,
  duration,
  reverse,
}: {
  size: string;
  dashed?: boolean;
  duration: number;
  reverse?: boolean;
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: size, height: size }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ repeat: Infinity, duration, ease: "linear" }}
    >
      <svg
        viewBox="0 0 200 200"
        className="size-full"
        aria-hidden
        fill="none"
      >
        <circle
          cx="100"
          cy="100"
          r="98"
          stroke="rgba(245,158,11,0.2)"
          strokeWidth="1"
          strokeDasharray={dashed ? "6 10" : undefined}
        />
      </svg>
    </motion.div>
  );
}

export function SanctumHome() {
  const playerDeck = useBattleStore((s) => s.playerDeck);
  const initializeDeck = useBattleStore((s) => s.initializeDeck);
  const masteredVocabIds = useLessonStore((s) => s.masteredVocabIds);
  const completedStepIds = useLessonStore((s) => s.completedStepIds);
  const hasHydrated = useLessonStore((s) => s.hasHydrated);

  useEffect(() => {
    registerLessons(curriculumData);
    initializeDeck(masteredVocabIds);
    if (!hasHydrated) {
      useLessonStore.persist.rehydrate();
    }
  }, [initializeDeck, masteredVocabIds, hasHydrated]);

  const totalRoots = countCatalogRoots();
  const discoveredRoots = countDiscoveredRoots(completedStepIds);
  const totalCards = countCatalogVocab();
  const forgedCards = playerDeck.length;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center overflow-x-hidden px-4 py-10 sm:py-12">
      {/* Celestial astrolabe — three rings, independent slow spins */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
        style={{ width: ASTROLABE_SIZE, height: ASTROLABE_SIZE }}
      >
        <AstrolabeRing size="100%" duration={60} />
        <AstrolabeRing size="72%" duration={90} dashed reverse />
        <AstrolabeRing size="44%" duration={120} />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center text-center">
        {/* Nawā core — glow on vector only */}
        <div className="relative mb-8 flex size-36 items-center justify-center sm:size-44">
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="relative flex items-center justify-center"
          >
            <Sparkles
              className="size-24 text-amber-300 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)] sm:size-28"
              strokeWidth={1.1}
              aria-hidden
            />
          </motion.div>
          <span
            className="font-arabic pointer-events-none absolute -bottom-1 text-2xl text-amber-300/90 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]"
            dir="rtl"
            lang="ar"
          >
            نَوَاة
          </span>
        </div>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-3"
        >
          <p className="font-serif text-xs tracking-[0.28em] text-amber-400/80 uppercase">
            The Celestial Scribe
          </p>
          <h1 className="font-serif text-3xl font-semibold tracking-wide text-amber-50 sm:text-4xl">
            Welcome to the Sanctum, Scribe.
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-300/70 sm:text-base">
            The universe&apos;s lexicon is shattered. Reclaim the Roots from the stars and weave
            them into power.
          </p>
        </motion.header>

        {/* Scribe's Codex dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.5 }}
          className="mt-10 w-full rounded-2xl border border-amber-500/20 bg-slate-900/90 p-5 text-start shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
          aria-labelledby="codex-title"
        >
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="size-4 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]" />
            <h2 id="codex-title" className="font-serif text-sm tracking-[0.14em] text-amber-400 uppercase">
              Scribe&apos;s Codex
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <CodexStat
              label="Roots Discovered"
              value={hasHydrated ? `${discoveredRoots}/${totalRoots}` : "—"}
              hint="Awaken runes on the Star Map"
            />
            <CodexStat
              label="Cards Forged"
              value={hasHydrated ? `${forgedCards}/${totalCards}` : "—"}
              hint="Vocabulary bound to your deck"
            />
          </div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
            className="mt-5"
          >
            <Link
              href="/learning-path"
              className="font-serif flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-500/20 to-amber-950/30 px-4 py-3.5 text-base font-semibold tracking-wide text-amber-100 transition hover:border-amber-400/70 hover:text-amber-50"
            >
              <Map className="size-5 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
              Enter the Star Map
            </Link>
          </motion.div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-8 w-full"
        >
          <SanctumPortal
            href="/arena"
            title="Arena"
            description="Enter The Forge (root × pattern waves) or The Crucible (syntax combat)."
            icon={<Swords className="size-6 drop-shadow-[0_0_20px_rgba(244,63,94,0.45)]" />}
            accent="rose"
          />
        </motion.div>
      </div>
    </div>
  );
}

function CodexStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-amber-500/15 bg-[#0B0F19]/60 px-3 py-3">
      <p className="text-[10px] tracking-wide text-amber-400/70 uppercase">{label}</p>
      <p className="font-serif mt-1 text-2xl font-semibold text-amber-100">{value}</p>
      <p className="mt-1 text-[11px] text-slate-400/80">{hint}</p>
    </div>
  );
}

function SanctumPortal({
  href,
  title,
  description,
  icon,
  accent,
  disabled = false,
  disabledHint,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const accentRing =
    accent === "amber"
      ? "border-amber-500/30 hover:border-amber-400/55"
      : "border-rose-500/30 hover:border-rose-400/55";

  const inner = (
    <motion.div
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-slate-900/90 p-5 text-start shadow-[inset_0_2px_8px_rgba(255,255,255,0.04),0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-300",
        accentRing,
        disabled && "cursor-not-allowed opacity-45 grayscale",
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl border bg-[#0B0F19]/80",
            accent === "amber" ? "border-amber-500/35 text-amber-400" : "border-rose-500/35 text-rose-300",
          )}
        >
          {disabled ? <Lock className="size-5 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]" /> : icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg font-semibold tracking-wide text-amber-50">
            {title}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-300/65">{description}</p>
          {disabled && disabledHint ? (
            <p className="mt-2 text-xs text-rose-200/70">{disabledHint}</p>
          ) : null}
        </div>
      </div>
    </motion.div>
  );

  if (disabled) {
    return <div aria-disabled>{inner}</div>;
  }

  return (
    <Link href={href} className="block">
      {inner}
    </Link>
  );
}
