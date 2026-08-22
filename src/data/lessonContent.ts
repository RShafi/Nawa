import type { TashkeelMode } from "@/types/arabic";

export type PhoneticItem = {
  arabic: string;
  latin: string;
  tip: string;
};

export type PhoneticsContent = {
  kind: "phonetics";
  intro: string;
  items: PhoneticItem[];
  pairs?: { a: PhoneticItem; b: PhoneticItem; note: string }[];
};

export type QuizQuestion = {
  prompt: string;
  options: string[];
  answer: string;
  explain?: string;
};

export type QuizContent = {
  kind: "quiz";
  intro: string;
  questions: QuizQuestion[];
};

export type ReadingItem = {
  arabic: string;
  latin: string;
  gloss: string;
};

export type ReadingContent = {
  kind: "reading";
  intro: string;
  items: ReadingItem[];
  rootId?: string;
  patternId?: string;
  tashkeelMode?: TashkeelMode;
};

export type LessonBodyContent = PhoneticsContent | QuizContent | ReadingContent;

/** Per-lesson teaching material — keyed by curriculum lesson id. */
export const LESSON_CONTENT: Record<string, LessonBodyContent> = {
  /* ── Stage 0 · Consonants ───────────────────────────────────── */
  "s0-u0-l1": {
    kind: "phonetics",
    intro:
      "English has no true match for these. Think of them as consonants made deeper than “k” or “h” — tap each, then compare to the English hint.",
    items: [
      {
        arabic: "ع",
        latin: "ayn",
        tip: "Not a vowel. A voiced “squeeze” in the throat — like starting a word with effort. English has no letter for this.",
      },
      {
        arabic: "ح",
        latin: "Ḥāʾ (Haa)",
        tip: "Stronger than English “h.” Whisper “hat,” then push the breath from deeper in the throat.",
      },
      {
        arabic: "خ",
        latin: "khāʾ",
        tip: "Like German Bach or Scottish loch — a scrape at the back. Not English “k.”",
      },
      {
        arabic: "غ",
        latin: "ghayn",
        tip: "Voiced twin of خ. Roughly like a soft French “r,” but treat it as a full consonant.",
      },
    ],
  },
  "s0-u0-l2": {
    kind: "phonetics",
    intro:
      "Arabic pairs “light” and “heavy” (emphatic) consonants. The heavy one darkens nearby vowels — like “see” vs a thicker “Sough.” Tap each letter, then the pairs.",
    items: [
      {
        arabic: "س",
        latin: "sīn (seen)",
        tip: "Light s — closest to English “see.”",
      },
      {
        arabic: "ص",
        latin: "Ṣād (Saad)",
        tip: "Heavy s. Tongue lower/back; the “a” after it sounds darker than after س.",
      },
      {
        arabic: "ت",
        latin: "tāʾ",
        tip: "Light t — tip of the tongue, like “tea.”",
      },
      {
        arabic: "ط",
        latin: "Ṭāʾ (Taa)",
        tip: "Heavy t. Same tip contact, but thicker vowel color next to it.",
      },
    ],
    pairs: [
      {
        a: { arabic: "سَ", latin: "sa", tip: "light" },
        b: { arabic: "صَ", latin: "Ṣa", tip: "heavy" },
        note: "Same short-a mark (fatha). Only the consonant changes the color — like sip vs a darker “Sop.”",
      },
      {
        a: { arabic: "تَ", latin: "ta", tip: "light" },
        b: { arabic: "طَ", latin: "Ṭa", tip: "heavy" },
        note: "Emphatics pull “a” toward “ah.” Listen for the thicker second sound.",
      },
    ],
  },
  "s0-u0-l3": {
    kind: "quiz",
    intro:
      "Quick check: can you tell throat letters and emphatics apart? Use what you just heard — no trick questions.",
    questions: [
      {
        prompt: "Which letter is a deep throat sound English doesn’t write as a consonant?",
        options: ["ب (b)", "ع (ayn)", "م (m)", "ل (l)"],
        answer: "ع (ayn)",
        explain: "ع is produced in the throat — not a plain “a” vowel.",
      },
      {
        prompt: "س sounds like English “see.” Its heavy partner is…",
        options: ["ش (sh)", "ز (z)", "ص (Ṣād)", "ث (th)"],
        answer: "ص (Ṣād)",
        explain: "ص is emphatic “S”; س is light “s.”",
      },
      {
        prompt: "Which letter is closest to the ch in German “Bach”?",
        options: ["ح (Ḥāʾ)", "خ (khāʾ)", "ه (h)", "ك (k)"],
        answer: "خ (khāʾ)",
        explain: "خ scrapes at the back; ح is a deeper breathy h; ك is a plain k.",
      },
    ],
  },

  /* ── Stage 0 · Connectors ───────────────────────────────────── */
  "s0-u1-l1": {
    kind: "reading",
    intro:
      "Unlike English print, Arabic letters change shape by position. Compare the letter alone with the same letter inside a word — like a cursive “n” that looks different mid-word.",
    items: [
      {
        arabic: "ب",
        latin: "bāʾ alone",
        gloss: "Isolated form — one tooth + a dot below.",
      },
      {
        arabic: "بَاب",
        latin: "bāb",
        gloss: "“door” — first ب connects forward; shapes shift when joined.",
      },
      {
        arabic: "ك",
        latin: "kāf alone",
        gloss: "Isolated kāf.",
      },
      {
        arabic: "كِتَاب",
        latin: "kitāb",
        gloss: "“book” — ك joins into ت and ا ب. English “book” letters don’t morph like this.",
      },
    ],
  },
  "s0-u1-l2": {
    kind: "phonetics",
    intro:
      "Six letters never join to what follows (they can still join from the right). After one of them, the next letter starts “fresh” — like a space without a space. Memorize: ا د ذ ر ز و.",
    items: [
      {
        arabic: "ا",
        latin: "alif",
        tip: "Never joins left. Think of it as a “hard stop” in the chain.",
      },
      {
        arabic: "د",
        latin: "dāl",
        tip: "Breaks the chain after it — next letter won’t attach.",
      },
      {
        arabic: "ذ",
        latin: "dhāl",
        tip: "Same rule as د (plus a dot).",
      },
      {
        arabic: "ر",
        latin: "rāʾ",
        tip: "No left join — like a cursive letter that always lifts the pen.",
      },
      {
        arabic: "ز",
        latin: "zāy",
        tip: "Same as ر, with a dot.",
      },
      {
        arabic: "و",
        latin: "wāw",
        tip: "No left join. You’ll see this constantly in وَ (“and”).",
      },
    ],
  },
  "s0-u1-l3": {
    kind: "reading",
    intro:
      "Read slowly and watch the joins. In وَلَد, و does not attach to ل — that’s the non-connector rule in action.",
    items: [
      { arabic: "مِن", latin: "min", gloss: "“from” — short, fully connected." },
      { arabic: "عَلَى", latin: "ʿalā", gloss: "“on” — throat ع + joining ل." },
      { arabic: "فِي", latin: "fī", gloss: "“in” — like English “fee,” one syllable." },
      {
        arabic: "وَلَد",
        latin: "walad",
        gloss: "“boy” — و never joins to ل, so ل starts a new shape.",
      },
    ],
  },
  "s0-u1-l4": {
    kind: "quiz",
    intro: "Which letters break the connecting chain? Recall ا د ذ ر ز و.",
    questions: [
      {
        prompt: "Which letter never connects to the letter after it?",
        options: ["ب", "ت", "ر", "س"],
        answer: "ر",
        explain: "ر is one of the six non-connectors: ا د ذ ر ز و.",
      },
      {
        prompt: "In وَلَد (“boy”), why doesn’t و join to ل?",
        options: [
          "Because ل is emphatic",
          "Because و never joins left",
          "Because the word is dialect",
          "Because there is a sukun",
        ],
        answer: "Because و never joins left",
        explain: "و is a non-connector — the next letter always starts clean.",
      },
      {
        prompt: "How many non-connecting letters are there?",
        options: ["4", "5", "6", "8"],
        answer: "6",
        explain: "Exactly six: ا د ذ ر ز و.",
      },
    ],
  },

  /* ── Stage 0 · Vowels ───────────────────────────────────────── */
  "s0-u2-l1": {
    kind: "phonetics",
    intro:
      "In English, a / i / u are letters inside the word. In Arabic, short vowels are tiny marks on consonants. Same ك — three different syllables.",
    items: [
      {
        arabic: "كَ",
        latin: "ka",
        tip: "Fatha (َ) — short a, roughly like “cat.” Mark sits above.",
      },
      {
        arabic: "كِ",
        latin: "ki",
        tip: "Kasra (ِ) — short i, like “kit.” Mark sits below.",
      },
      {
        arabic: "كُ",
        latin: "ku",
        tip: "Ḍamma (ُ) — short u, like “put.” Mark sits above (looks like a tiny و).",
      },
    ],
  },
  "s0-u2-l2": {
    kind: "phonetics",
    intro:
      "Long vowels use real letters: ا = aa, و = uu, ي = ii. English “father” aa vs “fun” a is a similar length idea — tap short vs long side by side.",
    items: [
      { arabic: "كَ", latin: "ka", tip: "Short a — mark only." },
      {
        arabic: "كَا",
        latin: "kā",
        tip: "Long aa — fatha + ا. Like “kaa,” held longer than كَ.",
      },
      { arabic: "كُ", latin: "ku", tip: "Short u." },
      {
        arabic: "كُو",
        latin: "kū",
        tip: "Long uu — ḍamma + و. Like “coo.”",
      },
      { arabic: "كِ", latin: "ki", tip: "Short i." },
      {
        arabic: "كِي",
        latin: "kī",
        tip: "Long ii — kasra + ي. Like “key.”",
      },
    ],
  },
  "s0-u2-l3": {
    kind: "reading",
    intro:
      "Read with full vowels first. Then fade marks with the header control (Full → Minimal → None). Real Arabic often looks like كتب with no marks — you’re training for that.",
    items: [
      {
        arabic: "كَتَبَ",
        latin: "kataba",
        gloss: "“he wrote” — three short a’s on ك ت ب.",
      },
      {
        arabic: "دَرَسَ",
        latin: "darasa",
        gloss: "“he studied” — same rhythm as kataba.",
      },
      {
        arabic: "كِتَاب",
        latin: "kitāb",
        gloss: "“book” — short i, then long ā (ا).",
      },
    ],
    rootId: "ktb",
    patternId: "verb-i",
    tashkeelMode: "full",
  },
  "s0-u2-l4": {
    kind: "quiz",
    intro: "Short mark vs long letter — quick checkpoint.",
    questions: [
      {
        prompt: "كَ uses which vowel type?",
        options: ["Short a (fatha)", "Long aa (alif)", "Short u", "No vowel"],
        answer: "Short a (fatha)",
        explain: "Only a mark — no ا و ي length letter.",
      },
      {
        prompt: "What makes كَا longer than كَ?",
        options: ["A kasra", "The letter ا", "A shadda", "Nunation"],
        answer: "The letter ا",
        explain: "Long aa = short-a mark + alif.",
      },
      {
        prompt: "Ḍamma (ُ) is the short vowel for…",
        options: ["a", "i", "u", "e"],
        answer: "u",
        explain: "Fatha = a, kasra = i, ḍamma = u. Arabic has no short “e” mark.",
      },
    ],
  },

  /* ── Stage 1 quizzes / reading ──────────────────────────────── */
  "s1-u1-l3": {
    kind: "quiz",
    intro:
      "Form I past is the “he ___-ed” shape: كَتَبَ = he wrote. Match each gloss — same pattern, different roots.",
    questions: [
      {
        prompt: "كَتَبَ (k-t-b) means…",
        options: ["he studied", "he wrote", "he spoke", "book"],
        answer: "he wrote",
        explain: "Root “writing” + Form I past → kataba.",
      },
      {
        prompt: "دَرَسَ (d-r-s) means…",
        options: ["he wrote", "office", "he studied", "peace"],
        answer: "he studied",
        explain: "Same فَعَلَ template on the “study” root.",
      },
      {
        prompt: "On the placeholder root ف ع ل, Form I past is written…",
        options: ["فَعَلَ", "فَعَّلَ", "اِسْتَفْعَلَ", "مَفْعَل"],
        answer: "فَعَلَ",
        explain: "فَعَلَ is the Form I past skeleton; فَعَّلَ is Form II (with shadda).",
      },
    ],
  },
  "s1-u2-l1": {
    kind: "reading",
    intro:
      "Past Form I feels finished — like English “wrote / studied / knew.” Lock the sound of this shape before present stems show up.",
    items: [
      { arabic: "كَتَبَ", latin: "kataba", gloss: "he wrote (past) — compare English “wrote.”" },
      { arabic: "دَرَسَ", latin: "darasa", gloss: "he studied (past)." },
      { arabic: "عَلِمَ", latin: "ʿalima", gloss: "he knew (past) — throat ع on the knowledge root." },
    ],
    rootId: "ktb",
    patternId: "verb-i",
  },
  "s1-u2-l3": {
    kind: "quiz",
    intro: "Spot Form I past vs lookalikes (nouns, Form II).",
    questions: [
      {
        prompt: "Which is Form I past “he wrote”?",
        options: ["كِتَاب (book)", "كَتَبَ", "مَكْتَب (office)", "كَتَّبَ (Form II)"],
        answer: "كَتَبَ",
        explain: "كَتَبَ = Form I past. كَتَّبَ has a shadda (Form II). كِتَاب / مَكْتَب are nouns.",
      },
      {
        prompt: "عَلِمَ is built on which root?",
        options: ["k-t-b (write)", "d-r-s (study)", "ʿ-l-m (know)", "s-l-m (peace)"],
        answer: "ʿ-l-m (know)",
        explain: "ع ل م — knowledge / knowing.",
      },
    ],
  },
  "s1-u2-l4": {
    kind: "reading",
    intro:
      "Same root د-ر-س: verb “he studied” vs place noun “school.” Hear both, then fade vowels — you’ll still see د ر س in both.",
    items: [
      { arabic: "دَرَسَ", latin: "darasa", gloss: "he studied (verb)." },
      {
        arabic: "مَدْرَسَة",
        latin: "madrasa",
        gloss: "school (place noun) — related to “madrasah” in English.",
      },
    ],
    rootId: "drs",
    patternId: "verb-i",
    tashkeelMode: "minimal",
  },
  "s1-u3-l3": {
    kind: "quiz",
    intro:
      "Same root ك-ت-ب, different jobs: مَكْتُوب ≈ “written / a letter,” مَكْتَب ≈ “office / desk.”",
    questions: [
      {
        prompt: "مَكْتُوب is closest to…",
        options: ["office", "he wrote", "written / letter", "teacher"],
        answer: "written / letter",
        explain: "Passive participle “done” — what is written.",
      },
      {
        prompt: "مَكْتَب is…",
        options: ["he wrote", "office / desk", "book", "he dictated"],
        answer: "office / desk",
        explain: "Place noun — where writing happens. Compare English “desk.”",
      },
    ],
  },

  /* ── Stage 2 ────────────────────────────────────────────────── */
  "s2-u0-l4": {
    kind: "quiz",
    intro:
      "Form II adds a shadda (ّ) and often means “make / intensify.” كَتَبَ = he wrote; كَتَّبَ ≈ he made (someone) write.",
    questions: [
      {
        prompt: "كَتَّبَ (Form II) is closer to…",
        options: ["he wrote", "he made write / dictated", "book", "office"],
        answer: "he made write / dictated",
        explain: "Shadda on the middle letter → causative / intensive flavor.",
      },
      {
        prompt: "The shadda (ّ) in Form II usually signals…",
        options: ["a long vowel", "a doubled consonant / intensity", "past tense only", "dialect"],
        answer: "a doubled consonant / intensity",
        explain: "Shadda doubles a consonant — you’ll see/hear it as a “held” middle sound.",
      },
    ],
  },
  "s2-u1-l3": {
    kind: "quiz",
    intro:
      "Form X often starts with استـ and means “seek / request.” Think “ask for knowledge” → اِسْتَعْلَمَ.",
    questions: [
      {
        prompt: "Form X often begins with…",
        options: ["مَ", "ال", "استـ", "يَ"],
        answer: "استـ",
        explain: "The استـ chunk is your Form X flag.",
      },
      {
        prompt: "اِسْتَعْلَمَ (ʿ-l-m) is about…",
        options: ["writing a book", "inquiring / seeking knowledge", "greeting", "school"],
        answer: "inquiring / seeking knowledge",
        explain: "Seek + knowledge root → inquire.",
      },
    ],
  },
  "s2-u2-l3": {
    kind: "quiz",
    intro: "Place and noun patterns from roots you know — school vs book.",
    questions: [
      {
        prompt: "مَدْرَسَة (from d-r-s) is…",
        options: ["he studied", "school", "teacher", "lesson"],
        answer: "school",
        explain: "Place of studying — loaned into English as “madrasah.”",
      },
      {
        prompt: "كِتَاب (from k-t-b) is…",
        options: ["he wrote", "office", "book", "written"],
        answer: "book",
        explain: "Noun pattern فِعَال — the thing written / a book.",
      },
    ],
  },
  "s2-u3-l1": {
    kind: "reading",
    intro:
      "Start on Full, then switch the header to Minimal. Keep recognizing كَتَبَ even with fewer marks — like reading “wrt” and still knowing “wrote.”",
    items: [{ arabic: "كَتَبَ", latin: "kataba", gloss: "he wrote — your Form I anchor." }],
    rootId: "ktb",
    patternId: "verb-i",
    tashkeelMode: "minimal",
  },
  "s2-u3-l2": {
    kind: "reading",
    intro:
      "Bare-script challenge. Turn Full on only if stuck. Spot استـ + ع ل م even without vowels.",
    items: [
      {
        arabic: "اِسْتَعْلَمَ",
        latin: "istaʿlama",
        gloss: "he inquired — Form X on the knowledge root.",
      },
    ],
    rootId: "elm",
    patternId: "verb-x",
    tashkeelMode: "none",
  },
  "s2-u3-l3": {
    kind: "quiz",
    intro: "Without vowels, context + root consonants do the work — like English “rd” → “read/road” from context.",
    questions: [
      {
        prompt: "In a lesson about writing, bare كتب is most likely…",
        options: ["kataba (he wrote)", "darasa (he studied)", "salām (peace)", "kalima (word)"],
        answer: "kataba (he wrote)",
        explain: "ك ت ب = writing root; Form I past is the default beginner reading.",
      },
    ],
  },

  /* ── Stage 3 ────────────────────────────────────────────────── */
  "s3-u0-l2": {
    kind: "quiz",
    intro:
      "MSA is the “news / formal” register; dialects are café speech. Same greeting idea — different clothes.",
    questions: [
      {
        prompt: "السَّلَامُ عَلَيْكُمْ is typical of…",
        options: [
          "Only Egyptian street talk",
          "MSA / formal greeting",
          "Only Levantine slang",
          "A verb form",
        ],
        answer: "MSA / formal greeting",
        explain: "Classic formal “peace be upon you” — used widely, taught as MSA.",
      },
      {
        prompt: "مَرْحَبا is most at home in…",
        options: [
          "MSA news only",
          "Levantine everyday speech",
          "Classical poetry only",
          "Form X verbs",
        ],
        answer: "Levantine everyday speech",
        explain: "Marḥaba is the friendly Levantine hello — like “hi” vs “good afternoon.”",
      },
    ],
  },
  "s3-u0-l3": {
    kind: "phonetics",
    intro:
      "Three hello “flavors.” Then open the dialect cards and hear the full phrases side by side — like Hello / Hi / Hey.",
    items: [
      {
        arabic: "سَلَام",
        latin: "salām",
        tip: "“Peace” — core of the MSA greeting السَّلَامُ عَلَيْكُمْ.",
      },
      {
        arabic: "مَرْحَبا",
        latin: "marḥaba",
        tip: "Common Levantine hello — casual and warm.",
      },
      {
        arabic: "أَهْلاً",
        latin: "ahlan",
        tip: "Common Egyptian hello (also “welcome”). Short and friendly.",
      },
    ],
  },
  "s3-u1-l3": {
    kind: "quiz",
    intro: "Café speech drops some MSA endings and picks dialect verbs. Think formal letter vs texting a friend.",
    questions: [
      {
        prompt: "For casual “I wrote,” dialects often drop the final MSA “u” of كَتَبْتُ.",
        options: ["True", "False"],
        answer: "True",
        explain: "Dialects usually simplify endings — MSA case/mood vowels fade in speech.",
      },
      {
        prompt: "Egyptian “speak / talk” is closest to…",
        options: ["حكي (Levantine-ish)", "اتكلم (Egyptian)", "kataba", "madrasa"],
        answer: "اتكلم (Egyptian)",
        explain: "اتكلم is the everyday Egyptian “talk”; Levantine often uses حكى / يحكي.",
      },
    ],
  },
  "s3-u1-l4": {
    kind: "reading",
    intro:
      "Café vocabulary. Hear each line, then fade vowels — you’ll still order قهوة off a menu without marks.",
    items: [
      {
        arabic: "قَهْوَة",
        latin: "qahwa",
        gloss: "coffee — related to English “coffee” / “café.”",
      },
      {
        arabic: "مِنْ فَضْلِك",
        latin: "min faḍlik",
        gloss: "“please” (to a man, MSA-ish polite).",
      },
    ],
  },
  "s3-u2-l3": {
    kind: "quiz",
    intro: "City survival — school noun vs street “I know.”",
    questions: [
      {
        prompt: "مَدْرَسَة means…",
        options: ["office", "school", "book", "hello"],
        answer: "school",
        explain: "Same word family as English “madrasah.”",
      },
      {
        prompt: "Levantine “I know” is often…",
        options: ["katabtu", "baʿref", "istaktaba", "maktab"],
        answer: "baʿref",
        explain: "Street knowledge verb — not the MSA dictionary form أعْلَمُ.",
      },
    ],
  },
  "s3-u3-l2": {
    kind: "reading",
    intro:
      "Headline style: fewer vowel marks. Read عِلْم / مَعْلُوم like chyron text — meaning from root ع ل م.",
    items: [
      { arabic: "عِلْم", latin: "ʿilm", gloss: "knowledge / science — root of “alim.”" },
      {
        arabic: "مَعْلُوم",
        latin: "maʿlūm",
        gloss: "known / information — related to “maalum.”",
      },
    ],
    rootId: "elm",
    patternId: "noun-fi3al",
    tashkeelMode: "minimal",
  },
  "s3-u3-l3": {
    kind: "quiz",
    intro: "Register switch: desk vs street. Pick what fits the scene.",
    questions: [
      {
        prompt: "A TV news opener is most likely to use…",
        options: [
          "Only Egyptian street slang",
          "MSA-style phrasing",
          "Form II shadda only",
          "No Arabic",
        ],
        answer: "MSA-style phrasing",
        explain: "Broadcast Arabic leans MSA — clear, formal, shared across regions.",
      },
      {
        prompt: "Ordering coffee with a friend, you’re more likely to use…",
        options: [
          "Full classical case endings",
          "Dialect-friendly greetings",
          "Only Form X",
          "Hebrew",
        ],
        answer: "Dialect-friendly greetings",
        explain: "Friends → dialect. News desk → MSA.",
      },
    ],
  },
};

export function getLessonContent(lessonId: string): LessonBodyContent | undefined {
  return LESSON_CONTENT[lessonId];
}
