import { Communicate } from "edge-tts-universal";
import { NextRequest, NextResponse } from "next/server";
import { ipaForPrepared, prepareArabicForTts } from "@/lib/arabic-tts";

export const runtime = "nodejs";

const cache = new Map<string, { bytes: ArrayBuffer; contentType: string; at: number; provider: string }>();
const CACHE_TTL_MS = 1000 * 60 * 60;
const MAX_CHARS = 120;

const EDGE_VOICES = {
  msa: "ar-SA-ZariyahNeural",
  msaMale: "ar-SA-HamedNeural",
  egyptian: "ar-EG-SalmaNeural",
  levantine: "ar-SY-AmanyNeural",
} as const;

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

type TtsRequest = { text: string; lang: string; voiceHint: string };

function parseRequest(
  req: NextRequest,
  body?: { text?: string; lang?: string; voice?: string },
): TtsRequest | NextResponse {
  const textRaw = (body?.text ?? req.nextUrl.searchParams.get("text") ?? "").trim();
  const lang = (body?.lang ?? req.nextUrl.searchParams.get("lang") ?? "ar").trim() || "ar";
  const voiceHint = (body?.voice ?? req.nextUrl.searchParams.get("voice") ?? "").trim().toLowerCase();

  if (!textRaw) return badRequest("Missing text");
  if (textRaw.length > MAX_CHARS) return badRequest(`Text too long (max ${MAX_CHARS} chars)`);

  return { text: prepareArabicForTts(textRaw), lang, voiceHint };
}

/**
 * Provider order (most reliable Arabic first):
 * 1. Azure Speech neural (+ IPA phonemes for short drills)
 * 2. Google Cloud Text-to-Speech WaveNet
 * 3. OpenAI gpt-4o-mini-tts with Arabic instructions
 * 4. Edge neural (free) — can truncate on short clips
 * 5. Google Translate TTS — last resort
 */
export async function GET(req: NextRequest) {
  return handleTts(req);
}

export async function POST(req: NextRequest) {
  let body: { text?: string; lang?: string; voice?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return badRequest("Invalid JSON body");
  }
  return handleTts(req, body);
}

async function handleTts(
  req: NextRequest,
  body?: { text?: string; lang?: string; voice?: string },
) {
  const parsed = parseRequest(req, body);
  if (parsed instanceof NextResponse) return parsed;

  const { text, lang, voiceHint } = parsed;
  const edgeVoice = pickEdgeVoice(lang, voiceHint);
  const cacheKey = `${lang}:${edgeVoice}:${text}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return audioResponse(hit.bytes, hit.contentType, hit.provider, edgeVoice, text, "hit");
  }

  const errors: string[] = [];

  const attempts: Array<() => Promise<{ bytes: ArrayBuffer; contentType: string; provider: string }>> =
    [];

  if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) {
    attempts.push(() => synthesizeAzure(text, edgeVoice));
  }
  if (process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_CLOUD_API_KEY) {
    attempts.push(() => synthesizeGoogleCloud(text));
  }
  if (process.env.OPENAI_API_KEY) {
    attempts.push(() => synthesizeOpenAI(text));
  }
  attempts.push(() => synthesizeEdgeNeural(text, edgeVoice));
  attempts.push(() => synthesizeGoogleTranslate(text, lang));

  let audio: { bytes: ArrayBuffer; contentType: string; provider: string } | null = null;

  for (const attempt of attempts) {
    try {
      audio = await attempt();
      break;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  if (!audio) {
    return NextResponse.json(
      { error: "All TTS providers failed", detail: errors.slice(0, 3) },
      { status: 502 },
    );
  }

  cache.set(cacheKey, { ...audio, at: Date.now() });
  return audioResponse(audio.bytes, audio.contentType, audio.provider, edgeVoice, text, "miss");
}

function audioResponse(
  bytes: ArrayBuffer,
  contentType: string,
  provider: string,
  voice: string,
  text: string,
  cache: string,
) {
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
      "X-TTS-Provider": provider,
      "X-TTS-Voice": voice,
      "X-TTS-Text": encodeURIComponent(text),
      "X-TTS-Cache": cache,
    },
  });
}

function pickEdgeVoice(lang: string, hint: string): string {
  const key = `${lang} ${hint}`.toLowerCase();
  if (key.includes("eg") || key.includes("egypt") || key.includes("cairo")) {
    return EDGE_VOICES.egyptian;
  }
  if (
    key.includes("lev") ||
    key.includes("sy") ||
    key.includes("damasc") ||
    key.includes("leb") ||
    key.includes("beirut") ||
    key.includes("jordan") ||
    key.includes("amman")
  ) {
    return EDGE_VOICES.levantine;
  }
  if (hint === "male" || hint === "hamed") return EDGE_VOICES.msaMale;
  return EDGE_VOICES.msa;
}

/** Azure Neural — best emphatic (ص/ط) support; IPA for short drills. */
async function synthesizeAzure(
  text: string,
  voiceName: string,
): Promise<{ bytes: ArrayBuffer; contentType: string; provider: string }> {
  const key = process.env.AZURE_SPEECH_KEY!;
  const region = process.env.AZURE_SPEECH_REGION!;
  const locale = voiceName.split("-").slice(0, 2).join("-");
  const ipa = ipaForPrepared(text);

  const inner = ipa
    ? `<phoneme alphabet="ipa" ph="${escapeXml(ipa)}">${escapeXml(text)}</phoneme>`
    : escapeXml(text);

  // Trailing break prevents end clipping on short syllables
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}">
  <voice name="${voiceName}">
    <prosody rate="-8%">${inner}<break time="120ms"/></prosody>
  </voice>
</speak>`;

  const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
      "User-Agent": "NawaArabicMVP",
    },
    body: ssml,
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Azure TTS ${res.status}: ${detail.slice(0, 200)}`);
  }

  const bytes = await res.arrayBuffer();
  if (bytes.byteLength < 200) throw new Error("Azure TTS empty audio");

  return {
    bytes,
    contentType: "audio/mpeg",
    provider: ipa ? `azure-ipa:${voiceName}` : `azure-neural:${voiceName}`,
  };
}

/** Google Cloud Text-to-Speech WaveNet (ar-XA). */
async function synthesizeGoogleCloud(
  text: string,
): Promise<{ bytes: ArrayBuffer; contentType: string; provider: string }> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_TTS_API_KEY");

  const ipa = ipaForPrepared(text);
  const input = ipa
    ? {
        ssml: `<speak><phoneme alphabet="ipa" ph="${escapeXml(ipa)}">${escapeXml(text)}</phoneme><break time="120ms"/></speak>`,
      }
    : { text };

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input,
        voice: {
          languageCode: "ar-XA",
          name: process.env.GOOGLE_TTS_VOICE || "ar-XA-Wavenet-B",
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 0.9,
          pitch: 0,
        },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Google Cloud TTS ${res.status}: ${detail.slice(0, 200)}`);
  }

  const json = (await res.json()) as { audioContent?: string };
  if (!json.audioContent) throw new Error("Google Cloud TTS missing audioContent");

  const bytes = Buffer.from(json.audioContent, "base64");
  return {
    bytes: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    contentType: "audio/mpeg",
    provider: "google-wavenet:ar-XA-Wavenet-B",
  };
}

/** OpenAI gpt-4o-mini-tts — better than tts-1 for Arabic with instructions. */
async function synthesizeOpenAI(
  text: string,
): Promise<{ bytes: ArrayBuffer; contentType: string; provider: string }> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: "coral",
      input: text,
      instructions:
        "Speak Modern Standard Arabic only. Pronounce exactly the given Arabic text as a clear syllable or word. Emphatic consonants ص ط ض ظ must sound distinctly heavier/darker than س ت د ذ. Do not say English letter names. Do not add extra words. End cleanly with no cutoff.",
      response_format: "mp3",
      speed: 0.9,
    }),
  });

  if (!res.ok) {
    // Older accounts may lack gpt-4o-mini-tts — try hd once
    const fallback = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        voice: "nova",
        input: text,
        response_format: "mp3",
        speed: 0.9,
      }),
    });
    if (!fallback.ok) {
      const detail = await res.text();
      throw new Error(`OpenAI TTS ${res.status}: ${detail.slice(0, 200)}`);
    }
    return {
      bytes: await fallback.arrayBuffer(),
      contentType: "audio/mpeg",
      provider: "openai-hd",
    };
  }

  return {
    bytes: await res.arrayBuffer(),
    contentType: "audio/mpeg",
    provider: "openai-gpt4o-mini-tts",
  };
}

/** Free Edge neural — collect full stream to reduce truncation. */
async function synthesizeEdgeNeural(
  text: string,
  voiceName: string,
): Promise<{ bytes: ArrayBuffer; contentType: string; provider: string }> {
  const chunks: Buffer[] = [];
  const communicate = new Communicate(text, {
    voice: voiceName,
    rate: "-8%",
    pitch: "+0Hz",
    volume: "+0%",
  });

  for await (const chunk of communicate.stream()) {
    if (chunk.type === "audio" && chunk.data) {
      chunks.push(Buffer.from(chunk.data));
    }
  }

  const buf = Buffer.concat(chunks);
  if (buf.byteLength < 200) throw new Error("Edge TTS empty audio");

  return {
    bytes: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    contentType: "audio/mpeg",
    provider: `edge-neural:${voiceName}`,
  };
}

async function synthesizeGoogleTranslate(
  text: string,
  lang: string,
): Promise<{ bytes: ArrayBuffer; contentType: string; provider: string }> {
  const tl = lang.startsWith("ar") ? "ar" : lang;
  const url = new URL("https://translate.google.com/translate_tts");
  url.searchParams.set("ie", "UTF-8");
  url.searchParams.set("client", "tw-ob");
  url.searchParams.set("tl", tl);
  url.searchParams.set("q", text);

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "*/*",
      Referer: "https://translate.google.com/",
    },
  });

  if (!res.ok) throw new Error(`Google TTS error ${res.status}`);
  const bytes = await res.arrayBuffer();
  if (bytes.byteLength < 200) throw new Error("Google TTS returned empty audio");

  return { bytes, contentType: "audio/mpeg", provider: "gtts" };
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
