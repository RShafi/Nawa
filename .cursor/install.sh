#!/usr/bin/env bash
set -euo pipefail

# Idempotent repository bootstrap for the Nawā Cloud Agent environment.
# Runs from /workspace after the repo is checked out.

# Install exact dependencies from the lockfile.
npm ci

# The app cannot boot without the two public Supabase vars: src/middleware.ts
# calls createServerClient on nearly every request, so a missing
# NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY crashes every route
# (including / and /login) with a 500.
#
# If those values are provided as environment secrets they are already present
# in the process environment, and Next.js reads them directly (real values take
# precedence — @next/env never overrides an already-defined process.env var).
# Only when they are absent do we drop a placeholder .env.local so the dev
# server can still boot and serve the public/unauthenticated routes. Auth-gated
# routes (/path, /lesson/*, /arena, /bustan, /forge, /review, /passport,
# /passports) require a real Supabase project.
if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] && [ ! -f .env.local ]; then
  cat > .env.local <<'EOF'
# Auto-generated placeholder by .cursor/install.sh so the dev server can boot.
# Replace with a real Supabase project's values, or set them as environment
# secrets, to exercise auth-gated routes.
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLXBsYWNlaG9sZGVyIn0.placeholder-anon-key-not-valid
EOF
fi
