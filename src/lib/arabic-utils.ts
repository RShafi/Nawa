import type { DerivedWord, RootLetter, TashkeelMode } from "@/types/arabic";

/** Harakat, tanween, sukun, dagger alef, and related Arabic combining marks. */
export const ARABIC_DIACRITICS =
  /[\u064B-\u0652\u0653-\u0655\u0670\u06D6-\u06ED]/g;

const SHADDA = "\u0651";
const DAGGER_ALEF = "\u0670";

/**
 * Strip or retain Arabic diacritics according to reading mode.
 * - full: unchanged
 * - minimal: keep shadda + dagger alef; strip harakat, tanween, sukun
 * - none: strip all listed diacritics
 */
export function stripDiacritics(text: string, mode: TashkeelMode): string {
  if (mode === "full") return text;
  if (mode === "none") return text.replace(ARABIC_DIACRITICS, "");

  let result = "";
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    const isShadda = ch === SHADDA;
    const isDagger = ch === DAGGER_ALEF;
    const isDiacritic =
      (code >= 0x064b && code <= 0x0652) ||
      (code >= 0x0653 && code <= 0x0655) ||
      (code >= 0x06d6 && code <= 0x06ed) ||
      code === 0x0670;

    if (isDiacritic && !isShadda && !isDagger) continue;
    result += ch;
  }
  return result;
}

export function formatPhonetic(transliteration: string, ipa?: string): string {
  if (!ipa) return transliteration;
  return `${transliteration} · ${ipa}`;
}

export function getDerivedWord(
  rootId: string,
  patternId: string,
  catalog: DerivedWord[],
): DerivedWord | undefined {
  return catalog.find((w) => w.rootId === rootId && w.patternId === patternId);
}

/**
 * Replace ف / ع / ل placeholders in a template with root consonants.
 * Display helper only — canonical Arabic comes from DerivedWord.arabic.
 */
export function slotRootIntoTemplate(
  consonants: [RootLetter, RootLetter, RootLetter],
  template: string,
): string {
  const [f, a, l] = consonants;
  let fUsed = false;
  let aUsed = false;
  let lUsed = false;
  let out = "";

  for (const ch of template) {
    if (ch === "ف" && !fUsed) {
      out += f.arabic;
      fUsed = true;
    } else if (ch === "ع" && !aUsed) {
      out += a.arabic;
      aUsed = true;
    } else if (ch === "ل" && !lUsed) {
      out += l.arabic;
      lUsed = true;
    } else {
      out += ch;
    }
  }
  return out;
}

export function hasDerivedWord(
  rootId: string,
  patternId: string,
  catalog: DerivedWord[],
): boolean {
  return catalog.some((w) => w.rootId === rootId && w.patternId === patternId);
}
