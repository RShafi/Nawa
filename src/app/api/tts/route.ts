/**
 * Strict ElevenLabs Arabic TTS — GET /api/tts?text=...
 * Cache key: hash(voiceId + "_" + text)
 */

import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_CHARS = 200;
const CACHE_DIR = path.join(process.cwd(), "public", "tts");

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function hashVoiceText(voiceId: string, text: string): string {
  return createHash("sha256").update(`${voiceId}_${text}`).digest("hex");
}

async function ensureCacheDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

function cachePath(hash: string) {
  return path.join(CACHE_DIR, `${hash}.mp3`);
}

export async function GET(req: NextRequest) {
  const text = (req.nextUrl.searchParams.get("text") ?? "").trim();
  if (!text) return badRequest("Missing text");
  if (text.length > MAX_CHARS) return badRequest(`Text too long (max ${MAX_CHARS} chars)`);

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();

  if (!apiKey || !voiceId) {
    console.error("[TTS] Missing ElevenLabs env keys");
    return NextResponse.json(
      {
        error: "ElevenLabs is not configured",
        detail: "Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in .env.local, then restart.",
      },
      { status: 503 },
    );
  }

  const hash = hashVoiceText(voiceId, text);
  const file = cachePath(hash);

  try {
    await ensureCacheDir();
    const cached = await fs.readFile(file);
    console.log("[TTS] Cache hit", hash.slice(0, 10));
    return audioResponse(cached, "hit", hash);
  } catch {
    /* miss */
  }

  console.log("[TTS] Requesting ElevenLabs audio for:", text, "with voiceId:", voiceId);

  try {
    const bytes = await synthesizeElevenLabs(text, apiKey, voiceId);
    await fs.writeFile(file, Buffer.from(bytes));
    return audioResponse(Buffer.from(bytes), "miss", hash);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[TTS] ElevenLabs failed:", message);
    return NextResponse.json({ error: "ElevenLabs TTS failed", detail: message }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  let body: { text?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return badRequest("Invalid JSON body");
  }
  const url = req.nextUrl.clone();
  url.searchParams.set("text", (body.text ?? "").trim());
  return GET(new NextRequest(url, { method: "GET" }));
}

function audioResponse(buf: Buffer, cacheStatus: "hit" | "miss", hash: string) {
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-TTS-Provider": "elevenlabs:eleven_multilingual_v2",
      "X-TTS-Cache": cacheStatus,
      "X-TTS-Hash": hash,
    },
  });
}

async function synthesizeElevenLabs(
  text: string,
  apiKey: string,
  voiceId: string,
): Promise<ArrayBuffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    if (res.status === 402) {
      throw new Error(
        "This voice requires a paid ElevenLabs plan. Use a premade voice from Voice Lab (not a shared library voice) in ELEVENLABS_VOICE_ID.",
      );
    }
    throw new Error(`ElevenLabs ${res.status}: ${detail.slice(0, 240)}`);
  }

  const bytes = await res.arrayBuffer();
  if (bytes.byteLength < 200) throw new Error("ElevenLabs empty audio");
  return bytes;
}
