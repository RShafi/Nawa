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
  /** Prefetch these Arabic strings on mount */
  prefetch?: string[];
};

/**
 * React hook around the phonetic audio engine — busy state, spam gate, prefetch.
 */
export function useAudio(options: UseAudioOptions = {}) {
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<SpeakResult | null>(null);
  const gate = useRef(false);
  const prefetchKey = options.prefetch?.join("\u0000") ?? "";

  useEffect(() => {
    if (!options.prefetch?.length) return;
    prefetchArabic(options.prefetch, options.lang ?? "ar");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prefetch when list identity changes
  }, [prefetchKey, options.lang]);

  const speak = useCallback(
    async (text: string, override?: SpeakOptions) => {
      if (!canSpeak() || gate.current) {
        return { mode: "silent" as const, usedVoice: null };
      }
      gate.current = true;
      setBusy(true);
      try {
        const result = await speakArabic(text, { ...options, ...override });
        setLastResult(result);
        return result;
      } finally {
        setBusy(false);
        window.setTimeout(() => {
          gate.current = false;
        }, 200);
      }
    },
    [options],
  );

  return {
    speak,
    busy,
    lastResult,
    canSpeak: canSpeak(),
    normalize: normalizeForSpeech,
    prefetch: prefetchArabic,
  };
}
