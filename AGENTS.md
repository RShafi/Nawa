# Nawā

Arabic learning MVP (Next.js 15 App Router · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Zustand). See `README.md` for the product overview and standard commands.

## Cursor Cloud specific instructions

Single Next.js service. Standard commands live in `package.json` (`dev`, `build`, `start`, `lint`) and `README.md`; use those rather than duplicating them here.

- Dev server: `npm run dev` serves on `http://localhost:3000`. Routes: `/` (Learning Path + Sandbox), `/lesson/[id]`, and the TTS API at `/api/tts`.
- Lint: `npm run lint`. It prints a `next lint` deprecation notice — this is expected and does not indicate failure.
- No environment variables are required. There is no `.env.example` in the repo despite the README referencing one.
- TTS (`GET /api/tts?text=...&lang=ar`) selects a provider by env vars at request time: Azure (`AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION`), then OpenAI (`OPENAI_API_KEY`), else a **free Google Translate TTS fallback**. The fallback needs outbound network access to `translate.google.com`; if egress is blocked the endpoint returns HTTP 502. All keys are optional.
