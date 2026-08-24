/**
 * Compatibility façade — phonetic prep lives in `@/lib/audio`.
 * Kept so `/api/tts` and older imports keep working.
 */

import {
  arabicLetterCount,
  hasArabicScript,
  normalizeForSpeech,
  orthographyToIpa,
  type NormalizedSpeech,
  FATHA,
  KASRA,
  DAMMA,
} from "@/lib/audio";

export type PreparedTts = {
  display: string;
  spoken: string;
  ipa: string | null;
  short: boolean;
};

export function prepareArabicForTts(raw: string): PreparedTts {
  const n: NormalizedSpeech = normalizeForSpeech(raw);
  return {
    display: n.display || n.spoken,
    spoken: n.spoken,
    ipa: n.ipa,
    short: n.short,
  };
}

export function prepareArabicForTtsText(raw: string): string {
  return prepareArabicForTts(raw).spoken;
}

export function isShortPhonemeDrill(prepared: string): boolean {
  return arabicLetterCount(prepared) <= 2 && prepared.length <= 8;
}

export function arabicOrthographyToIpa(raw: string): string | null {
  return orthographyToIpa(raw);
}

export { hasArabicScript, arabicLetterCount, FATHA, KASRA, DAMMA };
