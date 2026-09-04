import type { ArabicRoot, PatternMold, VocabularyItem } from "@/types/curriculum";
import {
  PATTERN_FA3ALA,
  PATTERN_MAF3ALA,
} from "@/content/curriculumData";
import { CORE_VOCAB_TTS_OVERRIDES } from "@/content/ttsOverrides";
import type { ForgeTrial } from "@/types/forge";

/** فَاعِل — active participle / doer (كَاتِب). */
export const PATTERN_FAA3IL: PatternMold = {
  id: "pattern-faa3il",
  name: "The Doer Mold",
  meaning: "The one who does it",
  visualSlots: ["slot1", "ا", "slot2", "ِ", "slot3"],
};

const ROOT_KTB: ArabicRoot = {
  id: "root-ktb",
  letters: ["ك", "ت", "ب"],
  transliteration: "K-T-B",
  primaryMeaning: "Writing",
};

const ROOT_DRS: ArabicRoot = {
  id: "root-drs",
  letters: ["د", "ر", "س"],
  transliteration: "D-R-S",
  primaryMeaning: "Study",
};

const VOCAB_KATABA: VocabularyItem = {
  id: "vocab-kataba",
  arabic: "كَتَبَ",
  transliteration: "Kataba",
  english: "He wrote",
  partOfSpeech: "verb",
  elementalSchool: "flame",
  rootId: "root-ktb",
  pattern: PATTERN_FA3ALA,
  semanticTags: ["action", "writing"],
  ttsOverride: CORE_VOCAB_TTS_OVERRIDES["كَتَبَ"],
};

const VOCAB_KAATIB: VocabularyItem = {
  id: "vocab-kaatib",
  arabic: "كَاتِب",
  transliteration: "Kaatib",
  english: "Writer",
  partOfSpeech: "noun",
  elementalSchool: "flame",
  rootId: "root-ktb",
  pattern: PATTERN_FAA3IL,
  semanticTags: ["person", "writing"],
  ttsOverride: "kaa-tib",
};

const VOCAB_MADRASA: VocabularyItem = {
  id: "vocab-madrasa",
  arabic: "مَدْرَسَة",
  transliteration: "Madrasa",
  english: "School",
  partOfSpeech: "noun",
  elementalSchool: "mind",
  rootId: "root-drs",
  pattern: PATTERN_MAF3ALA,
  semanticTags: ["place", "knowledge"],
  ttsOverride: CORE_VOCAB_TTS_OVERRIDES["مَدْرَسَة"],
};

/** Star Map TRIAL nodes — constrained deck + target waves. */
export const forgeTrials: readonly ForgeTrial[] = [
  {
    id: "trial-writing-forge",
    title: "Writing Forge",
    subtitle: "كَتَبَ · كَاتِب — root ك ت ب",
    chapterId: "chapter-1",
    unlockAfterLessonId: "lesson-1-1",
    fallDurationMs: 14000,
    deck: {
      roots: [ROOT_KTB],
      molds: [PATTERN_FA3ALA, PATTERN_FAA3IL],
    },
    targets: [VOCAB_KATABA, VOCAB_KAATIB, VOCAB_KATABA],
  },
  {
    id: "trial-school-forge",
    title: "School Forge",
    subtitle: "مَدْرَسَة — place mold",
    chapterId: "chapter-2",
    unlockAfterLessonId: "lesson-2-1",
    fallDurationMs: 16000,
    deck: {
      roots: [ROOT_DRS, ROOT_KTB],
      molds: [PATTERN_MAF3ALA, PATTERN_FA3ALA],
    },
    targets: [VOCAB_MADRASA, VOCAB_KATABA],
  },
];

export function getForgeTrial(trialId: string): ForgeTrial | undefined {
  return forgeTrials.find((t) => t.id === trialId);
}

export function forgeTrialHref(trialId: string): string {
  return `/arena?trialId=${encodeURIComponent(trialId)}`;
}

export function trialMilestoneId(trialId: string): string {
  return `trial:${trialId}`;
}
