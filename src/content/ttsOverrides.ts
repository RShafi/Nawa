import type { CurriculumLesson } from "@/types/curriculum";

/**
 * Centralized ElevenLabs pronunciation map — explicit strings only, no AI guesswork.
 * Keys = display Arabic; values = exact text sent to ElevenLabs.
 */

/** Isolated-letter drills — short 'a' vowel, never bare letter names. */
export const LETTER_TTS_OVERRIDES: Record<string, string> = {
  ب: "ب",
  ت: "ت",
  ث: "ث",
  "بَ": "بَ",
  "تَ": "تَ",
  "ثَ": "ثَ",
  ك: "كَ",
  د: "دَ",
  ر: "رَ",
  س: "سَ",
  ف: "فَ",
  ع: "عَ",
  ل: "لَ",
};

/**
 * Core vocabulary — pausal forms (sukūn / هْ) kill phantom case vowels (-u, -i, -a).
 * Every Loom unlockable word MUST appear here and on its VocabularyItem.ttsOverride.
 */
export const CORE_VOCAB_TTS_OVERRIDES: Record<string, string> = {
  /** Past verb — internal fatha preserved, terminal sukūn (pausal). */
  "كَتَبَ": "كَتَبْ",
  /** Ta marbuta → ha + sukūn at pause. */
  "مَدْرَسَة": "مَدْرَسَهْ",
  /** Desk / office — final ba with sukūn. */
  "مَكْتَب": "مَكْتَبْ",
};

/** @deprecated Use CORE_VOCAB_TTS_OVERRIDES */
export const WORD_TTS_OVERRIDES = CORE_VOCAB_TTS_OVERRIDES;

/** Resolve the canonical override for a vocabulary display form. */
export function getVocabTtsOverride(displayArabic: string): string {
  const key = displayArabic.trim();
  return CORE_VOCAB_TTS_OVERRIDES[key] ?? key;
}

let overrideMap: Map<string, string> | null = null;

function loadCurriculumData(): readonly CurriculumLesson[] {
  // Lazy require breaks circular import with curriculumData.ts
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/content/curriculumData").curriculumData as readonly CurriculumLesson[];
}

function buildOverrideMap(curriculum: readonly CurriculumLesson[]): Map<string, string> {
  const map = new Map<string, string>([
    ...Object.entries(LETTER_TTS_OVERRIDES),
    ...Object.entries(CORE_VOCAB_TTS_OVERRIDES),
  ]);

  for (const lesson of curriculum) {
    if (lesson.root.ttsOverride) {
      map.set(lesson.root.letters.join(""), lesson.root.ttsOverride);
    }

    for (const vocab of lesson.unlockableVocab) {
      const override = vocab.ttsOverride ?? CORE_VOCAB_TTS_OVERRIDES[vocab.arabic];
      if (!override) {
        throw new Error(
          `[ttsOverrides] Missing ttsOverride for vocabulary "${vocab.arabic}" (${vocab.id})`,
        );
      }
      map.set(vocab.arabic, override);
    }

    for (const step of lesson.steps) {
      if (step.forgeVocab) {
        const override =
          step.forgeVocab.ttsOverride ?? CORE_VOCAB_TTS_OVERRIDES[step.forgeVocab.arabic];
        if (!override) {
          throw new Error(
            `[ttsOverrides] Missing ttsOverride for forge vocab "${step.forgeVocab.arabic}"`,
          );
        }
        map.set(step.forgeVocab.arabic, override);
      }
      for (const vocab of step.targetVocab ?? []) {
        const override = vocab.ttsOverride ?? CORE_VOCAB_TTS_OVERRIDES[vocab.arabic];
        if (override) map.set(vocab.arabic, override);
      }
    }
  }

  return map;
}

function ensureOverrideMap(): Map<string, string> {
  if (!overrideMap) overrideMap = buildOverrideMap(loadCurriculumData());
  return overrideMap;
}

export function getTtsOverrideForArabic(displayArabic: string): string | undefined {
  const key = displayArabic.trim();
  if (!key) return undefined;

  const map = ensureOverrideMap();
  return map.get(key) ?? map.get(key.normalize("NFC"));
}

export function countCatalogRoots(): number {
  return new Set(loadCurriculumData().map((l) => l.root.id)).size;
}

export function countCatalogVocab(): number {
  const seen = new Set<string>();
  for (const lesson of loadCurriculumData()) {
    for (const vocab of lesson.unlockableVocab) seen.add(vocab.id);
    for (const step of lesson.steps) {
      if (step.forgeVocab) seen.add(step.forgeVocab.id);
      for (const vocab of step.targetVocab ?? []) seen.add(vocab.id);
    }
  }
  return seen.size;
}

export function countDiscoveredRoots(completedStepIds: readonly string[]): number {
  const discovered = new Set<string>();
  for (const lesson of loadCurriculumData()) {
    const rootStep = lesson.steps.find((s) => s.type === "observatory");
    if (rootStep && completedStepIds.includes(rootStep.id)) {
      discovered.add(lesson.root.id);
    }
  }
  return discovered.size;
}
