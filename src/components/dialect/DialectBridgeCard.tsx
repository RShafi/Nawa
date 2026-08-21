"use client";

import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { DIALECT_VARIANTS, getDialectVariantById, getDialectVariantsForRoot } from "@/data/mockRoots";
import { ArabicText } from "@/components/common/ArabicText";
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

export function DialectBridgeCard() {
  const selectedRootId = useNawaStore((s) => s.selectedRootId);
  const phraseId = useNawaStore((s) => s.selectedDialectPhraseId);
  const setDialectPhraseId = useNawaStore((s) => s.setDialectPhraseId);
  const selectedDialect = useNawaStore((s) => s.userProgress.selectedDialect);
  const setSelectedDialect = useNawaStore((s) => s.setSelectedDialect);
  const scrollTarget = useNawaStore((s) => s.scrollTarget);
  const highlightTick = useNawaStore((s) => s.highlightTick);

  const forRoot = getDialectVariantsForRoot(selectedRootId);
  const phrase =
    (phraseId ? getDialectVariantById(phraseId) : undefined) ??
    forRoot[0] ??
    DIALECT_VARIANTS[0];

  const highlight = scrollTarget === "dialect";
  const defaultTab: DialectRegister =
    selectedDialect === "egyptian" ? "egyptian" : selectedDialect === "levantine" ? "levantine" : "msa";

  return (
    <motion.div
      animate={highlight ? { boxShadow: ["0 0 0 0 transparent", "0 0 0 3px var(--ring)", "0 0 0 0 transparent"] } : {}}
      transition={{ duration: 1.2 }}
      key={`dialect-${highlightTick}`}
    >
      <Card>
        <CardHeader>
          <CardTitle>Dialect bridge</CardTitle>
          <CardDescription>Compare فصحى with Levantine and Egyptian for the same meaning.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {(forRoot.length ? forRoot : DIALECT_VARIANTS).map((p) => (
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

          <div className="flex flex-wrap gap-2">
            {phrase.usageTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm">
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
                  <span className="font-arabic text-xs opacity-70">{r.arabic}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {REGISTERS.map((r) => {
              const entry = phrase.variants[r.id];
              return (
                <TabsContent key={r.id} value={r.id} className="space-y-3 pt-3">
                  <ArabicText className="block text-3xl font-semibold sm:text-4xl">{entry.script}</ArabicText>
                  <p className="text-muted-foreground text-sm">{formatPhonetic(entry.transliteration, entry.ipa)}</p>
                  <Button variant="outline" size="sm" disabled title="Audio coming soon">
                    <Volume2 className="size-4" />
                    {entry.audioLabel}
                  </Button>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
