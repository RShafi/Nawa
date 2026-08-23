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

`POST /api/tts` with `{ text, lang }` returns MP3. Client prep lives in `src/lib/audio.ts` (+ `useAudio` hook):

- Isolated letters → phonetic CV (`ب` → `بَ` /ba/), never letter names
- Full tashkeel preserved; Azure IPA keeps final fatha audible
- Fallback: Web Speech `ar-SA` at rate `0.85`

Provider priority: Azure Neural → Google Cloud → OpenAI → Edge → gTTS.

Copy `.env.example` → `.env.local` and add a speech key for best quality.
