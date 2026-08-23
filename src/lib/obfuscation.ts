/**
 * Progressive UI decay — strip diacritics as player level rises
 * so learners must read bare Arabic morphology.
 */

const TASHKEEL_RANGE = /[\u064B-\u0652]/g;

/** Strip all harakat / tanween / sukun (commitment tooltips). */
export function stripAllTashkeel(arabicText: string): string {
  return arabicText.replace(TASHKEEL_RANGE, "");
}

/**
 * @param arabicText — pattern template or word with optional harakat
 * @param playerLevel — derived from curriculum progress (1+)
 */
export function applyDecay(arabicText: string, playerLevel: number): string {
  if (playerLevel < 5) return arabicText;
  return stripAllTashkeel(arabicText);
}

/** Hide English gloss/name hints once the reader is advanced enough. */
export function shouldHideEnglishHints(playerLevel: number): boolean {
  return playerLevel >= 10;
}
