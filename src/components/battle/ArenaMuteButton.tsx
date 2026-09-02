"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

/** Glassmorphic mute toggle for the Arena HUD. */
export function ArenaMuteButton({ className }: { className?: string }) {
  const isMuted = useSettingsStore((s) => s.isMuted);
  const toggleMute = useSettingsStore((s) => s.toggleMute);

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={isMuted ? "Unmute battle music" : "Mute battle music"}
      aria-pressed={isMuted}
      className={cn(
        "glass-tablet absolute top-2 end-2 z-[90] flex size-9 items-center justify-center rounded-xl border border-white/15 bg-slate-900/70 text-amber-100 shadow-lg backdrop-blur-md transition hover:border-amber-400/40 hover:bg-slate-900/90",
        className,
      )}
    >
      {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
    </button>
  );
}
