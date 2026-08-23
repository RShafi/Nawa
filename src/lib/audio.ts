/**
 * Arabic phonetic & audio synthesis helpers.
 * Goal: isolated letters speak as CV phonemes (/ba/), never letter names (/baa'/),
 * and full words keep every tashkeel mark (esp. final fatha).
 */

export const FATHA = "\u064E";
export const DAMMA = "\u064F";
export const KASRA = "\u0650";
export const SUKOON = "\u0652";
export const SHADDA = "\u0651";

const ARABIC_LETTER = /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3]/;
const SHORT_VOWEL = /[\u064B-\u0652\u0670]/;

/** Bare letter → phonetic CV (fatha) for speech engines. */
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
  ى: "ىَ",
};

/** Microsoft ar-SA IPA for short phonetic drills. */
export const PHONETIC_IPA: Record<string, string> = {
  عَ: "ʕa",
  عِ: "ʕi",
  عُ: "ʕu",
  حَ: "ħa",
  حِ: "ħi",
  حُ: "ħu",
  خَ: "xa",
  خِ: "xi",
  خُ: "xu",
  غَ: "ɣa",
  غِ: "ɣi",
  غُ: "ɣu",
  سَ: "sa",
  سِ: "si",
  سُ: "su",
  صَ: "sˤa",
  صِ: "sˤi",
  صُ: "sˤu",
  تَ: "ta",
  تِ: "ti",
  تُ: "tu",
  طَ: "tˤa",
  طِ: "tˤi",
  طُ: "tˤu",
  دَ: "da",
  ضَ: "dˤa",
  ذَ: "ða",
  ظَ: "ðˤa",
  كَ: "ka",
  كِ: "ki",
  كُ: "ku",
  كَا: "kaː",
  كِي: "kiː",
  كُو: "kuː",
  بَ: "ba",
  قَ: "qa",
  هَ: "ha",
  رَ: "ra",
  زَ: "za",
  شَ: "ʃa",
  فَ: "fa",
  لَ: "la",
  مَ: "ma",
  نَ: "na",
  وَ: "wa",
  يَ: "ja",
  ثَ: "θa",
  جَ: "dʒa",
  أَ: "ʔa",
  إِ: "ʔi",
};

const CONSONANT_IPA: Record<string, string> = {
  ء: "ʔ",
  أ: "ʔ",
  إ: "ʔ",
  آ: "ʔ",
  ب: "b",
  ت: "t",
  ث: "θ",
  ج: "dʒ",
  ح: "ħ",
  خ: "x",
  د: "d",
  ذ: "ð",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "ʃ",
  ص: "sˤ",
  ض: "dˤ",
  ط: "tˤ",
  ظ: "ðˤ",
  ع: "ʕ",
  غ: "ɣ",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  و: "w",
  ي: "j",
  ة: "h",
};

export type NormalizedUtterance = {
  /** Text shown / cached (preserves learner orthography where possible) */
  display: string;
  /** String sent to TTS engines — always fully vocalized for phonemes */
  spoken: string;
  /** IPA for Azure SSML when available */
  ipa: string | null;
  short: boolean;
};

export function hasArabicScript(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

export function arabicLetterCount(text: string): number {
  return [...text].filter((ch) => ARABIC_LETTER.test(ch)).length;
}

/**
 * Phonetic anchor: soft هاء after a short vowel syllable so engines keep the
 * terminal fatha audible (without teaching the letter name).
 * Zero-width joiners discourage “alphabet name” reading of bare glyphs.
 */
const ZWJ = "\u200D";
const SOFT_HA = "ه";

function phoneticAnchor(cv: string): string {
  // e.g. بَ → بَهْ  (still /ba/-like; discourages “baa’”)
  if (cv.length >= 2 && SHORT_VOWEL.test(cv[cv.length - 1]!)) {
    return `${cv}${SOFT_HA}${SUKOON}`;
  }
  return cv;
}

function preserveFinalFatha(word: string): string {
  const chars = [...word];
  if (!chars.length) return word;
  const last = chars[chars.length - 1]!;
  if (last === FATHA || last === DAMMA || last === KASRA) {
    // Soft echo of final CV so pause-form TTS doesn’t clip the vowel
    let i = chars.length - 2;
    while (i >= 0 && !ARABIC_LETTER.test(chars[i]!)) i -= 1;
    if (i >= 0) {
      const syllable = chars.slice(i).join("");
      return `${word}، ${syllable}`;
    }
  }
  return word;
}

/** Normalize isolated letters to CV phonemes; keep full tashkeel on words. */
export function normalizeForSpeech(raw: string): NormalizedUtterance {
  const text = raw.normalize("NFC").trim();
  if (!text) return { display: "", spoken: "", ipa: null, short: true };

  const letters = [...text].filter((ch) => ARABIC_LETTER.test(ch));
  const hasShortVowel = SHORT_VOWEL.test(text);

  // Isolated bare letter → phonetic CV (/ba/), never letter name
  if (letters.length === 1 && !hasShortVowel) {
    const letter = letters[0]!;
    const cv = PHONETIC_CV[letter] ?? `${letter}${FATHA}`;
    const spoken = phoneticAnchor(cv);
    return {
      display: letter,
      spoken: `${ZWJ}${spoken}`,
      ipa: PHONETIC_IPA[cv] ?? orthographyToIpa(cv),
      short: true,
    };
  }

  // Already-vowelled single syllable (عَ, كَا, …)
  if (letters.length <= 2 && text.length <= 8) {
    const cv = text;
    const spoken = phoneticAnchor(cv);
    return {
      display: text,
      spoken,
      ipa: PHONETIC_IPA[cv] ?? orthographyToIpa(cv),
      short: true,
    };
  }

  // Full words — preserve every diacritic; soft-echo final short vowel
  const spoken = preserveFinalFatha(text);
  return {
    display: text,
    spoken,
    ipa: orthographyToIpa(text),
    short: false,
  };
}

/** Convert vowelled Arabic → Microsoft IPA (keeps final short vowels). */
export function orthographyToIpa(raw: string): string | null {
  const text = raw.normalize("NFC").trim();
  if (!text) return null;

  type Syl = { c: string; v: string; geminate: boolean };
  const syllables: Syl[] = [];
  const chars = [...text];
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i]!;
    if (ch === " " || ch === "،" || ch === "ـ") {
      i += 1;
      continue;
    }
    if (ch === "آ") {
      syllables.push({ c: "ʔ", v: "aː", geminate: false });
      i += 1;
      continue;
    }
    if (!ARABIC_LETTER.test(ch)) {
      i += 1;
      continue;
    }

    const base = ch;
    i += 1;
    let geminate = false;
    if (chars[i] === SHADDA) {
      geminate = true;
      i += 1;
    }

    let vowel = "";
    if (chars[i] === FATHA || chars[i] === "\u064B") {
      vowel = "a";
      i += 1;
      if (chars[i] === "ا") {
        vowel = "aː";
        i += 1;
      }
    } else if (chars[i] === KASRA || chars[i] === "\u064D") {
      vowel = "i";
      i += 1;
      if (chars[i] === "ي" || chars[i] === "ى") {
        vowel = "iː";
        i += 1;
      }
    } else if (chars[i] === DAMMA || chars[i] === "\u064C") {
      vowel = "u";
      i += 1;
      if (chars[i] === "و") {
        vowel = "uː";
        i += 1;
      }
    } else if (chars[i] === SUKOON) {
      i += 1;
    }

    if (base === "ا" || base === "ى") {
      syllables.push({ c: "", v: vowel || "aː", geminate: false });
      continue;
    }

    const cIpa = CONSONANT_IPA[base];
    if (!cIpa) return null;
    syllables.push({ c: cIpa, v: vowel, geminate });
  }

  if (!syllables.length) return null;
  const voiced = syllables.filter((s) => s.v).length;
  if (voiced === 0) return null;

  const parts: string[] = [];
  for (const s of syllables) {
    if (!s.c && s.v) {
      parts.push(s.v);
      continue;
    }
    const c = s.geminate ? s.c + s.c : s.c;
    parts.push(s.v ? `${c}${s.v}` : c);
  }

  const merged: string[] = [];
  for (const p of parts) {
    if (/^[bdfghjklmnpqrstvwxzθðʃʕɣħʔsˤdˤtˤðˤ]+$/i.test(p) && merged.length) {
      merged[merged.length - 1] = `${merged[merged.length - 1]!}${p}`;
    } else {
      merged.push(p);
    }
  }
  return merged.join(".") || null;
}

export type SpeakOptions = {
  lang?: string;
  /** Prefer server neural TTS when available */
  preferApi?: boolean;
  rate?: number;
  pitch?: number;
};

export type SpeakResult = {
  mode: "api" | "webspeech" | "silent";
  usedVoice: string | null;
  cached?: boolean;
};

type CacheEntry = { blob: Blob; objectUrl: string; at: number };

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const audioCache = new Map<string, CacheEntry>();
let sharedAudio: HTMLAudioElement | null = null;
let playGeneration = 0;
let lastPlayAt = 0;
const MIN_REPLAY_GAP_MS = 160;

export function canSpeak(): boolean {
  return typeof window !== "undefined";
}

function cacheKey(spoken: string, lang: string): string {
  return `${lang}:${spoken}`;
}

function stopCurrentAudio() {
  if (!sharedAudio) return;
  sharedAudio.pause();
  sharedAudio.onended = null;
  sharedAudio.onerror = null;
  sharedAudio.removeAttribute("src");
  try {
    sharedAudio.load();
  } catch {
    /* ignore */
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function getCached(key: string): CacheEntry | null {
  const hit = audioCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    URL.revokeObjectURL(hit.objectUrl);
    audioCache.delete(key);
    return null;
  }
  return hit;
}

function putCache(key: string, blob: Blob): CacheEntry {
  const prev = audioCache.get(key);
  if (prev) URL.revokeObjectURL(prev.objectUrl);
  const entry: CacheEntry = { blob, objectUrl: URL.createObjectURL(blob), at: Date.now() };
  audioCache.set(key, entry);
  if (audioCache.size > 80) {
    const oldest = [...audioCache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (oldest) {
      URL.revokeObjectURL(oldest[1].objectUrl);
      audioCache.delete(oldest[0]);
    }
  }
  return entry;
}

async function fetchApiAudio(text: string, lang: string): Promise<Blob> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error(`TTS HTTP ${res.status}`);
  }
  const buf = await res.arrayBuffer();
  return new Blob([buf], { type: res.headers.get("Content-Type") || "audio/mpeg" });
}

function playObjectUrl(objectUrl: string, gen: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gen !== playGeneration) {
      resolve();
      return;
    }
    sharedAudio = new Audio(objectUrl);
    const audio = sharedAudio;
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Audio playback failed"));
    void audio.play().catch((err) => reject(err instanceof Error ? err : new Error(String(err))));
  });
}

/**
 * Web Speech fallback — calm ar-SA voice for learning clarity.
 * Hard defaults: rate 0.85, pitch 0.8 (never piercing).
 */
export function speakViaWebSpeech(
  spoken: string,
  options: { lang?: string; rate?: number; pitch?: number } = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("speechSynthesis unavailable"));
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(spoken);
    utter.lang = "ar-SA";
    utter.rate = options.rate ?? 0.85;
    utter.pitch = options.pitch ?? 0.8;

    const pickVoice = () => {
      const voices = synth.getVoices();
      const arabic =
        voices.find((v) => v.lang.toLowerCase() === "ar-sa") ??
        voices.find((v) => v.lang.toLowerCase().startsWith("ar")) ??
        null;
      if (arabic) utter.voice = arabic;
    };
    pickVoice();
    if (synth.getVoices().length === 0) {
      synth.addEventListener("voiceschanged", pickVoice, { once: true });
    }

    utter.onend = () => resolve();
    utter.onerror = () => reject(new Error("Web Speech failed"));
    synth.speak(utter);
  });
}

/** Prefetch neural clips for lesson tiles. */
export function prefetchArabic(texts: string[], lang = "ar"): void {
  if (!canSpeak()) return;
  for (const raw of texts) {
    const { spoken } = normalizeForSpeech(raw);
    if (!spoken) continue;
    const key = cacheKey(spoken, lang);
    if (getCached(key)) continue;
    void fetchApiAudio(spoken, lang)
      .then((blob) => putCache(key, blob))
      .catch(() => {
        /* best-effort */
      });
  }
}

/**
 * Primary speak entry — phonetic normalization + API TTS, Web Speech fallback.
 */
export async function speakArabic(
  text: string,
  options: SpeakOptions & { latinFallback?: string } = {},
): Promise<SpeakResult> {
  if (!canSpeak() || !text.trim()) {
    return { mode: "silent", usedVoice: null };
  }

  const lang = options.lang?.startsWith("ar") ? options.lang : "ar-SA";
  const preferApi = options.preferApi !== false;
  const normalized = normalizeForSpeech(text);
  const now = Date.now();
  if (now - lastPlayAt < MIN_REPLAY_GAP_MS) {
    return { mode: "api", usedVoice: "nawa-audio", cached: true };
  }
  lastPlayAt = now;

  const gen = ++playGeneration;
  stopCurrentAudio();

  const key = cacheKey(normalized.spoken, lang);

  if (preferApi) {
    try {
      let entry = getCached(key);
      const fromCache = Boolean(entry);
      if (!entry) {
        const blob = await fetchApiAudio(normalized.spoken, lang);
        if (gen !== playGeneration) return { mode: "api", usedVoice: "nawa-audio" };
        entry = putCache(key, blob);
      }
      if (gen !== playGeneration) {
        return { mode: "api", usedVoice: "nawa-audio", cached: fromCache };
      }
      await playObjectUrl(entry.objectUrl, gen);
      return { mode: "api", usedVoice: "nawa-audio", cached: fromCache };
    } catch {
      /* fall through to Web Speech */
    }
  }

  if (gen !== playGeneration) {
    return { mode: "webspeech", usedVoice: "ar-SA" };
  }

  try {
    await speakViaWebSpeech(normalized.spoken, {
      lang: "ar-SA",
      rate: options.rate ?? 0.85,
      pitch: options.pitch ?? 0.8,
    });
    return { mode: "webspeech", usedVoice: "ar-SA" };
  } catch {
    return { mode: "silent", usedVoice: null };
  }
}
