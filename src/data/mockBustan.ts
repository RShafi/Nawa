import { ROOTS } from "@/data/mockRoots";
import { DERIVED_WORDS } from "@/data/mockRoots";
import type { BustanTree, MasteryLevel } from "@/store/useGamificationStore";

/** Seed orchard trees from curriculum roots with varied mastery. */
export function createInitialBustanTrees(): BustanTree[] {
  const seedLevels: MasteryLevel[] = [3, 2, 1, 0, 1];
  return ROOTS.map((root, i) => {
    const patternsTotal = DERIVED_WORDS.filter((w) => w.rootId === root.id).length || 5;
    const masteryLevel = seedLevels[i % seedLevels.length]!;
    const patternsMastered = Math.min(
      patternsTotal,
      masteryLevel === 0 ? 0 : masteryLevel === 1 ? 2 : masteryLevel === 2 ? 4 : patternsTotal,
    );
    return {
      rootId: root.id,
      letters: root.consonants.map((c) => c.arabic).join("-"),
      masteryLevel,
      patternsMastered,
      patternsTotal,
      gloss: root.gloss,
    };
  });
}
