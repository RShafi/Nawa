/**
 * Shared layout constants for the Handwriting step.
 * Glyph outlines are extracted from Amiri via arabicGlyphPaths.ts.
 */

export const CALLIGRAPHY_VIEWBOX = "0 0 800 400";
export const CALLIGRAPHY_VIEWBOX_WIDTH = 800;

const COMBINING_MARK = /[\u064B-\u065F\u0670\u0617-\u061A\u06D6-\u06ED]/;

function segmentArabicGraphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("ar", { granularity: "grapheme" });
    return [...segmenter.segment(text)].map((part) => part.segment);
  }

  const graphemes: string[] = [];
  let current = "";
  for (const char of text) {
    if (current && COMBINING_MARK.test(char)) {
      current += char;
    } else {
      if (current) graphemes.push(current);
      current = char;
    }
  }
  if (current) graphemes.push(current);
  return graphemes;
}

export type CalligraphyMode = "letters" | "word";

export type CalligraphyPlan = {
  letters: readonly string[];
  mode: CalligraphyMode;
  displayText: string;
};

/** Split handwriting input into drawable graphemes + layout mode. */
export function resolveCalligraphyPlan(text: string): CalligraphyPlan {
  const trimmed = text.trim();
  if (!trimmed) {
    return { letters: ["ب"], mode: "letters", displayText: "ب" };
  }

  if (/[·•|]/.test(trimmed)) {
    const letters = trimmed
      .split(/\s*[·•|]\s*/)
      .map((part) => part.trim())
      .filter(Boolean);
    return {
      letters,
      mode: "letters",
      displayText: letters.join(" · "),
    };
  }

  const graphemes = segmentArabicGraphemes(trimmed);
  const letters = graphemes.length > 0 ? graphemes : [trimmed];
  return {
    letters,
    mode: letters.length > 1 ? "word" : "letters",
    displayText: trimmed,
  };
}

/** Split handwriting input into individual drawable Arabic graphemes (RTL animation order). */
export function resolveCalligraphyLetters(text: string): readonly string[] {
  return resolveCalligraphyPlan(text).letters;
}
