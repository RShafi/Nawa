/**
 * Strict morphological combat dictionary.
 * Only listed (root × pattern) weaves resolve; everything else fizzles.
 */

export type SpellArchetype = "dps" | "tank" | "control";

export type SpellEffectType = "damage" | "shield" | "heal" | "control" | "focus";

export type ValidSpell = {
  id: string;
  root: string;
  pattern: string;
  arabicWord: string;
  englishTranslation: string;
  transliteration: string;
  archetype: SpellArchetype;
  effectType: SpellEffectType;
  baseValue: number;
  inkCost: number;
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

/** Roots available in the battle hand pool */
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

/** Patterns on the crucible board */
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

/**
 * Curated valid weaves only — sparse on purpose so invalid drops fizzle.
 */
export const VALID_SPELLS: ValidSpell[] = [
  // ن ص ر
  {
    id: "nsr-form-1",
    root: "nsr",
    pattern: "form-1",
    arabicWord: "نَصَرَ",
    englishTranslation: "He helped / granted victory",
    transliteration: "naṣara",
    archetype: "dps",
    effectType: "damage",
    baseValue: 18,
    inkCost: 2,
  },
  {
    id: "nsr-form-2",
    root: "nsr",
    pattern: "form-2",
    arabicWord: "نَصَّرَ",
    englishTranslation: "He made victorious (intensified)",
    transliteration: "naṣṣara",
    archetype: "dps",
    effectType: "damage",
    baseValue: 26,
    inkCost: 3,
  },
  {
    id: "nsr-active-participle",
    root: "nsr",
    pattern: "active-participle",
    arabicWord: "نَاصِر",
    englishTranslation: "Helper / supporter",
    transliteration: "nāṣir",
    archetype: "dps",
    effectType: "damage",
    baseValue: 14,
    inkCost: 2,
  },
  {
    id: "nsr-passive-participle",
    root: "nsr",
    pattern: "passive-participle",
    arabicWord: "مَنْصُور",
    englishTranslation: "The aided one",
    transliteration: "manṣūr",
    archetype: "tank",
    effectType: "shield",
    baseValue: 12,
    inkCost: 2,
  },

  // س ل م
  {
    id: "slm-form-1",
    root: "slm",
    pattern: "form-1",
    arabicWord: "سَلِمَ",
    englishTranslation: "He was safe / unharmed",
    transliteration: "salima",
    archetype: "tank",
    effectType: "heal",
    baseValue: 12,
    inkCost: 2,
  },
  {
    id: "slm-form-2",
    root: "slm",
    pattern: "form-2",
    arabicWord: "سَلَّمَ",
    englishTranslation: "He greeted / handed over",
    transliteration: "sallama",
    archetype: "tank",
    effectType: "shield",
    baseValue: 20,
    inkCost: 2,
  },
  {
    id: "slm-active-participle",
    root: "slm",
    pattern: "active-participle",
    arabicWord: "سَالِم",
    englishTranslation: "Safe / sound one",
    transliteration: "sālim",
    archetype: "tank",
    effectType: "heal",
    baseValue: 14,
    inkCost: 2,
  },

  // ك ت ب
  {
    id: "ktb-form-1",
    root: "ktb",
    pattern: "form-1",
    arabicWord: "كَتَبَ",
    englishTranslation: "He wrote",
    transliteration: "kataba",
    archetype: "dps",
    effectType: "damage",
    baseValue: 12,
    inkCost: 1,
  },
  {
    id: "ktb-form-2",
    root: "ktb",
    pattern: "form-2",
    arabicWord: "كَتَّبَ",
    englishTranslation: "He made (someone) write",
    transliteration: "kattaba",
    archetype: "dps",
    effectType: "damage",
    baseValue: 22,
    inkCost: 3,
  },
  {
    id: "ktb-form-10",
    root: "ktb",
    pattern: "form-10",
    arabicWord: "اِسْتَكْتَبَ",
    englishTranslation: "He asked to write / dictated",
    transliteration: "istaktaba",
    archetype: "control",
    effectType: "control",
    baseValue: 8,
    inkCost: 3,
  },
  {
    id: "ktb-active-participle",
    root: "ktb",
    pattern: "active-participle",
    arabicWord: "كَاتِب",
    englishTranslation: "Writer / scribe",
    transliteration: "kātib",
    archetype: "control",
    effectType: "focus",
    baseValue: 2,
    inkCost: 2,
  },
  {
    id: "ktb-passive-participle",
    root: "ktb",
    pattern: "passive-participle",
    arabicWord: "مَكْتُوب",
    englishTranslation: "That which is written",
    transliteration: "maktūb",
    archetype: "tank",
    effectType: "shield",
    baseValue: 10,
    inkCost: 1,
  },
  {
    id: "ktb-noun-of-instrument",
    root: "ktb",
    pattern: "noun-of-instrument",
    arabicWord: "مِكْتَاب",
    englishTranslation: "Writing instrument (typewriter)",
    transliteration: "miktāb",
    archetype: "dps",
    effectType: "damage",
    baseValue: 16,
    inkCost: 2,
  },

  // د ر س
  {
    id: "drs-form-1",
    root: "drs",
    pattern: "form-1",
    arabicWord: "دَرَسَ",
    englishTranslation: "He studied",
    transliteration: "darasa",
    archetype: "dps",
    effectType: "damage",
    baseValue: 11,
    inkCost: 1,
  },
  {
    id: "drs-form-2",
    root: "drs",
    pattern: "form-2",
    arabicWord: "دَرَّسَ",
    englishTranslation: "He taught",
    transliteration: "darrasa",
    archetype: "dps",
    effectType: "damage",
    baseValue: 20,
    inkCost: 2,
  },
  {
    id: "drs-active-participle",
    root: "drs",
    pattern: "active-participle",
    arabicWord: "دَارِس",
    englishTranslation: "Student / one who studies",
    transliteration: "dāris",
    archetype: "control",
    effectType: "focus",
    baseValue: 1,
    inkCost: 1,
  },
  {
    id: "drs-noun-of-place",
    root: "drs",
    pattern: "noun-of-place",
    arabicWord: "مَدْرَسَة",
    englishTranslation: "A place of learning / school",
    transliteration: "madrasa",
    archetype: "control",
    effectType: "control",
    baseValue: 8,
    inkCost: 2,
  },

  // ح ك م
  {
    id: "hkm-form-1",
    root: "hkm",
    pattern: "form-1",
    arabicWord: "حَكَمَ",
    englishTranslation: "He judged / ruled",
    transliteration: "ḥakama",
    archetype: "dps",
    effectType: "damage",
    baseValue: 16,
    inkCost: 2,
  },
  {
    id: "hkm-active-participle",
    root: "hkm",
    pattern: "active-participle",
    arabicWord: "حَاكِم",
    englishTranslation: "Ruler / judge",
    transliteration: "ḥākim",
    archetype: "tank",
    effectType: "shield",
    baseValue: 14,
    inkCost: 2,
  },

  // ض ر ب — strike
  {
    id: "drb-form-1",
    root: "drb",
    pattern: "form-1",
    arabicWord: "ضَرَبَ",
    englishTranslation: "He struck",
    transliteration: "ḍaraba",
    archetype: "dps",
    effectType: "damage",
    baseValue: 20,
    inkCost: 2,
  },
  {
    id: "drb-form-2",
    root: "drb",
    pattern: "form-2",
    arabicWord: "ضَرَّبَ",
    englishTranslation: "He struck repeatedly",
    transliteration: "ḍarraba",
    archetype: "dps",
    effectType: "damage",
    baseValue: 28,
    inkCost: 3,
  },
  {
    id: "drb-active-participle",
    root: "drb",
    pattern: "active-participle",
    arabicWord: "ضَارِب",
    englishTranslation: "Striker",
    transliteration: "ḍārib",
    archetype: "dps",
    effectType: "damage",
    baseValue: 15,
    inkCost: 2,
  },
  {
    id: "drb-noun-of-instrument",
    root: "drb",
    pattern: "noun-of-instrument",
    arabicWord: "مِضْرَاب",
    englishTranslation: "Bat / striking tool",
    transliteration: "miḍrāb",
    archetype: "dps",
    effectType: "damage",
    baseValue: 18,
    inkCost: 2,
  },

  // ح ف ظ — protect
  {
    id: "hfz-form-1",
    root: "hfz",
    pattern: "form-1",
    arabicWord: "حَفِظَ",
    englishTranslation: "He preserved / memorized",
    transliteration: "ḥafiẓa",
    archetype: "tank",
    effectType: "shield",
    baseValue: 14,
    inkCost: 2,
  },
  {
    id: "hfz-active-participle",
    root: "hfz",
    pattern: "active-participle",
    arabicWord: "حَافِظ",
    englishTranslation: "Protector / guardian",
    transliteration: "ḥāfiẓ",
    archetype: "tank",
    effectType: "shield",
    baseValue: 22,
    inkCost: 2,
  },
  {
    id: "hfz-passive-participle",
    root: "hfz",
    pattern: "passive-participle",
    arabicWord: "مَحْفُوظ",
    englishTranslation: "That which is preserved",
    transliteration: "maḥfūẓ",
    archetype: "tank",
    effectType: "heal",
    baseValue: 12,
    inkCost: 2,
  },

  // ك ش ف — reveal / explore
  {
    id: "kshf-form-1",
    root: "kshf",
    pattern: "form-1",
    arabicWord: "كَشَفَ",
    englishTranslation: "He uncovered / revealed",
    transliteration: "kashafa",
    archetype: "control",
    effectType: "control",
    baseValue: 10,
    inkCost: 2,
  },
  {
    id: "kshf-form-10",
    root: "kshf",
    pattern: "form-10",
    arabicWord: "اِسْتَكْشَفَ",
    englishTranslation: "He explored / sought to uncover",
    transliteration: "istakshafa",
    archetype: "control",
    effectType: "control",
    baseValue: 16,
    inkCost: 3,
  },
  {
    id: "kshf-active-participle",
    root: "kshf",
    pattern: "active-participle",
    arabicWord: "كَاشِف",
    englishTranslation: "Revealer",
    transliteration: "kāshif",
    archetype: "dps",
    effectType: "damage",
    baseValue: 13,
    inkCost: 2,
  },
];

const SPELL_INDEX = new Map(
  VALID_SPELLS.map((s) => [`${s.root}::${s.pattern}`, s] as const),
);

/** Return the ValidSpell for a weave, or null if morphologically invalid. */
export function validateWeave(root: string, pattern: string): ValidSpell | null {
  return SPELL_INDEX.get(`${root}::${pattern}`) ?? null;
}

/** Flat fizzle tax when the weave is not in the dictionary. */
export const FIZZLE_INK_COST = 1;

/** Ink regenerated at end of enemy turn (unused ink carries over). */
export const INK_REGEN_PER_TURN = 2;

/**
 * Strict Path → Arena lock: only weaves present in `user_unlocked_vocab`.
 */
export function spellIdsFromPathVocab(
  pairs: Array<{ rootId: string; patternId: string }>,
): string[] {
  const unlocked = new Set<string>();
  for (const pair of pairs) {
    const spell = validateWeave(pair.rootId, pair.patternId);
    if (spell) unlocked.add(spell.id);
  }
  return [...unlocked];
}

export function getPatternById(id: string): CombatPattern | undefined {
  return COMBAT_PATTERNS.find((p) => p.id === id);
}

export function catalogRootId(instanceId: string): string {
  // Prefer longest matching root id (kshf before k)
  const sorted = [...COMBAT_ROOTS].sort((a, b) => b.id.length - a.id.length);
  for (const root of sorted) {
    if (instanceId === root.id || instanceId.startsWith(`${root.id}-`)) {
      return root.id;
    }
  }
  return instanceId.split("-")[0] ?? instanceId;
}
