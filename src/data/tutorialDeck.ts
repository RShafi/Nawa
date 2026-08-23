/**
 * Curated high-power deck for the Arena sandbox tutorial only.
 * Bypasses the learner inventory so every pedagogical cast is available.
 */

import type { CombatPattern, CombatRoot, ValidSpell } from "@/data/combatDictionary";
import type { Ward } from "@/lib/wardDealer";

export const TUTORIAL_ROOTS: CombatRoot[] = [
  { id: "drs", letters: "د-ر-س", gloss: "studying / examining" },
  { id: "drb", letters: "ض-ر-ب", gloss: "striking" },
  { id: "hfz", letters: "ح-ف-ظ", gloss: "guarding / preserving" },
  { id: "slm", letters: "س-ل-م", gloss: "peace / safety" },
];

export const TUTORIAL_PATTERNS: CombatPattern[] = [
  { id: "form-1", name: "Form I", template: "فَعَلَ", gloss: "basic action" },
  { id: "active-participle", name: "Active Participle", template: "فَاعِل", gloss: "the doer" },
  { id: "noun-of-place", name: "Noun of Place", template: "مَفْعَل", gloss: "place / location" },
];

/** Spells the tutorial encounter can forge */
export const TUTORIAL_SPELLS: ValidSpell[] = [
  {
    id: "tut-drs-noun-of-place",
    root: "drs",
    pattern: "noun-of-place",
    arabicWord: "مَدْرَسَة",
    englishTranslation: "A place of learning / school",
    transliteration: "madrasa",
    archetype: "control",
    effectType: "control",
    baseValue: 10,
    inkCost: 1,
  },
  {
    id: "tut-drb-form-1",
    root: "drb",
    pattern: "form-1",
    arabicWord: "ضَرَبَ",
    englishTranslation: "He struck",
    transliteration: "ḍaraba",
    archetype: "dps",
    effectType: "damage",
    baseValue: 28,
    inkCost: 2,
  },
  {
    id: "tut-hfz-form-1",
    root: "hfz",
    pattern: "form-1",
    arabicWord: "حَفِظَ",
    englishTranslation: "He guarded / preserved",
    transliteration: "ḥafiẓa",
    archetype: "tank",
    effectType: "shield",
    baseValue: 14,
    inkCost: 2,
  },
  {
    id: "tut-hfz-active-participle",
    root: "hfz",
    pattern: "active-participle",
    arabicWord: "حَافِظ",
    englishTranslation: "Guardian / protector",
    transliteration: "ḥāfiẓ",
    archetype: "tank",
    effectType: "shield",
    baseValue: 12,
    inkCost: 2,
  },
  {
    id: "tut-slm-form-1",
    root: "slm",
    pattern: "form-1",
    arabicWord: "سَلِمَ",
    englishTranslation: "He was safe",
    transliteration: "salima",
    archetype: "tank",
    effectType: "heal",
    baseValue: 10,
    inkCost: 1,
  },
  {
    id: "tut-drs-form-1",
    root: "drs",
    pattern: "form-1",
    arabicWord: "دَرَسَ",
    englishTranslation: "He studied",
    transliteration: "darasa",
    archetype: "control",
    effectType: "control",
    baseValue: 8,
    inkCost: 1,
  },
];

export const TUTORIAL_TARGET_WARD: Ward = {
  id: "ward-tut-madrasa",
  wordId: "drs:noun-of-place",
  rootId: "drs",
  patternId: "noun-of-place",
  arabic: "مَدْرَسَة",
  english: "A place of learning",
  transliteration: "madrasa",
  shattered: false,
};

export const TUTORIAL_SECOND_WARD: Ward = {
  id: "ward-tut-strike",
  wordId: "drb:form-1",
  rootId: "drb",
  patternId: "form-1",
  arabic: "ضَرَبَ",
  english: "A heavy strike",
  transliteration: "ḍaraba",
  shattered: false,
};

export type EnemyIntentKind = "heavy-strike" | "ward-shield" | "probe";

export type EnemyIntent = {
  kind: EnemyIntentKind;
  label: string;
  damage: number;
  turnsUntil: number;
  icon: "sword" | "shield" | "eye";
};

export const TUTORIAL_OPENING_INTENT: EnemyIntent = {
  kind: "heavy-strike",
  label: "Preparing Heavy Strike",
  damage: 20,
  turnsUntil: 1,
  icon: "sword",
};

export function findTutorialSpell(rootId: string, patternId: string): ValidSpell | null {
  return (
    TUTORIAL_SPELLS.find((s) => s.root === rootId && s.pattern === patternId) ?? null
  );
}

export const TUTORIAL_DIALOGUE = {
  craftMetaphor:
    "Goal: reduce enemy HP to 0. Attack by tapping a Root, then a Pattern, then Cast. Break English Wards with the matching Arabic word. Clear all Wards to Stagger the enemy for bonus damage.",
} as const;
