"use client";

import { hasArabicScript } from "@/lib/arabic-tts";

type SpeakOptions = {
  lang?: string;
  latinFallback?: string;
};

export type SpeakResult = {
  mode: "api" | "latin";
  usedVoice: string | null;
};

let sharedAudio: HTMLAudioElement | null = null;

export function canSpeak(): boolean {
  return typeof window !== "undefined";
}

/**
 * Prefer server `/api/tts` (Arabic neural). Never fall back to English
 * reading of Latin spellings when the source text is Arabic.
 */
export async function speakArabic(text: string, options: SpeakOptions = {}): Promise<SpeakResult> {
  const { lang = "ar", latinFallback } = options;
  if (!canSpeak() || !text.trim()) {
    return { mode: "latin", usedVoice: null };
  }

  try {
    await playViaApi(text, lang);
    return { mode: "api", usedVoice: "nawa-tts" };
  } catch (err) {
    if (latinFallback?.trim() && !hasArabicScript(text)) {
      await playViaWebSpeech(latinFallback, "en-US");
      return { mode: "latin", usedVoice: "web-speech-latin" };
    }
    throw err instanceof Error ? err : new Error("TTS unavailable");
  }
}

async function playViaApi(text: string, lang: string): Promise<void> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `TTS HTTP ${res.status}`);
  }

  const provider = res.headers.get("X-TTS-Provider") ?? "unknown";
  const buf = await res.arrayBuffer();
  const blob = new Blob([buf], { type: "audio/mpeg" });
  const objectUrl = URL.createObjectURL(blob);

  if (!sharedAudio) sharedAudio = new Audio();
  const audio = sharedAudio;
  audio.pause();
  audio.currentTime = 0;
  audio.src = objectUrl;
  audio.preload = "auto";

  await new Promise<void>((resolve, reject) => {
    let settled = false;

    const cleanup = (revokeDelayMs: number) => {
      audio.onended = null;
      audio.onerror = null;
      audio.oncanplaythrough = null;
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), revokeDelayMs);
    };

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      cleanup(0);
      reject(err);
    };

    const succeed = () => {
      if (settled) return;
      settled = true;
      // Delay revoke so the last frames aren't clipped mid-decode
      cleanup(1500);
      resolve();
    };

    audio.onended = () => succeed();
    audio.onerror = () => fail(new Error(`Audio element failed (${provider})`));

    const start = () => {
      void audio.play().catch((playErr) => fail(playErr instanceof Error ? playErr : new Error(String(playErr))));
    };

    if (audio.readyState >= 3) {
      start();
    } else {
      audio.oncanplaythrough = () => start();
      audio.load();
    }
  });
}

function playViaWebSpeech(text: string, lang: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("No speechSynthesis"));
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.9;
    utter.onend = () => resolve();
    utter.onerror = () => reject(new Error("Web Speech failed"));
    window.speechSynthesis.speak(utter);
  });
}
