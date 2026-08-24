"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Neural TTS — HTML5 Audio against `/api/tts?text=...` (ElevenLabs only).
 * No window.speechSynthesis.
 */
export function useNeuralAudio(arabicText?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const play = useCallback(
    async (text?: string) => {
      const value = (text ?? arabicText ?? "").trim();
      if (!value) return;

      setError(null);
      setIsLoading(true);
      setIsPlaying(false);

      try {
        audioRef.current?.pause();
        const audio = new Audio(`/api/tts?text=${encodeURIComponent(value)}`);
        audioRef.current = audio;

        await new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            setIsPlaying(false);
            resolve();
          };
          audio.onerror = () => {
            setIsPlaying(false);
            reject(new Error("Playback failed — check ElevenLabs keys / network"));
          };
          void audio
            .play()
            .then(() => {
              setIsLoading(false);
              setIsPlaying(true);
            })
            .catch(reject);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not play audio");
      } finally {
        setIsLoading(false);
        setIsPlaying(false);
      }
    },
    [arabicText],
  );

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  return { play, stop, isLoading, isPlaying, error };
}
