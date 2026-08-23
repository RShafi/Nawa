"use client";

import { useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakArabic } from "@/lib/audio";
import { cn } from "@/lib/utils";

type SpeakButtonProps = {
  text: string;
  latinFallback?: string;
  label?: string;
  lang?: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  onSpoke?: (mode: "api" | "webspeech" | "silent") => void;
};

export function SpeakButton({
  text,
  label = "Listen",
  lang = "ar-SA",
  className,
  size = "sm",
  onSpoke,
}: SpeakButtonProps) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const locked = useRef(false);

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        size={size}
        disabled={busy}
        className={cn(className)}
        onClick={() => {
          if (locked.current) return;
          locked.current = true;
          setBusy(true);
          setNote(null);
          void (async () => {
            try {
              const result = await speakArabic(text, { lang });
              onSpoke?.(result.mode);
              if (result.mode === "silent") {
                setNote("Couldn’t play audio. Try again in a moment.");
              } else if (result.mode === "webspeech") {
                setNote("Playing with device Arabic voice.");
              }
            } catch {
              setNote("Couldn’t play audio. Try again in a moment.");
            } finally {
              setBusy(false);
              window.setTimeout(() => {
                locked.current = false;
              }, 220);
            }
          })();
        }}
        title="Play pronunciation"
      >
        <Volume2 className="size-4" />
        {size === "icon" ? <span className="sr-only">{label}</span> : busy ? "Playing…" : label}
      </Button>
      {note ? (
        <span className="text-muted-foreground max-w-[16rem] text-[10px] leading-snug">{note}</span>
      ) : null}
    </div>
  );
}
