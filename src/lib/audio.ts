"use client";

/**
 * Client audio — ElevenLabs via `/api/tts` only. Web Speech removed.
 */

export const FATHA = "\u064E";
export const DAMMA = "\u064F";
export const KASRA = "\u0650";
export const SUKOON = "\u0652";
export const SHADDA = "\u0651";

const ARABIC_LETTER = /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3]/;
const SHORT_VOWEL = /[\u064B-\u0652\u0670]/;

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

export type SpeakOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
  preferApi?: boolean;
};

export type SpeakResult = {
  mode: "api" | "silent";
  usedVoice: string | null;
  cached?: boolean;
};

export type NormalizedSpeech = {
  display: string;
  spoken: string;
  ipa: string | null;
  short: boolean;
};

/** @deprecated alias */
export type NormalizedUtterance = NormalizedSpeech;

export function hasArabicScript(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

export function arabicLetterCount(text: string): number {
  return [...text].filter((c) => ARABIC_LETTER.test(c)).length;
}

export function orthographyToIpa(_text: string): string | null {
  return null;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && typeof Audio !== "undefined";
}

export function normalizeForSpeech(text: string): NormalizedSpeech {
  const trimmed = text.trim();
  if (!trimmed) return { display: "", spoken: "", ipa: null, short: true };

  const letters = [...trimmed].filter((c) => ARABIC_LETTER.test(c));
  const hasVowel = SHORT_VOWEL.test(trimmed);

  if (letters.length === 1 && !hasVowel) {
    const letter = letters[0]!;
    const spoken = PHONETIC_CV[letter] ?? `${letter}${FATHA}`;
    return { display: letter, spoken, ipa: null, short: true };
  }

  return {
    display: trimmed,
    spoken: trimmed,
    ipa: null,
    short: letters.length <= 2,
  };
}

let sharedAudio: HTMLAudioElement | null = null;
let playGeneration = 0;
let lastPlayAt = 0;
const MIN_REPLAY_GAP_MS = 180;

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
}

/**
 * Primary speak entry — ElevenLabs via GET `/api/tts?text=...`.
 */
export async function speakArabic(
  text: string,
  _options: SpeakOptions & { latinFallback?: string } = {},
): Promise<SpeakResult> {
  if (!canSpeak() || !text.trim()) {
    return { mode: "silent", usedVoice: null };
  }

  const normalized = normalizeForSpeech(text);
  const now = Date.now();
  if (now - lastPlayAt < MIN_REPLAY_GAP_MS) {
    return { mode: "api", usedVoice: "elevenlabs", cached: true };
  }
  lastPlayAt = now;

  const gen = ++playGeneration;
  stopCurrentAudio();

  try {
    const url = `/api/tts?text=${encodeURIComponent(normalized.spoken)}`;
    sharedAudio = new Audio(url);
    const audio = sharedAudio;
    await new Promise<void>((resolve, reject) => {
      if (gen !== playGeneration) {
        resolve();
        return;
      }
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
      void audio.play().catch((err) => reject(err instanceof Error ? err : new Error(String(err))));
    });
    return { mode: "api", usedVoice: "elevenlabs" };
  } catch {
    return { mode: "silent", usedVoice: null };
  }
}

/** Prefetch neural clips (browser HTTP cache + server disk cache). */
export function prefetchArabic(texts: string[]): void {
  if (!canSpeak()) return;
  for (const raw of texts) {
    const { spoken } = normalizeForSpeech(raw);
    if (!spoken) continue;
    void fetch(`/api/tts?text=${encodeURIComponent(spoken)}`, { cache: "force-cache" }).catch(
      () => {
        /* best-effort */
      },
    );
  }
}
