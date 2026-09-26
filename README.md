# Nawā (نَوَاة)

Arabic learning MVP. A root is a plant. A visit grows one frame. The arena only casts words you have grown.

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

`GET /api/tts?text=...` returns MP3 from ElevenLabs (`eleven_multilingual_v2`). Set `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`. Missing keys return 503. Files cache under `public/tts/`.

Copy `.env.example` to `.env.local`. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required.
