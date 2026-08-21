import type { CurriculumStage, UserProgress } from "@/types/arabic";

export const CURRICULUM_STAGES: CurriculumStage[] = [
  {
    stageId: "stage-0",
    title: "Alphabet & Throat Phonetics",
    description: "Foundations — letters, emphatics, and throat phonemes that unlock reading.",
    level: "beginner",
    units: [
      {
        id: "unit-0-1",
        title: "Letter shapes & throat sounds",
        description: "Meet ع غ ح خ and the emphatics ض ص ط ظ.",
        unlocked: true,
        completed: false,
        lessons: [
          {
            id: "lesson-0-1a",
            title: "Throat letters intro",
            description: "Hear and see ع ح خ — the phonemes MSA and dialects share.",
            target: "foundations",
          },
          {
            id: "lesson-0-1b",
            title: "Emphatic consonants",
            description: "Contrast س/ص and ت/ط before you touch roots.",
            target: "foundations",
          },
          {
            id: "lesson-0-1c",
            title: "Ready for roots",
            description: "Checkpoint: alphabet confidence before Form I.",
            target: "foundations",
          },
        ],
      },
    ],
  },
  {
    stageId: "stage-1",
    title: "Root System & Form I",
    description: "Elementary morphology — slot three consonants into فَعَلَ.",
    level: "beginner",
    units: [
      {
        id: "unit-1-1",
        title: "Meet the root ك-ت-ب",
        description: "Build كَتَبَ and feel the ف-ع-ل slots.",
        unlocked: true,
        completed: false,
        lessons: [
          {
            id: "lesson-1-1a",
            title: "Form I · كَتَبَ",
            description: "Assemble k-t-b into Form I and read full tashkeel.",
            target: "morph",
            rootId: "ktb",
            patternId: "verb-i",
            tashkeelMode: "full",
          },
          {
            id: "lesson-1-1b",
            title: "Form I · دَرَسَ",
            description: "Transfer the pattern to d-r-s (studying).",
            target: "morph",
            rootId: "drs",
            patternId: "verb-i",
            tashkeelMode: "full",
          },
        ],
      },
      {
        id: "unit-1-2",
        title: "Noun of place",
        description: "From verbs to مَفْعَل places.",
        unlocked: false,
        completed: false,
        lessons: [
          {
            id: "lesson-1-2a",
            title: "مَكْتَب from ك-ت-ب",
            description: "See how place nouns inherit the root.",
            target: "morph",
            rootId: "ktb",
            patternId: "noun-maf3al",
            tashkeelMode: "full",
          },
        ],
      },
    ],
  },
  {
    stageId: "stage-2",
    title: "Derived Templates & Tashkeel Decay",
    description: "Intermediate literacy — Form II/X and reading with less voweling.",
    level: "intermediate",
    units: [
      {
        id: "unit-2-1",
        title: "Causatives & requests",
        description: "Form II intensives and Form X seek-patterns.",
        unlocked: false,
        completed: false,
        lessons: [
          {
            id: "lesson-2-1a",
            title: "Form II · كَتَّبَ",
            description: "Intensive / causative with shadda — keep minimal tashkeel.",
            target: "morph",
            rootId: "ktb",
            patternId: "verb-ii",
            tashkeelMode: "minimal",
          },
          {
            id: "lesson-2-1b",
            title: "Form X · اِسْتَعْلَمَ",
            description: "Seek knowledge from ʿ-l-m with bare script challenge.",
            target: "morph",
            rootId: "elm",
            patternId: "verb-x",
            tashkeelMode: "none",
          },
        ],
      },
    ],
  },
  {
    stageId: "stage-3",
    title: "Spoken Dialect & Conversational Bridge",
    description: "Fluency — compare فصحى with Levantine and Egyptian.",
    level: "advanced",
    units: [
      {
        id: "unit-3-1",
        title: "Bridge greetings & daily verbs",
        description: "MSA vs شامي vs مصري for high-frequency phrases.",
        unlocked: false,
        completed: false,
        lessons: [
          {
            id: "lesson-3-1a",
            title: "Hello across registers",
            description: "السَّلَامُ عَلَيْكُمْ vs مرحبا vs أهلاً.",
            target: "dialect",
            rootId: "slm",
            dialectPhraseId: "phrase-hello",
          },
          {
            id: "lesson-3-1b",
            title: "I wrote — MSA & street",
            description: "Compare كَتَبْتُ with dialect endings.",
            target: "dialect",
            rootId: "ktb",
            dialectPhraseId: "phrase-i-wrote",
          },
          {
            id: "lesson-3-1c",
            title: "Speak / talk",
            description: "تَكَلَّمْ vs حكي vs اتكلم.",
            target: "dialect",
            rootId: "klm",
            dialectPhraseId: "phrase-speak",
          },
        ],
      },
    ],
  },
];

/** Seeded progress: Stage 0 partly done; Stage 1 current; later stages locked via helpers. */
export const INITIAL_USER_PROGRESS: UserProgress = {
  currentStageId: "stage-1",
  completedLessonIds: ["lesson-0-1a", "lesson-0-1b"],
  masteredRoots: [],
  selectedDialect: "levantine",
};

export function findLessonById(lessonId: string) {
  for (const stage of CURRICULUM_STAGES) {
    for (const unit of stage.units) {
      const lesson = unit.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return { stage, unit, lesson };
      }
    }
  }
  return undefined;
}

export function getAllLessonsInOrder() {
  return CURRICULUM_STAGES.flatMap((stage) =>
    stage.units.flatMap((unit) =>
      unit.lessons.map((lesson) => ({
        stage,
        unit,
        lesson,
      })),
    ),
  );
}
