/**
 * Tutorial deck data — Word Cards for the rail TutorialArena.
 */

import { getWordCard, type WordCard } from "@/data/combatDictionary";

export const TUTORIAL_CARD_IDS = {
  flameNoun: "drb-noun-of-instrument",
  vso: ["drb-form-1", "drs-noun-of-place", "ktb-passive-participle"] as const,
  mind: ["kshf-form-1", "hkm-active-participle"] as const,
};

export function tutorialCards(ids: readonly string[]): WordCard[] {
  return ids.map((id) => getWordCard(id)).filter((c): c is WordCard => Boolean(c));
}

export const TUTORIAL_DIALOGUE = {
  craftMetaphor:
    "Goal: reduce enemy HP to 0. Chain Word Cards into a correct Arabic sentence, then Cast. Longer correct sentences multiply damage. Schools add Burn, Frost, Mind pierce, or Kinetic force.",
} as const;
