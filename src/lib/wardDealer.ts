import {
  VALID_SPELLS,
  validateWeave,
  type ValidSpell,
} from "@/data/combatDictionary";

export type Ward = {
  id: string;
  wordId: string;
  rootId: string;
  patternId: string;
  arabic: string;
  english: string;
  transliteration: string;
  shattered: boolean;
};

export type PathVocabPair = { rootId: string; patternId: string };

const RECENT_ROOT_MEMORY = 3;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Resolve path vocab into ValidSpell rows (combat ammo only). */
export function spellsFromVocab(pairs: PathVocabPair[]): ValidSpell[] {
  const out: ValidSpell[] = [];
  const seen = new Set<string>();
  for (const p of pairs) {
    const spell = validateWeave(p.rootId, p.patternId);
    if (!spell || seen.has(spell.id)) continue;
    seen.add(spell.id);
    out.push(spell);
  }
  return out;
}

/**
 * Smart Dealer: pick 2–3 unlocked words as Enemy Wards,
 * prefer avoiding recently used roots, guarantee playable hand roots/patterns.
 */
export function dealWardEncounter(
  pairs: PathVocabPair[],
  recentRootIds: string[] = [],
  wardCount = 3,
): {
  wards: Ward[];
  rootIds: string[];
  patternIds: string[];
  spells: ValidSpell[];
} {
  const spells = spellsFromVocab(pairs);
  if (spells.length === 0) {
    return { wards: [], rootIds: [], patternIds: [], spells: [] };
  }

  const recent = new Set(recentRootIds.slice(-RECENT_ROOT_MEMORY));
  const preferred = spells.filter((s) => !recent.has(s.root));
  const pool = preferred.length >= 2 ? preferred : spells;
  const picked = shuffle(pool).slice(0, Math.min(wardCount, Math.max(2, Math.min(3, pool.length))));

  // Ensure at least 2 wards when possible
  while (picked.length < Math.min(2, spells.length)) {
    const extra = spells.find((s) => !picked.some((p) => p.id === s.id));
    if (!extra) break;
    picked.push(extra);
  }

  const wards: Ward[] = picked.map((s) => ({
    id: `ward-${s.id}`,
    wordId: `${s.root}:${s.pattern}`,
    rootId: s.root,
    patternId: s.pattern,
    arabic: s.arabicWord,
    english: s.englishTranslation,
    transliteration: s.transliteration,
    shattered: false,
  }));

  const rootIds = [...new Set(picked.map((s) => s.root))];
  const patternIds = [...new Set(picked.map((s) => s.pattern))];

  // Pad hand with other unlocked roots/patterns so forging isn't only the ward set
  for (const s of shuffle(spells)) {
    if (rootIds.length < 4 && !rootIds.includes(s.root)) rootIds.push(s.root);
    if (patternIds.length < 3 && !patternIds.includes(s.pattern)) patternIds.push(s.pattern);
  }

  return { wards, rootIds, patternIds, spells: picked };
}

export function findSpell(rootId: string, patternId: string): ValidSpell | null {
  return validateWeave(rootId, patternId);
}

export function allValidSpellIds(): string[] {
  return VALID_SPELLS.map((s) => s.id);
}

export const WARD_CHIP_DAMAGE = 8;
export const STAGGER_DAMAGE_MULT = 2.5;
export const BATTLE_WIN_HIBR = 50;
export const REVIEW_SESSION_HIBR = 50;
export const RUST_DAMAGE_MULT = 0.7;
