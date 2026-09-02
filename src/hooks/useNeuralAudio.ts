"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchTtsBlob } from "@/lib/ttsClient";

/**
 * Neural TTS — fetch `/api/tts` first, then play blob URL (ElevenLabs only).
 */
export function useNeuralAudio(arabicText?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      revokeObjectUrl();
    };
  }, [revokeObjectUrl]);

  const play = useCallback(
    async (text?: string) => {
      const value = (text ?? arabicText ?? "").trim();
      if (!value) return;

      setError(null);
      setIsLoading(true);
      setIsPlaying(false);

      try {
        audioRef.current?.pause();
        revokeObjectUrl();

        const blob = await fetchTtsBlob(value);
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;

        const audio = new Audio(objectUrl);
        audioRef.current = audio;

        await new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            setIsPlaying(false);
            resolve();
          };
          audio.onerror = () => {
            setIsPlaying(false);
            reject(new Error("Audio playback failed"));
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
    [arabicText, revokeObjectUrl],
  );

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  return { play, stop, isLoading, isPlaying, error };
}
