"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { TUTORIAL_STORAGE_KEY } from "@/store/useBattleStore";
import { cn } from "@/lib/utils";

export type TutorialSpotlightTarget = "hand" | "syntax" | "cast" | null;

export type RailStep = 0 | 1 | 2 | 3 | 4 | 5;

/** Compact tutorial strip — wraps to two lines when needed (no ellipsis). */
export function GuideBanner({
  step,
  totalSteps = 5,
  title,
  body,
  onNext,
  nextLabel = "Next",
  className,
}: {
  step?: number;
  totalSteps?: number;
  title: string;
  body: string;
  onNext?: () => void;
  nextLabel?: string;
  className?: string;
}) {
  const line = body?.trim() ? body : title;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex h-auto w-full max-w-2xl flex-row items-center justify-between gap-3 rounded-xl border border-amber-500/50 bg-slate-900/90 py-3 px-3 md:gap-4 md:px-4",
        className,
      )}
      title={title}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2 md:gap-3">
        {step != null ? (
          <span className="mt-0.5 shrink-0 rounded-md bg-amber-500/15 px-2 py-0.5 text-[clamp(0.55rem,1.2vh,0.65rem)] font-bold tracking-wide text-amber-300/80 uppercase">
            {step}/{totalSteps}
          </span>
        ) : null}
        <p className="min-w-0 flex-1 whitespace-normal break-words text-[clamp(0.8rem,1.8vh,1rem)] leading-snug text-amber-50">
          {line}
        </p>
      </div>
      {onNext ? (
        <button
          type="button"
          onClick={onNext}
          className="bg-celestial-amber inline-flex h-8 shrink-0 items-center justify-center rounded-lg px-3 text-xs font-semibold text-obsidian hover:bg-amber-400"
        >
          {nextLabel}
        </button>
      ) : null}
    </motion.div>
  );
}

/** Fixed dimmer — pointer-events none so HUD stays clickable; targets use SpotlightElevate. */
export function TutorialBlackout({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 bg-black/50"
      aria-hidden
    />
  );
}

/**
 * Elevate a tutorial target above the z-50 blackout.
 * Use when spotlighting syntax / hand / cast / redraw.
 */
export function SpotlightElevate({
  active,
  children,
  className,
}: {
  active: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative",
        active &&
          "z-[60] rounded-2xl bg-slate-900 p-1 ring-4 ring-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.55)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Pulse ring applied directly to the active target (no overlay mask). */
export function targetPulse(active: boolean) {
  return active
    ? "relative z-[60] ring-4 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse"
    : "";
}

export function TargetArrow({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <motion.div
      className="pointer-events-none absolute -top-8 inset-x-0 z-30 flex justify-center"
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <ChevronDown className="size-8 text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]" />
    </motion.div>
  );
}

export function resetArenaTutorialProgress() {
  try {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    localStorage.removeItem("nawa-ward-tutorial-v2");
    localStorage.removeItem("nawa-ward-tutorial-v1");
  } catch {
    /* ignore */
  }
}

export function useShouldAutoStartTutorial() {
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    try {
      setAuto(localStorage.getItem(TUTORIAL_STORAGE_KEY) !== "1");
    } catch {
      setAuto(true);
    }
  }, []);
  return auto;
}

export function markArenaTutorialDone() {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function TutorialOverlay() {
  return null;
}

export function HowToPlayButton({ className }: { className?: string }) {
  void className;
  return null;
}

/** @deprecated Prefer TutorialBlackout */
export function TutorialBackdrop({ active }: { active: boolean }) {
  return <TutorialBlackout active={active} />;
}

export function CompanionGuide({
  step,
  target,
}: {
  step: number;
  target: TutorialSpotlightTarget;
}) {
  void step;
  void target;
  return null;
}

export function GlowShell({
  elevated,
  children,
  className,
}: {
  elevated?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", targetPulse(Boolean(elevated)), className)}>{children}</div>
  );
}

export function spotlightPop(active: boolean) {
  return targetPulse(active);
}

export function spotlightRing(active: boolean) {
  return targetPulse(active);
}

export function TutorialSpotlight(_props: {
  step: number | string;
  target: TutorialSpotlightTarget;
}) {
  return null;
}

export type InSituStep = RailStep | "done";
