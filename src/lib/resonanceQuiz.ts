import { WORD_CARDS, type WordCard } from "@/data/combatDictionary";
import { generateDistractors, generateNaturalTranslation } from "@/utils/grammarEngine";

/** Build a safe 3-option MC quiz with natural English. */
export function buildResonanceQuiz(
  cards: WordCard[],
  extraPool: WordCard[] = [],
): {
  arabic: string;
  correct: string;
  options: string[];
} {
  const arabic = cards.map((c) => c.word).join(" ");
  const deck = extraPool.length > 0 ? [...extraPool, ...WORD_CARDS] : WORD_CARDS;
  const { correct, options } = generateDistractors(cards, deck);
  // Prefer generateNaturalTranslation explicitly for the displayed correct line
  const natural = generateNaturalTranslation(cards) || correct;
  const opts = options.includes(natural)
    ? options
    : [natural, ...options.filter((o) => o !== correct)].slice(0, 3);
  // Ensure exactly 3 unique options including natural correct
  const seen = new Set<string>();
  const final: string[] = [];
  for (const o of [natural, ...opts]) {
    const k = o.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    final.push(o);
    if (final.length === 3) break;
  }
  const fallbacks = ["He wrote a book", "The desk is big", "He studied at school", "A safe greeting"];
  for (const extra of fallbacks) {
    if (final.length >= 3) break;
    const key = extra.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    final.push(extra);
  }
  return { arabic, correct: natural, options: seededOrder(final, arabic) };
}

function seededOrder(list: string[], seedText: string): string[] {
  const copy = [...list];
  let state = 1;
  for (const ch of seedText) state = (state * 33 + ch.charCodeAt(0)) % 2147483647;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    state = (state * 16807) % 2147483647;
    const j = state % (i + 1);
    const left = copy[i];
    const right = copy[j];
    if (left === undefined || right === undefined) continue;
    copy[i] = right;
    copy[j] = left;
  }
  return copy;
}
