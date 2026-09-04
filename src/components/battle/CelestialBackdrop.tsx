"use client";

import { cn } from "@/lib/utils";

/** Optional local accent vignette — base gradient + particles live in the root layout. */
export function CelestialBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_12%,rgba(245,158,11,0.14),transparent_52%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_8%,rgba(56,189,248,0.07),transparent_48%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-amber-950/25 to-transparent" />
    </div>
  );
}
