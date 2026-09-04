/**
 * EdTech Learning Path — Unit → Module → Lesson → Slide.
 * Strict Teach → Practice → Quiz. Plain English for absolute novices.
 */

export type SlideType =
  | "info"
  | "vocab"
  | "phonetic"
  | "shape"
  | "morphology"
  | "syntax"
  | "translation"
  | "listening"
  | "matching";

export type InfoInteraction = {
  /** Short paragraphs (2–3). Shown as digestible blocks. */
  paragraphs: string[];
  /** Optional bullet list under the paragraphs */
  bullets?: string[];
  /** Optional Arabic example to hear */
  exampleArabic?: string;
  exampleCaption?: string;
};

export type VocabInteraction = {
  arabic: string;
  english: string;
  latin?: string;
  audioText?: string;
  /** Extra teaching lines under the card */
  notes?: string[];
};

export type ListeningInteraction = {
  audioText: string;
  options: string[];
  answer: string;
};

export type TranslationInteraction = {
  english: string;
  bank: string[];
  answer: string[];
};

export type PhoneticInteraction = {
  audioText: string;
  hint?: string;
  options: Array<{ id: string; arabic: string; label?: string }>;
  answerId: string;
};

/**
 * Shape / fill-in-the-blank.
 * `displayWord` MUST include `_` where the letter is missing (e.g. "_َيْت").
 * `correctAnswer` must exactly match one option's `arabic` glyph.
 */
export type ShapeInteraction = {
  displayWord: string;
  prompt: string;
  explanation?: string;
  options: Array<{
    id: string;
    arabic: string;
    form: "isolated" | "initial" | "medial" | "final";
  }>;
  correctAnswer: string;
};

export type MorphologyInteraction = {
  patternName: string;
  /** Visual frame label, e.g. فَعَلَ */
  templateLabel: string;
  /** Drop zones — length must equal rootLetters.length */
  patternSlots: Array<{ id: string; label: string }>;
  rootLetters: Array<{ id: string; arabic: string; latin?: string }>;
  /** Order of root letter ids into slots */
  correctOrder: string[];
  resultArabic: string;
  resultEnglish: string;
};

export type SyntaxInteraction = {
  cards: Array<{ id: string; arabic: string; english: string }>;
  answerOrder: string[];
  tip?: string;
};

export type MatchingInteraction = {
  pairs: Array<{ id: string; arabic: string; english: string }>;
};

export type SlideInteraction =
  | { type: "info"; data: InfoInteraction }
  | { type: "vocab"; data: VocabInteraction }
  | { type: "listening"; data: ListeningInteraction }
  | { type: "translation"; data: TranslationInteraction }
  | { type: "phonetic"; data: PhoneticInteraction }
  | { type: "shape"; data: ShapeInteraction }
  | { type: "morphology"; data: MorphologyInteraction }
  | { type: "syntax"; data: SyntaxInteraction }
  | { type: "matching"; data: MatchingInteraction };

export type CurriculumSlide = {
  id: string;
  type: SlideType;
  instruction: string;
  interaction: SlideInteraction;
};

export type CurriculumLesson = {
  id: string;
  title: string;
  summary: string;
  slides: CurriculumSlide[];
  deckWordIds?: string[];
};

export type CurriculumModule = {
  id: string;
  title: string;
  summary: string;
  lessons: CurriculumLesson[];
};

export type CurriculumUnit = {
  id: string;
  title: string;
  summary: string;
  accent: "sky" | "emerald" | "amber" | "violet";
  modules: CurriculumModule[];
};

export type Curriculum = {
  units: CurriculumUnit[];
};

export const CURRICULUM: Curriculum = {
  units: [
    {
      id: "unit-1",
      title: "Unit 1: The Foundations",
      summary: "How Arabic sounds work, how letters connect, and your first words.",
      accent: "sky",
      modules: [
        {
          id: "u1-m1",
          title: "Letters & short vowels",
          summary: "Meet ب and the three short vowel marks.",
          lessons: [
            {
              id: "u1-m1-l1",
              title: "The letter ب and short a",
              summary: "Hear بَ (ba), then practice picking it out.",
              slides: [
                {
                  id: "u1-m1-l1-s0",
                  type: "info",
                  instruction: "Before we quiz anything — here’s the idea.",
                  interaction: {
                    type: "info",
                    data: {
                      paragraphs: [
                        "Arabic letters are sounds. The letter ب is like a soft English “b”.",
                        "On its own, ب doesn’t tell you the vowel yet. Tiny marks above or below the letter add a short vowel.",
                        "A small line above the letter (ـَ) adds a short “a”. So بَ sounds like “ba”.",
                      ],
                      bullets: [
                        "ـَ = short a (fatha)",
                        "ـِ = short i (kasra)",
                        "ـُ = short u (damma)",
                      ],
                      exampleArabic: "بَ",
                      exampleCaption: "ب + short a → “ba”",
                    },
                  },
                },
                {
                  id: "u1-m1-l1-s1",
                  type: "phonetic",
                  instruction: "Listen first. Then tap the symbol that matches what you heard.",
                  interaction: {
                    type: "phonetic",
                    data: {
                      audioText: "بَ",
                      hint: "You should hear a short “a” after the ب.",
                      options: [
                        { id: "ba", arabic: "بَ", label: "ba" },
                        { id: "bi", arabic: "بِ", label: "bi" },
                        { id: "bu", arabic: "بُ", label: "bu" },
                        { id: "ta", arabic: "تَ", label: "ta" },
                      ],
                      answerId: "ba",
                    },
                  },
                },
                {
                  id: "u1-m1-l1-s2",
                  type: "info",
                  instruction: "Same letter, different mark.",
                  interaction: {
                    type: "info",
                    data: {
                      paragraphs: [
                        "If the short mark sits below the letter (ـِ), you get a short “i” sound.",
                        "So بِ sounds like “bi”. Listen and compare it with بَ in your head — the consonant stays the same; only the vowel changes.",
                      ],
                      exampleArabic: "بِ",
                      exampleCaption: "ب + short i → “bi”",
                    },
                  },
                },
                {
                  id: "u1-m1-l1-s3",
                  type: "phonetic",
                  instruction: "Practice: which one did you hear?",
                  interaction: {
                    type: "phonetic",
                    data: {
                      audioText: "بِ",
                      options: [
                        { id: "ba", arabic: "بَ", label: "ba" },
                        { id: "bi", arabic: "بِ", label: "bi" },
                        { id: "bu", arabic: "بُ", label: "bu" },
                        { id: "tu", arabic: "تُ", label: "tu" },
                      ],
                      answerId: "bi",
                    },
                  },
                },
              ],
            },
            {
              id: "u1-m1-l2",
              title: "Your first word: book",
              summary: "Learn كِتَاب, then prove you know it.",
              deckWordIds: ["ktb-form-1"],
              slides: [
                {
                  id: "u1-m1-l2-s0",
                  type: "info",
                  instruction: "We’re ready for a real word.",
                  interaction: {
                    type: "info",
                    data: {
                      paragraphs: [
                        "كِتَاب means “book”. You’ll hear it a lot in school vocabulary.",
                        "Don’t worry about reading every mark perfectly yet. First goal: connect the sound to the meaning.",
                      ],
                    },
                  },
                },
                {
                  id: "u1-m1-l2-s1",
                  type: "vocab",
                  instruction:
                    "Tap the card to flip it. You must see the English meaning before you can continue.",
                  interaction: {
                    type: "vocab",
                    data: {
                      arabic: "كِتَاب",
                      english: "book",
                      latin: "kitāb",
                      notes: [
                        "Hear it a couple of times — sound first, then meaning.",
                        "We’ll reuse this word in later listening practice.",
                      ],
                    },
                  },
                },
                {
                  id: "u1-m1-l2-s2",
                  type: "listening",
                  instruction:
                    "Quiz time (only after you saw the meaning). Listen with no Arabic on screen — pick “book”.",
                  interaction: {
                    type: "listening",
                    data: {
                      audioText: "كِتَاب",
                      options: ["book", "desk", "school", "he wrote"],
                      answer: "book",
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          id: "u1-m2",
          title: "How letters change shape",
          summary: "Arabic is cursive — the same letter looks different in different spots.",
          lessons: [
            {
              id: "u1-m2-l1",
              title: "Connecting letters",
              summary: "Why ب looks different in the middle of a word — then practice.",
              slides: [
                {
                  id: "u1-m2-l1-s0",
                  type: "info",
                  instruction: "Why Arabic letters change shape",
                  interaction: {
                    type: "info",
                    data: {
                      paragraphs: [
                        "Arabic writing is cursive. Letters usually join to their neighbors, like handwriting English — but more consistently.",
                        "Because of that joining, many letters have different drawings depending on position: alone, at the start, in the middle, or at the end of a word.",
                        "You’re not learning four new letters — you’re learning four costumes for the same sound.",
                      ],
                      bullets: [
                        "Isolated: standing alone",
                        "Initial: starts a connected group",
                        "Medial: sits in the middle",
                        "Final: ends a connected group",
                      ],
                    },
                  },
                },
                {
                  id: "u1-m2-l1-s1",
                  type: "info",
                  instruction: "Example: the letter ب inside “house”",
                  interaction: {
                    type: "info",
                    data: {
                      paragraphs: [
                        "The word بَيْت means “house”. It starts with ب.",
                        "When ب begins a word and connects forward, we often write a “starting” form that trails into the next letter: بـ",
                        "Next you’ll fill a blank that looks like _َيْت — pick the starting shape of ب.",
                      ],
                      exampleArabic: "بَيْت",
                      exampleCaption: "house (bayt)",
                    },
                  },
                },
                {
                  id: "u1-m2-l1-s2",
                  type: "shape",
                  instruction: "Fill the blank. The underscore marks the missing letter shape.",
                  interaction: {
                    type: "shape",
                    data: {
                      displayWord: "_َيْت",
                      prompt: "Which form of ب belongs at the start?",
                      explanation:
                        "Initial بـ connects into the next letter. Isolated ب is for when the letter stands alone.",
                      options: [
                        { id: "iso", arabic: "ب", form: "isolated" },
                        { id: "ini", arabic: "بـ", form: "initial" },
                        { id: "med", arabic: "ـبـ", form: "medial" },
                        { id: "fin", arabic: "ـب", form: "final" },
                      ],
                      correctAnswer: "بـ",
                    },
                  },
                },
                {
                  id: "u1-m2-l1-s3",
                  type: "vocab",
                  instruction: "Flip to lock in the meaning of the full word.",
                  interaction: {
                    type: "vocab",
                    data: {
                      arabic: "بَيْت",
                      english: "house",
                      latin: "bayt",
                      notes: ["You just practiced the opening ب that builds this word."],
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "unit-2",
      title: "Unit 2: Core Vocabulary",
      summary: "Useful school words, then gentle listening and matching.",
      accent: "emerald",
      modules: [
        {
          id: "u2-m1",
          title: "School words",
          summary: "Desk and school — teach first, quiz second.",
          lessons: [
            {
              id: "u2-m1-l1",
              title: "Desk and school",
              summary: "Learn مَكْتَب and مَدْرَسَة, then check yourself.",
              deckWordIds: ["ktb-place-noun", "drs-noun-of-place"],
              slides: [
                {
                  id: "u2-m1-l1-s0",
                  type: "info",
                  instruction: "Two place-words you’ll see often",
                  interaction: {
                    type: "info",
                    data: {
                      paragraphs: [
                        "مَكْتَب can mean “desk” or “office” — a place connected to writing.",
                        "مَدْرَسَة means “school” — a place connected to studying.",
                        "We’ll show each word clearly before any quiz.",
                      ],
                    },
                  },
                },
                {
                  id: "u2-m1-l1-s1",
                  type: "vocab",
                  instruction: "Tap to reveal the English meaning.",
                  interaction: {
                    type: "vocab",
                    data: {
                      arabic: "مَكْتَب",
                      english: "desk / office",
                      latin: "maktab",
                      notes: ["Listen once or twice before you flip if you like."],
                    },
                  },
                },
                {
                  id: "u2-m1-l1-s2",
                  type: "vocab",
                  instruction: "Second word — flip for the meaning.",
                  interaction: {
                    type: "vocab",
                    data: {
                      arabic: "مَدْرَسَة",
                      english: "school",
                      latin: "madrasa",
                    },
                  },
                },
                {
                  id: "u2-m1-l1-s3",
                  type: "listening",
                  instruction: "You already saw both meanings. Listen and choose.",
                  interaction: {
                    type: "listening",
                    data: {
                      audioText: "مَدْرَسَة",
                      options: ["school", "desk / office", "book", "house"],
                      answer: "school",
                    },
                  },
                },
                {
                  id: "u2-m1-l1-s4",
                  type: "matching",
                  instruction: "Match the two words you just learned.",
                  interaction: {
                    type: "matching",
                    data: {
                      pairs: [
                        { id: "a", arabic: "مَكْتَب", english: "desk / office" },
                        { id: "b", arabic: "مَدْرَسَة", english: "school" },
                      ],
                    },
                  },
                },
              ],
            },
            {
              id: "u2-m1-l2",
              title: "Describing a desk",
              summary: "In Arabic, the describing word usually follows the thing.",
              slides: [
                {
                  id: "u2-m1-l2-s0",
                  type: "info",
                  instruction: "Word order tip (keep it simple)",
                  interaction: {
                    type: "info",
                    data: {
                      paragraphs: [
                        "In English we say “a big desk” — describing word first.",
                        "In Arabic, you usually name the thing first, then the describing word: مَكْتَب كَبِير (desk + big).",
                        "We’ll practice that order after you meet كَبِير (“big”).",
                      ],
                    },
                  },
                },
                {
                  id: "u2-m1-l2-s1",
                  type: "vocab",
                  instruction: "Flip to learn “big”.",
                  interaction: {
                    type: "vocab",
                    data: {
                      arabic: "كَبِير",
                      english: "big",
                      latin: "kabīr",
                    },
                  },
                },
                {
                  id: "u2-m1-l2-s2",
                  type: "syntax",
                  instruction: "Put the noun first, then “big”.",
                  interaction: {
                    type: "syntax",
                    data: {
                      tip: "Thing first, description second.",
                      cards: [
                        { id: "adj", arabic: "كَبِير", english: "big" },
                        { id: "noun", arabic: "مَكْتَب", english: "desk" },
                      ],
                      answerOrder: ["noun", "adj"],
                    },
                  },
                },
                {
                  id: "u2-m1-l2-s3",
                  type: "translation",
                  instruction: "Tap Arabic words in order to say “A big desk”.",
                  interaction: {
                    type: "translation",
                    data: {
                      english: "A big desk",
                      bank: ["مَكْتَب", "كَبِير", "مَدْرَسَة", "كِتَاب"],
                      answer: ["مَكْتَب", "كَبِير"],
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          id: "u2-m2",
          title: "A first verb",
          summary: "Build “he wrote” with a Thread and a Word Frame.",
          lessons: [
            {
              id: "u2-m2-l1",
              title: "Thread + Frame → كَتَبَ",
              summary: "Teach the idea, build the word, then match.",
              deckWordIds: ["ktb-form-1"],
              slides: [
                {
                  id: "u2-m2-l1-s0",
                  type: "info",
                  instruction: "What is a Word Thread?",
                  interaction: {
                    type: "info",
                    data: {
                      paragraphs: [
                        "Many Arabic words share a family of three consonants — a Word Thread. For writing, the thread is ك ت ب.",
                        "A Word Frame is a vowel-and-shape pattern those letters drop into. One common past-tense frame looks like فَعَلَ.",
                        "When you drop ك ت ب into that frame, you get كَتَبَ — “he wrote”.",
                      ],
                      bullets: [
                        "Thread = the three root letters (meaning family)",
                        "Frame = the pattern (grammar shape)",
                        "Together they build a finished word",
                      ],
                    },
                  },
                },
                {
                  id: "u2-m2-l1-s1",
                  type: "vocab",
                  instruction: "Meet the finished word before you build it.",
                  interaction: {
                    type: "vocab",
                    data: {
                      arabic: "كَتَبَ",
                      english: "he wrote",
                      latin: "kataba",
                    },
                  },
                },
                {
                  id: "u2-m2-l1-s2",
                  type: "morphology",
                  instruction: "Drop each Thread letter into a Frame slot (in order).",
                  interaction: {
                    type: "morphology",
                    data: {
                      patternName: "Simple past Frame",
                      templateLabel: "فَعَلَ",
                      patternSlots: [
                        { id: "s1", label: "1st" },
                        { id: "s2", label: "2nd" },
                        { id: "s3", label: "3rd" },
                      ],
                      rootLetters: [
                        { id: "r1", arabic: "ك", latin: "k" },
                        { id: "r2", arabic: "ت", latin: "t" },
                        { id: "r3", arabic: "ب", latin: "b" },
                      ],
                      correctOrder: ["r1", "r2", "r3"],
                      resultArabic: "كَتَبَ",
                      resultEnglish: "he wrote",
                    },
                  },
                },
                {
                  id: "u2-m2-l1-s3",
                  type: "listening",
                  instruction: "You already saw the meaning. Listen and choose “he wrote”.",
                  interaction: {
                    type: "listening",
                    data: {
                      audioText: "كَتَبَ",
                      options: ["he wrote", "book", "desk / office", "school"],
                      answer: "he wrote",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "unit-3",
      title: "Unit 3: The Word Forge",
      summary: "More Threads and Frames — preview lesson.",
      accent: "amber",
      modules: [
        {
          id: "u3-m1",
          title: "More practice (preview)",
          summary: "A short preview while we expand this unit.",
          lessons: [
            {
              id: "u3-m1-l1",
              title: "Review: he wrote",
              summary: "Rebuild كَتَبَ once more.",
              deckWordIds: ["ktb-form-1"],
              slides: [
                {
                  id: "u3-m1-l1-s0",
                  type: "info",
                  instruction: "Quick refresher",
                  interaction: {
                    type: "info",
                    data: {
                      paragraphs: [
                        "Same idea: Thread ك ت ب + past Frame → كَتَبَ (“he wrote”).",
                        "Build it again to make the habit stick.",
                      ],
                    },
                  },
                },
                {
                  id: "u3-m1-l1-s1",
                  type: "morphology",
                  instruction: "Place the three letters into the three slots.",
                  interaction: {
                    type: "morphology",
                    data: {
                      patternName: "Simple past Frame",
                      templateLabel: "فَعَلَ",
                      patternSlots: [
                        { id: "s1", label: "1st" },
                        { id: "s2", label: "2nd" },
                        { id: "s3", label: "3rd" },
                      ],
                      rootLetters: [
                        { id: "r1", arabic: "ك", latin: "k" },
                        { id: "r2", arabic: "ت", latin: "t" },
                        { id: "r3", arabic: "ب", latin: "b" },
                      ],
                      correctOrder: ["r1", "r2", "r3"],
                      resultArabic: "كَتَبَ",
                      resultEnglish: "he wrote",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "unit-4",
      title: "Unit 4: Sentences",
      summary: "Word order practice with words you already know.",
      accent: "violet",
      modules: [
        {
          id: "u4-m1",
          title: "Noun then description",
          summary: "Reuse school + big.",
          lessons: [
            {
              id: "u4-m1-l1",
              title: "A big school",
              summary: "Teach the pieces, then order them.",
              slides: [
                {
                  id: "u4-m1-l1-s0",
                  type: "info",
                  instruction: "Same order rule as before",
                  interaction: {
                    type: "info",
                    data: {
                      paragraphs: [
                        "We’ll say “a big school” the Arabic way: school first, then big.",
                        "You’ll see each word again briefly, then arrange them.",
                      ],
                    },
                  },
                },
                {
                  id: "u4-m1-l1-s1",
                  type: "vocab",
                  instruction: "Refresh: school",
                  interaction: {
                    type: "vocab",
                    data: { arabic: "مَدْرَسَة", english: "school", latin: "madrasa" },
                  },
                },
                {
                  id: "u4-m1-l1-s2",
                  type: "vocab",
                  instruction: "Refresh: big (feminine form used with مَدْرَسَة)",
                  interaction: {
                    type: "vocab",
                    data: {
                      arabic: "كَبِيرَة",
                      english: "big (feminine)",
                      latin: "kabīra",
                      notes: [
                        "For now, treat this as the matching form of “big” for this noun. We’ll explain gender gently later.",
                      ],
                    },
                  },
                },
                {
                  id: "u4-m1-l1-s3",
                  type: "syntax",
                  instruction: "Noun first, then the describing word.",
                  interaction: {
                    type: "syntax",
                    data: {
                      tip: "مَدْرَسَة then كَبِيرَة",
                      cards: [
                        { id: "a", arabic: "كَبِيرَة", english: "big (f.)" },
                        { id: "n", arabic: "مَدْرَسَة", english: "school" },
                      ],
                      answerOrder: ["n", "a"],
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export function getAllLessons(): CurriculumLesson[] {
  return CURRICULUM.units.flatMap((u) => u.modules.flatMap((m) => m.lessons));
}

export function findCurriculumLesson(lessonId: string):
  | { unit: CurriculumUnit; module: CurriculumModule; lesson: CurriculumLesson }
  | undefined {
  for (const unit of CURRICULUM.units) {
    for (const module of unit.modules) {
      const lesson = module.lessons.find((l) => l.id === lessonId);
      if (lesson) return { unit, module, lesson };
    }
  }
  return undefined;
}

export function getNextLessonId(lessonId: string): string | null {
  const all = getAllLessons();
  const idx = all.findIndex((l) => l.id === lessonId);
  if (idx < 0 || idx >= all.length - 1) return null;
  return all[idx + 1]?.id ?? null;
}

/** @deprecated Legacy slide lessons removed — use `loomLessonHref` from `@/content/curriculumData`. */
export function lessonPathHref(lessonId: string): string {
  return `/loom/${encodeURIComponent(lessonId)}`;
}

export function isLessonComplete(lessonId: string, completedIds: string[]): boolean {
  return completedIds.includes(lessonId);
}

export function isModuleUnlocked(
  unitIndex: number,
  moduleIndex: number,
  completedIds: string[],
): boolean {
  if (unitIndex === 0 && moduleIndex === 0) return true;
  const units = CURRICULUM.units;
  if (moduleIndex > 0) {
    const prev = units[unitIndex]?.modules[moduleIndex - 1];
    return prev ? prev.lessons.every((l) => completedIds.includes(l.id)) : false;
  }
  const prevUnit = units[unitIndex - 1];
  if (!prevUnit) return true;
  const lastMod = prevUnit.modules[prevUnit.modules.length - 1];
  return lastMod ? lastMod.lessons.every((l) => completedIds.includes(l.id)) : true;
}

export function firstIncompleteLesson(completedIds: string[]): CurriculumLesson | null {
  for (const lesson of getAllLessons()) {
    if (!completedIds.includes(lesson.id)) return lesson;
  }
  return null;
}
