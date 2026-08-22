/** Morphology, dialect, and curriculum types for Nawā. */

export type TashkeelMode = "full" | "minimal" | "none";

export type RootLetter = {
  arabic: string;
  latin: string;
};

export type Root = {
  id: string;
  consonants: [RootLetter, RootLetter, RootLetter];
  transliteration: string;
  gloss: string;
  semanticField: string;
};

export type PatternKind = "verb" | "noun";

export type VerbForm = "I" | "II" | "III" | "X";

export type Pattern = {
  id: string;
  kind: PatternKind;
  verbForm?: VerbForm;
  templateArabic: string;
  templateName: string;
  description: string;
};

export type DerivedWord = {
  rootId: string;
  patternId: string;
  arabic: string;
  transliteration: string;
  ipa: string;
  translation: string;
  grammaticalCategory: string;
  notes?: string;
};

export type DialectRegister = "msa" | "levantine" | "egyptian";

export type DialectScriptEntry = {
  script: string;
  transliteration: string;
  ipa: string;
  audioLabel: string;
};

export type DialectVariant = {
  id: string;
  rootId: string;
  meaning: string;
  usageTags: string[];
  variants: Record<DialectRegister, DialectScriptEntry>;
};

export type SampleSentence = {
  id: string;
  rootId: string;
  msa: string;
  dialect: string;
  dialectRegister: Exclude<DialectRegister, "msa">;
  translation: string;
};

export type SelectedDialect = "levantine" | "egyptian";

export type LessonStatus = "locked" | "active" | "completed";

export type ScrollTarget = "morph" | "dialect" | "path" | null;

/* ── Curriculum path (subway map) ─────────────────────────────── */

export type LessonType =
  | "phonetics"
  | "morph-engine"
  | "dialect-bridge"
  | "reading-drill"
  | "quiz";

export type Lesson = {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  isCompleted: boolean;
  /** Optional tool wiring for Morph / Dialect sessions */
  rootId?: string;
  patternId?: string;
  dialectPhraseId?: string;
  tashkeelMode?: TashkeelMode;
};

export type Unit = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isUnlocked: boolean;
  isCompleted: boolean;
};

export type Stage = {
  id: string;
  title: string;
  description: string;
  themeColor: string;
  units: Unit[];
};

export type UserProgress = {
  activeLessonId: string;
  completedLessonIds: string[];
};
