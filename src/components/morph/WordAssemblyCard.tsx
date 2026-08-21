"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getPatternById } from "@/data/mockPatterns";
import { DERIVED_WORDS, getRootById } from "@/data/mockRoots";
import { ArabicText } from "@/components/common/ArabicText";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPhonetic, getDerivedWord, slotRootIntoTemplate, stripDiacritics } from "@/lib/arabic-utils";
import { useNawaStore } from "@/store/nawa-store";

export function WordAssemblyCard() {
  const selectedRootId = useNawaStore((s) => s.selectedRootId);
  const selectedPatternId = useNawaStore((s) => s.selectedPatternId);
  const tashkeelMode = useNawaStore((s) => s.tashkeelMode);
  const highlightTick = useNawaStore((s) => s.highlightTick);
  const scrollTarget = useNawaStore((s) => s.scrollTarget);

  const root = getRootById(selectedRootId);
  const pattern = getPatternById(selectedPatternId);
  const word = getDerivedWord(selectedRootId, selectedPatternId, DERIVED_WORDS);

  if (!root || !pattern) return null;

  const slotted = slotRootIntoTemplate(root.consonants, pattern.templateArabic);
  const highlight = scrollTarget === "morph";

  return (
    <motion.div
      animate={highlight ? { boxShadow: ["0 0 0 0 transparent", "0 0 0 3px var(--ring)", "0 0 0 0 transparent"] } : {}}
      transition={{ duration: 1.2 }}
      key={highlightTick}
    >
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Assembly canvas</CardTitle>
          <CardDescription>
            Root consonants slot into ف–ع–ل placeholders for {pattern.templateName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/40 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6">
            <TemplateSlots
              template={pattern.templateArabic}
              consonants={root.consonants.map((c) => c.arabic)}
            />
          </div>

          <div className="text-muted-foreground text-center text-xs">
            Pattern merge preview:{" "}
            <span className="font-arabic text-foreground text-base" dir="rtl">
              {stripDiacritics(slotted, tashkeelMode)}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {word ? (
              <motion.div
                key={`${word.rootId}-${word.patternId}-${tashkeelMode}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3 text-center"
              >
                <ArabicText className="block text-4xl font-semibold sm:text-5xl">{word.arabic}</ArabicText>
                <p className="text-lg font-medium">{word.translation}</p>
                <p className="text-muted-foreground text-sm">{formatPhonetic(word.transliteration, word.ipa)}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge>{word.grammaticalCategory}</Badge>
                  {word.notes ? <Badge variant="outline">{word.notes}</Badge> : null}
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground py-6 text-center text-sm"
              >
                No derived sample for this root × pattern yet.
              </motion.p>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TemplateSlots({
  template,
  consonants,
}: {
  template: string;
  consonants: string[];
}) {
  const [f, a, l] = consonants;
  let fUsed = false;
  let aUsed = false;
  let lUsed = false;

  const parts: { key: string; label: string; isSlot: boolean; slotIndex?: number }[] = [];

  for (let i = 0; i < template.length; i++) {
    const ch = template[i];
    if (ch === "ف" && !fUsed) {
      parts.push({ key: `f-${i}`, label: f, isSlot: true, slotIndex: 0 });
      fUsed = true;
    } else if (ch === "ع" && !aUsed) {
      parts.push({ key: `a-${i}`, label: a, isSlot: true, slotIndex: 1 });
      aUsed = true;
    } else if (ch === "ل" && !lUsed) {
      parts.push({ key: `l-${i}`, label: l, isSlot: true, slotIndex: 2 });
      lUsed = true;
    } else {
      parts.push({ key: `ch-${i}`, label: ch, isSlot: false });
    }
  }

  return (
    <div className="font-arabic flex flex-wrap items-center justify-center gap-1 text-2xl sm:text-3xl" dir="rtl">
      {parts.map((part) =>
        part.isSlot ? (
          <motion.span
            key={part.key}
            layoutId={`root-letter-${part.slotIndex}`}
            className="bg-primary text-primary-foreground mx-0.5 inline-flex min-w-10 items-center justify-center rounded-lg px-2 py-1"
          >
            {part.label}
          </motion.span>
        ) : (
          <span key={part.key} className="text-muted-foreground px-0.5">
            {part.label}
          </span>
        ),
      )}
    </div>
  );
}
