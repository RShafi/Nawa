"use client";

import { useState } from "react";
import { getDialectVariantById } from "@/data/mockRoots";
import { ArabicText } from "@/components/common/ArabicText";
import { SpeakButton } from "@/components/common/SpeakButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DialectRegister } from "@/types/arabic";

const REGISTERS: { id: DialectRegister; label: string }[] = [
  { id: "msa", label: "MSA" },
  { id: "levantine", label: "Levantine" },
  { id: "egyptian", label: "Egyptian" },
];

export function DialectBridgeCard({
  phraseId,
  focus = "msa",
}: {
  phraseId: string;
  focus?: DialectRegister;
}) {
  const phrase = getDialectVariantById(phraseId);
  const [heard, setHeard] = useState<Partial<Record<DialectRegister, boolean>>>({});
  if (!phrase) return null;

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-lg text-white">{phrase.meaning}</CardTitle>
        <p className="text-sm text-white/60">Hear the same idea in MSA, Levantine, and Egyptian.</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={focus}>
          <TabsList className="w-full">
            {REGISTERS.map((register) => (
              <TabsTrigger key={register.id} value={register.id} className="flex-1">
                {register.label}
                {heard[register.id] ? " · heard" : ""}
              </TabsTrigger>
            ))}
          </TabsList>
          {REGISTERS.map((register) => {
            const entry = phrase.variants[register.id];
            return (
              <TabsContent key={register.id} value={register.id} className="space-y-3 pt-4">
                <ArabicText size="lg" forceFull className="block text-amber-50">
                  {entry.script}
                </ArabicText>
                <p className="text-sm text-white/55">{entry.transliteration}</p>
                <SpeakButton
                  text={entry.script}
                  label={`Hear ${register.label}`}
                  onSpoke={() => setHeard((current) => ({ ...current, [register.id]: true }))}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
