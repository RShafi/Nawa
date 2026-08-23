"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useNawaStore } from "@/store/nawa-store";
import type { TashkeelMode } from "@/types/arabic";

const MODES: { value: TashkeelMode; label: string; hint: string }[] = [
  { value: "full", label: "Full", hint: "All harakat" },
  { value: "minimal", label: "Minimal", hint: "Shadda only" },
  { value: "none", label: "None", hint: "Bare script" },
];

export function TashkeelToggle() {
  const mode = useNawaStore((s) => s.tashkeelMode);
  const setTashkeelMode = useNawaStore((s) => s.setTashkeelMode);

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-[10px] font-medium tracking-wide text-white/45 uppercase sm:inline">
        Tashkeel
      </span>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={mode}
        onValueChange={(v) => {
          if (v) setTashkeelMode(v as TashkeelMode);
        }}
        aria-label="Diacritic mode"
        className="rounded-lg border border-white/15 bg-black/30 shadow-none"
      >
        {MODES.map((m) => (
          <ToggleGroupItem
            key={m.value}
            value={m.value}
            title={m.hint}
            className={cn(
              "border-white/10 px-2.5 text-xs text-white/55 hover:bg-white/10 hover:text-white",
              "data-[state=on]:bg-amber-500/25 data-[state=on]:text-amber-100 data-[state=on]:shadow-none",
            )}
          >
            {m.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
