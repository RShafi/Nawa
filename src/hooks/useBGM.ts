"use client";

import { useCallback, useEffect } from "react";
import { fadeOutBgm, setBgmMuted, startBgm, stopBgm } from "@/lib/bgmManager";
import { useSettingsStore } from "@/store/useSettingsStore";

/**
 * Looping BGM that respects global mute and cleans up on unmount / disable.
 * Uses a shared audio element — safe when arena modes switch.
 */
export function useBGM(url: string, enabled = true) {
  const isMuted = useSettingsStore((s) => s.isMuted);

  useEffect(() => {
    if (!enabled) {
      stopBgm();
      return;
    }
    startBgm(url, isMuted);
    return () => stopBgm();
  }, [url, enabled]);

  useEffect(() => {
    if (!enabled) return;
    setBgmMuted(isMuted);
  }, [isMuted, enabled]);

  const fadeOut = useCallback(() => {
    fadeOutBgm();
  }, []);

  return { fadeOut };
}
