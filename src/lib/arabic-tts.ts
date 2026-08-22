/**
 * Prep Arabic text for TTS without changing the learning target.
 * Bare consonants get a short fatha so the engine has a pronounceable syllable
 * (ع → عَ) — we do NOT elongate with alif (صَا), which muddies phoneme drills.
 */

const ARABIC_LETTER = /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3]/;
const SHORT_VOWEL = /[\u064B-\u0652\u0670]/;

const BARE_TO_FATHA: Record<string, string> = {
  ء: "أَ",
  أ: "أَ",
  إ: "إِ",
  آ: "آ",
  ا: "اَ",
  ب: "بَ",
  ت: "تَ",
  ث: "ثَ",
  ج: "جَ",
  ح: "حَ",
  خ: "خَ",
  د: "دَ",
  ذ: "ذَ",
  ر: "رَ",
  ز: "زَ",
  س: "سَ",
  ش: "شَ",
  ص: "صَ",
  ض: "ضَ",
  ط: "طَ",
  ظ: "ظَ",
  ع: "عَ",
  غ: "غَ",
  ف: "فَ",
  ق: "قَ",
  ك: "كَ",
  ل: "لَ",
  م: "مَ",
  ن: "نَ",
  ه: "هَ",
  و: "وَ",
  ي: "يَ",
  ة: "ةَ",
  ى: "ىَ",
};

/** IPA hints for short CV drills — used by Azure/Google SSML when available. */
export const PHONEME_IPA: Record<string, string> = {
  أَ: "ʔa",
  إِ: "ʔi",
  بَ: "ba",
  تَ: "ta",
  ثَ: "θa",
  جَ: "dʒa",
  حَ: "ħa",
  خَ: "xa",
  دَ: "da",
  ذَ: "ða",
  رَ: "ra",
  زَ: "za",
  سَ: "sa",
  شَ: "ʃa",
  صَ: "sˤa",
  ضَ: "dˤa",
  طَ: "tˤa",
  ظَ: "ðˤa",
  عَ: "ʕa",
  غَ: "ɣa",
  فَ: "fa",
  قَ: "qa",
  كَ: "ka",
  لَ: "la",
  مَ: "ma",
  نَ: "na",
  هَ: "ha",
  وَ: "wa",
  يَ: "ja",
};

export function hasArabicScript(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

export function prepareArabicForTts(raw: string): string {
  const text = raw.normalize("NFC").trim();
  if (!text) return text;

  const letters = [...text].filter((ch) => ARABIC_LETTER.test(ch));
  if (letters.length === 1 && !SHORT_VOWEL.test(text)) {
    const letter = letters[0]!;
    return BARE_TO_FATHA[letter] ?? `${letter}\u064E`;
  }
  return text;
}

export function ipaForPrepared(text: string): string | null {
  return PHONEME_IPA[text] ?? null;
}
