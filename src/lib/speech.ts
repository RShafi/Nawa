"use client";

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
 * Prefer server `/api/tts` (Arabic neural/gTTS). Fall back to speaking
 * transliteration via Web Speech only if the API fails.
 */
export async function speakArabic(text: string, options: SpeakOptions = {}): Promise<SpeakResult> {
  const { lang = "ar", latinFallback } = options;
  if (!canSpeak() || !text.trim()) {
    return { mode: "latin", usedVoice: null };
  }

  try {
    await playViaApi(text, lang);
    return { mode: "api", usedVoice: "nawa-tts" };
  } catch {
    if (latinFallback?.trim()) {
      await playViaWebSpeech(latinFallback, "en-US");
      return { mode: "latin", usedVoice: "web-speech-latin" };
    }
    throw new Error("TTS unavailable");
  }
}

async function playViaApi(text: string, lang: string): Promise<void> {
  const url = `/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `TTS HTTP ${res.status}`);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  if (!sharedAudio) sharedAudio = new Audio();
  const audio = sharedAudio;
  audio.pause();
  audio.src = objectUrl;

  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      audio.onended = null;
      audio.onerror = null;
    };
    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error("Audio element failed"));
    };
    void audio.play().catch((err) => {
      cleanup();
      reject(err);
    });
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
