/**
 * Curated early-game pairings for Arena dealing / tutorials.
 * Full lexicon lives in combatDictionary; this exports semantic starter sets.
 */

import { getWordCard, WORD_CARDS, type WordCard } from "@/data/combatDictionary";

/** Guaranteed logical noun↔modifier pairs for early play. */
export const EARLY_SEMANTIC_PAIRS: Array<[string, string]> = [
  ["drs-active-participle", "jhd-adjective"], // student + diligent
  ["bab-noun-door", "thql-adjective"], // door + heavy
  ["ktb-noun-book", "kbr-adjective"], // book + big
  ["ktb-noun-book", "ktb-passive-participle"], // book + written
  ["hfz-active-participle", "slm-active-participle"], // guardian + safe
  ["drs-active-participle", "nsr-passive-participle"], // student + aided
];

export const EARLY_DECK_IDS: string[] = [
  ...new Set(EARLY_SEMANTIC_PAIRS.flat()),
  "drb-form-1",
  "ktb-form-1",
  "drs-form-1",
  "hfz-form-1",
];

export function getMockDeckCards(): WordCard[] {
  return EARLY_DECK_IDS.map((id) => getWordCard(id)).filter((c): c is WordCard => Boolean(c));
}

export function allTaggedCards(): WordCard[] {
  return WORD_CARDS;
}
