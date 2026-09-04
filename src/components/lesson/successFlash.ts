/** Golden completion pulse — shared across interactive lesson steps. */
export const SUCCESS_FLASH_ANIMATE = {
  backgroundColor: [
    "rgba(0,0,0,0)",
    "rgba(245,158,11,0.22)",
    "rgba(0,0,0,0)",
  ],
} as const;

export const SUCCESS_FLASH_TRANSITION = {
  duration: 0.65,
  ease: "easeOut" as const,
};

export function runSuccessFlash(
  setFlashing: (value: boolean) => void,
  onDone: () => void,
  delayMs = 520,
): void {
  setFlashing(true);
  window.setTimeout(() => {
    onDone();
    window.setTimeout(() => setFlashing(false), 120);
  }, delayMs);
}
