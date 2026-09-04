"use client";

import { Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNeuralAudio } from "@/hooks/useNeuralAudio";
import { cn } from "@/lib/utils";

export function HearButton({
  text,
  label = "Hear it",
  size = "default",
  className,
  variant = "outline",
}: {
  text: string;
  label?: string;
  size?: "default" | "lg" | "sm";
  className?: string;
  variant?: "outline" | "default" | "secondary";
}) {
  const { play, isLoading, isPlaying, error } = useNeuralAudio(text);

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        type="button"
        size={size}
        variant={variant}
        disabled={!text.trim() || isLoading}
        className={cn(
          "gap-2 border-amber-500/20 bg-slate-900/90 text-amber-100",
          isPlaying && "ring-2 ring-amber-400/50",
          className,
        )}
        onClick={() => void play(text)}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin text-amber-400" />
        ) : (
          <Volume2 className={cn("size-4", isPlaying && "animate-pulse text-amber-400")} />
        )}
        {isLoading ? "Preparing audio…" : isPlaying ? "Playing…" : label}
      </Button>
      {error ? <p className="max-w-xs text-center text-[11px] text-rose-300/90">{error}</p> : null}
    </div>
  );
}
