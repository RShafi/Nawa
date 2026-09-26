import { getWordCard, type WordCard } from "@/data/combatDictionary";
import { stripDiacritics } from "@/lib/arabic-utils";
import { makeWordId } from "@/types/app-progress";
import type { TashkeelMode } from "@/types/arabic";
import { REGISTER_COST } from "@/data/rewards";

export type FrameKind = "build" | "hear" | "insert" | "strengthen";

export type LessonPiece = {
  id: string;
  arabic: string;
  label: string;
};

export type FrameDef = {
  lessonId: string;
  wordId: string;
  title: string;
  /** Plain name used when review asks for this word. */
  frameName: string;
  frameTemplate: string;
  teach: string;
  task: string;
  win: string;
  kind: FrameKind;
  /** Where the new piece goes. The right side is the front. */
  gap?: "front" | "middle";
  /** First piece is the correct one. */
  pieces?: LessonPiece[];
};

export type RegisterDialect = "levantine" | "egyptian";

export type RegisterDef = {
  id: string;
  dialect: RegisterDialect;
  city: string;
  cityAr: string;
  cost: number;
};

export type PlantDef = {
  rootId: string;
  letters: string;
  gloss: string;
  phraseId: string;
  frames: FrameDef[];
  registers: RegisterDef[];
};

export const FRAMES_BEFORE_REGISTER = 2;

const LONG_A: LessonPiece[] = [
  { id: "alif", arabic: "ا", label: "long a" },
  { id: "waw", arabic: "و", label: "w" },
  { id: "ya", arabic: "ي", label: "y" },
];

const FRONT_M: LessonPiece[] = [
  { id: "mim", arabic: "م", label: "m" },
  { id: "ba", arabic: "ب", label: "b" },
];

const levantine = (rootId: string): RegisterDef => ({
  id: `levantine:${rootId}`,
  dialect: "levantine",
  city: "Damascus",
  cityAr: "دمشق",
  cost: REGISTER_COST,
});

const egyptian = (rootId: string): RegisterDef => ({
  id: `egyptian:${rootId}`,
  dialect: "egyptian",
  city: "Cairo",
  cityAr: "القاهرة",
  cost: REGISTER_COST,
});

export const PLANTS: PlantDef[] = [
  {
    rootId: "ktb",
    letters: "ك ت ب",
    gloss: "writing",
    phraseId: "phrase-i-wrote",
    registers: [levantine("ktb"), egyptian("ktb")],
    frames: [
      {
        lessonId: "hour-ktb",
        wordId: "ktb-form-1",
        title: "He wrote",
        frameName: "he wrote",
        frameTemplate: "فَعَلَ",
        teach: "k, t, and b mean writing. The first letter sits on the right.",
        task: "Tap k, then t, then b.",
        win: "He wrote is on the plant.",
        kind: "build",
      },
      {
        lessonId: "frame-ktb-doer",
        wordId: "ktb-active-participle",
        title: "The writer",
        frameName: "the writer",
        frameTemplate: "فَاعِل",
        teach: "He wrote is already on the plant. A long a in the middle names the person.",
        task: "Tap the long a into the empty space.",
        win: "The writer is on the plant.",
        kind: "insert",
        gap: "middle",
        pieces: LONG_A,
      },
      {
        lessonId: "frame-ktb-place",
        wordId: "ktb-place-noun",
        title: "The desk",
        frameName: "the desk",
        frameTemplate: "مَفْعَل",
        teach: "m at the front names the place. The front is the right side.",
        task: "Tap m into the empty space.",
        win: "The desk is on the plant.",
        kind: "insert",
        gap: "front",
        pieces: FRONT_M,
      },
      {
        lessonId: "frame-ktb-book",
        wordId: "ktb-noun-book",
        title: "The book",
        frameName: "the book",
        frameTemplate: "فِعَال",
        teach: "These same letters can name the thing you hold. Listen before you choose.",
        task: "Play the sound. Then tap the word you heard.",
        win: "The book is on the plant.",
        kind: "hear",
      },
      {
        lessonId: "frame-ktb-cause",
        wordId: "ktb-form-2",
        title: "He made someone write",
        frameName: "he made someone write",
        frameTemplate: "فَعَّلَ",
        teach: "Say the middle letter twice. The action is stronger.",
        task: "Tap the middle letter, t.",
        win: "He made someone write is on the plant.",
        kind: "strengthen",
      },
    ],
  },
  {
    rootId: "drs",
    letters: "د ر س",
    gloss: "studying",
    phraseId: "phrase-school",
    registers: [levantine("drs"), egyptian("drs")],
    frames: [
      {
        lessonId: "frame-drs-did",
        wordId: "drs-form-1",
        title: "He studied",
        frameName: "he studied",
        frameTemplate: "فَعَلَ",
        teach: "d, r, and s mean studying. The first letter sits on the right.",
        task: "Tap d, then r, then s.",
        win: "He studied is on the plant.",
        kind: "build",
      },
      {
        lessonId: "frame-drs-doer",
        wordId: "drs-active-participle",
        title: "The student",
        frameName: "the student",
        frameTemplate: "فَاعِل",
        teach: "He studied is already on the plant. A long a in the middle names the person.",
        task: "Tap the long a into the empty space.",
        win: "The student is on the plant.",
        kind: "insert",
        gap: "middle",
        pieces: LONG_A,
      },
      {
        lessonId: "frame-drs-place",
        wordId: "drs-noun-of-place",
        title: "The school",
        frameName: "the school",
        frameTemplate: "مَفْعَل",
        teach: "m at the front names the place, as it did for the desk.",
        task: "Tap m into the empty space.",
        win: "The school is on the plant.",
        kind: "insert",
        gap: "front",
        pieces: FRONT_M,
      },
      {
        lessonId: "frame-drs-cause",
        wordId: "drs-form-2",
        title: "He taught",
        frameName: "he taught",
        frameTemplate: "فَعَّلَ",
        teach: "Say the middle letter twice. The action is stronger.",
        task: "Tap the middle letter, r.",
        win: "He taught is on the plant.",
        kind: "strengthen",
      },
    ],
  },
  {
    rootId: "slm",
    letters: "س ل م",
    gloss: "peace",
    phraseId: "phrase-hello",
    registers: [levantine("slm"), egyptian("slm")],
    frames: [
      {
        lessonId: "frame-slm-did",
        wordId: "slm-form-1",
        title: "He was safe",
        frameName: "he was safe",
        frameTemplate: "فَعِلَ",
        teach: "s, l, and m mean peace. This time the middle vowel is i, not a.",
        task: "Tap s, then l, then m.",
        win: "He was safe is on the plant.",
        kind: "build",
      },
      {
        lessonId: "frame-slm-doer",
        wordId: "slm-active-participle",
        title: "Safe",
        frameName: "safe",
        frameTemplate: "فَاعِل",
        teach: "He was safe is already on the plant. A long a in the middle describes the person.",
        task: "Tap the long a into the empty space.",
        win: "Safe is on the plant.",
        kind: "insert",
        gap: "middle",
        pieces: LONG_A,
      },
      {
        lessonId: "frame-slm-cause",
        wordId: "slm-form-2",
        title: "He greeted",
        frameName: "he greeted",
        frameTemplate: "فَعَّلَ",
        teach: "Say the middle letter twice. The action is stronger.",
        task: "Tap the middle letter, l.",
        win: "He greeted is on the plant.",
        kind: "strengthen",
      },
    ],
  },
];

export type OpeningLesson = {
  kind: "letter" | "shapes" | "vowel";
  id: string;
  title: string;
  teach: string;
  task: string;
  win: string;
};

export const FIRST_HOUR: OpeningLesson[] = [
  {
    id: "hour-letter",
    title: "The letter b",
    kind: "letter",
    teach: "This letter is b, the same b as in book.",
    task: "Play the sound. Then tap b.",
    win: "b is on the plant.",
  },
  {
    id: "hour-shapes",
    title: "How b joins",
    kind: "shapes",
    teach: "b changes shape when a letter sits beside it.",
    task: "Tap each shape into its box.",
    win: "The shapes of b are on the plant.",
  },
  {
    id: "hour-vowel",
    title: "A short a",
    kind: "vowel",
    teach: "A short stroke above a letter is the vowel a.",
    task: "Tap the short a onto b.",
    win: "ba is on the plant.",
  },
];

export type SentenceWord = { id: string; arabic: string; label: string };

export type SentenceLesson = {
  kind: "sentence";
  id: string;
  title: string;
  teach: string;
  task: string;
  win: string;
  words: SentenceWord[];
  meaning: string;
};

export const SENTENCES: SentenceLesson[] = [
  {
    kind: "sentence",
    id: "hour-sentence",
    title: "He wrote the book",
    teach: "The action comes first. He wrote, then the book.",
    task: "Tap He wrote into the right box. Then tap The book.",
    win: "He wrote the book is on the plant.",
    meaning: "He wrote the book.",
    words: [
      { id: "verb", arabic: "كَتَبَ", label: "He wrote" },
      { id: "noun", arabic: "كِتَاب", label: "The book" },
    ],
  },
];

const AFTER_FRAME: Record<string, string[]> = {
  "frame-ktb-book": ["hour-sentence"],
};

export type ScriptLesson = OpeningLesson;

export type FrameLesson = {
  kind: "frame";
  id: string;
  title: string;
  teach: string;
  task: string;
  win: string;
  plant: PlantDef;
  frame: FrameDef;
};

export type LessonDef = ScriptLesson | FrameLesson | SentenceLesson;

export function visitOrder(): string[] {
  const ids = FIRST_HOUR.map((step) => step.id);
  for (const plant of PLANTS) {
    for (const frame of plant.frames) {
      ids.push(frame.lessonId);
      for (const extra of AFTER_FRAME[frame.lessonId] ?? []) ids.push(extra);
    }
  }
  return ids;
}

export type StemKind = "letter" | "shapes" | "vowel" | "frame" | "sentence";

export type StemNode = {
  id: string;
  title: string;
  kind: StemKind;
  task: string;
  arabic?: string;
  shapes?: string[];
  meaning?: string;
};

const BA_SHAPES = ["ب", "بـ", "ـبـ", "ـب"];

/** Pieces on one plant, in the order a learner grows them. */
export function stemForPlant(plant: PlantDef): StemNode[] {
  const nodes: StemNode[] = [];
  if (plant.rootId === "ktb") {
    for (const step of FIRST_HOUR) {
      nodes.push({
        id: step.id,
        title: step.title,
        kind: step.kind,
        task: step.task,
        arabic: step.kind === "letter" ? "ب" : step.kind === "vowel" ? "بَ" : undefined,
        shapes: step.kind === "shapes" ? BA_SHAPES : undefined,
      });
    }
  }
  for (const frame of plant.frames) {
    const card = cardForFrame(frame);
    nodes.push({
      id: frame.lessonId,
      title: frame.title,
      kind: "frame",
      task: frame.task,
      arabic: card?.word,
      meaning: card?.translation,
    });
    for (const extraId of AFTER_FRAME[frame.lessonId] ?? []) {
      const sentence = SENTENCES.find((item) => item.id === extraId);
      if (!sentence) continue;
      nodes.push({
        id: sentence.id,
        title: sentence.title,
        kind: "sentence",
        task: sentence.task,
        arabic: sentence.words.map((word) => word.arabic).join(" "),
        meaning: sentence.meaning,
      });
    }
  }
  return nodes;
}

export function courseWordIds(): string[] {
  return PLANTS.flatMap((p) => p.frames.map((f) => f.wordId));
}

export function isCourseWord(wordId: string): boolean {
  return courseWordIds().includes(wordId);
}

export function plantByRoot(rootId: string): PlantDef | undefined {
  return PLANTS.find((p) => p.rootId === rootId);
}

export function frameByLesson(lessonId: string): { plant: PlantDef; frame: FrameDef } | null {
  for (const plant of PLANTS) {
    const frame = plant.frames.find((f) => f.lessonId === lessonId);
    if (frame) return { plant, frame };
  }
  return null;
}

export function getLesson(lessonId: string): LessonDef | null {
  const script = FIRST_HOUR.find((s) => s.id === lessonId);
  if (script) return script;
  const sentence = SENTENCES.find((s) => s.id === lessonId);
  if (sentence) return sentence;
  const found = frameByLesson(lessonId);
  if (!found) return null;
  return {
    kind: "frame",
    id: lessonId,
    title: found.frame.title,
    teach: found.frame.teach,
    task: found.frame.task,
    win: found.frame.win,
    plant: found.plant,
    frame: found.frame,
  };
}

export function previousLessonId(lessonId: string): string | null {
  const order = visitOrder();
  const index = order.indexOf(lessonId);
  if (index <= 0) return null;
  return order[index - 1] ?? null;
}

export function cardForFrame(frame: FrameDef): WordCard | undefined {
  return getWordCard(frame.wordId);
}

export function isLessonDone(lessonId: string, completed: string[], deck: string[]): boolean {
  if (completed.includes(lessonId)) return true;
  const found = frameByLesson(lessonId);
  if (!found) return false;
  return deck.includes(found.frame.wordId);
}

export function nextLessonId(completed: string[], deck: string[]): string | null {
  for (const id of visitOrder()) {
    if (!isLessonDone(id, completed, deck)) return id;
  }
  return null;
}

export function grownFrames(plant: PlantDef, completed: string[], deck: string[]): FrameDef[] {
  return plant.frames.filter((f) => isLessonDone(f.lessonId, completed, deck));
}

export function plantIsVisible(plant: PlantDef, completed: string[], deck: string[]): boolean {
  const index = PLANTS.findIndex((p) => p.rootId === plant.rootId);
  if (index <= 0) return true;
  const prev = PLANTS[index - 1];
  if (!prev) return true;
  return grownFrames(prev, completed, deck).length >= prev.frames.length;
}

export function registerReady(plant: PlantDef, completed: string[], deck: string[]): boolean {
  return grownFrames(plant, completed, deck).length >= FRAMES_BEFORE_REGISTER;
}

export function getRegister(registerId: string): { plant: PlantDef; register: RegisterDef } | null {
  for (const plant of PLANTS) {
    const register = plant.registers.find((r) => r.id === registerId);
    if (register) return { plant, register };
  }
  return null;
}

export type TreeRow = { rootId: string; letters?: string; masteryLevel: number };

export type FsrsLite = { wordId: string; masteryLevel: number };

export function readingModeFromLevel(level: number): TashkeelMode {
  if (level >= 3) return "none";
  if (level >= 2) return "minimal";
  return "full";
}

export function readingLabel(mode: TashkeelMode): string {
  if (mode === "none") return "No vowel marks";
  if (mode === "minimal") return "Fewer vowel marks";
  return "Vowel marks on";
}

export function plantReadingLevel(rootId: string, items: FsrsLite[], trees: TreeRow[] = []): number {
  const plant = plantByRoot(rootId);
  const ids = new Set<string>();
  if (plant) {
    for (const frame of plant.frames) {
      const card = getWordCard(frame.wordId);
      if (!card) continue;
      ids.add(card.id);
      ids.add(makeWordId(card.rootId, card.patternId));
    }
  }
  const fromCards = items.filter((item) => ids.has(item.wordId)).map((item) => item.masteryLevel);
  const fromTree = trees.find((t) => t.rootId === rootId)?.masteryLevel ?? 0;
  if (fromTree > 0) return Math.min(3, fromTree);
  const best = Math.max(...fromCards, 0);
  return best <= 0 ? 1 : Math.min(3, best);
}

export function displayArabic(text: string, rootId: string, items: FsrsLite[], trees: TreeRow[] = []): string {
  return stripDiacritics(text, readingModeFromLevel(plantReadingLevel(rootId, items, trees)));
}

export type ReviewPrompt = {
  mode: "root" | "frame" | "bare";
  promptArabic: string;
  promptHint: string;
  choices: string[];
  answer: string;
  gloss: string;
};

function seededShuffle<T>(list: T[], seed: number): T[] {
  const copy = [...list];
  let state = Math.abs(seed) % 2147483646 || 1;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    state = (state * 16807) % 2147483647;
    const j = state % (i + 1);
    const left = copy[i];
    const right = copy[j];
    if (left === undefined || right === undefined) continue;
    copy[i] = right;
    copy[j] = left;
  }
  return copy;
}

export function buildReviewPrompt(
  wordId: string,
  salt: number,
  knownIds: readonly string[] = [],
): ReviewPrompt | null {
  const card = getWordCard(wordId);
  if (!card || !isCourseWord(wordId)) return null;
  const found = PLANTS.flatMap((plant) =>
    plant.frames.filter((frame) => frame.wordId === wordId).map((frame) => ({ plant, frame })),
  )[0];
  if (!found) return null;

  const modes = ["root", "frame", "bare"] as const;
  const mode = modes[Math.abs(salt) % modes.length] ?? "root";
  const known = new Set(knownIds);
  known.add(wordId);
  const sameFamily = found.plant.frames
    .filter((frame) => frame.wordId !== wordId && known.has(frame.wordId))
    .map((frame) => getWordCard(frame.wordId))
    .filter((card): card is WordCard => Boolean(card));
  const others = courseWordIds()
    .filter((id) => id !== wordId && known.has(id) && !sameFamily.some((card) => card.id === id))
    .map((id) => getWordCard(id))
    .filter((c): c is WordCard => Boolean(c));
  const distractors = seededShuffle(
    sameFamily.length >= 2 ? sameFamily : [...sameFamily, ...others],
    salt + 3,
  ).slice(0, 2);
  const choices = seededShuffle([card, ...distractors], salt + 9).map((c) => c.word);

  if (mode === "root") {
    return {
      mode,
      promptArabic: found.plant.letters,
      promptHint: "These are the three letters.",
      choices,
      answer: card.word,
      gloss: card.translation,
    };
  }
  if (mode === "frame") {
    return {
      mode,
      promptArabic: found.frame.frameTemplate,
      promptHint: "These are the vowels. The letters stay the same.",
      choices,
      answer: card.word,
      gloss: card.translation,
    };
  }
  return {
    mode,
    promptArabic: stripDiacritics(card.word, "none"),
    promptHint: "The vowel marks are gone.",
    choices,
    answer: card.word,
    gloss: card.translation,
  };
}

export function rootLetters(rootId: string): string[] {
  const plant = plantByRoot(rootId);
  if (!plant) return [];
  return plant.letters.split(" ").filter(Boolean);
}
