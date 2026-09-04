"use client";

/** Shared in-flight TTS fetches — avoids duplicate ElevenLabs calls. */
import { resolveSpokenText } from "@/utils/tts";
import { getTtsOverrideForArabic } from "@/content/ttsOverrides";
const inflight = new Map<string, Promise<Blob>>();

function ttsUrl(text: string): string {
  return `/api/tts?text=${encodeURIComponent(text)}`;
}

function parseTtsError(body: string, status: number): string {
  try {
    const json = JSON.parse(body) as { error?: string; detail?: string };
    const detail = json.detail?.trim();
    if (detail) {
      if (detail.includes("paid_plan_required") || detail.includes("payment_required")) {
        return "This ElevenLabs voice needs a paid plan. Pick a premade voice from Voice Lab and update ELEVENLABS_VOICE_ID.";
      }
      if (detail.includes("ElevenLabs 401") || detail.includes("invalid_api_key")) {
        return "Invalid ElevenLabs API key — check ELEVENLABS_API_KEY in .env.local.";
      }
      if (json.error === "ElevenLabs is not configured") {
        return "TTS not configured — set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID, then restart dev.";
      }
      const elevenMatch = detail.match(/ElevenLabs \d+: (.+)/);
      if (elevenMatch?.[1]) {
        try {
          const inner = JSON.parse(elevenMatch[1]) as { detail?: { message?: string } };
          if (inner.detail?.message) return inner.detail.message;
        } catch {
          return elevenMatch[1].slice(0, 180);
        }
      }
      return detail.slice(0, 200);
    }
    if (json.error) return json.error;
  } catch {
    /* plain text */
  }
  return `TTS request failed (${status})`;
}

/**
 * Fetch neural TTS audio. Throws with a user-facing message on API errors.
 */
export async function fetchTtsBlob(text: string): Promise<Blob> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Nothing to speak");

  const spoken = resolveSpokenText(trimmed, getTtsOverrideForArabic(trimmed));
  const url = ttsUrl(spoken);
  const existing = inflight.get(url);
  if (existing) return existing;

  const promise = (async () => {
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(parseTtsError(body, res.status));
    }
    const blob = await res.blob();
    if (blob.size < 200) throw new Error("TTS returned empty audio");
    return blob;
  })();

  inflight.set(url, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(url);
  }
}

/** Best-effort warm cache — deduped, capped batch size. */
const prefetched = new Set<string>();

export function prefetchTtsTexts(texts: string[], limit = 8): void {
  if (typeof window === "undefined") return;
  let n = 0;
  for (const raw of texts) {
    if (n >= limit) break;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const spoken = resolveSpokenText(trimmed, getTtsOverrideForArabic(trimmed));
    const url = ttsUrl(spoken);
    if (prefetched.has(url)) continue;
    prefetched.add(url);
    n += 1;
    void fetch(url).catch(() => {
      prefetched.delete(url);
    });
  }
}
