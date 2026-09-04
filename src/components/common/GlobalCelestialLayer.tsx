"use client";

import { AmbientParticles } from "@/components/battle/AmbientParticles";

/** Accent twilight layers + stardust — base gradient lives on `<body>`. */
export function GlobalCelestialLayer() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_12%,rgba(245,158,11,0.14),transparent_52%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-amber-950/25 to-transparent" />
      <AmbientParticles count={12} />
    </div>
  );
}
