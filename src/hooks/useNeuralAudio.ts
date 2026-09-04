"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getIsAudioPlaying, speakArabic, stopArabicAudio } from "@/lib/audio";

/**
 * Neural TTS hook — delegates to the shared audio lock in `speakArabic`.
 */
export function useNeuralAudio(arabicText?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generationRef = useRef(0);

  useEffect(() => {
    return () => {
      generationRef.current += 1;
      stopArabicAudio();
    };
  }, []);

  const play = useCallback(
    async (text?: string) => {
      const value = (text ?? arabicText ?? "").trim();
      if (!value) return;

      const gen = ++generationRef.current;
      setError(null);
      setIsLoading(true);
      setIsPlaying(false);

      try {
        const result = await speakArabic(value);
        if (gen !== generationRef.current) return;
        if (!result || result.mode === "silent") {
          setError("Could not play audio");
        }
      } catch (err) {
        if (gen !== generationRef.current) return;
        setError(err instanceof Error ? err.message : "Could not play audio");
      } finally {
        if (gen === generationRef.current) {
          setIsLoading(false);
          setIsPlaying(getIsAudioPlaying());
        }
      }
    },
    [arabicText],
  );

  const stop = useCallback(() => {
    generationRef.current += 1;
    stopArabicAudio();
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  return { play, stop, isLoading, isPlaying, error };
}
