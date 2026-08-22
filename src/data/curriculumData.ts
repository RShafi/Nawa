import type { Lesson, Stage, UserProgress } from "@/types/arabic";

function L(
  partial: Omit<Lesson, "isCompleted"> & { isCompleted?: boolean },
): Lesson {
  return { isCompleted: false, ...partial };
}

/**
 * Canonical Nawā curriculum — four stages, subway-map nodes.
 * Static `isCompleted` / `isUnlocked` seed the first steps; runtime progress
 * is driven by `UserProgress.completedLessonIds`.
 */
export const curriculumStages: Stage[] = [
  {
    id: "stage-0",
    title: "The Sound & Script Gate",
    description:
      "Train your ear and eye before grammar — consonants, how letters connect, and the vowel marks that make Arabic readable.",
    themeColor: "oklch(0.55 0.09 195)",
    units: [
      {
        id: "unit-0-consonants",
        title: "The Consonants",
        description: "Meet the shapes and sounds that English doesn’t share.",
        isUnlocked: true,
        isCompleted: false,
        lessons: [
          L({
            id: "s0-u0-l1",
            title: "Throat letters",
            description: "Hear ع ح خ غ — throat sounds English doesn’t have as letters.",
            type: "phonetics",
            isCompleted: false,
          }),
          L({
            id: "s0-u0-l2",
            title: "Emphatic consonants",
            description: "س vs ص, ت vs ط — light vs “heavy” consonants that darken vowels.",
            type: "phonetics",
            isCompleted: false,
          }),
          L({
            id: "s0-u0-l3",
            title: "Letter shapes quiz",
            description: "Quiz: throat letters and emphatics — match sound to letter.",
            type: "quiz",
            isCompleted: false,
          }),
        ],
      },
      {
        id: "unit-0-connectors",
        title: "The Connectors",
        description: "How Arabic letters join — initial, medial, and final forms.",
        isUnlocked: false,
        isCompleted: false,
        lessons: [
          L({
            id: "s0-u1-l1",
            title: "Why letters change shape",
            description: "ب alone vs بَاب; ك alone vs كِتَاب — letters change shape when joined.",
            type: "reading-drill",
            isCompleted: false,
          }),
          L({
            id: "s0-u1-l2",
            title: "Non-connecting letters",
            description: "ا د ذ ر ز و — six letters that never join to what follows.",
            type: "phonetics",
            isCompleted: false,
          }),
          L({
            id: "s0-u1-l3",
            title: "Connect-the-script drill",
            description: "Read مِن، عَلَى، فِي، وَلَد — watch joins (and the و break).",
            type: "reading-drill",
            isCompleted: false,
          }),
          L({
            id: "s0-u1-l4",
            title: "Connector checkpoint",
            description: "Quick quiz: which letters break the chain?",
            type: "quiz",
            isCompleted: false,
          }),
        ],
      },
      {
        id: "unit-0-vowels",
        title: "The Vowels",
        description: "Short marks (fatha, kasra, damma) vs long vowel letters.",
        isUnlocked: false,
        isCompleted: false,
        lessons: [
          L({
            id: "s0-u2-l1",
            title: "Short vowels as marks",
            description: "Short a/i/u as marks on ك — not separate letters like English.",
            type: "phonetics",
            isCompleted: false,
          }),
          L({
            id: "s0-u2-l2",
            title: "Long vowels as letters",
            description: "كَ vs كَا, كُ vs كُو, كِ vs كِي — short marks vs long letters.",
            type: "phonetics",
            isCompleted: false,
          }),
          L({
            id: "s0-u2-l3",
            title: "Vowel reading drill",
            description: "Read fully vowelled syllables, then fade the marks.",
            type: "reading-drill",
            tashkeelMode: "full",
            isCompleted: false,
          }),
          L({
            id: "s0-u2-l4",
            title: "Vowels checkpoint",
            description: "Quiz: short mark or long letter?",
            type: "quiz",
            isCompleted: false,
          }),
        ],
      },
    ],
  },
  {
    id: "stage-1",
    title: "The Root Awakening",
    description:
      "Discover the triliteral root — three consonants that carry meaning — and Form I past and present.",
    themeColor: "oklch(0.52 0.11 75)",
    units: [
      {
        id: "unit-1-meet-root",
        title: "Meet the Root",
        description: "ك-ت-ب and the idea that meaning lives in three consonants.",
        isUnlocked: false,
        isCompleted: false,
        lessons: [
          L({
            id: "s1-u0-l1",
            title: "What is a root?",
            description: "See ك ت ب as writing — before any pattern is applied.",
            type: "morph-engine",
            rootId: "ktb",
            patternId: "verb-i",
            tashkeelMode: "full",
            isCompleted: false,
          }),
          L({
            id: "s1-u0-l2",
            title: "Build “kataba” (he wrote)",
            description: "Slot the root into Form I and watch the word assemble.",
            type: "morph-engine",
            rootId: "ktb",
            patternId: "verb-i",
            tashkeelMode: "full",
            isCompleted: false,
          }),
          L({
            id: "s1-u0-l3",
            title: "Same pattern: “darasa”",
            description: "Reuse Form I with د-ر-س (studying).",
            type: "morph-engine",
            rootId: "drs",
            patternId: "verb-i",
            tashkeelMode: "full",
            isCompleted: false,
          }),
        ],
      },
      {
        id: "unit-1-form-i-past",
        title: "Form I Past",
        description: "Perfect-tense Form I across a few core roots.",
        isUnlocked: false,
        isCompleted: false,
        lessons: [
          L({
            id: "s1-u1-l1",
            title: "Past tense shape",
            description: "Recognize فَعَلَ as the default past template.",
            type: "morph-engine",
            rootId: "ktb",
            patternId: "verb-i",
            isCompleted: false,
          }),
          L({
            id: "s1-u1-l2",
            title: "Peace root: salima",
            description: "Apply Form I past to س-ل-م.",
            type: "morph-engine",
            rootId: "slm",
            patternId: "verb-i",
            isCompleted: false,
          }),
          L({
            id: "s1-u1-l3",
            title: "Past tense quiz",
            description: "Match root + Form I past to the English gloss.",
            type: "quiz",
            isCompleted: false,
          }),
        ],
      },
      {
        id: "unit-1-form-i-present",
        title: "Form I Present",
        description: "Imperfect stems — the “is writing / studies” layer (intro).",
        isUnlocked: false,
        isCompleted: false,
        lessons: [
          L({
            id: "s1-u2-l1",
            title: "Present vs past feel",
            description: "Hear how present stems differ from past Form I (guided intro).",
            type: "reading-drill",
            rootId: "ktb",
            isCompleted: false,
          }),
          L({
            id: "s1-u2-l2",
            title: "Knowledge root in motion",
            description: "Explore ع-ل-م in the Morph Engine.",
            type: "morph-engine",
            rootId: "elm",
            patternId: "verb-i",
            isCompleted: false,
          }),
          L({
            id: "s1-u2-l3",
            title: "Present checkpoint",
            description: "Short quiz on past vs present cues.",
            type: "quiz",
            isCompleted: false,
          }),
          L({
            id: "s1-u2-l4",
            title: "Reading with full vowels",
            description: "Read Form I words with Full tashkeel, then Minimal.",
            type: "reading-drill",
            tashkeelMode: "minimal",
            rootId: "drs",
            patternId: "verb-i",
            isCompleted: false,
          }),
        ],
      },
      {
        id: "unit-1-doer-done",
        title: "The Doer & The Done",
        description: "Active and passive participles — who does, what is done.",
        isUnlocked: false,
        isCompleted: false,
        lessons: [
          L({
            id: "s1-u3-l1",
            title: "The done: maktūb",
            description: "Passive participle مَكْتُوب from ك-ت-ب.",
            type: "morph-engine",
            rootId: "ktb",
            patternId: "noun-maf3ul",
            isCompleted: false,
          }),
          L({
            id: "s1-u3-l2",
            title: "Place noun: maktab",
            description: "مَكْتَب — office / desk from the same root.",
            type: "morph-engine",
            rootId: "ktb",
            patternId: "noun-maf3al",
            isCompleted: false,
          }),
          L({
            id: "s1-u3-l3",
            title: "Doer & done quiz",
            description: "Pick participle vs place noun from short prompts.",
            type: "quiz",
            isCompleted: false,
          }),
        ],
      },
    ],
  },
  {
    id: "stage-2",
    title: "The Pattern Matrix",
    description:
      "Derived verb forms and noun templates — then practice reading as vowel marks fade away.",
    themeColor: "oklch(0.48 0.12 25)",
    units: [
      {
        id: "unit-2-ii-v",
        title: "Causative / Reflexive (Forms II & V)",
        description: "Intensify, cause, or turn the action back on the subject.",
        isUnlocked: false,
        isCompleted: false,
        lessons: [
          L({
            id: "s2-u0-l1",
            title: "Form II: kattaba",
            description: "Shadda and causative flavor on ك-ت-ب.",
            type: "morph-engine",
            rootId: "ktb",
            patternId: "verb-ii",
            tashkeelMode: "minimal",
            isCompleted: false,
          }),
          L({
            id: "s2-u0-l2",
            title: "Form II: ʿallama",
            description: "Teach vs know — ع-ل-م in Form II.",
            type: "morph-engine",
            rootId: "elm",
            patternId: "verb-ii",
            isCompleted: false,
          }),
          L({
            id: "s2-u0-l3",
            title: "Speaking family: kallama",
            description: "Form II on ك-ل-م — speak to someone.",
            type: "morph-engine",
            rootId: "klm",
            patternId: "verb-ii",
            isCompleted: false,
          }),
          L({
            id: "s2-u0-l4",
            title: "II / V meaning quiz",
            description: "Match derived forms to English glosses.",
            type: "quiz",
            isCompleted: false,
          }),
        ],
      },
      {
        id: "unit-2-form-x",
        title: "Seeking (Form X)",
        description: "The “seek / request” template اِسْتَفْعَلَ.",
        isUnlocked: false,
        isCompleted: false,
        lessons: [
          L({
            id: "s2-u1-l1",
            title: "Form X: istaktaba",
            description: "Ask someone to write — ك-ت-ب in Form X.",
            type: "morph-engine",
            rootId: "ktb",
            patternId: "verb-x",
            isCompleted: false,
          }),
          L({
            id: "s2-u1-l2",
            title: "Form X: istaʿlama",
            description: "Inquire / seek knowledge — ع-ل-م.",
            type: "morph-engine",
            rootId: "elm",
            patternId: "verb-x",
            tashkeelMode: "none",
            isCompleted: false,
          }),
          L({
            id: "s2-u1-l3",
            title: "Form X checkpoint",
            description: "Spot the استـ prefix and the root consonants.",
            type: "quiz",
            isCompleted: false,
          }),
        ],
      },
      {
        id: "unit-2-place-time",
        title: "Place & Time Nouns",
        description: "مَفْعَل and friends — where and when the root happens.",
        isUnlocked: false,
        isCompleted: false,
        lessons: [
          L({
            id: "s2-u2-l1",
            title: "School: madrasa",
            description: "Place noun from د-ر-س.",
            type: "morph-engine",
            rootId: "drs",
            patternId: "noun-maf3al",
            isCompleted: false,
          }),
          L({
            id: "s2-u2-l2",
            title: "Book: kitāb",
            description: "Noun pattern فِعَال from ك-ت-ب.",
            type: "morph-engine",
            rootId: "ktb",
            patternId: "noun-fi3al",
            isCompleted: false,
          }),
          L({
            id: "s2-u2-l3",
            title: "Place & time quiz",
            description: "Choose the noun that fits the scene.",
            type: "quiz",
            isCompleted: false,
          }),
        ],
      },
      {
        id: "unit-2-tashkeel-fade",
        title: "Tashkeel Fade-Out",
        description: "Read the same words as vowel marks disappear.",
        isUnlocked: false,
        isCompleted: false,
        lessons: [
          L({
            id: "s2-u3-l1",
            title: "Full → Minimal",
            description: "Keep shadda; drop short vowels on familiar Form I words.",
            type: "reading-drill",
            rootId: "ktb",
            patternId: "verb-i",
            tashkeelMode: "minimal",
            isCompleted: false,
          }),
          L({
            id: "s2-u3-l2",
            title: "Minimal → None",
            description: "Bare script challenge on Form X.",
            type: "reading-drill",
            rootId: "elm",
            patternId: "verb-x",
            tashkeelMode: "none",
            isCompleted: false,
          }),
          L({
            id: "s2-u3-l3",
            title: "Fade-out quiz",
            description: "Identify the word with no vowel marks showing.",
            type: "quiz",
            isCompleted: false,
          }),
          L({
            id: "s2-u3-l4",
            title: "Morph free practice",
            description: "Open the Morph Engine and explore any unlocked pattern.",
            type: "morph-engine",
            rootId: "slm",
            patternId: "verb-ii",
            isCompleted: false,
          }),
        ],
      },
    ],
  },
  {
    id: "stage-3",
    title: "The Dialect Bridge",
    description:
      "Carry MSA into Levantine and Egyptian — greetings, cafés, the city, and media.",
    themeColor: "oklch(0.5 0.1 280)",
    units: [
      {
        id: "unit-3-greetings",
        title: "Greetings & Protocol",
        description: "Peace be upon you vs marḥaba vs ahlan.",
        isUnlocked: false,
        isCompleted: false,
        lessons: [
          L({
            id: "s3-u0-l1",
            title: "Hello across registers",
            description: "MSA, Levantine, and Egyptian greetings side by side.",
            type: "dialect-bridge",
            rootId: "slm",
            dialectPhraseId: "phrase-hello",
            isCompleted: false,
          }),
          L({
            id: "s3-u0-l2",
            title: "When to use which",
            description: "Formal media vs street — tag the right register.",
            type: "quiz",
            isCompleted: false,
          }),
          L({
            id: "s3-u0-l3",
            title: "Greeting listening drill",
            description: "Hear each variant and pick the dialect.",
            type: "phonetics",
            dialectPhraseId: "phrase-hello",
            isCompleted: false,
          }),
        ],
      },
      {
        id: "unit-3-coffee",
        title: "The Coffee Shop",
        description: "Order, chat, and “I wrote” in casual speech.",
        isUnlocked: false,
        isCompleted: false,
        lessons: [
          L({
            id: "s3-u1-l1",
            title: "I wrote — café version",
            description: "Compare كَتَبْتُ with dialect endings.",
            type: "dialect-bridge",
            rootId: "ktb",
            dialectPhraseId: "phrase-i-wrote",
            isCompleted: false,
          }),
          L({
            id: "s3-u1-l2",
            title: "Speak / talk",
            description: "تكلم vs حكي vs اتكلم at the table.",
            type: "dialect-bridge",
            rootId: "klm",
            dialectPhraseId: "phrase-speak",
            isCompleted: false,
          }),
          L({
            id: "s3-u1-l3",
            title: "Café dialogue quiz",
            description: "Choose the line that fits a casual coffee chat.",
            type: "quiz",
            isCompleted: false,
          }),
          L({
            id: "s3-u1-l4",
            title: "Reading a menu snippet",
            description: "Short vowelled then bare reading drill.",
            type: "reading-drill",
            isCompleted: false,
          }),
        ],
      },
      {
        id: "unit-3-city",
        title: "Navigating the City",
        description: "School, directions, and everyday nouns on the street.",
        isUnlocked: false,
        isCompleted: false,
        lessons: [
          L({
            id: "s3-u2-l1",
            title: "School across dialects",
            description: "مدرسة — MSA vs Levantine vs Egyptian feel.",
            type: "dialect-bridge",
            rootId: "drs",
            dialectPhraseId: "phrase-school",
            isCompleted: false,
          }),
          L({
            id: "s3-u2-l2",
            title: "I know (street)",
            description: "أعْلَمُ vs بعرف / بعرف — knowledge root in speech.",
            type: "dialect-bridge",
            rootId: "elm",
            dialectPhraseId: "phrase-i-know",
            isCompleted: false,
          }),
          L({
            id: "s3-u2-l3",
            title: "City survival quiz",
            description: "Pick the natural line for asking or answering.",
            type: "quiz",
            isCompleted: false,
          }),
        ],
      },
      {
        id: "unit-3-media",
        title: "Media & News",
        description: "When فصحى returns — headlines and formal speech.",
        isUnlocked: false,
        isCompleted: false,
        lessons: [
          L({
            id: "s3-u3-l1",
            title: "Why news sounds MSA",
            description: "Revisit greetings and note Formal / Media tags.",
            type: "dialect-bridge",
            dialectPhraseId: "phrase-hello",
            isCompleted: false,
          }),
          L({
            id: "s3-u3-l2",
            title: "Headline reading drill",
            description: "Read with Minimal tashkeel like a news chyron.",
            type: "reading-drill",
            tashkeelMode: "minimal",
            rootId: "elm",
            patternId: "noun-fi3al",
            isCompleted: false,
          }),
          L({
            id: "s3-u3-l3",
            title: "Register switch quiz",
            description: "MSA for the desk, dialect for the street — choose.",
            type: "quiz",
            isCompleted: false,
          }),
          L({
            id: "s3-u3-l4",
            title: "Capstone: free dialect bridge",
            description: "Open any phrase and explain it in your own words.",
            type: "dialect-bridge",
            dialectPhraseId: "phrase-speak",
            isCompleted: false,
          }),
        ],
      },
    ],
  },
];

/** Fresh start — only the first lesson is active; nothing completed yet. */
export const INITIAL_USER_PROGRESS: UserProgress = {
  activeLessonId: "s0-u0-l1",
  completedLessonIds: [],
};

export function getAllCurriculumLessons() {
  return curriculumStages.flatMap((stage) =>
    stage.units.flatMap((unit) =>
      unit.lessons.map((lesson) => ({ stage, unit, lesson })),
    ),
  );
}

export function findCurriculumLesson(lessonId: string) {
  return getAllCurriculumLessons().find((entry) => entry.lesson.id === lessonId);
}

export function getNextCurriculumLessonId(completedLessonIds: string[]): string | null {
  for (const entry of getAllCurriculumLessons()) {
    const done = completedLessonIds.includes(entry.lesson.id) || entry.lesson.isCompleted;
    if (done) continue;
    if (isCurriculumLessonUnlocked(entry.lesson.id, completedLessonIds)) {
      return entry.lesson.id;
    }
  }
  return null;
}

export function isCurriculumLessonUnlocked(
  lessonId: string,
  completedLessonIds: string[],
): boolean {
  const ordered = getAllCurriculumLessons();
  const index = ordered.findIndex((e) => e.lesson.id === lessonId);
  if (index === -1) return false;

  const { unit, lesson } = ordered[index];
  if (!isCurriculumUnitUnlocked(unit.id, completedLessonIds)) return false;

  const idxInUnit = unit.lessons.findIndex((l) => l.id === lesson.id);
  for (let i = 0; i < idxInUnit; i++) {
    const prev = unit.lessons[i];
    if (!completedLessonIds.includes(prev.id) && !prev.isCompleted) return false;
  }
  return true;
}

export function isCurriculumUnitUnlocked(unitId: string, completedLessonIds: string[]): boolean {
  const units = curriculumStages.flatMap((s) => s.units);
  const idx = units.findIndex((u) => u.id === unitId);
  if (idx === -1) return false;
  if (units[idx].isUnlocked) return true;
  if (idx === 0) return true;
  const prev = units[idx - 1];
  return prev.lessons.every((l) => completedLessonIds.includes(l.id) || l.isCompleted);
}

export function deriveLessonStatus(
  lessonId: string,
  progress: UserProgress,
): "locked" | "active" | "completed" {
  const completed =
    progress.completedLessonIds.includes(lessonId) ||
    findCurriculumLesson(lessonId)?.lesson.isCompleted === true;
  if (completed) return "completed";
  if (!isCurriculumLessonUnlocked(lessonId, progress.completedLessonIds)) return "locked";

  // Only the single "next" lesson is active — never mark every unlocked node as playable
  const nextId = getNextCurriculumLessonId(progress.completedLessonIds);
  if (lessonId === nextId) return "active";

  return "locked";
}
