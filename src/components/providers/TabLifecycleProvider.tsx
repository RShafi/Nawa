"use client";

import { useEffect } from "react";
import { ensureTabVisibilityAudioCleanup } from "@/utils/tts";
import { suspendAllTabMedia } from "@/lib/tabLifecycle";

/** Window-wide visibility listener — suspends audio/animation drivers when the tab is hidden. */
export function TabLifecycleProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    return ensureTabVisibilityAudioCleanup(suspendAllTabMedia);
  }, []);

  return children;
}
