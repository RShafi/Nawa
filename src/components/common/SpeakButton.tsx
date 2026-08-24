"use client";

import { Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNeuralAudio } from "@/hooks/useNeuralAudio";
import { cn } from "@/lib/utils";

type SpeakButtonProps = {
  text: string;
  latinFallback?: string;
  label?: string;
  lang?: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  onSpoke?: (mode: "api" | "silent") => void;
};

/** Pronunciation button — ElevenLabs `/api/tts` only. */
export function SpeakButton({
  text,
  label = "Listen",
  className,
  size = "sm",
  onSpoke,
}: SpeakButtonProps) {
  const { play, isLoading, isPlaying, error } = useNeuralAudio(text);

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        size={size}
        disabled={!text.trim() || isLoading}
        className={cn(className)}
        onClick={() => {
          void play(text).then(() => onSpoke?.("api"));
        }}
        title="Play pronunciation (ElevenLabs)"
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Volume2 className="size-4" />
        )}
        {size === "icon" ? (
          <span className="sr-only">{label}</span>
        ) : isLoading ? (
          "Preparing…"
        ) : isPlaying ? (
          "Playing…"
        ) : (
          label
        )}
      </Button>
      {error ? (
        <span className="text-muted-foreground max-w-[16rem] text-[10px] leading-snug text-rose-300">
          {error}
        </span>
      ) : null}
    </div>
  );
}
