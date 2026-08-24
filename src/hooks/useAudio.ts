"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  canSpeak,
  normalizeForSpeech,
  prefetchArabic,
  speakArabic,
  type SpeakOptions,
  type SpeakResult,
} from "@/lib/audio";

type UseAudioOptions = SpeakOptions & {
  prefetch?: string[];
};

/**
 * React hook — ElevenLabs via `/api/tts` (no Web Speech).
 */
export function useAudio(options: UseAudioOptions = {}) {
  const [busy, setBusy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<SpeakResult | null>(null);
  const gate = useRef(false);
  const prefetchKey = options.prefetch?.join("\u0000") ?? "";

  useEffect(() => {
    if (!options.prefetch?.length) return;
    prefetchArabic(options.prefetch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefetchKey]);

  const speak = useCallback(
    async (text: string, override?: SpeakOptions) => {
      if (!canSpeak() || gate.current) {
        return { mode: "silent" as const, usedVoice: null };
      }
      gate.current = true;
      setBusy(true);
      setIsLoading(true);
      try {
        const result = await speakArabic(text, { ...options, ...override });
        setLastResult(result);
        return result;
      } finally {
        setBusy(false);
        setIsLoading(false);
        window.setTimeout(() => {
          gate.current = false;
        }, 200);
      }
    },
    [options],
  );

  return {
    speak,
    play: speak,
    busy,
    isLoading,
    lastResult,
    canSpeak: canSpeak(),
    normalize: normalizeForSpeech,
    prefetch: prefetchArabic,
  };
}
