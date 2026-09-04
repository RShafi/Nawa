"use client";

/**
 * Back-compat re-exports — prefer `@/lib/audio` or `useAudio` for new code.
 */
export {
  canSpeak,
  getIsAudioPlaying,
  prefetchArabic,
  speakArabic,
  stopArabicAudio,
  type SpeakOptions,
  type SpeakResult,
} from "@/lib/audio";
