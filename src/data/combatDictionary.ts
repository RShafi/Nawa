/**
 * Nawā combat lexicon — fully formed Word Cards with elemental schools + semantic tags.
 * Path forging unlocks these IDs into the player's deck; Arena plays them as syntax chains.
 */

import type { SemanticTag } from "@/types/cards";

export type PartOfSpeech = "VERB" | "NOUN" | "ADJECTIVE";

/** Elemental schools — semantic combat effects */
export type ElementSchool = "FLAME" | "FROST" | "MIND" | "KINETIC";

export type WordCard = {
  id: string;
  word: string;
  translation: string;
  transliteration: string;
  partOfSpeech: PartOfSpeech;
  school: ElementSchool;
  /** Base power before syntax multipliers */
  basePower: number;
  /** Forge recipe (Path Card Forge) */
  rootId: string;
  patternId: string;
  /** What this word *is* (nouns especially). */
  tags: SemanticTag[];
  /** Verbs/adjectives: required partner tags. */
  validTargets?: SemanticTag[];
  /** Definiteness for natural English rules. */
  definite?: boolean;
  /** Clean English lemma for natural phrasing. */
  lemmaEn?: string;
};

export type CombatRoot = {
  id: string;
  letters: string;
  gloss: string;
};

export type CombatPattern = {
  id: string;
  name: string;
  template: string;
  gloss: string;
};

export const SCHOOL_META: Record<
  ElementSchool,
  { label: string; effect: string; color: string; glow: string }
> = {
  FLAME: {
    label: "Flame",
    effect: "Burn — damage over time",
    color: "text-amber-300",
    glow: "border-amber-400/60 bg-amber-500/15 shadow-[0_0_20px_-6px_rgba(245,158,11,0.65)]",
  },
  FROST: {
    label: "Frost",
    effect: "Frost — delays the enemy’s next turn",
    color: "text-cyan-300",
    glow: "border-cyan-400/60 bg-cyan-500/15 shadow-[0_0_20px_-6px_rgba(56,189,248,0.65)]",
  },
  MIND: {
    label: "Mind",
    effect: "Mind — pierces shields / reveals intent",
    color: "text-violet-300",
    glow: "border-violet-400/50 bg-violet-500/15",
  },
  KINETIC: {
    label: "Kinetic",
    effect: "Kinetic — raw damage",
    color: "text-amber-200",
    glow: "border-amber-400/50 bg-amber-500/15",
  },
};

/** Roots available in the Path Card Forge */
export const COMBAT_ROOTS: CombatRoot[] = [
  { id: "ktb", letters: "ك-ت-ب", gloss: "writing" },
  { id: "slm", letters: "س-ل-م", gloss: "peace / safety" },
  { id: "nsr", letters: "ن-ص-ر", gloss: "victory / aid" },
  { id: "drs", letters: "د-ر-س", gloss: "studying" },
  { id: "hkm", letters: "ح-ك-م", gloss: "judgment / wisdom" },
  { id: "drb", letters: "ض-ر-ب", gloss: "striking" },
  { id: "hfz", letters: "ح-ف-ظ", gloss: "guarding / preserving" },
  { id: "kshf", letters: "ك-ش-ف", gloss: "uncovering / revealing" },
];

/** Patterns on the Path Card Forge */
export const COMBAT_PATTERNS: CombatPattern[] = [
  { id: "form-1", name: "Form I", template: "فَعَلَ", gloss: "basic action" },
  { id: "form-2", name: "Form II", template: "فَعَّلَ", gloss: "intensify / cause" },
  { id: "form-10", name: "Form X", template: "اِسْتَفْعَلَ", gloss: "seek / request" },
  { id: "active-participle", name: "Active Participle", template: "فَاعِل", gloss: "the doer" },
  { id: "passive-participle", name: "Passive Participle", template: "مَفْعُول", gloss: "the done" },
  {
    id: "noun-of-instrument",
    name: "Noun of Instrument",
    template: "مِفْعَال",
    gloss: "tool / means",
  },
  {
    id: "noun-of-place",
    name: "Noun of Place",
    template: "مَفْعَل",
    gloss: "place / location",
  },
];

const HUMAN: SemanticTag[] = ["human", "male", "animate"];
const OBJECT: SemanticTag[] = ["object", "inanimate"];
const TOOL: SemanticTag[] = ["object", "tool", "inanimate"];
const PLACE: SemanticTag[] = ["place", "inanimate"];
const TEXT: SemanticTag[] = ["object", "text", "inanimate"];
const ANIMATE_T: SemanticTag[] = ["animate", "human"];
const OBJECT_T: SemanticTag[] = ["object", "inanimate", "tool", "text", "place"];

/**
 * Fully formed Word Cards — the only combat ammo.
 * School is assigned by semantic meaning; tags enable logical sentences.
 */
export const WORD_CARDS: WordCard[] = [
  // ——— Kinetic (aid / writing force) ———
  {
    id: "nsr-form-1",
    word: "نَصَرَ",
    translation: "He helped / granted victory",
    lemmaEn: "helped",
    transliteration: "naṣara",
    partOfSpeech: "VERB",
    school: "KINETIC",
    basePower: 18,
    rootId: "nsr",
    patternId: "form-1",
    tags: ["action"],
    validTargets: ANIMATE_T,
  },
  {
    id: "nsr-form-2",
    word: "نَصَّرَ",
    translation: "He made victorious",
    lemmaEn: "made victorious",
    transliteration: "naṣṣara",
    partOfSpeech: "VERB",
    school: "KINETIC",
    basePower: 26,
    rootId: "nsr",
    patternId: "form-2",
    tags: ["action"],
    validTargets: ANIMATE_T,
  },
  {
    id: "nsr-active-participle",
    word: "نَاصِر",
    translation: "Helper / supporter",
    lemmaEn: "helper",
    transliteration: "nāṣir",
    partOfSpeech: "NOUN",
    school: "KINETIC",
    basePower: 14,
    rootId: "nsr",
    patternId: "active-participle",
    tags: HUMAN,
    definite: true,
  },
  {
    id: "nsr-passive-participle",
    word: "مَنْصُور",
    translation: "The aided one",
    lemmaEn: "aided",
    transliteration: "manṣūr",
    partOfSpeech: "ADJECTIVE",
    school: "KINETIC",
    basePower: 12,
    rootId: "nsr",
    patternId: "passive-participle",
    tags: ["abstract"],
    validTargets: ANIMATE_T,
    definite: false,
  },
  {
    id: "ktb-form-1",
    word: "كَتَبَ",
    translation: "He wrote",
    lemmaEn: "wrote",
    transliteration: "kataba",
    partOfSpeech: "VERB",
    school: "KINETIC",
    basePower: 12,
    rootId: "ktb",
    patternId: "form-1",
    tags: ["action"],
    validTargets: [...TEXT, "object"],
  },
  {
    id: "ktb-noun-of-instrument",
    word: "مِكْتَاب",
    translation: "Writing instrument",
    lemmaEn: "pen",
    transliteration: "miktāb",
    partOfSpeech: "NOUN",
    school: "KINETIC",
    basePower: 16,
    rootId: "ktb",
    patternId: "noun-of-instrument",
    tags: TOOL,
    definite: false,
  },

  // ——— Flame (strike / intensify) ———
  {
    id: "drb-form-1",
    word: "ضَرَبَ",
    translation: "He struck",
    lemmaEn: "struck",
    transliteration: "ḍaraba",
    partOfSpeech: "VERB",
    school: "FLAME",
    basePower: 20,
    rootId: "drb",
    patternId: "form-1",
    tags: ["action"],
    validTargets: [...ANIMATE_T, ...OBJECT_T],
  },
  {
    id: "drb-form-2",
    word: "ضَرَّبَ",
    translation: "He struck repeatedly",
    lemmaEn: "struck repeatedly",
    transliteration: "ḍarraba",
    partOfSpeech: "VERB",
    school: "FLAME",
    basePower: 28,
    rootId: "drb",
    patternId: "form-2",
    tags: ["action"],
    validTargets: [...ANIMATE_T, ...OBJECT_T],
  },
  {
    id: "drb-active-participle",
    word: "ضَارِب",
    translation: "Striker",
    lemmaEn: "striker",
    transliteration: "ḍārib",
    partOfSpeech: "NOUN",
    school: "FLAME",
    basePower: 15,
    rootId: "drb",
    patternId: "active-participle",
    tags: HUMAN,
    definite: true,
  },
  {
    id: "drb-noun-of-instrument",
    word: "مِضْرَاب",
    translation: "Bat / striking tool",
    lemmaEn: "bat",
    transliteration: "miḍrāb",
    partOfSpeech: "NOUN",
    school: "FLAME",
    basePower: 18,
    rootId: "drb",
    patternId: "noun-of-instrument",
    tags: TOOL,
    definite: false,
  },
  {
    id: "ktb-form-2",
    word: "كَتَّبَ",
    translation: "He made (someone) write",
    lemmaEn: "made write",
    transliteration: "kattaba",
    partOfSpeech: "VERB",
    school: "FLAME",
    basePower: 22,
    rootId: "ktb",
    patternId: "form-2",
    tags: ["action"],
    validTargets: ANIMATE_T,
  },

  // ——— Frost (peace / guard) ———
  {
    id: "slm-form-1",
    word: "سَلِمَ",
    translation: "He was safe",
    lemmaEn: "was safe",
    transliteration: "salima",
    partOfSpeech: "VERB",
    school: "FROST",
    basePower: 12,
    rootId: "slm",
    patternId: "form-1",
    tags: ["action"],
    validTargets: ANIMATE_T,
  },
  {
    id: "slm-form-2",
    word: "سَلَّمَ",
    translation: "He greeted / handed over",
    lemmaEn: "greeted",
    transliteration: "sallama",
    partOfSpeech: "VERB",
    school: "FROST",
    basePower: 16,
    rootId: "slm",
    patternId: "form-2",
    tags: ["action"],
    validTargets: [...ANIMATE_T, ...OBJECT_T],
  },
  {
    id: "slm-active-participle",
    word: "سَالِم",
    translation: "Safe / sound one",
    lemmaEn: "safe",
    transliteration: "sālim",
    partOfSpeech: "ADJECTIVE",
    school: "FROST",
    basePower: 14,
    rootId: "slm",
    patternId: "active-participle",
    tags: ["abstract"],
    validTargets: ANIMATE_T,
    definite: false,
  },
  {
    id: "hfz-form-1",
    word: "حَفِظَ",
    translation: "He preserved / memorized",
    lemmaEn: "preserved",
    transliteration: "ḥafiẓa",
    partOfSpeech: "VERB",
    school: "FROST",
    basePower: 14,
    rootId: "hfz",
    patternId: "form-1",
    tags: ["action"],
    validTargets: [...OBJECT_T, "text", "abstract"],
  },
  {
    id: "hfz-active-participle",
    word: "حَافِظ",
    translation: "Protector / guardian",
    lemmaEn: "guardian",
    transliteration: "ḥāfiẓ",
    partOfSpeech: "NOUN",
    school: "FROST",
    basePower: 18,
    rootId: "hfz",
    patternId: "active-participle",
    tags: HUMAN,
    definite: true,
  },
  {
    id: "hfz-passive-participle",
    word: "مَحْفُوظ",
    translation: "That which is preserved",
    lemmaEn: "preserved",
    transliteration: "maḥfūẓ",
    partOfSpeech: "ADJECTIVE",
    school: "FROST",
    basePower: 12,
    rootId: "hfz",
    patternId: "passive-participle",
    tags: ["abstract"],
    validTargets: OBJECT_T,
    definite: false,
  },
  {
    id: "ktb-passive-participle",
    word: "مَكْتُوب",
    translation: "That which is written",
    lemmaEn: "written",
    transliteration: "maktūb",
    partOfSpeech: "ADJECTIVE",
    school: "FROST",
    basePower: 10,
    rootId: "ktb",
    patternId: "passive-participle",
    tags: ["abstract"],
    validTargets: TEXT,
    definite: false,
  },

  // ——— Mind (study / reveal / wisdom) ———
  {
    id: "drs-form-1",
    word: "دَرَسَ",
    translation: "He studied",
    lemmaEn: "studied",
    transliteration: "darasa",
    partOfSpeech: "VERB",
    school: "MIND",
    basePower: 11,
    rootId: "drs",
    patternId: "form-1",
    tags: ["action"],
    validTargets: [...TEXT, "abstract", "place"],
  },
  {
    id: "drs-form-2",
    word: "دَرَّسَ",
    translation: "He taught",
    lemmaEn: "taught",
    transliteration: "darrasa",
    partOfSpeech: "VERB",
    school: "MIND",
    basePower: 20,
    rootId: "drs",
    patternId: "form-2",
    tags: ["action"],
    validTargets: ANIMATE_T,
  },
  {
    id: "drs-active-participle",
    word: "دَارِس",
    translation: "Student / one who studies",
    lemmaEn: "student",
    transliteration: "dāris",
    partOfSpeech: "NOUN",
    school: "MIND",
    basePower: 10,
    rootId: "drs",
    patternId: "active-participle",
    tags: HUMAN,
    definite: true,
  },
  {
    id: "drs-noun-of-place",
    word: "مَدْرَسَة",
    translation: "School / place of learning",
    lemmaEn: "school",
    transliteration: "madrasa",
    partOfSpeech: "NOUN",
    school: "MIND",
    basePower: 14,
    rootId: "drs",
    patternId: "noun-of-place",
    tags: PLACE,
    definite: true,
  },
  {
    id: "kshf-form-1",
    word: "كَشَفَ",
    translation: "He uncovered / revealed",
    lemmaEn: "uncovered",
    transliteration: "kashafa",
    partOfSpeech: "VERB",
    school: "MIND",
    basePower: 16,
    rootId: "kshf",
    patternId: "form-1",
    tags: ["action"],
    validTargets: OBJECT_T,
  },
  {
    id: "kshf-form-10",
    word: "اِسْتَكْشَفَ",
    translation: "He explored",
    lemmaEn: "explored",
    transliteration: "istakshafa",
    partOfSpeech: "VERB",
    school: "MIND",
    basePower: 18,
    rootId: "kshf",
    patternId: "form-10",
    tags: ["action"],
    validTargets: [...PLACE, ...OBJECT_T],
  },
  {
    id: "kshf-active-participle",
    word: "كَاشِف",
    translation: "Revealer",
    lemmaEn: "revealer",
    transliteration: "kāshif",
    partOfSpeech: "NOUN",
    school: "MIND",
    basePower: 13,
    rootId: "kshf",
    patternId: "active-participle",
    tags: HUMAN,
    definite: true,
  },
  {
    id: "hkm-form-1",
    word: "حَكَمَ",
    translation: "He judged / ruled",
    lemmaEn: "judged",
    transliteration: "ḥakama",
    partOfSpeech: "VERB",
    school: "MIND",
    basePower: 16,
    rootId: "hkm",
    patternId: "form-1",
    tags: ["action"],
    validTargets: ANIMATE_T,
  },
  {
    id: "hkm-active-participle",
    word: "حَاكِم",
    translation: "Ruler / judge",
    lemmaEn: "judge",
    transliteration: "ḥākim",
    partOfSpeech: "NOUN",
    school: "MIND",
    basePower: 14,
    rootId: "hkm",
    patternId: "active-participle",
    tags: HUMAN,
    definite: true,
  },
  {
    id: "ktb-form-10",
    word: "اِسْتَكْتَبَ",
    translation: "He asked to write",
    lemmaEn: "asked to write",
    transliteration: "istaktaba",
    partOfSpeech: "VERB",
    school: "MIND",
    basePower: 14,
    rootId: "ktb",
    patternId: "form-10",
    tags: ["action"],
    validTargets: ANIMATE_T,
  },
  {
    id: "ktb-active-participle",
    word: "كَاتِب",
    translation: "Writer / scribe",
    lemmaEn: "writer",
    transliteration: "kātib",
    partOfSpeech: "NOUN",
    school: "MIND",
    basePower: 11,
    rootId: "ktb",
    patternId: "active-participle",
    tags: HUMAN,
    definite: true,
  },

  // Extra nouns / adjectives for syntax + semantic drills
  {
    id: "ktb-place-noun",
    word: "مَكْتَب",
    translation: "Office / desk",
    lemmaEn: "desk",
    transliteration: "maktab",
    partOfSpeech: "NOUN",
    school: "KINETIC",
    basePower: 12,
    rootId: "ktb",
    patternId: "noun-of-place",
    tags: [...PLACE, ...OBJECT],
    definite: false,
  },
  {
    id: "ktb-noun-book",
    word: "كِتَاب",
    translation: "Book",
    lemmaEn: "book",
    transliteration: "kitāb",
    partOfSpeech: "NOUN",
    school: "KINETIC",
    basePower: 14,
    rootId: "ktb",
    patternId: "noun-book",
    tags: TEXT,
    definite: false,
  },
  {
    id: "kbr-adjective",
    word: "كَبِير",
    translation: "Big",
    lemmaEn: "big",
    transliteration: "kabīr",
    partOfSpeech: "ADJECTIVE",
    school: "FLAME",
    basePower: 12,
    rootId: "kbr",
    patternId: "adjective-basic",
    tags: ["abstract"],
    validTargets: OBJECT_T,
    definite: false,
  },
  // Early-game logical pairings
  {
    id: "jhd-adjective",
    word: "مُجْتَهِد",
    translation: "Diligent",
    lemmaEn: "diligent",
    transliteration: "mujtahid",
    partOfSpeech: "ADJECTIVE",
    school: "MIND",
    basePower: 11,
    rootId: "jhd",
    patternId: "adjective-basic",
    tags: ["abstract"],
    validTargets: ANIMATE_T,
    definite: false,
  },
  {
    id: "thql-adjective",
    word: "ثَقِيل",
    translation: "Heavy",
    lemmaEn: "heavy",
    transliteration: "thaqīl",
    partOfSpeech: "ADJECTIVE",
    school: "KINETIC",
    basePower: 11,
    rootId: "thql",
    patternId: "adjective-basic",
    tags: ["abstract"],
    validTargets: OBJECT_T,
    definite: false,
  },
  {
    id: "bab-noun-door",
    word: "بَاب",
    translation: "Door",
    lemmaEn: "door",
    transliteration: "bāb",
    partOfSpeech: "NOUN",
    school: "KINETIC",
    basePower: 10,
    rootId: "bab",
    patternId: "noun-basic",
    tags: OBJECT,
    definite: true,
  },
];

const BY_ID = new Map(WORD_CARDS.map((c) => [c.id, c] as const));
const BY_RECIPE = new Map(WORD_CARDS.map((c) => [`${c.rootId}::${c.patternId}`, c] as const));

export function getWordCard(id: string): WordCard | undefined {
  return BY_ID.get(id);
}

export function getWordCards(ids: string[]): WordCard[] {
  return ids.map((id) => BY_ID.get(id)).filter((c): c is WordCard => Boolean(c));
}

/** Forge a Word Card from root × pattern (Path Card Forge). */
export function forgeWordCard(rootId: string, patternId: string): WordCard | null {
  return BY_RECIPE.get(`${rootId}::${patternId}`) ?? null;
}

export function getPatternById(id: string): CombatPattern | undefined {
  return COMBAT_PATTERNS.find((p) => p.id === id);
}

export function getRootById(id: string): CombatRoot | undefined {
  return COMBAT_ROOTS.find((r) => r.id === id);
}

/** Syntax combo multipliers by chain length */
export const SYNTAX_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 2.5,
  3: 5,
  4: 7,
};

export function syntaxMultiplier(length: number): number {
  if (length <= 0) return 0;
  if (length >= 4) return SYNTAX_MULTIPLIERS[4] ?? 7;
  return SYNTAX_MULTIPLIERS[length] ?? 1;
}

/** Burn DoT ticks after a Flame cast */
export const FLAME_BURN_TICKS = 2;
export const FLAME_BURN_RATIO = 0.25;

// ——— Legacy aliases (bridge during Path unlock migration) ———

/** @deprecated Prefer WordCard — kept for FSRS / review population */
export type ValidSpell = {
  id: string;
  root: string;
  pattern: string;
  arabicWord: string;
  englishTranslation: string;
  transliteration: string;
  baseValue: number;
  archetype?: string;
  effectType?: string;
  inkCost?: number;
};

export function validateWeave(root: string, pattern: string): ValidSpell | null {
  const card = forgeWordCard(root, pattern);
  if (!card) return null;
  return {
    id: card.id,
    root: card.rootId,
    pattern: card.patternId,
    arabicWord: card.word,
    englishTranslation: card.translation,
    transliteration: card.transliteration,
    baseValue: card.basePower,
    archetype: card.school,
    effectType: "damage",
    inkCost: 1,
  };
}

/** Convert Path unlock pairs / legacy vocab into deck word IDs */
export function wordIdsFromUnlocks(
  pairs: Array<{ rootId: string; patternId: string } | string>,
): string[] {
  const ids: string[] = [];
  for (const p of pairs) {
    if (typeof p === "string") {
      if (BY_ID.has(p)) ids.push(p);
      continue;
    }
    const card = forgeWordCard(p.rootId, p.patternId);
    if (card) ids.push(card.id);
  }
  return [...new Set(ids)];
}

export function spellIdsFromPathVocab(
  pairs: Array<{ rootId: string; patternId: string }>,
): string[] {
  return wordIdsFromUnlocks(pairs);
}

/** @deprecated Compatibility alias for review / economy helpers */
export const VALID_SPELLS = WORD_CARDS.map((c) => ({
  id: c.id,
  root: c.rootId,
  pattern: c.patternId,
  arabicWord: c.word,
  englishTranslation: c.translation,
  transliteration: c.transliteration,
  baseValue: c.basePower,
  archetype: "dps" as const,
  effectType: "damage" as const,
  inkCost: 1,
}));
