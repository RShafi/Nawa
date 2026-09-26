"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Neural TTS — HTML5 Audio against `/api/tts?text=...` (ElevenLabs only).
 * No window.speechSynthesis.
 */
function releaseAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.onended = null;
  audio.onerror = null;
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
}

export function useNeuralAudio(arabicText?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alive = useRef(true);
  const settleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      settleRef.current?.();
      settleRef.current = null;
      releaseAudio(audioRef.current);
      audioRef.current = null;
    };
  }, []);

  const play = useCallback(
    async (text?: string): Promise<boolean> => {
      const value = (text ?? arabicText ?? "").trim();
      if (!value) return false;

      if (alive.current) {
        setError(null);
        setIsLoading(true);
        setIsPlaying(false);
      }

      settleRef.current?.();
      settleRef.current = null;
      releaseAudio(audioRef.current);
      const audio = new Audio(`/api/tts?text=${encodeURIComponent(value)}`);
      audioRef.current = audio;

      try {
        await audio.play();
        if (!alive.current) return false;
        setIsLoading(false);
        setIsPlaying(true);
        await new Promise<void>((resolve, reject) => {
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            if (settleRef.current === finish) settleRef.current = null;
            resolve();
          };
          const fail = () => {
            if (settled) return;
            settled = true;
            if (settleRef.current === finish) settleRef.current = null;
            reject(new Error("Playback failed. Check the audio keys or the network."));
          };
          settleRef.current = finish;
          audio.onended = finish;
          audio.onerror = fail;
        });
        return true;
      } catch (err) {
        if (alive.current) {
          setError(err instanceof Error ? err.message : "Could not play audio");
        }
        return false;
      } finally {
        if (alive.current) {
          setIsLoading(false);
          setIsPlaying(false);
        }
        if (audioRef.current === audio) {
          releaseAudio(audio);
          audioRef.current = null;
        }
      }
    },
    [arabicText],
  );

  const stop = useCallback(() => {
    releaseAudio(audioRef.current);
    audioRef.current = null;
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  return { play, stop, isLoading, isPlaying, error };
}
