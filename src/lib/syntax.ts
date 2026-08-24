/**
 * Arabic sentence syntax + semantic validation for the Syntactic Arena.
 * Rules (learner-facing):
 * - Verbs typically lead (VSO): VERB … then nouns/adjectives
 * - Adjectives follow the nouns they modify (Noun → Adjective)
 * - Modifiers must semantically match their noun targets
 */

import type { PartOfSpeech, WordCard } from "@/data/combatDictionary";
import { englishLemma, isSemanticMatch } from "@/utils/grammarEngine";

export type SyntaxResult = {
  ok: boolean;
  /** Human-readable reason when invalid */
  error?: string;
  /** Detected pattern label for UI */
  pattern?: string;
};

function semanticFail(modifier: WordCard, noun: WordCard): SyntaxResult {
  return {
    ok: false,
    error: `"${englishLemma(modifier)}" doesn’t fit with "${englishLemma(noun)}" — pick a logically matching word.`,
  };
}

/** Validate adjective/verb attachments against noun tags. */
function validateSemantics(cards: WordCard[]): SyntaxResult | null {
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i]!;
    if (c.partOfSpeech === "ADJECTIVE") {
      // Adjective modifies the nearest preceding noun
      let noun: WordCard | null = null;
      for (let j = i - 1; j >= 0; j--) {
        if (cards[j]!.partOfSpeech === "NOUN") {
          noun = cards[j]!;
          break;
        }
      }
      if (noun && !isSemanticMatch(c, noun)) return semanticFail(c, noun);
    }
    if (c.partOfSpeech === "VERB") {
      // Verb targets the first noun after it (object / complement)
      const noun = cards.slice(i + 1).find((x) => x.partOfSpeech === "NOUN");
      if (noun && !isSemanticMatch(c, noun)) return semanticFail(c, noun);
    }
  }
  return null;
}

/**
 * Validate a played chain (already in logical play order: first tap = first word).
 * Cards are stored RTL visually but validation uses play order.
 */
export function validateSyntax(cards: WordCard[]): SyntaxResult {
  if (cards.length === 0) {
    return { ok: false, error: "Play at least one Word Card." };
  }

  if (cards.length === 1) {
    return { ok: true, pattern: "Single word" };
  }

  const pos = cards.map((c) => c.partOfSpeech);

  // Reject adjective before its noun anywhere in the chain
  for (let i = 0; i < pos.length - 1; i++) {
    if (pos[i] === "ADJECTIVE" && pos[i + 1] === "NOUN") {
      return {
        ok: false,
        error: "In Arabic, adjectives follow nouns — put the noun before the adjective.",
      };
    }
  }

  // Two cards
  if (cards.length === 2) {
    if (pos[0] === "VERB" && (pos[1] === "NOUN" || pos[1] === "ADJECTIVE")) {
      const sem = validateSemantics(cards);
      if (sem) return sem;
      return { ok: true, pattern: "Verb + complement (VSO)" };
    }
    if (pos[0] === "NOUN" && pos[1] === "ADJECTIVE") {
      const sem = validateSemantics(cards);
      if (sem) return sem;
      return { ok: true, pattern: "Noun + adjective" };
    }
    if (pos[0] === "NOUN" && pos[1] === "NOUN") {
      return { ok: true, pattern: "Noun phrase (Iḍāfa)" };
    }
    if (pos[0] === "VERB" && pos[1] === "VERB") {
      return { ok: false, error: "Two verbs in a row — add a noun or rearrange." };
    }
    return {
      ok: false,
      error: "Try Verb→Noun, or Noun→Adjective.",
    };
  }

  // Three+ cards: prefer VSO with adjectives after nouns
  if (pos[0] !== "VERB") {
    return {
      ok: false,
      error: "Longer sentences usually start with a Verb (VSO).",
    };
  }

  const rest = pos.slice(1);
  let seenNoun = false;
  for (const p of rest) {
    if (p === "NOUN") seenNoun = true;
    if (p === "ADJECTIVE" && !seenNoun) {
      return {
        ok: false,
        error: "Adjectives need a noun before them.",
      };
    }
  }

  const sem = validateSemantics(cards);
  if (sem) return sem;

  if (
    cards.length === 3 &&
    pos[0] === "VERB" &&
    pos[1] === "NOUN" &&
    pos[2] === "ADJECTIVE"
  ) {
    return { ok: true, pattern: "Verb + Noun + Adjective (VSO)" };
  }

  if (rest.every((p) => p === "NOUN" || p === "ADJECTIVE")) {
    return { ok: true, pattern: "Verb-led sentence" };
  }

  return { ok: false, error: "That order isn’t a valid Arabic chain yet." };
}

export function describePos(pos: PartOfSpeech): string {
  switch (pos) {
    case "VERB":
      return "Verb";
    case "NOUN":
      return "Noun";
    case "ADJECTIVE":
      return "Adjective";
  }
}
