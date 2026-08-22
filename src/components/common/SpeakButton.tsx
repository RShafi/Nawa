"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakArabic } from "@/lib/speech";
import { cn } from "@/lib/utils";

type SpeakButtonProps = {
  text: string;
  latinFallback?: string;
  label?: string;
  lang?: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  onSpoke?: (mode: "api" | "latin") => void;
};

export function SpeakButton({
  text,
  latinFallback,
  label = "Listen",
  lang = "ar",
  className,
  size = "sm",
  onSpoke,
}: SpeakButtonProps) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        size={size}
        disabled={busy}
        className={cn(className)}
        onClick={async () => {
          setBusy(true);
          setNote(null);
          try {
            const result = await speakArabic(text, { lang, latinFallback });
            onSpoke?.(result.mode);
            if (result.mode === "latin") {
              setNote("Server audio unavailable — played transliteration instead.");
            }
          } catch {
            setNote("Couldn’t play audio. Try again in a moment.");
          } finally {
            setBusy(false);
          }
        }}
        title="Play pronunciation"
      >
        <Volume2 className="size-4" />
        {size === "icon" ? <span className="sr-only">{label}</span> : busy ? "Playing…" : label}
      </Button>
      {note ? <span className="text-muted-foreground max-w-[16rem] text-[10px] leading-snug">{note}</span> : null}
    </div>
  );
}
