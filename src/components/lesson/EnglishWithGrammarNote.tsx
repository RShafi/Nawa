import { curriculumData } from "@/content/curriculumData";
import { GrammarLoreTooltip } from "@/components/ui/grammar-lore-tooltip";
import type { VocabularyItem } from "@/types/curriculum";

function curriculumVocabCatalog(): VocabularyItem[] {
  const items: VocabularyItem[] = [];
  const seen = new Set<string>();

  for (const lesson of curriculumData) {
    for (const vocab of lesson.unlockableVocab) {
      if (seen.has(vocab.id)) continue;
      seen.add(vocab.id);
      items.push(vocab);
    }
    for (const step of lesson.steps) {
      for (const vocab of step.targetVocab ?? []) {
        if (seen.has(vocab.id)) continue;
        seen.add(vocab.id);
        items.push(vocab);
      }
    }
  }

  return items;
}

export function resolveGrammarNote(
  english: string,
  vocabList: readonly VocabularyItem[],
  arabicLabel?: string,
): string | undefined {
  const pool = [...vocabList, ...curriculumVocabCatalog()];

  if (arabicLabel != null) {
    const byArabic = pool.find((v) => v.arabic === arabicLabel);
    if (byArabic?.grammarNote) return byArabic.grammarNote;
  }

  const byEnglish = pool.find((v) => v.english === english);
  return byEnglish?.grammarNote;
}

export function EnglishWithGrammarNote({
  english,
  grammarNote,
  className,
}: {
  english: string;
  grammarNote?: string;
  className?: string;
}) {
  if (!grammarNote) {
    return <span className={className}>{english}</span>;
  }

  return (
    <GrammarLoreTooltip note={grammarNote} className={className}>
      {english}
    </GrammarLoreTooltip>
  );
}
