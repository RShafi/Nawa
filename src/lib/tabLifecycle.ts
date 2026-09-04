"use client";

import { stopArabicAudio } from "@/lib/audio";
import { fadeOutBgm, pauseBgmOnHide } from "@/lib/bgmManager";
import { suspendSharedAudioContext } from "@/hooks/useSoundEffects";

/** Pause/stop all tab media when the document is hidden — safe to call repeatedly. */
export function suspendAllTabMedia(): void {
  stopArabicAudio();
  suspendSharedAudioContext();
  pauseBgmOnHide();
  fadeOutBgm();
}
