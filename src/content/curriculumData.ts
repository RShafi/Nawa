import type {
  ArabicRoot,
  CurriculumLesson,
  InteractiveStep,
  PatternMold,
  VocabularyItem,
} from "@/types/curriculum";
import { CORE_VOCAB_TTS_OVERRIDES } from "@/content/ttsOverrides";

const ROOT_BOAT_BARE: ArabicRoot = {
  id: "root-boat-btt-bare",
  letters: ["ب", "ت", "ث"],
  transliteration: "Ba-Ta-Tha",
  primaryMeaning: "Boat letters (shapes only)",
};

const ROOT_BOAT: ArabicRoot = {
  id: "root-boat-btt",
  letters: ["بَ", "تَ", "ثَ"],
  transliteration: "Ba-Ta-Tha",
  primaryMeaning: "Boat letters with Fatha",
};

const ROOT_ALGEBRA: ArabicRoot = {
  id: "root-algebra-f3l",
  letters: ["ف", "ع", "ل"],
  transliteration: "Fa-Ayn-Lam",
  primaryMeaning: "The Blueprint placeholders",
};

const ROOT_KTB: ArabicRoot = {
  id: "root-ktb",
  letters: ["ك", "ت", "ب"],
  transliteration: "K-T-B",
  primaryMeaning: "Writing",
};

const ROOT_INTRO: ArabicRoot = {
  id: "root-intro",
  letters: ["ن", "و", "ا"],
  transliteration: "N-W-A",
  primaryMeaning: "Beginning",
};

export const PATTERN_FA3ALA: PatternMold = {
  id: "pattern-fa3ala",
  name: "The Word Mold",
  meaning: "He did it (past action)",
  visualSlots: ["slot1", "َ", "slot2", "َ", "slot3"],
};

export const PATTERN_FI3AL: PatternMold = {
  id: "pattern-fi3al",
  name: "The Thing Mold",
  meaning: "The thing itself",
  visualSlots: ["slot1", "ِ", "slot2", "ا", "slot3"],
};

export const PATTERN_MAF3AL: PatternMold = {
  id: "pattern-maf3al",
  name: "Place Mold",
  meaning: "Where it happens",
  visualSlots: ["م", "َ", "slot1", "slot2", "َ", "slot3"],
};

export const PATTERN_MAF3ALA: PatternMold = {
  id: "pattern-maf3ala",
  name: "Place Mold (feminine)",
  meaning: "A place (feminine)",
  visualSlots: ["م", "َ", "slot1", "slot2", "َ", "slot3", "ة"],
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
  grammarNote: "Dictionary verbs show he in the past — that is normal.",
};

const ROOT_DRS: ArabicRoot = {
  id: "root-drs",
  letters: ["د", "ر", "س"],
  transliteration: "D-R-S",
  primaryMeaning: "Study",
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

function step(partial: InteractiveStep): InteractiveStep {
  return partial;
}

export function lessonMilestoneId(lessonId: string): string {
  return `milestone:${lessonId}`;
}

export { LETTER_TTS_OVERRIDES, CORE_VOCAB_TTS_OVERRIDES as WORD_TTS_OVERRIDES } from "@/content/ttsOverrides";

export const curriculumData: CurriculumLesson[] = [
  {
    id: "lesson-0-0",
    chapterId: "chapter-0",
    title: "Welcome",
    subtitle: "Your first steps in Arabic",
    root: ROOT_INTRO,
    unlockableVocab: [],
    steps: [
      step({
        id: "lesson-0-0-narrative-1",
        type: "narrative",
        promptTitle: "Welcome",
        promptDescription:
          "You will learn Arabic step-by-step: first the letter shapes, then vowel marks, and finally how to build words using root patterns.",
        options: [],
        explanation:
          "Each lesson builds on the last. Tap to hear sounds, follow the prompts, and practice one skill at a time.",
      }),
      step({
        id: "lesson-0-0-narrative-2",
        type: "narrative",
        promptTitle: "Reading Direction",
        promptDescription:
          "Arabic is written and read from right to left — the opposite of English.",
        options: [],
        explanation:
          "Your goal: start from the right side of the screen and move left. Drag letters into slots starting from the rightmost slot.",
      }),
    ],
  },
  {
    id: "lesson-1-1",
    chapterId: "chapter-1",
    title: "The Boat Letters",
    subtitle: "ب · ت · ث",
    root: ROOT_BOAT_BARE,
    unlockableVocab: [],
    steps: [
      step({
        id: "lesson-1-1-observatory",
        type: "observatory",
        promptTitle: "Meet Ba, Ta, and Tha",
        promptDescription:
          "These are the bare letter shapes — no vowel marks yet. Each has a name: Ba, Ta, and Tha.",
        targetRoot: ROOT_BOAT_BARE,
        options: [],
        explanation:
          "Tap each orb to reveal the letter and hear its name. Notice the shared boat body and the dots that tell them apart.",
      }),
      step({
        id: "lesson-1-1-handwriting",
        type: "handwriting",
        promptTitle: "The Boat Shape",
        promptDescription:
          "Three letters share one base shape — like three boats that differ only by their dots.",
        targetRoot: ROOT_BOAT_BARE,
        options: [],
        explanation:
          "How it works: one dot below = Ba (ب), two dots above = Ta (ت), three dots above = Tha (ث). Your goal: watch the pen stroke each shape before you hear them.",
      }),
    ],
  },
  {
    id: "lesson-1-2",
    chapterId: "chapter-1",
    title: "The Fatha Vowel",
    subtitle: "َ — short \"a\"",
    root: ROOT_BOAT,
    unlockableVocab: [],
    steps: [
      step({
        id: "lesson-1-2-narrative",
        type: "narrative",
        promptTitle: "Breathing Life into Letters",
        promptDescription:
          "Arabic consonants need a vowel mark to be pronounced fully. The Fatha (َ) is a small diagonal line above the letter.",
        options: [],
        explanation:
          "How it works: Fatha adds a short \"a\" sound — so ب becomes \"ba\", ت becomes \"ta\", and ث becomes \"tha\". Your goal: understand the mark before you hear it on the boat letters.",
      }),
      step({
        id: "lesson-1-2-observatory",
        type: "observatory",
        promptTitle: "Ba, Ta, Tha with Fatha",
        promptDescription:
          "The same boat letters — now with a Fatha above each one. Listen for the short \"a\" at the end of each sound.",
        targetRoot: ROOT_BOAT,
        options: [],
        explanation:
          "Tap each orb. You should hear ba, ta, and tha — not just the letter names. This is how Arabic letters sound inside words.",
      }),
    ],
  },
  {
    id: "lesson-1-3",
    chapterId: "chapter-1",
    title: "The First Root",
    subtitle: "كَتَبَ — He wrote",
    root: ROOT_KTB,
    unlockableVocab: [VOCAB_KATABA],
    steps: [
      step({
        id: "lesson-1-3-observatory",
        type: "observatory",
        promptTitle: "Meet the Writing Root",
        promptDescription:
          "Tap ك · ت · ب — the three letters that carry the idea of writing.",
        targetRoot: ROOT_KTB,
        options: [],
        explanation:
          "This root is the core of words about writing. Learn each letter's sound before you watch the full word written.",
      }),
      step({
        id: "lesson-1-3-handwriting",
        type: "handwriting",
        promptTitle: "Write كَتَبَ",
        promptDescription:
          "Watch the quill write the complete word كَتَبَ — he wrote — letter by letter from right to left.",
        forgeVocab: VOCAB_KATABA,
        options: [],
        explanation:
          "The root ك · ت · ب becomes the verb كَتَبَ when vowel marks and the past-tense pattern are applied.",
      }),
      step({
        id: "lesson-1-3-loom",
        type: "cosmic_loom",
        promptTitle: "The 3-Letter Root",
        promptDescription:
          "Most Arabic words are built from a 3-letter root core surrounded by a pattern mold.",
        targetRoot: ROOT_KTB,
        patternMold: PATTERN_FA3ALA,
        forgeVocab: VOCAB_KATABA,
        options: [],
        explanation:
          "The root ك-ت-ب carries the core meaning of writing. You will drag these root letters into a pattern mold to forge your very first complete verb: He wrote.",
      }),
      step({
        id: "lesson-1-3-epiphany",
        type: "epiphany",
        promptTitle: "Quick Check",
        promptDescription: "What does كَتَبَ mean?",
        forgeVocab: VOCAB_KATABA,
        options: [
          { id: "opt-wrote", label: "He wrote", isCorrect: true },
          { id: "opt-book", label: "Book", isCorrect: false },
          { id: "opt-desk", label: "Desk", isCorrect: false },
        ],
        explanation: "Correct: He wrote.",
      }),
    ],
  },
  {
    id: "lesson-2-1",
    chapterId: "chapter-2",
    title: "School",
    subtitle: "مَدْرَسَة",
    root: ROOT_DRS,
    unlockableVocab: [VOCAB_MADRASA],
    steps: [
      step({
        id: "lesson-2-1-observatory",
        type: "observatory",
        promptTitle: "Study Root",
        promptDescription: "Tap د · ر · س — listen for da, ra, sa.",
        targetRoot: ROOT_DRS,
        options: [],
        explanation: "This root means study.",
      }),
      step({
        id: "lesson-2-1-handwriting",
        type: "handwriting",
        promptTitle: "Write مَدْرَسَة",
        promptDescription: "Watch the quill write the full word مَدْرَسَة — school — from right to left.",
        forgeVocab: VOCAB_MADRASA,
        options: [],
        explanation: "School — built from the study root.",
      }),
      step({
        id: "lesson-2-1-cursive",
        type: "cursive_connection",
        promptTitle: "Letters Link",
        promptDescription: "Watch the letters join in cursive.",
        targetRoot: ROOT_DRS,
        options: [],
        explanation: "Some letters reach out; some stand alone.",
      }),
      step({
        id: "lesson-2-1-loom",
        type: "cosmic_loom",
        promptTitle: "Build the Place",
        promptDescription: "Drop د · ر · س into the Place Mold to make مَدْرَسَة.",
        targetRoot: ROOT_DRS,
        patternMold: PATTERN_MAF3ALA,
        forgeVocab: VOCAB_MADRASA,
        options: [],
        explanation: "A place mold turns a root into a building name.",
      }),
      step({
        id: "lesson-2-1-epiphany",
        type: "epiphany",
        promptTitle: "Quick Check",
        promptDescription: "What does مَدْرَسَة mean?",
        forgeVocab: VOCAB_MADRASA,
        options: [
          { id: "opt-school", label: "School", isCorrect: true },
          { id: "opt-lesson", label: "Lesson", isCorrect: false },
          { id: "opt-book", label: "Book", isCorrect: false },
        ],
        explanation: "Correct: School.",
      }),
    ],
  },
];

export const LOOM_CHAPTER_META: Record<string, { title: string; summary: string }> = {
  "chapter-0": {
    title: "Prologue",
    summary: "How the Loom works.",
  },
  "chapter-1": {
    title: "Chapter 1",
    summary: "Letter shapes, the Fatha vowel, and your first word كَتَبَ.",
  },
  "chapter-2": {
    title: "Chapter 2",
    summary: "Study root and مَدْرَسَة.",
  },
};

/** Star Map node discriminant — Loom lesson or Pattern Forge trial. */
export type StarMapNodeType = "LESSON" | "TRIAL";

export function loomLessonHref(lessonId: string): string {
  return `/loom/${encodeURIComponent(lessonId)}`;
}

export function isLoomLessonComplete(
  lesson: CurriculumLesson,
  masteredVocabIds: readonly string[],
): boolean {
  if (!lesson.unlockableVocab.length) {
    return masteredVocabIds.includes(lessonMilestoneId(lesson.id));
  }
  return lesson.unlockableVocab.every((v) => masteredVocabIds.includes(v.id));
}

export function isLoomLessonUnlocked(
  lessonIndex: number,
  masteredVocabIds: readonly string[],
): boolean {
  if (lessonIndex <= 0) return true;
  const prev = curriculumData[lessonIndex - 1];
  return prev ? isLoomLessonComplete(prev, masteredVocabIds) : true;
}

export function firstIncompleteLoomLesson(
  masteredVocabIds: readonly string[],
): CurriculumLesson | null {
  for (const lesson of curriculumData) {
    if (!isLoomLessonComplete(lesson, masteredVocabIds)) return lesson;
  }
  return null;
}

export function getNextLoomLessonId(currentLessonId: string): string | null {
  const index = curriculumData.findIndex((lesson) => lesson.id === currentLessonId);
  if (index < 0 || index >= curriculumData.length - 1) return null;
  return curriculumData[index + 1]!.id;
}
