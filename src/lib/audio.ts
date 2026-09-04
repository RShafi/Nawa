"use client";

/**
 * Client audio — ElevenLabs via `/api/tts` with instant browser-speech fallback.
 * Single shared playback mutex prevents overlapping streams / crashes on spam-click.
 */

import { fetchTtsBlob, prefetchTtsTexts } from "@/lib/ttsClient";
import {
  FATHA,
  DAMMA,
  KASRA,
  PHONETIC_CV,
  SHADDA,
  SUKOON,
  resolveSpokenText,
} from "@/utils/tts";
import { getTtsOverrideForArabic } from "@/content/ttsOverrides";

export { FATHA, DAMMA, KASRA, SHADDA, SUKOON, PHONETIC_CV };

const ARABIC_LETTER = /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3]/;
const TTS_FETCH_TIMEOUT_MS = 1500;

export type SpeakOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
  preferApi?: boolean;
  /** Manual ElevenLabs string — wins over auto normalization. */
  ttsOverride?: string;
};

export type SpeakResult = {
  mode: "api" | "browser" | "silent";
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

export function normalizeForSpeech(text: string, ttsOverride?: string): NormalizedSpeech {
  const trimmed = text.trim();
  if (!trimmed) return { display: "", spoken: "", ipa: null, short: true };

  const letters = [...trimmed].filter((c) => ARABIC_LETTER.test(c));
  const override = ttsOverride ?? getTtsOverrideForArabic(trimmed);
  const spoken = resolveSpokenText(trimmed, override);
  const short = letters.length <= 1;

  return {
    display: trimmed,
    spoken,
    ipa: null,
    short,
  };
}

let sharedAudio: HTMLAudioElement | null = null;
let objectUrl: string | null = null;
let playGeneration = 0;
let isAudioPlaying = false;
let browserUtterance: SpeechSynthesisUtterance | null = null;

function canUseBrowserSpeech(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function stopBrowserSpeech(): void {
  if (!canUseBrowserSpeech()) return;
  window.speechSynthesis.cancel();
  browserUtterance = null;
}

/** Whether neural TTS audio is currently playing. */
export function getIsAudioPlaying(): boolean {
  return isAudioPlaying;
}

/** Stop HTML5 neural clip only — does not bump generation (safe mid-fallback). */
function stopNeuralClip(): void {
  if (!sharedAudio) {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
    return;
  }

  sharedAudio.pause();
  sharedAudio.onended = null;
  sharedAudio.onerror = null;
  sharedAudio.removeAttribute("src");
  try {
    sharedAudio.load();
  } catch {
    /* ignore */
  }
  sharedAudio = null;

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
}

/** Stop any in-flight audio and release resources. Always resets the mutex. */
export function stopArabicAudio(): void {
  playGeneration += 1;
  isAudioPlaying = false;

  stopBrowserSpeech();
  stopNeuralClip();
}

function speakWithBrowser(
  text: string,
  options: SpeakOptions,
  gen: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!canUseBrowserSpeech()) {
      reject(new Error("Browser speech unavailable"));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    browserUtterance = utterance;
    utterance.lang = options.lang ?? "en-US";
    utterance.rate = options.rate ?? 0.82;
    utterance.pitch = options.pitch ?? 1;

    const cleanup = () => {
      if (browserUtterance === utterance) browserUtterance = null;
    };

    utterance.onend = () => {
      cleanup();
      if (gen === playGeneration) resolve();
    };
    utterance.onerror = () => {
      cleanup();
      if (gen === playGeneration) reject(new Error("Browser speech failed"));
    };

    window.speechSynthesis.speak(utterance);
  });
}

function fetchTtsBlobWithTimeout(text: string, timeoutMs: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error("TTS timeout"));
    }, timeoutMs);

    void fetchTtsBlob(text)
      .then((blob) => {
        window.clearTimeout(timer);
        resolve(blob);
      })
      .catch((err) => {
        window.clearTimeout(timer);
        reject(err instanceof Error ? err : new Error(String(err)));
      });
  });
}

function shouldSkipNeuralFetch(): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  return false;
}

/**
 * Primary speak entry — tries ElevenLabs (1.5s cap), falls back to browser speech instantly.
 */
export async function speakArabic(
  text: string,
  options: SpeakOptions & { latinFallback?: string } = {},
): Promise<SpeakResult> {
  if (typeof window === "undefined" || !text.trim()) {
    return { mode: "silent", usedVoice: null };
  }

  if (typeof document !== "undefined" && document.hidden) {
    return { mode: "silent", usedVoice: null };
  }

  stopArabicAudio();

  const normalized = normalizeForSpeech(text, options.ttsOverride);
  const gen = ++playGeneration;
  isAudioPlaying = true;

  const releaseLock = () => {
    if (gen === playGeneration) isAudioPlaying = false;
  };

  try {
    if (shouldSkipNeuralFetch()) {
      await speakWithBrowser(normalized.spoken, options, gen);
      if (gen !== playGeneration) return { mode: "silent", usedVoice: null };
      return { mode: "browser", usedVoice: "speechSynthesis" };
    }

    try {
      const blob = await fetchTtsBlobWithTimeout(normalized.spoken, TTS_FETCH_TIMEOUT_MS);
      if (gen !== playGeneration) return { mode: "silent", usedVoice: null };

      objectUrl = URL.createObjectURL(blob);
      sharedAudio = new Audio(objectUrl);
      const audio = sharedAudio;

      await new Promise<void>((resolve, reject) => {
        if (gen !== playGeneration) {
          resolve();
          return;
        }
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed"));
        void audio
          .play()
          .catch((err) => reject(err instanceof Error ? err : new Error(String(err))));
      });

      if (gen !== playGeneration) return { mode: "silent", usedVoice: null };
      return { mode: "api", usedVoice: "elevenlabs" };
    } catch {
      if (gen !== playGeneration) return { mode: "silent", usedVoice: null };

      stopNeuralClip();

      await speakWithBrowser(normalized.spoken, options, gen);
      if (gen !== playGeneration) return { mode: "silent", usedVoice: null };
      return { mode: "browser", usedVoice: "speechSynthesis" };
    }
  } catch {
    return { mode: "silent", usedVoice: null };
  } finally {
    releaseLock();
  }
}

/** Prefetch neural clips (deduped, capped — browser + server disk cache). */
export function prefetchArabic(texts: string[]): void {
  if (!canSpeak()) return;
  const spoken = texts
    .map((raw) => normalizeForSpeech(raw).spoken)
    .filter(Boolean);
  prefetchTtsTexts(spoken);
}
