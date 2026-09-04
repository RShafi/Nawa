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

/* ── Cursive Morph Engine ───────────────────────────────────────────
 * Arabic letters change shape based on their neighborhood in a word:
 *   • Isolated — standing alone (ك)
 *   • Initial  — starts a chain; holds the hand of the letter on its left (كـ)
 *   • Medial   — sandwiched between two neighbors (ـكـ)
 *   • Final    — last in the chain; open toward the right (ـك)
 *
 * In RTL script the first letter you read sits on the right. It uses Initial
 * when it links leftward; the last letter on the left uses Final.
 *
 * Example — Kaf (ك): isolated ك → initial كـ when it connects to a letter on its left.
 * ─────────────────────────────────────────────────────────────────── */

export type CursivePosition = "isolated" | "initial" | "medial" | "final";

const ARABIC_BASE = /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3]/;

/** Six letters never join to what comes after them (leftward in RTL). */
const NON_CONNECTING_FORWARD = new Set(["ا", "أ", "آ", "إ", "د", "ذ", "ر", "ز", "و", "ؤ", "ء"]);

type LetterFormGlyphs = {
  isolated: string;
  initial: string;
  medial: string;
  final: string;
};

/**
 * Unicode Arabic Presentation Forms-B — explicit glyph per position.
 * Fonts with `font-arabic` render these reliably for morph animations.
 */
const LETTER_FORM_GLYPHS: Record<string, LetterFormGlyphs> = {
  ء: { isolated: "\uFE80", initial: "\uFE80", medial: "\uFE80", final: "\uFE80" },
  أ: { isolated: "\uFE83", initial: "\uFE83", medial: "\uFE83", final: "\uFE84" },
  ا: { isolated: "\uFE8D", initial: "\uFE8D", medial: "\uFE8E", final: "\uFE8E" },
  ب: { isolated: "\uFE8F", initial: "\uFE91", medial: "\uFE92", final: "\uFE90" },
  ت: { isolated: "\uFE95", initial: "\uFE97", medial: "\uFE98", final: "\uFE96" },
  ث: { isolated: "\uFE99", initial: "\uFE9B", medial: "\uFE9C", final: "\uFE9A" },
  ج: { isolated: "\uFE9D", initial: "\uFE9F", medial: "\uFEA0", final: "\uFE9E" },
  ح: { isolated: "\uFEA1", initial: "\uFEA3", medial: "\uFEA4", final: "\uFEA2" },
  خ: { isolated: "\uFEA5", initial: "\uFEA7", medial: "\uFEA8", final: "\uFEA6" },
  د: { isolated: "\uFEA9", initial: "\uFEA9", medial: "\uFEA9", final: "\uFEAA" },
  ذ: { isolated: "\uFEAB", initial: "\uFEAB", medial: "\uFEAB", final: "\uFEAC" },
  ر: { isolated: "\uFEAD", initial: "\uFEAD", medial: "\uFEAD", final: "\uFEAE" },
  ز: { isolated: "\uFEAF", initial: "\uFEAF", medial: "\uFEAF", final: "\uFEB0" },
  س: { isolated: "\uFEB1", initial: "\uFEB3", medial: "\uFEB4", final: "\uFEB2" },
  ش: { isolated: "\uFEB5", initial: "\uFEB7", medial: "\uFEB8", final: "\uFEB6" },
  ص: { isolated: "\uFEB9", initial: "\uFEBB", medial: "\uFEBC", final: "\uFEBA" },
  ض: { isolated: "\uFEBD", initial: "\uFEBF", medial: "\uFEC0", final: "\uFEBE" },
  ط: { isolated: "\uFEC1", initial: "\uFEC3", medial: "\uFEC4", final: "\uFEC2" },
  ظ: { isolated: "\uFEC5", initial: "\uFEC7", medial: "\uFEC8", final: "\uFEC6" },
  ع: { isolated: "\uFEC9", initial: "\uFECB", medial: "\uFECC", final: "\uFECA" },
  غ: { isolated: "\uFECD", initial: "\uFECF", medial: "\uFED0", final: "\uFECE" },
  ف: { isolated: "\uFED1", initial: "\uFED3", medial: "\uFED4", final: "\uFED2" },
  ق: { isolated: "\uFED5", initial: "\uFED7", medial: "\uFED8", final: "\uFED6" },
  ك: { isolated: "\uFED9", initial: "\uFEDB", medial: "\uFEDC", final: "\uFEDA" },
  ل: { isolated: "\uFEDD", initial: "\uFEDF", medial: "\uFEE0", final: "\uFEDE" },
  م: { isolated: "\uFEE1", initial: "\uFEE3", medial: "\uFEE4", final: "\uFEE2" },
  ن: { isolated: "\uFEE5", initial: "\uFEE7", medial: "\uFEE8", final: "\uFEE6" },
  ه: { isolated: "\uFEE9", initial: "\uFEEB", medial: "\uFEEC", final: "\uFEEA" },
  و: { isolated: "\uFEED", initial: "\uFEED", medial: "\uFEED", final: "\uFEEE" },
  ي: { isolated: "\uFEEF", initial: "\uFEF1", medial: "\uFEF2", final: "\uFEF0" },
  ة: { isolated: "\uFE93", initial: "\uFE93", medial: "\uFE94", final: "\uFE94" },
  ى: { isolated: "\uFEEF", initial: "\uFEF1", medial: "\uFEF2", final: "\uFEF0" },
};

/** Strip harakat from a letter token, keeping the base consonant. */
export function baseConsonant(letter: string): string {
  const chars = [...letter.trim()];
  return chars.find((c) => ARABIC_BASE.test(c)) ?? letter.trim();
}

/** Return combining marks (harakat) attached to a letter token. */
export function trailingDiacritics(letter: string): string {
  const trimmed = letter.trim();
  const base = baseConsonant(trimmed);
  const idx = trimmed.indexOf(base);
  if (idx < 0) return "";
  return trimmed.slice(idx + base.length);
}

/** Whether this letter joins to the next letter leftward in RTL flow. */
export function connectsForward(letter: string): boolean {
  return !NON_CONNECTING_FORWARD.has(baseConsonant(letter));
}

/**
 * Resolve positional cursive form for a letter token.
 * Preserves any harakat (e.g. َ) on the base consonant.
 */
export function getConnectedForm(letter: string, position: CursivePosition): string {
  const base = baseConsonant(letter);
  const marks = trailingDiacritics(letter);
  const forms = LETTER_FORM_GLYPHS[base];
  if (!forms) return letter;
  return `${forms[position]}${marks}`;
}

/** Positional role for the nth root letter in a RTL triliteral (index 0 = rightmost). */
export function cursivePositionInRoot(index: number, total: number): CursivePosition {
  if (total <= 1) return "isolated";
  if (index === 0) return "initial";
  if (index === total - 1) return "final";
  return "medial";
}

export type CursiveDrill = {
  /** Root letter index (RTL order) that slides and morphs. */
  sourceIndex: number;
  /** Letter it connects toward (leftward); -1 = ghost anchor only. */
  anchorIndex: number;
  /** Placeholder when there is no real anchor letter (e.g. final connectable letter). */
  ghostAnchor?: string;
  /** Form the source morphs into during the drill. */
  morphTo: CursivePosition;
};

/**
 * Build tap-through cursive drills for a root.
 * Pairs each connectable letter with its leftward neighbor, or a ghost anchor.
 */
export function buildCursiveDrills(letters: readonly string[]): CursiveDrill[] {
  const drills: CursiveDrill[] = [];

  for (let i = 0; i < letters.length - 1; i++) {
    if (!connectsForward(letters[i]!)) continue;
    drills.push({
      sourceIndex: i,
      anchorIndex: i + 1,
      morphTo: cursivePositionInRoot(i, letters.length),
    });
  }

  if (drills.length === 0) {
    for (let i = letters.length - 1; i >= 0; i--) {
      if (connectsForward(letters[i]!)) {
        drills.push({
          sourceIndex: i,
          anchorIndex: -1,
          ghostAnchor: "ـ",
          morphTo: letters.length === 1 ? "isolated" : i === 0 ? "initial" : "final",
        });
        break;
      }
    }
  }

  return drills;
}

/** Root letters in RTL reading order (rightmost / first-read letter first). */
export function rootLettersInReadingOrder(letters: readonly string[]): string[] {
  return [...letters].reverse();
}

/** Join root letters into a single cursive string using positional forms. */
export function assembleCursiveRoot(letters: readonly string[]): string {
  const ordered = rootLettersInReadingOrder(letters);
  return ordered
    .map((letter, index) => getConnectedForm(letter, cursivePositionInRoot(index, ordered.length)))
    .join("");
}
