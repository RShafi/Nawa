/**
 * Natural English + distractors for Arena Resonance / Spell Chamber.
 */

import {
  WORD_CARDS,
  type PartOfSpeech,
  type WordCard,
} from "@/data/combatDictionary";
import type { SemanticTag } from "@/types/cards";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Infer definiteness from flag or الـ / Al- prefix. */
export function isDefinite(card: WordCard): boolean {
  if (typeof card.definite === "boolean") return card.definite;
  const w = card.word.replace(/^\u0640+/g, "");
  if (/^ال/.test(w) || /^ٱل/.test(w)) return true;
  if (/^al[-‑]/i.test(card.transliteration)) return true;
  return false;
}

/** Short English lemma for natural sentences. */
export function englishLemma(card: WordCard): string {
  const raw = (card.lemmaEn ?? card.translation).split("/")[0]?.trim() ?? card.translation;
  return raw
    .replace(/^(he|she|they|it)\s+/i, "")
    .replace(/\s+one$/i, "")
    .replace(/^the\s+/i, "")
    .trim();
}

function lowerLemma(card: WordCard): string {
  const L = englishLemma(card);
  if (!L) return L;
  return L.charAt(0).toLowerCase() + L.slice(1);
}

function titleLemma(card: WordCard): string {
  const L = englishLemma(card);
  if (!L) return L;
  return L.charAt(0).toUpperCase() + L.slice(1);
}

function verbPast(card: WordCard): string {
  // lemmaEn for verbs should already be past (“struck”, “studied”)
  const L = englishLemma(card);
  if (/ed$/i.test(L) || /[^aeiou]t$/i.test(L)) return L.toLowerCase();
  return L.toLowerCase();
}

/** True when modifier (verb/adj) may attach to target noun by semantic tags. */
export function isSemanticMatch(modifier: WordCard, target: WordCard): boolean {
  const needs = modifier.validTargets;
  if (!needs || needs.length === 0) return true;
  const have = new Set(target.tags ?? []);
  return needs.some((t) => have.has(t));
}

/** Find a noun + matching adj/verb pair in a card list. */
export function findSemanticPair(
  cards: WordCard[],
): { noun: WordCard; partner: WordCard } | null {
  const nouns = cards.filter((c) => c.partOfSpeech === "NOUN");
  const partners = cards.filter(
    (c) => c.partOfSpeech === "ADJECTIVE" || c.partOfSpeech === "VERB",
  );
  for (const noun of shuffle(nouns)) {
    for (const partner of shuffle(partners)) {
      if (isSemanticMatch(partner, noun)) return { noun, partner };
    }
  }
  return null;
}

/**
 * Parse play-order cards into natural English (not raw gloss concatenation).
 */
export function generateNaturalTranslation(cards: WordCard[]): string {
  if (cards.length === 0) return "";
  if (cards.length === 1) {
    const c = cards[0]!;
    if (c.partOfSpeech === "VERB") return titleLemma(c);
    return isDefinite(c) ? `The ${lowerLemma(c)}` : titleLemma(c);
  }

  const [a, b, c] = cards;
  const pos = cards.map((x) => x.partOfSpeech);

  // ——— Two cards ———
  if (cards.length === 2 && a && b) {
    // Noun + Adjective
    if (pos[0] === "NOUN" && pos[1] === "ADJECTIVE") {
      const nDef = isDefinite(a);
      const aDef = isDefinite(b);
      if (nDef && !aDef) {
        return `The ${lowerLemma(a)} is ${lowerLemma(b)}.`;
      }
      if (nDef && aDef) {
        return `The ${lowerLemma(b)} ${lowerLemma(a)}`;
      }
      // Indefinite noun + indefinite adj → predicative teaching default
      if (!nDef && !aDef) {
        return `The ${lowerLemma(a)} is ${lowerLemma(b)}.`;
      }
      return `The ${lowerLemma(b)} ${lowerLemma(a)}`;
    }

    // Idafa: Noun + Noun
    if (pos[0] === "NOUN" && pos[1] === "NOUN") {
      if (!isDefinite(a) && isDefinite(b)) {
        return `The ${lowerLemma(a)} of the ${lowerLemma(b)}`;
      }
      if (isDefinite(a) && isDefinite(b)) {
        return `The ${lowerLemma(a)} of the ${lowerLemma(b)}`;
      }
      return `The ${lowerLemma(a)} of a ${lowerLemma(b)}`;
    }

    // Verb + Noun / Adj
    if (pos[0] === "VERB" && pos[1] === "NOUN") {
      return `He ${verbPast(a)} the ${lowerLemma(b)}`;
    }
    if (pos[0] === "VERB" && pos[1] === "ADJECTIVE") {
      return `He ${verbPast(a)} ${lowerLemma(b)}`;
    }
  }

  // ——— Three+: Verb + Noun + Adjective ———
  if (
    cards.length >= 3 &&
    a &&
    b &&
    c &&
    pos[0] === "VERB" &&
    pos[1] === "NOUN" &&
    pos[2] === "ADJECTIVE"
  ) {
    return `He ${verbPast(a)} the ${lowerLemma(c)} ${lowerLemma(b)}`;
  }

  if (pos[0] === "VERB") {
    const rest = cards.slice(1);
    const nouns = rest.filter((x) => x.partOfSpeech === "NOUN");
    const adjs = rest.filter((x) => x.partOfSpeech === "ADJECTIVE");
    if (nouns[0] && adjs[0]) {
      return `He ${verbPast(a!)} the ${lowerLemma(adjs[0])} ${lowerLemma(nouns[0])}`;
    }
    if (nouns[0]) {
      return `He ${verbPast(a!)} the ${lowerLemma(nouns[0])}`;
    }
  }

  // Fallback: natural-ish join of lemmas
  return cards.map((x) => englishLemma(x)).join(" · ");
}

type DistractorBundle = {
  correct: string;
  options: string[];
};

/**
 * Plausible wrong answers that still look like natural English.
 * Trap = swap noun (same tags); Opposite = swap adjective/verb.
 */
export function generateDistractors(
  correctCards: WordCard[],
  deck: WordCard[] = WORD_CARDS,
): DistractorBundle {
  const correct = generateNaturalTranslation(correctCards);
  const pool = deck.length ? deck : WORD_CARDS;
  const seen = new Set([correct.toLowerCase()]);
  const distractors: string[] = [];

  const nounIdx = correctCards.findIndex((c) => c.partOfSpeech === "NOUN");
  const modIdx = correctCards.findIndex(
    (c) => c.partOfSpeech === "ADJECTIVE" || c.partOfSpeech === "VERB",
  );

  // Distractor 1 — Trap: swap noun for another with overlapping tags
  if (nounIdx >= 0) {
    const noun = correctCards[nounIdx]!;
    const tagSet = new Set(noun.tags ?? []);
    const altNouns = shuffle(
      pool.filter(
        (c) =>
          c.partOfSpeech === "NOUN" &&
          c.id !== noun.id &&
          (c.tags ?? []).some((t) => tagSet.has(t)),
      ),
    );
    for (const alt of altNouns) {
      const swapped = correctCards.map((c, i) => (i === nounIdx ? alt : c));
      // Keep semantic validity when a modifier is present
      const mod = modIdx >= 0 ? swapped[modIdx] : null;
      if (mod && mod.partOfSpeech !== "NOUN" && !isSemanticMatch(mod, alt)) continue;
      const text = generateNaturalTranslation(swapped);
      if (!seen.has(text.toLowerCase())) {
        seen.add(text.toLowerCase());
        distractors.push(text);
        break;
      }
    }
  }

  // Distractor 2 — Opposite: swap adjective/verb
  if (modIdx >= 0 && distractors.length < 2) {
    const mod = correctCards[modIdx]!;
    const noun = nounIdx >= 0 ? correctCards[nounIdx]! : null;
    const alts = shuffle(
      pool.filter((c) => {
        if (c.id === mod.id) return false;
        if (c.partOfSpeech !== mod.partOfSpeech) return false;
        if (noun && !isSemanticMatch(c, noun)) return false;
        return true;
      }),
    );
    for (const alt of alts) {
      const swapped = correctCards.map((c, i) => (i === modIdx ? alt : c));
      const text = generateNaturalTranslation(swapped);
      if (!seen.has(text.toLowerCase())) {
        seen.add(text.toLowerCase());
        distractors.push(text);
        break;
      }
    }
  }

  // Safe padding from other natural phrases / fallbacks
  const FALLBACKS = [
    "The student is diligent.",
    "The book is heavy.",
    "He studied the lesson",
    "The guardian of the school",
    "He wrote the book",
  ];
  for (const f of [...shuffle(pool).slice(0, 8).map((c) => generateNaturalTranslation([c])), ...FALLBACKS]) {
    if (distractors.length >= 2) break;
    if (!seen.has(f.toLowerCase())) {
      seen.add(f.toLowerCase());
      distractors.push(f);
    }
  }

  while (distractors.length < 2) {
    const pad = `A forgotten echo (${distractors.length + 1})`;
    if (!seen.has(pad.toLowerCase())) {
      seen.add(pad.toLowerCase());
      distractors.push(pad);
    }
  }

  const options = shuffle([correct, distractors[0]!, distractors[1]!]);
  return { correct, options };
}

/** Whether two cards form a guaranteed playable semantic pair for dealing. */
export function cardsFormDealablePair(a: WordCard, b: WordCard): boolean {
  const noun = a.partOfSpeech === "NOUN" ? a : b.partOfSpeech === "NOUN" ? b : null;
  const partner =
    a.partOfSpeech === "ADJECTIVE" || a.partOfSpeech === "VERB"
      ? a
      : b.partOfSpeech === "ADJECTIVE" || b.partOfSpeech === "VERB"
        ? b
        : null;
  if (!noun || !partner || noun.id === partner.id) return false;
  return isSemanticMatch(partner, noun);
}

export function pickSemanticMatchIds(
  poolIds: string[],
  getCard: (id: string) => WordCard | undefined,
): [string, string] | null {
  const cards = poolIds
    .map((id) => getCard(id))
    .filter((c): c is WordCard => Boolean(c));
  const pair = findSemanticPair(cards);
  if (!pair) return null;
  return [pair.noun.id, pair.partner.id];
}

export type { SemanticTag, PartOfSpeech };
