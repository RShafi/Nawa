"use client";

import { useEffect, useState } from "react";
import { DIALECT_VARIANTS, getDialectVariantById, getDialectVariantsForRoot } from "@/data/mockRoots";
import { ArabicText } from "@/components/common/ArabicText";
import { SpeakButton } from "@/components/common/SpeakButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPhonetic } from "@/lib/arabic-utils";
import { cn } from "@/lib/utils";
import { useNawaStore } from "@/store/nawa-store";
import type { DialectRegister } from "@/types/arabic";

const REGISTERS: { id: DialectRegister; label: string; arabic: string }[] = [
  { id: "msa", label: "MSA", arabic: "فصحى" },
  { id: "levantine", label: "Levantine", arabic: "شامي" },
  { id: "egyptian", label: "Egyptian", arabic: "مصري" },
];

export function DialectBridgeCard({
  lockedPhraseId,
  onComplete,
}: {
  lockedPhraseId?: string;
  onComplete?: () => void;
}) {
  const selectedRootId = useNawaStore((s) => s.selectedRootId);
  const storePhraseId = useNawaStore((s) => s.selectedDialectPhraseId);
  const setDialectPhraseId = useNawaStore((s) => s.setDialectPhraseId);
  const selectedDialect = useNawaStore((s) => s.selectedDialect);
  const setSelectedDialect = useNawaStore((s) => s.setSelectedDialect);
  const [heard, setHeard] = useState<Partial<Record<DialectRegister, boolean>>>({});

  useEffect(() => {
    if (lockedPhraseId) setDialectPhraseId(lockedPhraseId);
  }, [lockedPhraseId, setDialectPhraseId]);

  const phraseId = lockedPhraseId ?? storePhraseId;
  const forRoot = getDialectVariantsForRoot(selectedRootId);
  const phrase =
    (phraseId ? getDialectVariantById(phraseId) : undefined) ??
    forRoot[0] ??
    DIALECT_VARIANTS[0];

  const chooserList = lockedPhraseId
    ? [phrase]
    : forRoot.length
      ? forRoot
      : DIALECT_VARIANTS;

  const defaultTab: DialectRegister =
    selectedDialect === "egyptian"
      ? "egyptian"
      : selectedDialect === "levantine"
        ? "levantine"
        : "msa";

  const allHeard = REGISTERS.every((r) => heard[r.id]);

  useEffect(() => {
    if (allHeard) onComplete?.();
  }, [allHeard, onComplete]);

  // Reset hear tracking when the focus phrase changes
  useEffect(() => {
    setHeard({});
  }, [phrase.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dialect bridge</CardTitle>
        <CardDescription className="text-base leading-relaxed sm:text-lg">
          {lockedPhraseId
            ? `Focus: ${phrase.meaning}. Hear MSA, Levantine, and Egyptian — same idea, three “accents.”`
            : "Same meaning, three registers. Think news desk (MSA) vs café chat (dialect)."}
        </CardDescription>
        <p className="text-muted-foreground text-sm sm:text-base">
          Heard {REGISTERS.filter((r) => heard[r.id]).length}/3 registers
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {!lockedPhraseId ? (
          <div className="flex flex-wrap gap-2">
            {chooserList.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDialectPhraseId(p.id)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-colors",
                  phrase.id === p.id ? "border-primary bg-primary/10" : "hover:bg-muted/60",
                )}
              >
                {p.meaning}
              </button>
            ))}
          </div>
        ) : (
          <Badge variant="outline">{phrase.meaning}</Badge>
        )}

        <div className="flex flex-wrap gap-2">
          {phrase.usageTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Preferred dialect track:</span>
          <Button
            size="sm"
            variant={selectedDialect === "levantine" ? "default" : "outline"}
            onClick={() => setSelectedDialect("levantine")}
          >
            Levantine
          </Button>
          <Button
            size="sm"
            variant={selectedDialect === "egyptian" ? "default" : "outline"}
            onClick={() => setSelectedDialect("egyptian")}
          >
            Egyptian
          </Button>
        </div>

        <Tabs defaultValue={defaultTab} key={`${phrase.id}-${defaultTab}`}>
          <TabsList className="w-full sm:w-auto">
            {REGISTERS.map((r) => (
              <TabsTrigger key={r.id} value={r.id} className="flex-1 gap-1 sm:flex-none">
                <span>{r.label}</span>
                <ArabicText className="text-xs opacity-70">{r.arabic}</ArabicText>
                {heard[r.id] ? <span className="text-[10px]">✓</span> : null}
              </TabsTrigger>
            ))}
          </TabsList>
          {REGISTERS.map((r) => {
            const entry = phrase.variants[r.id];
            return (
              <TabsContent key={r.id} value={r.id} className="space-y-3 pt-3">
                <ArabicText className="block text-4xl font-semibold sm:text-5xl">
                  {entry.script}
                </ArabicText>
                <p className="text-muted-foreground text-base sm:text-lg">
                  {formatPhonetic(entry.transliteration, entry.ipa)}
                </p>
                <SpeakButton
                  text={entry.script}
                  latinFallback={entry.transliteration}
                  label={entry.audioLabel}
                  onSpoke={() => setHeard((h) => ({ ...h, [r.id]: true }))}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
