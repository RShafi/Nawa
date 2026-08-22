export type ForgePuzzle = {
  id: string;
  rootId: string;
  /** Three consonants as separate glyphs for the arena */
  consonants: [string, string, string];
  /** Display hyphenated root e.g. ك-ت-ب */
  letters: string;
  targetMeaning: string;
  correctPattern: string;
  options: string[];
};

/** Ten Morph Forge rounds — meaning cue + pattern pick. */
export const FORGE_PUZZLES: ForgePuzzle[] = [
  {
    id: "f1",
    rootId: "ktb",
    consonants: ["ك", "ت", "ب"],
    letters: "ك-ت-ب",
    targetMeaning: "The place where you write (office / desk)",
    correctPattern: "مَفْعَل",
    options: ["مَفْعَل", "فَاعِل", "فَعَّلَ", "فَعَلَ", "مَفْعُول", "فِعَال"],
  },
  {
    id: "f2",
    rootId: "ktb",
    consonants: ["ك", "ت", "ب"],
    letters: "ك-ت-ب",
    targetMeaning: "He wrote (basic past)",
    correctPattern: "فَعَلَ",
    options: ["فَعَلَ", "فَعَّلَ", "اِسْتَفْعَلَ", "مَفْعَل", "فَاعِل", "مَفْعُول"],
  },
  {
    id: "f3",
    rootId: "ktb",
    consonants: ["ك", "ت", "ب"],
    letters: "ك-ت-ب",
    targetMeaning: "He made someone write / dictated",
    correctPattern: "فَعَّلَ",
    options: ["فَعَّلَ", "فَعَلَ", "مَفْعَل", "فِعَال", "فَاعِل", "اِسْتَفْعَلَ"],
  },
  {
    id: "f4",
    rootId: "ktb",
    consonants: ["ك", "ت", "ب"],
    letters: "ك-ت-ب",
    targetMeaning: "Something written / a letter",
    correctPattern: "مَفْعُول",
    options: ["مَفْعُول", "مَفْعَل", "فَاعِل", "فَعَلَ", "فِعَال", "فَعَّلَ"],
  },
  {
    id: "f5",
    rootId: "ktb",
    consonants: ["ك", "ت", "ب"],
    letters: "ك-ت-ب",
    targetMeaning: "A book",
    correctPattern: "فِعَال",
    options: ["فِعَال", "مَفْعَل", "فَعَلَ", "فَاعِل", "مَفْعُول", "اِسْتَفْعَلَ"],
  },
  {
    id: "f6",
    rootId: "drs",
    consonants: ["د", "ر", "س"],
    letters: "د-ر-س",
    targetMeaning: "The place of studying (school)",
    correctPattern: "مَفْعَلَة",
    options: ["مَفْعَلَة", "فَعَلَ", "فَاعِل", "مَفْعُول", "فَعَّلَ", "فِعَال"],
  },
  {
    id: "f7",
    rootId: "drs",
    consonants: ["د", "ر", "س"],
    letters: "د-ر-س",
    targetMeaning: "He studied (basic past)",
    correctPattern: "فَعَلَ",
    options: ["فَعَلَ", "مَفْعَلَة", "فَعَّلَ", "اِسْتَفْعَلَ", "فَاعِل", "مَفْعُول"],
  },
  {
    id: "f8",
    rootId: "elm",
    consonants: ["ع", "ل", "م"],
    letters: "ع-ل-م",
    targetMeaning: "He sought knowledge / inquired",
    correctPattern: "اِسْتَفْعَلَ",
    options: ["اِسْتَفْعَلَ", "فَعَلَ", "فَعَّلَ", "مَفْعَل", "فَاعِل", "فِعَال"],
  },
  {
    id: "f9",
    rootId: "elm",
    consonants: ["ع", "ل", "م"],
    letters: "ع-ل-م",
    targetMeaning: "He taught (caused to know)",
    correctPattern: "فَعَّلَ",
    options: ["فَعَّلَ", "فَعَلَ", "اِسْتَفْعَلَ", "مَفْعُول", "فَاعِل", "مَفْعَل"],
  },
  {
    id: "f10",
    rootId: "klm",
    consonants: ["ك", "ل", "م"],
    letters: "ك-ل-م",
    targetMeaning: "He spoke to someone",
    correctPattern: "فَعَّلَ",
    options: ["فَعَّلَ", "فَعَلَ", "مَفْعَل", "فِعَال", "اِسْتَفْعَلَ", "مَفْعُول"],
  },
];
