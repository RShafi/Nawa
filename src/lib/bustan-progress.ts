import { DERIVED_WORDS, ROOTS } from "@/data/mockRoots";
import type { BustanTree, MasteryLevel } from "@/store/useGamificationStore";

export type DbBustanTreeRow = {
  root_id: string;
  letters: string;
  mastery_level: number;
};

function clampMastery(level: number): MasteryLevel {
  if (level <= 0) return 0;
  if (level >= 3) return 3;
  return level as MasteryLevel;
}

function patternsForRoot(rootId: string, mastery: MasteryLevel): {
  patternsTotal: number;
  patternsMastered: number;
} {
  const patternsTotal = DERIVED_WORDS.filter((w) => w.rootId === rootId).length || 5;
  const patternsMastered = Math.min(
    patternsTotal,
    mastery === 0 ? 0 : mastery === 1 ? 2 : mastery === 2 ? 4 : patternsTotal,
  );
  return { patternsTotal, patternsMastered };
}

/** Merge catalog roots with persisted mastery (defaults to seed / level 0). */
export function mergeBustanTrees(dbRows: DbBustanTreeRow[]): BustanTree[] {
  const byRoot = new Map(dbRows.map((r) => [r.root_id, r]));

  return ROOTS.map((root) => {
    const row = byRoot.get(root.id);
    const masteryLevel = clampMastery(row?.mastery_level ?? 0);
    const letters =
      row?.letters ?? root.consonants.map((c) => c.arabic).join("-");
    const { patternsTotal, patternsMastered } = patternsForRoot(root.id, masteryLevel);

    return {
      rootId: root.id,
      letters,
      masteryLevel,
      patternsMastered,
      patternsTotal,
      gloss: root.gloss,
    };
  });
}
