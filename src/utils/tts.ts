/**

 * ElevenLabs Arabic TTS text normalization (server + client safe).

 */



export const FATHA = "\u064E";

export const DAMMA = "\u064F";

export const KASRA = "\u0650";

export const SUKOON = "\u0652";

export const SHADDA = "\u0651";

export const TA_MARBUTA = "\u0629";

export const HA = "\u0647";



const ARABIC_LETTER = /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3]/;

const SHORT_VOWEL = /[\u064B-\u0652\u0670]/;

const DIACRITICS = /[\u064B-\u065F\u0670]/gu;

const TRAILING_TA_MARBUTA = /ة[\u064B-\u0652\u0670]*$/u;



/** Fatha form for isolated letter drills — forces "ba" not "beh". */

export const PHONETIC_CV: Record<string, string> = {

  ء: "أَ",

  أ: "أَ",

  إ: "إِ",

  آ: "آ",

  ا: "أَ",

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

};



/** English phonetic hints for root-discovery UI. */

export const LETTER_PHONETIC_HINT: Record<string, { symbol: string; name: string }> = {

  ء: { symbol: "ʔ", name: "Hamza" },

  أ: { symbol: "A", name: "Alif" },

  إ: { symbol: "I", name: "Alif" },

  آ: { symbol: "Ā", name: "Alif madda" },

  ا: { symbol: "A", name: "Alif" },

  ب: { symbol: "Ba", name: "Ba" },

  ت: { symbol: "Ta", name: "Ta" },

  ث: { symbol: "Tha", name: "Tha" },

  ج: { symbol: "Ja", name: "Jim" },

  ح: { symbol: "Ha", name: "Ha (heavy)" },

  خ: { symbol: "Kha", name: "Kha" },

  د: { symbol: "Da", name: "Dal" },

  ذ: { symbol: "Dha", name: "Dhal" },

  ر: { symbol: "Ra", name: "Ra" },

  ز: { symbol: "Za", name: "Zay" },

  س: { symbol: "Sa", name: "Sin" },

  ش: { symbol: "Sh", name: "Shīn" },

  ص: { symbol: "Ṣ", name: "Ṣād" },

  ض: { symbol: "Ḍ", name: "Ḍād" },

  ط: { symbol: "Ṭ", name: "Ṭāʾ" },

  ظ: { symbol: "Ẓ", name: "Ẓāʾ" },

  ع: { symbol: "ʿ", name: "ʿAyn" },

  غ: { symbol: "Gh", name: "Ghayn" },

  ف: { symbol: "F", name: "Fāʾ" },

  ق: { symbol: "Q", name: "Qāf" },

  ك: { symbol: "Ka", name: "Kaf" },

  ل: { symbol: "La", name: "Lam" },

  م: { symbol: "Ma", name: "Mim" },

  ن: { symbol: "Na", name: "Nun" },

  ه: { symbol: "Ha", name: "Ha" },

  و: { symbol: "Wa", name: "Waw" },

  ي: { symbol: "Ya", name: "Ya" },

  ة: { symbol: "Ta", name: "Ta marbuta" },

};



export type LetterPhoneticHint = {
  /** Spoken sound with short vowel, e.g. "Ka". */
  sound: string;
  /** Letter name for reference, e.g. "Kaf". */
  name: string;
};



export function getLetterSoundForTts(letter: string): string {
  const trimmed = letter.trim();
  if (!trimmed) return trimmed;
  const base = [...trimmed].find((c) => ARABIC_LETTER.test(c));
  if (!base) return trimmed;
  return PHONETIC_CV[base] ?? `${base}${FATHA}`;
}



export function getLetterPhoneticHint(

  letter: string,

  transliterationPart?: string,

): LetterPhoneticHint {

  const mapped = LETTER_PHONETIC_HINT[letter];

  if (mapped) return { sound: mapped.symbol, name: mapped.name };

  const part = transliterationPart?.trim();
  if (part) {
    const sound = part.length > 1 ? part : `${part}a`;
    return { sound, name: part };
  }

  return { sound: "?", name: "Letter" };
}



export type PrepareTtsOptions = {
  /** Curriculum/manual override — sent verbatim to ElevenLabs unless a phonetic map exists. */
  ttsOverride?: string;
};

/**
 * Hardcoded Latin phonetic spellings — bypasses ElevenLabs Arabic grammar guessing.
 * Keys = display Arabic (or Arabic ttsOverride); values = exact string sent to the API.
 */
export const PHONETIC_OVERRIDES: Record<string, string> = {
  "كَتَبَ": "ka-ta-ba",
  "كَتَبْ": "ka-ta-b",
  "مَدْرَسَة": "mad-ra-sah",
  "مَدْرَسَهْ": "mad-ra-sah",
  "دَرَسَ": "da-ra-sa",
  "مَكْتَب": "mak-tab",
  "مَكْتَبْ": "mak-tab",
  /** Bare boat letters — long vowel spelling stops ElevenLabs reading "tha" as "a-the-e". */
  "ب": "baa",
  "ت": "taa",
  "ث": "thah",
  "بَ": "baa",
  "تَ": "taa",
  "ثَ": "thah",
  "كَ": "kaa",
  "دَ": "daa",
  "رَ": "raa",
  "سَ": "saa",
  "فَ": "faa",
  "عَ": "ayn",
  "لَ": "laa",
};

/** Resolve Latin phonetic override for a display or override Arabic token. */
export function getPhoneticOverride(text: string): string | undefined {
  const key = text.trim();
  if (!key) return undefined;
  return PHONETIC_OVERRIDES[key] ?? PHONETIC_OVERRIDES[key.normalize("NFC")];
}

/**
 * Resolve the exact string sent to ElevenLabs.
 * Priority: phonetic dictionary → manual override phonetic → Arabic sanitization.
 */
export function resolveSpokenText(displayText: string, ttsOverride?: string): string {
  const trimmed = displayText.trim();
  if (!trimmed) return trimmed;

  const phoneticFromDisplay = getPhoneticOverride(trimmed);
  if (phoneticFromDisplay) return phoneticFromDisplay;

  const override = ttsOverride?.trim();
  if (override) {
    const phoneticFromOverride = getPhoneticOverride(override);
    if (phoneticFromOverride) return phoneticFromOverride;
    if (!/[\u0600-\u06FF]/.test(override)) return override;
    return prepareTextForElevenLabs(trimmed, { ttsOverride: override });
  }

  return prepareTextForElevenLabs(trimmed);
}



function isIsolatedLetterToken(token: string): boolean {

  const letters = [...token].filter((c) => ARABIC_LETTER.test(c));

  if (letters.length !== 1) return false;

  const base = token.replace(DIACRITICS, "").trim();

  return base === letters[0];

}



function lastArabicLetterIndex(chars: string[]): number {

  for (let i = chars.length - 1; i >= 0; i--) {

    if (ARABIC_LETTER.test(chars[i]!)) return i;

  }

  return -1;

}



function endsWithSukoon(text: string): boolean {

  return text.endsWith(SUKOON) || /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3]\u0652$/u.test(text);

}



/** Pausal form — silence terminal Ta-Marbuta (ة → هْ). */

export function stripTaMarbutaForTts(token: string): string {

  if (!TRAILING_TA_MARBUTA.test(token)) return token;

  return token.replace(TRAILING_TA_MARBUTA, `${HA}${SUKOON}`);

}



/** Strip trailing harakat, tanwīn, and dagger-alif that ElevenLabs reads as case endings. */
const TRAILING_CASE_VOWELS = /[\u064B-\u0652\u0670]+$/u;

/** Apply sukūn to the final consonant — standard Arabic pausal (waqf) form. */
function applyPausalSukoon(token: string): string {
  if (endsWithSukoon(token)) return token;

  const chars = [...token];
  const lastLetterIdx = lastArabicLetterIndex(chars);
  if (lastLetterIdx < 0) return token;

  let end = lastLetterIdx + 1;
  if (chars[end] === SHADDA) end += 1;

  const stem = chars.slice(0, end).join("");
  return `${stem}${SUKOON}`;
}

/** Remove phantom terminal case vowels ( َ / ِ / ُ / tanwīn ) before pausal sukūn. */
function stripTerminalCaseVowels(token: string): string {
  let result = token;
  while (TRAILING_CASE_VOWELS.test(result)) {
    result = result.replace(TRAILING_CASE_VOWELS, "");
  }
  return result;
}

/** Normalize one Arabic token for ElevenLabs (auto rules only). */
export function sanitizeArabicToken(token: string): string {
  let trimmed = token.trim();
  if (!trimmed || !ARABIC_LETTER.test(trimmed)) return trimmed;

  // Ta marbuta always pauses as هْ
  trimmed = stripTaMarbutaForTts(trimmed);

  // Isolated letter drills keep an explicit short vowel (never bare consonant names)
  if (isIsolatedLetterToken(trimmed)) {
    const letter = [...trimmed].find((c) => ARABIC_LETTER.test(c))!;
    if (SHORT_VOWEL.test(trimmed)) return trimmed;
    return PHONETIC_CV[letter] ?? `${letter}${FATHA}`;
  }

  if (endsWithSukoon(trimmed)) return trimmed;

  // Multi-letter tokens: strip terminal case markers, then enforce pausal sukūn
  trimmed = stripTerminalCaseVowels(trimmed);
  return applyPausalSukoon(trimmed);
}



/**

 * Prepare display Arabic for ElevenLabs.

 * Manual `ttsOverride` wins; otherwise auto pausal rules:
 *   • Ta marbuta (ة) → هْ
 *   • Word-final harakat / tanwīn stripped → sukūn (ْ)
 *   • Isolated letters keep explicit fatha for drills

 */

export function prepareTextForElevenLabs(text: string, options?: PrepareTtsOptions): string {

  const override = options?.ttsOverride?.trim();

  if (override) {
    const phonetic = getPhoneticOverride(override);
    if (phonetic) return phonetic;
    if (!/[\u0600-\u06FF]/.test(override)) return override;
  }

  const trimmed = text.trim();

  if (!trimmed) return trimmed;

  const phonetic = getPhoneticOverride(trimmed);
  if (phonetic) return phonetic;

  // Latin phonetic passthrough — already resolved, do not Arabic-sanitize
  if (!/[\u0600-\u06FF]/.test(trimmed)) return trimmed;

  return trimmed

    .split(/(\s+)/)

    .map((part) => (/\s+/.test(part) ? part : sanitizeArabicToken(part)))

    .join("");

}



/** @deprecated Use prepareTextForElevenLabs */

export function sanitizeTextForElevenLabs(text: string, options?: PrepareTtsOptions): string {

  return prepareTextForElevenLabs(text, options);

}

let tabVisibilityCleanupInstalled = false;

/**
 * Client-only: stop speech + HTML5 audio when the user leaves the tab.
 * Pass `suspendAllTabMedia` from `@/lib/tabLifecycle` (or `stopArabicAudio` alone).
 * Does not auto-resume on focus — playback requires explicit user interaction.
 */
export function ensureTabVisibilityAudioCleanup(suspend: () => void): () => void {
  if (typeof document === "undefined") return () => {};

  const onHide = () => {
    if (document.hidden) suspend();
  };

  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", onHide);

  tabVisibilityCleanupInstalled = true;

  return () => {
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", onHide);
    tabVisibilityCleanupInstalled = false;
  };
}

export function isTabVisibilityCleanupInstalled(): boolean {
  return tabVisibilityCleanupInstalled;
}

