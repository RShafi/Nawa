# Nawā (نَوَاة)

Arabic learning MVP built around root-and-pattern morphology, dynamic tashkeel, and MSA–dialect bridging.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · shadcn/ui · Framer Motion · Zustand

## Getting started

Requires [Node.js 20+](https://nodejs.org/).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Audio (TTS)

`GET /api/tts?text=كَتَبَ&lang=ar` returns MP3.

Provider priority:
1. **Azure Neural** (`AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION`) — best Arabic letter distinction (Zariyah / Salma voices)
2. **OpenAI `tts-1-hd`** (`OPENAI_API_KEY`) — strong multilingual
3. **Google Translate TTS** — free fallback (weaker on similar consonants)

Copy `.env.example` → `.env.local` and add a key for higher quality.
