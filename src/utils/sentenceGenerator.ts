/**
 * Phase 1 semantic sentence engine — natural EN/AR pairs + MC distractors for Resonance Check.
 */

import { WORD_CARDS, type WordCard } from "@/data/combatDictionary";
import { validateSyntax } from "@/lib/syntax";
import { generateDistractors, generateNaturalTranslation } from "@/utils/grammarEngine";

export type SentencePairResult = {
  arabic: string;
  english: string;
  distractors: string[];
  /** Shuffled multiple-choice options (correct + distractors). */
  options: string[];
  /** True when syntax/translation failed and literal fallback was used. */
  fallback: boolean;
  error?: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function uniqueStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const trimmed = item.trim();
    const key = trimmed.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

function literalArabic(cards: WordCard[]): string {
  return cards.map((c) => c.word).join(" ");
}

function literalEnglish(cards: WordCard[]): string {
  return cards
    .map((c) => (c.lemmaEn ?? c.translation).split("/")[0]?.trim() ?? c.translation)
    .join(" · ");
}

function buildFallbackPair(cards: WordCard[], error?: string): SentencePairResult {
  const arabic = literalArabic(cards);
  const english = literalEnglish(cards) || "Unknown phrase";

  const distractors = uniqueStrings([
    cards
      .map((c) => c.translation)
      .reverse()
      .join(" / "),
    cards.map((c) => c.transliteration).join(" "),
    "The meaning slips away…",
  ]).filter((d) => d.toLowerCase() !== english.toLowerCase());

  while (distractors.length < 2) {
    distractors.push(`Fragment ${distractors.length + 1}`);
  }

  const options = shuffle(uniqueStrings([english, ...distractors.slice(0, 2)]));

  return {
    arabic,
    english,
    distractors: distractors.slice(0, 2),
    options,
    fallback: true,
    error,
  };
}

/**
 * Build a natural Arabic display line + English translation quiz from slotted Syntax Bar cards.
 * Falls back to literal concatenation when syntax is invalid.
 */
export function generateValidSentencePair(
  slottedCards: WordCard[],
  extraPool: WordCard[] = WORD_CARDS,
): SentencePairResult {
  if (slottedCards.length === 0) {
    return buildFallbackPair([], "No cards in the Syntax Bar.");
  }

  const syntax = validateSyntax(slottedCards);
  const arabic = literalArabic(slottedCards);

  if (!syntax.ok) {
    return buildFallbackPair(slottedCards, syntax.error);
  }

  const english = generateNaturalTranslation(slottedCards).trim();
  if (!english) {
    return buildFallbackPair(slottedCards, "Could not derive a natural translation.");
  }

  const pool = extraPool.length > 0 ? extraPool : WORD_CARDS;
  const { correct, options: rawOptions } = generateDistractors(slottedCards, pool);
  const natural = english || correct;

  const distractors = uniqueStrings(
    rawOptions.filter((o) => o.toLowerCase() !== natural.toLowerCase()),
  ).slice(0, 2);

  while (distractors.length < 2) {
    distractors.push(`A distant echo (${distractors.length + 1})`);
  }

  let options = shuffle(uniqueStrings([natural, ...distractors]));
  if (options.length < 3) {
    options = shuffle(uniqueStrings([natural, ...distractors, ...rawOptions]));
  }
  options = options.slice(0, 3);

  return {
    arabic,
    english: natural,
    distractors,
    options,
    fallback: false,
  };
}
