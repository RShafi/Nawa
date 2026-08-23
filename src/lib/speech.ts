"use client";

/**
 * Back-compat re-exports — prefer `@/lib/audio` or `useAudio` for new code.
 */
export {
  canSpeak,
  prefetchArabic,
  speakArabic,
  type SpeakOptions,
  type SpeakResult,
} from "@/lib/audio";
