"use client";

import { useMemo, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ArrowUp, Eye, EyeOff } from "lucide-react";
import { ArabicText } from "@/components/common/ArabicText";
import { Button } from "@/components/ui/button";
import { catalogRootId } from "@/data/combatDictionary";
import { stripAllTashkeel } from "@/lib/obfuscation";
import { cn } from "@/lib/utils";
import { getMasteryLevel, useBattleStore } from "@/store/useBattleStore";

const FLICK_THRESHOLD = -80;

export function ForgeBoard() {
  const handRoots = useBattleStore((s) => s.handRoots);
  const handPatterns = useBattleStore((s) => s.handPatterns);
  const selectedRootId = useBattleStore((s) => s.selectedRootId);
  const loaded = useBattleStore((s) => s.loaded);
  const wards = useBattleStore((s) => s.wards);
  const isStaggered = useBattleStore((s) => s.isStaggered);
  const masteryByWordId = useBattleStore((s) => s.masteryByWordId);
  const tafsirHalvedRoots = useBattleStore((s) => s.tafsirHalvedRoots);
  const selectRoot = useBattleStore((s) => s.selectRoot);
  const selectPattern = useBattleStore((s) => s.selectPattern);
  const clearLoaded = useBattleStore((s) => s.clearLoaded);
  const castLoaded = useBattleStore((s) => s.castLoaded);
  const revealTafsir = useBattleStore((s) => s.revealTafsir);
  const victory = useBattleStore((s) => s.victory);
  const defeat = useBattleStore((s) => s.defeat);
  const tutorialMode = useBattleStore((s) => s.tutorialMode);
  const tutorialStep = useBattleStore((s) => s.tutorialStep);

  const [tafsirOpen, setTafsirOpen] = useState<Record<string, boolean>>({});
  const locked = victory || defeat;

  const matchingWard = useMemo(() => {
    if (!loaded?.spell) return null;
    return (
      wards.find(
        (w) =>
          !w.shattered &&
          w.rootId === loaded.spell!.root &&
          w.patternId === loaded.spell!.pattern,
      ) ?? null
    );
  }, [loaded, wards]);

  const coach = !loaded
    ? !selectedRootId
      ? {
          step: "1/3",
          title: "Tap a Root",
          detail: "Pick three letters from the row below.",
        }
      : {
          step: "2/3",
          title: "Tap a Pattern",
          detail: "Patterns light up after you pick a Root.",
        }
    : matchingWard
      ? {
          step: "3/3",
          title: "Cast",
          detail: `Matches ward “${matchingWard.english}”. Tap Cast.`,
        }
      : isStaggered
        ? {
            step: "Strike",
            title: "Enemy is Staggered",
            detail: "Cast for bonus damage.",
          }
        : {
            step: "3/3",
            title: "Cast (small hit)",
            detail: "No ward match — chips HP. Prefer a ward meaning when you can.",
          };

  function onFlickEnd(_: unknown, info: PanInfo) {
    if (info.offset.y < FLICK_THRESHOLD || info.velocity.y < -400) {
      castLoaded();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      <div
        className={cn(
          "shrink-0 rounded-xl border px-2.5 py-1.5",
          matchingWard
            ? "border-emerald-400/40 bg-emerald-500/10"
            : "border-white/10 bg-white/5",
          tutorialMode && tutorialStep === 1 && !selectedRootId && "ring-2 ring-emerald-400/50",
          tutorialMode && tutorialStep === 2 && selectedRootId && "ring-2 ring-amber-400/50",
          tutorialMode && tutorialStep === 3 && loaded && "ring-2 ring-amber-400/50",
        )}
      >
        <p className="text-[9px] tracking-[0.14em] text-white/40 uppercase">{coach.step}</p>
        <p className="text-xs font-semibold text-white">{coach.title}</p>
        <p className="text-[11px] leading-snug text-white/55">{coach.detail}</p>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain">
        <p className="text-center text-[9px] tracking-[0.16em] text-white/40 uppercase">Roots</p>
        <div className="flex gap-1.5 overflow-x-auto px-0.5 pb-1">
          {handRoots.map((root) => {
            const selected = selectedRootId === root.id;
            const catalogId = catalogRootId(root.id);
            const highlightCraft =
              tutorialMode && tutorialStep === 1 && catalogId === "drs";
            const highlightStrike =
              tutorialMode && tutorialStep === 2 && catalogId === "drb";
            return (
              <button
                key={root.id}
                type="button"
                disabled={locked || !!loaded}
                onClick={() => selectRoot(root.id)}
                className={cn(
                  "glass-panel-strong flex h-[4.25rem] w-[5.5rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border-emerald-400/20 px-1.5 py-1.5 transition",
                  selected &&
                    "scale-[1.02] border-emerald-300/80 bg-emerald-500/15 shadow-[0_0_20px_-8px_rgba(52,211,153,0.7)]",
                  !selectedRootId && !loaded && "animate-pulse",
                  (highlightCraft || highlightStrike) && "ring-2 ring-amber-400/70",
                )}
              >
                <ArabicText
                  size="inherit"
                  className="battle-arabic whitespace-nowrap text-base leading-none text-emerald-50"
                >
                  {root.letters}
                </ArabicText>
                <span className="max-w-full truncate text-[9px] text-white/45 capitalize">
                  {root.gloss}
                </span>
              </button>
            );
          })}
          {handRoots.length === 0 ? (
            <p className="w-full py-3 text-center text-xs text-white/40">
              No Roots — wait for refill after the enemy turn.
            </p>
          ) : null}
        </div>

        <p className="text-center text-[9px] tracking-[0.16em] text-white/40 uppercase">
          Patterns
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {handPatterns.map((pattern) => {
            const highlightPlace =
              tutorialMode && tutorialStep === 1 && pattern.id === "noun-of-place";
            const highlightForm1 =
              tutorialMode && tutorialStep === 2 && pattern.id === "form-1";
            return (
              <button
                key={pattern.id}
                type="button"
                disabled={locked || !selectedRootId}
                onClick={() => selectPattern(pattern.id)}
                className={cn(
                  "glass-panel relative rounded-xl px-1 py-1.5 transition",
                  selectedRootId ? "border-amber-400/50 bg-amber-500/10" : "opacity-45",
                  (highlightPlace || highlightForm1) &&
                    selectedRootId &&
                    "ring-2 ring-amber-400/70",
                )}
              >
                <ArabicText
                  size="inherit"
                  className="battle-arabic block whitespace-nowrap text-sm leading-none text-amber-50"
                >
                  {pattern.template}
                </ArabicText>
                <span className="mt-0.5 block truncate text-[8px] text-white/45 uppercase">
                  {pattern.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 py-1">
          {loaded ? (
            <>
              <motion.div
                drag="y"
                dragConstraints={{ top: -120, bottom: 0 }}
                dragElastic={0.12}
                onDragEnd={onFlickEnd}
                className={cn(
                  "glass-panel-strong glow-amber relative z-20 w-full max-w-[14rem] cursor-grab touch-none rounded-xl border px-3 py-2 text-center active:cursor-grabbing",
                  matchingWard ? "border-emerald-400/50" : "border-amber-400/35",
                )}
              >
                <p className="inline-flex items-center gap-1 text-[9px] tracking-[0.16em] text-amber-200/70 uppercase">
                  <ArrowUp className="size-2.5" />
                  Cast
                </p>
                <ArabicText
                  size="inherit"
                  className="battle-arabic mt-0.5 block whitespace-nowrap text-xl leading-none text-amber-50"
                >
                  {loaded.spell ? stripAllTashkeel(loaded.spell.arabicWord) : "؟؟؟"}
                </ArabicText>
                <MasteryHint
                  rootId={catalogRootId(loaded.root.id)}
                  patternId={loaded.pattern.id}
                  mastery={getMasteryLevel(
                    masteryByWordId,
                    catalogRootId(loaded.root.id),
                    loaded.pattern.id,
                  )}
                  english={loaded.spell?.englishTranslation}
                  vowelled={loaded.spell?.arabicWord}
                  tafsirOn={!!tafsirOpen[catalogRootId(loaded.root.id)]}
                  halved={tafsirHalvedRoots.includes(catalogRootId(loaded.root.id))}
                  onTafsir={() => {
                    const rid = catalogRootId(loaded.root.id);
                    setTafsirOpen((m) => ({ ...m, [rid]: true }));
                    revealTafsir(rid);
                  }}
                />
                {matchingWard ? (
                  <p className="mt-1 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-200">
                    Matches: {matchingWard.english}
                  </p>
                ) : null}
              </motion.div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 bg-amber-500 font-semibold text-black hover:bg-amber-400"
                  disabled={locked}
                  onClick={() => castLoaded()}
                >
                  <ArrowUp className="size-3.5" />
                  Cast
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-white/50"
                  onClick={() => clearLoaded()}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <p className="text-xs text-white/35">Root → Pattern → word appears here</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MasteryHint({
  mastery,
  english,
  vowelled,
  tafsirOn,
  halved,
  onTafsir,
}: {
  rootId: string;
  patternId: string;
  mastery: 1 | 2 | 3;
  english?: string;
  vowelled?: string;
  tafsirOn: boolean;
  halved: boolean;
  onTafsir: () => void;
}) {
  if (mastery === 1) {
    return (
      <div className="mt-1 space-y-0.5">
        {vowelled ? (
          <ArabicText
            size="inherit"
            className="battle-arabic block whitespace-nowrap text-sm leading-none text-white/80"
          >
            {vowelled}
          </ArabicText>
        ) : null}
        <p className="text-[10px] text-white/55">{english}</p>
      </div>
    );
  }

  if (mastery === 2) {
    return (
      <div className="mt-1">
        {vowelled ? (
          <ArabicText
            size="inherit"
            className="battle-arabic block whitespace-nowrap text-sm leading-none text-white/80"
          >
            {vowelled}
          </ArabicText>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-1 flex flex-col items-center gap-0.5">
      {tafsirOn && english ? (
        <p className="text-[10px] text-amber-200/80">{english}</p>
      ) : (
        <button
          type="button"
          onClick={onTafsir}
          className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/60 hover:bg-white/5"
        >
          {tafsirOn ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
          Reveal meaning
        </button>
      )}
      {halved ? (
        <p className="text-[9px] text-rose-300/80">Damage halved this battle</p>
      ) : null}
    </div>
  );
}
