/** Shared Celestial Loom layout + motion presets — full-bleed PC HUD. */

export const CELESTIAL_DESERT_BG = "bg-transparent";

/** PC HUD — fixed viewport, no scroll, 4/8 column split at lg. */
export const LOOM_HUD_GRID =
  "grid h-[100dvh] w-full grid-cols-1 overflow-hidden bg-transparent lg:grid-cols-12";

export const LOOM_HUD_NARRATIVE =
  "col-span-12 flex h-full min-h-0 flex-col border-amber-500/10 p-6 lg:col-span-4 lg:border-r lg:p-10 xl:p-12";

export const LOOM_HUD_STAGING =
  "relative col-span-12 flex h-full min-h-0 items-center justify-center overflow-hidden p-6 lg:col-span-8 lg:p-10 xl:p-12";

/** Centered interactive arena inside the right HUD panel. */
export const LOOM_STAGE_ARENA =
  "flex h-full w-full flex-col items-center justify-center gap-12";

export const LOOM_SHELL =
  "flex w-full flex-1 flex-col gap-12 bg-transparent lg:flex-row lg:gap-16";

export const LOOM_CINEMATIC_INNER = "flex w-full flex-1 flex-col gap-12 lg:flex-row lg:gap-16";

export const LOOM_NARRATIVE =
  "relative z-10 flex flex-col justify-center gap-5 lg:w-[38%] lg:max-w-lg lg:shrink-0";

export const LOOM_STAGE =
  "relative z-10 flex min-h-[24rem] flex-1 flex-col items-center justify-center gap-6";

export const LOOM_DEEP_SPACE = "pointer-events-none absolute inset-0";

export const RUNE_STONE =
  "font-arabic flex size-14 items-center justify-center rounded-xl border border-amber-500/50 bg-slate-800/80 text-3xl text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.3)] md:size-16 md:text-4xl";

export const entrance = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
};

/** @deprecated Use LOOM_HUD_GRID in CelestialLoomPlayer. */
export const LOOM_PLAYER_FRAME = LOOM_HUD_GRID;
