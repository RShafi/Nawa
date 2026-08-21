"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
      <span className="text-muted-foreground hidden text-xs font-medium tracking-wide uppercase sm:inline">
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
      >
        {MODES.map((m) => (
          <ToggleGroupItem key={m.value} value={m.value} title={m.hint} className="px-2.5 text-xs">
            {m.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
