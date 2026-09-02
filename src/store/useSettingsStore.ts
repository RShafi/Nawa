"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
};

/** App-wide audio preference (persisted). */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      isMuted: false,
      toggleMute: () => set({ isMuted: !get().isMuted }),
      setMuted: (muted) => set({ isMuted: muted }),
    }),
    { name: "nawa-settings-v1" },
  ),
);
