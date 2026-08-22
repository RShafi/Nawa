import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const cache = new Map<string, { bytes: ArrayBuffer; contentType: string; at: number; provider: string }>();
const CACHE_TTL_MS = 1000 * 60 * 60;
const MAX_CHARS = 120;

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Provider order (best → free):
 * 1. Azure Neural TTS — best Arabic phoneme distinction (AZURE_SPEECH_KEY + AZURE_SPEECH_REGION)
 * 2. OpenAI tts-1-hd — good multilingual (OPENAI_API_KEY)
 * 3. Google Translate TTS — free fallback
 */
export async function GET(req: NextRequest) {
  const text = (req.nextUrl.searchParams.get("text") ?? "").trim();
  const lang = (req.nextUrl.searchParams.get("lang") ?? "ar").trim() || "ar";

  if (!text) return badRequest("Missing text");
  if (text.length > MAX_CHARS) return badRequest(`Text too long (max ${MAX_CHARS} chars)`);

  const cacheKey = `${lang}:${text}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return new NextResponse(hit.bytes, {
      headers: {
        "Content-Type": hit.contentType,
        "Cache-Control": "public, max-age=3600",
        "X-TTS-Cache": "hit",
        "X-TTS-Provider": hit.provider,
      },
    });
  }

  try {
    let audio: { bytes: ArrayBuffer; contentType: string; provider: string };

    if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) {
      audio = await synthesizeAzure(text, lang);
    } else if (process.env.OPENAI_API_KEY) {
      audio = await synthesizeOpenAI(text);
    } else {
      audio = await synthesizeGoogleTranslate(text, lang);
    }

    cache.set(cacheKey, { ...audio, at: Date.now() });

    return new NextResponse(audio.bytes, {
      headers: {
        "Content-Type": audio.contentType,
        "Cache-Control": "public, max-age=3600",
        "X-TTS-Provider": audio.provider,
        "X-TTS-Cache": "miss",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TTS failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

async function synthesizeAzure(
  text: string,
  lang: string,
): Promise<{ bytes: ArrayBuffer; contentType: string; provider: string }> {
  const key = process.env.AZURE_SPEECH_KEY!;
  const region = process.env.AZURE_SPEECH_REGION!;
  // Neural voices with strong MSA phoneme contrast
  const voice =
    lang.toLowerCase().includes("eg") || lang.toLowerCase().includes("egyptian")
      ? "ar-EG-SalmaNeural"
      : "ar-SA-ZariyahNeural";
  const locale = voice.startsWith("ar-EG") ? "ar-EG" : "ar-SA";

  const ssml = `<speak version='1.0' xml:lang='${locale}'>
  <voice xml:lang='${locale}' name='${voice}'>
    <prosody rate='-10%'>${escapeXml(text)}</prosody>
  </voice>
</speak>`;

  const res = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "NawaArabicMVP",
      },
      body: ssml,
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Azure TTS ${res.status}: ${detail.slice(0, 200)}`);
  }

  return {
    bytes: await res.arrayBuffer(),
    contentType: "audio/mpeg",
    provider: "azure-neural",
  };
}

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
      model: "tts-1-hd",
      voice: "nova",
      input: text,
      response_format: "mp3",
      speed: 0.85,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`OpenAI TTS error ${res.status}: ${detail.slice(0, 200)}`);
  }

  return {
    bytes: await res.arrayBuffer(),
    contentType: "audio/mpeg",
    provider: "openai-hd",
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
