# Nawā

Arabic learning MVP (Next.js 15 App Router · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Zustand · Supabase auth). See `README.md` for the product overview and standard commands.

## Cursor Cloud specific instructions

Single Next.js service. Standard commands live in `package.json` (`dev`, `build`, `start`, `lint`) and `README.md`.

### Required env

Copy `.env.example` → `.env.local`. **`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required** — `src/middleware.ts` calls `createServerClient` on nearly every request, and missing values crash the app with a 500 (including `/` and `/login`). Auth-gated routes: `/path`, `/lesson/*`, `/arena`, `/bustan`, `/forge`, `/review`, `/passport`, `/passports`. Unauthenticated users are redirected to `/login`.

Schema SQL lives in `supabase/schema.sql` and `supabase/migrations/` — apply against the Supabase project (no local DB is started by the app).

### Run / lint / build

- Dev: `npm run dev` → `http://localhost:3000` (`/` redirects to `/path`).
- Lint: `npm run lint`. A `next lint` deprecation notice is expected. As of the Path/Arena merge, `prefer-const` in `src/store/useBattleStore.ts` fails lint and therefore also fails `npm run build` (Next runs ESLint during build).
- After large merges, if the running `next dev` process shows `ENOENT` for `.next/routes-manifest.json`, stop it and restart `npm run dev` (or delete `.next` first).

### TTS

`/api/tts` accepts GET query params or POST JSON `{ text, lang, voice }`. Provider order and optional keys are documented in `.env.example` / `README.md`. Without speech keys the server falls back to free Edge neural TTS (`edge-tts-universal`); client-side Web Speech is a further fallback. Outbound network is required for remote TTS providers.
