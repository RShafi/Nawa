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
  while (final.length < 3) {
    final.push(`Echo ${final.length}`);
  }
  // Shuffle for display
  for (let i = final.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [final[i], final[j]] = [final[j]!, final[i]!];
  }
  return { arabic, correct: natural, options: final };
}
