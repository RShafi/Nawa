import type { TashkeelMode } from "@/types/arabic";

export type PhoneticItem = {
  arabic: string;
  latin: string;
  tip: string;
};

export type PhoneticsContent = {
  kind: "phonetics";
  /** UI flavor — changes title + layout emphasis */
  mode: "sound-lab" | "pair-duel" | "vowel-lab" | "hello-tasting";
  title: string;
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
  mode: "speed-check" | "spot-the-word" | "scene-pick" | "true-false";
  title: string;
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
  mode: "shape-compare" | "join-hunt" | "fade-challenge" | "menu-read" | "headline";
  title: string;
  intro: string;
  items: ReadingItem[];
  rootId?: string;
  patternId?: string;
  tashkeelMode?: TashkeelMode;
};

export type LessonBodyContent = PhoneticsContent | QuizContent | ReadingContent;

export const LESSON_CONTENT: Record<string, LessonBodyContent> = {
  /* ── Stage 0 · Consonants ───────────────────────────────────── */
  "s0-u0-l1": {
    kind: "phonetics",
    mode: "sound-lab",
    title: "Sound lab: throat letters",
    intro:
      "These four letters are made deeper in the throat than anything in English. Tap each one, listen, and read the tip — you’re training your ear, not memorizing a chart.",
    items: [
      {
        arabic: "عَ",
        latin: "ʿa",
        tip: "Not a vowel. A voiced squeeze in the throat — English has no letter for this.",
      },
      {
        arabic: "حَ",
        latin: "ḥa",
        tip: "Stronger than English “h.” Push the breath from deeper than “hat.”",
      },
      {
        arabic: "خَ",
        latin: "kha",
        tip: "Like German Bach or Scottish loch — a scrape at the back, not a plain “k.”",
      },
      {
        arabic: "غَ",
        latin: "gha",
        tip: "The voiced twin of خ. Treat it as a real consonant, not a vowel.",
      },
    ],
  },
  "s0-u0-l2": {
    kind: "phonetics",
    mode: "pair-duel",
    title: "Pair duel: light vs heavy",
    intro:
      "Arabic has “light” and “heavy” partners. The heavy letter makes nearby vowels sound darker. Tap every letter, then tap both sides of each pair.",
    items: [
      { arabic: "سَ", latin: "sa", tip: "Light s — closest to English “see.”" },
      {
        arabic: "صَ",
        latin: "ṣa",
        tip: "Heavy ṣād. Same short-a mark as سَ — the consonant makes the vowel darker.",
      },
      { arabic: "تَ", latin: "ta", tip: "Light t — like the t in “tea.”" },
      {
        arabic: "طَ",
        latin: "ṭa",
        tip: "Heavy ṭāʾ. Same tongue tip as تَ, darker vowel color.",
      },
    ],
    pairs: [
      {
        a: { arabic: "سَ", latin: "sa", tip: "light" },
        b: { arabic: "صَ", latin: "ṣa", tip: "heavy" },
        note: "Same short-a. Only ص vs س changes the color.",
      },
      {
        a: { arabic: "تَ", latin: "ta", tip: "light" },
        b: { arabic: "طَ", latin: "ṭa", tip: "heavy" },
        note: "Listen for the thicker طَ compared to تَ.",
      },
    ],
  },
  "s0-u0-l3": {
    kind: "quiz",
    mode: "speed-check",
    title: "Ear check",
    intro: "Quick questions on what you just heard. No tricks — pick the letter that matches.",
    questions: [
      {
        prompt: "Which letter is a deep throat sound (not a plain English letter)?",
        options: ["ب (b)", "ع (ayn)", "م (m)", "ل (l)"],
        answer: "ع (ayn)",
        explain: "ع is made in the throat — it is not the vowel “a.”",
      },
      {
        prompt: "س is like English “see.” Which letter is its heavy partner?",
        options: ["ش (sh)", "ز (z)", "ص (Saad)", "ث (th)"],
        answer: "ص (Saad)",
        explain: "ص is the heavy “S”; س is the light “s.”",
      },
      {
        prompt: "Which letter is closest to the ch in German “Bach”?",
        options: ["ح (Haa)", "خ (khaa)", "ه (h)", "ك (k)"],
        answer: "خ (khaa)",
        explain: "خ scrapes at the back of the mouth.",
      },
    ],
  },

  /* ── Stage 0 · Connectors ───────────────────────────────────── */
  "s0-u1-l1": {
    kind: "reading",
    mode: "shape-compare",
    title: "Same letter, new outfit",
    intro:
      "In print English, “n” looks the same everywhere. In Arabic, a letter’s shape changes when it joins neighbors. Compare each letter alone with the same letter inside a word.",
    items: [
      { arabic: "ب", latin: "baa alone", gloss: "The letter by itself." },
      {
        arabic: "بَاب",
        latin: "baab",
        gloss: "“door” — the first ب stretches to join the next letter.",
      },
      { arabic: "ك", latin: "kaaf alone", gloss: "The letter by itself." },
      {
        arabic: "كِتَاب",
        latin: "kitaab",
        gloss: "“book” — ك joins into the rest of the word.",
      },
    ],
  },
  "s0-u1-l2": {
    kind: "phonetics",
    mode: "sound-lab",
    title: "The six “pen-lift” letters",
    intro:
      "Six letters never connect to what comes after them. After one of these, the next letter starts fresh — like lifting the pen in cursive. Memorize: ا د ذ ر ز و.",
    items: [
      { arabic: "ا", latin: "alif", tip: "Never joins to the left." },
      { arabic: "د", latin: "daal", tip: "Breaks the chain after it." },
      { arabic: "ذ", latin: "dhaal", tip: "Same rule as د (plus a dot)." },
      { arabic: "ر", latin: "raa", tip: "No left join." },
      { arabic: "ز", latin: "zaay", tip: "Same as ر, with a dot." },
      { arabic: "و", latin: "waaw", tip: "No left join — you’ll see this in وَ (“and”)." },
    ],
  },
  "s0-u1-l3": {
    kind: "reading",
    mode: "join-hunt",
    title: "Join hunt",
    intro:
      "Read these short words and watch the joins. In وَلَد, و does not attach to ل — that’s a pen-lift letter doing its job.",
    items: [
      { arabic: "مِن", latin: "min", gloss: "“from”" },
      { arabic: "عَلَى", latin: "alaa", gloss: "“on”" },
      { arabic: "فِي", latin: "fii", gloss: "“in”" },
      {
        arabic: "وَلَد",
        latin: "walad",
        gloss: "“boy” — و never joins to ل.",
      },
    ],
  },
  "s0-u1-l4": {
    kind: "quiz",
    mode: "speed-check",
    title: "Connector quiz",
    intro: "Which letters break the joining chain? Remember: ا د ذ ر ز و.",
    questions: [
      {
        prompt: "Which letter never connects to the letter after it?",
        options: ["ب", "ت", "ر", "س"],
        answer: "ر",
        explain: "ر is one of the six: ا د ذ ر ز و.",
      },
      {
        prompt: "In وَلَد (“boy”), why doesn’t و join to ل?",
        options: [
          "Because ل is heavy",
          "Because و never joins left",
          "Because the word is dialect",
          "Because of a missing vowel",
        ],
        answer: "Because و never joins left",
        explain: "و is a pen-lift letter — the next letter always starts clean.",
      },
      {
        prompt: "How many pen-lift (non-connecting) letters are there?",
        options: ["4", "5", "6", "8"],
        answer: "6",
        explain: "Exactly six: ا د ذ ر ز و.",
      },
    ],
  },

  /* ── Stage 0 · Vowels ───────────────────────────────────────── */
  "s0-u2-l1": {
    kind: "phonetics",
    mode: "vowel-lab",
    title: "Vowel lab: short marks",
    intro:
      "In English, a / i / u are letters inside the word. In Arabic, short vowels are tiny marks on consonants. Same ك — three different sounds. Tap each.",
    items: [
      { arabic: "كَ", latin: "ka", tip: "Fatha — short a, roughly like “cat.” Mark sits above." },
      { arabic: "كِ", latin: "ki", tip: "Kasra — short i, like “kit.” Mark sits below." },
      {
        arabic: "كُ",
        latin: "ku",
        tip: "Damma — short u, like “put.” Mark sits above (looks a bit like و).",
      },
    ],
  },
  "s0-u2-l2": {
    kind: "phonetics",
    mode: "pair-duel",
    title: "Short vs long",
    intro:
      "Long vowels use real letters: ا (aa), و (uu), ي (ii). Tap short, then long — hold the long one a beat longer in your mind.",
    items: [
      { arabic: "كَ", latin: "ka", tip: "Short a — mark only." },
      { arabic: "كَا", latin: "kaa", tip: "Long aa — mark + ا. Held longer than كَ." },
      { arabic: "كُ", latin: "ku", tip: "Short u." },
      { arabic: "كُو", latin: "kuu", tip: "Long uu — mark + و. Like “coo.”" },
      { arabic: "كِ", latin: "ki", tip: "Short i." },
      { arabic: "كِي", latin: "kii", tip: "Long ii — mark + ي. Like “key.”" },
    ],
  },
  "s0-u2-l3": {
    kind: "reading",
    mode: "fade-challenge",
    title: "Fade the marks",
    intro:
      "Hear each word with full vowels. Then use the header control (Full → Minimal → None). Real Arabic often hides the marks — you’re practicing for that.",
    items: [
      { arabic: "كَتَبَ", latin: "kataba", gloss: "he wrote" },
      { arabic: "دَرَسَ", latin: "darasa", gloss: "he studied" },
      { arabic: "كِتَاب", latin: "kitaab", gloss: "book" },
    ],
    rootId: "ktb",
    patternId: "verb-i",
    tashkeelMode: "full",
  },
  "s0-u2-l4": {
    kind: "quiz",
    mode: "speed-check",
    title: "Mark or letter?",
    intro: "Is the vowel a tiny mark, or a full length letter?",
    questions: [
      {
        prompt: "كَ has which kind of vowel?",
        options: ["Short a (fatha mark)", "Long aa (letter ا)", "Short u", "No vowel"],
        answer: "Short a (fatha mark)",
        explain: "Only a mark — no ا و ي length letter.",
      },
      {
        prompt: "What makes كَا longer than كَ?",
        options: ["A kasra mark", "The letter ا", "A shadda", "A dialect change"],
        answer: "The letter ا",
        explain: "Long aa = short-a mark + the letter alif.",
      },
      {
        prompt: "Damma (ُ) is the short vowel for…",
        options: ["a", "i", "u", "e"],
        answer: "u",
        explain: "Fatha = a, kasra = i, damma = u.",
      },
    ],
  },

  /* ── Stage 1 ────────────────────────────────────────────────── */
  "s1-u1-l3": {
    kind: "quiz",
    mode: "spot-the-word",
    title: "Same mold, different roots",
    intro:
      "You just practiced a basic past pattern (like “he wrote”). Now match each word to its English meaning. Same mold — different three-letter roots.",
    questions: [
      {
        prompt: "كَتَبَ means…",
        options: ["he studied", "he wrote", "he spoke", "book"],
        answer: "he wrote",
        explain: "Root k-t-b (writing) in the basic past mold.",
      },
      {
        prompt: "دَرَسَ means…",
        options: ["he wrote", "office", "he studied", "peace"],
        answer: "he studied",
        explain: "Same past mold on the study root d-r-s.",
      },
      {
        prompt: "Teachers write the basic past mold with placeholder letters as…",
        options: ["فَعَلَ", "فَعَّلَ", "اِسْتَفْعَلَ", "مَفْعَل"],
        answer: "فَعَلَ",
        explain: "فَعَلَ is the simple past skeleton. فَعَّلَ (with shadda) is a different mold.",
      },
    ],
  },
  "s1-u2-l1": {
    kind: "reading",
    mode: "shape-compare",
    title: "Past tense feel",
    intro:
      "These past verbs feel finished — like English “wrote / studied / knew.” Tap each, hear it, and notice they share a similar rhythm.",
    items: [
      { arabic: "كَتَبَ", latin: "kataba", gloss: "he wrote" },
      { arabic: "دَرَسَ", latin: "darasa", gloss: "he studied" },
      { arabic: "عَلِمَ", latin: "alima", gloss: "he knew" },
    ],
    rootId: "ktb",
    patternId: "verb-i",
  },
  "s1-u2-l3": {
    kind: "quiz",
    mode: "spot-the-word",
    title: "Pick the past verb",
    intro: "One option is the simple past “he wrote.” The others are nouns or a different mold.",
    questions: [
      {
        prompt: "Which word means “he wrote” (simple past)?",
        options: ["كِتَاب (book)", "كَتَبَ", "مَكْتَب (office)", "كَتَّبَ (different mold)"],
        answer: "كَتَبَ",
        explain: "كَتَبَ is simple past. كَتَّبَ has a doubled letter (another mold).",
      },
      {
        prompt: "عَلِمَ is built on which three-letter root?",
        options: ["k-t-b (write)", "d-r-s (study)", "ʿ-l-m (know)", "s-l-m (peace)"],
        answer: "ʿ-l-m (know)",
        explain: "ع ل م — the knowledge family.",
      },
    ],
  },
  "s1-u2-l4": {
    kind: "reading",
    mode: "fade-challenge",
    title: "One root, two jobs",
    intro:
      "Same three letters د ر س: a verb (“he studied”) and a place word (“school”). Hear both, then fade the vowel marks in the header.",
    items: [
      { arabic: "دَرَسَ", latin: "darasa", gloss: "he studied (verb)" },
      {
        arabic: "مَدْرَسَة",
        latin: "madrasa",
        gloss: "school — related to English “madrasah”",
      },
    ],
    rootId: "drs",
    patternId: "verb-i",
    tashkeelMode: "minimal",
  },
  "s1-u3-l3": {
    kind: "quiz",
    mode: "scene-pick",
    title: "Which job fits?",
    intro:
      "Same writing root, different jobs. مَكْتُوب ≈ something written / a letter. مَكْتَب ≈ office / desk.",
    questions: [
      {
        prompt: "You find مَكْتُوب on an envelope. Best meaning?",
        options: ["office", "he wrote", "written / a letter", "teacher"],
        answer: "written / a letter",
        explain: "This pattern often means “the thing that was written.”",
      },
      {
        prompt: "You sit at a مَكْتَب. Best meaning?",
        options: ["he wrote", "office / desk", "book", "he dictated"],
        answer: "office / desk",
        explain: "This pattern often names the place of the action.",
      },
    ],
  },

  /* ── Stage 2 ────────────────────────────────────────────────── */
  "s2-u0-l4": {
    kind: "quiz",
    mode: "spot-the-word",
    title: "Spot the doubled letter",
    intro:
      "A shadda (ّ) doubles a consonant. It often means “make someone do” or “do intensely.” كَتَبَ = he wrote; كَتَّبَ ≈ he made (someone) write.",
    questions: [
      {
        prompt: "كَتَّبَ is closest to…",
        options: ["he wrote", "he made write / dictated", "book", "office"],
        answer: "he made write / dictated",
        explain: "The doubled ت changes the meaning toward “cause / intensify.”",
      },
      {
        prompt: "What does the shadda (ّ) usually mark?",
        options: ["a long vowel", "a doubled consonant", "past tense only", "dialect only"],
        answer: "a doubled consonant",
        explain: "You’ll hear/feel a held middle sound.",
      },
    ],
  },
  "s2-u1-l3": {
    kind: "quiz",
    mode: "speed-check",
    title: "Find the “seek” prefix",
    intro:
      "One common mold starts with استـ and often means “seek / ask for.” Example: seek knowledge → inquire.",
    questions: [
      {
        prompt: "Which chunk often starts this “seek” mold?",
        options: ["مَ", "ال", "استـ", "يَ"],
        answer: "استـ",
        explain: "Spot استـ at the front — that’s your clue.",
      },
      {
        prompt: "اِسْتَعْلَمَ (knowledge root) is about…",
        options: ["writing a book", "asking / seeking knowledge", "greeting", "school"],
        answer: "asking / seeking knowledge",
        explain: "“Seek” + knowledge root → inquire.",
      },
    ],
  },
  "s2-u2-l3": {
    kind: "quiz",
    mode: "scene-pick",
    title: "School or book?",
    intro: "Place-words and thing-words from roots you know.",
    questions: [
      {
        prompt: "A child walks into a مَدْرَسَة. That word means…",
        options: ["he studied", "school", "teacher", "lesson"],
        answer: "school",
        explain: "Place of studying — English borrowed “madrasah.”",
      },
      {
        prompt: "You buy a كِتَاب. That word means…",
        options: ["he wrote", "office", "book", "written"],
        answer: "book",
        explain: "A thing from the writing root.",
      },
    ],
  },
  "s2-u3-l1": {
    kind: "reading",
    mode: "fade-challenge",
    title: "Keep it when marks fade",
    intro:
      "Start with Full vowels, then switch the header to Minimal. Can you still recognize كَتَبَ?",
    items: [{ arabic: "كَتَبَ", latin: "kataba", gloss: "he wrote" }],
    rootId: "ktb",
    patternId: "verb-i",
    tashkeelMode: "minimal",
  },
  "s2-u3-l2": {
    kind: "reading",
    mode: "fade-challenge",
    title: "Bare script challenge",
    intro:
      "Try Minimal or None in the header. Spot استـ and the knowledge letters ع ل م even without marks.",
    items: [
      {
        arabic: "اِسْتَعْلَمَ",
        latin: "istaalama",
        gloss: "he inquired / asked",
      },
    ],
    rootId: "elm",
    patternId: "verb-x",
    tashkeelMode: "none",
  },
  "s2-u3-l3": {
    kind: "quiz",
    mode: "scene-pick",
    title: "Guess from context",
    intro:
      "Without vowels, context helps — like English “rd” could be “read” or “road” depending on the sentence.",
    questions: [
      {
        prompt: "In a lesson about writing, bare كتب is most likely…",
        options: ["kataba (he wrote)", "darasa (he studied)", "salaam (peace)", "kalima (word)"],
        answer: "kataba (he wrote)",
        explain: "ك ت ب is the writing root; simple past is the usual beginner reading.",
      },
    ],
  },

  /* ── Stage 3 ────────────────────────────────────────────────── */
  "s3-u0-l2": {
    kind: "quiz",
    mode: "scene-pick",
    title: "News desk or café?",
    intro:
      "Formal Arabic (MSA) shows up in news and polite settings. Dialects show up with friends. Same “hello” idea — different clothes.",
    questions: [
      {
        prompt: "السَّلَامُ عَلَيْكُمْ is most typical of…",
        options: [
          "Only Egyptian slang",
          "Formal / MSA greeting",
          "Only Levantine slang",
          "A verb mold",
        ],
        answer: "Formal / MSA greeting",
        explain: "Classic polite “peace be upon you.”",
      },
      {
        prompt: "مَرْحَبا feels most natural as…",
        options: [
          "MSA news only",
          "Everyday Levantine hello",
          "Classical poetry only",
          "A Form X verb",
        ],
        answer: "Everyday Levantine hello",
        explain: "Like choosing “hi” instead of a formal greeting.",
      },
    ],
  },
  "s3-u0-l3": {
    kind: "phonetics",
    mode: "hello-tasting",
    title: "Hello tasting flight",
    intro:
      "Three hello flavors. Tap each, then use the dialect cards below to hear the full phrases — like Hello / Hi / Hey.",
    items: [
      {
        arabic: "سَلَام",
        latin: "salaam",
        tip: "“Peace” — core of the formal greeting.",
      },
      {
        arabic: "مَرْحَبا",
        latin: "marhaba",
        tip: "Friendly Levantine hello.",
      },
      {
        arabic: "أَهْلاً",
        latin: "ahlan",
        tip: "Friendly Egyptian hello (also “welcome”).",
      },
    ],
  },
  "s3-u1-l3": {
    kind: "quiz",
    mode: "true-false",
    title: "Café truths",
    intro: "Casual speech often drops formal endings and prefers dialect verbs.",
    questions: [
      {
        prompt: "True or false: casual “I wrote” often drops the final formal “u” of كَتَبْتُ.",
        options: ["True", "False"],
        answer: "True",
        explain: "Spoken dialects usually simplify endings.",
      },
      {
        prompt: "Egyptian “talk / speak” is closest to…",
        options: ["حكي (more Levantine)", "اتكلم (Egyptian)", "kataba", "madrasa"],
        answer: "اتكلم (Egyptian)",
        explain: "اتكلم is everyday Egyptian for “talk.”",
      },
    ],
  },
  "s3-u1-l4": {
    kind: "reading",
    mode: "menu-read",
    title: "Menu words",
    intro: "Café vocabulary. Hear each line — then try fading vowels like a real menu.",
    items: [
      {
        arabic: "قَهْوَة",
        latin: "qahwa",
        gloss: "coffee — related to English “coffee”",
      },
      {
        arabic: "مِنْ فَضْلِك",
        latin: "min fadlik",
        gloss: "please (polite)",
      },
    ],
  },
  "s3-u2-l3": {
    kind: "quiz",
    mode: "scene-pick",
    title: "City survival",
    intro: "Pick the line that fits the street.",
    questions: [
      {
        prompt: "مَدْرَسَة means…",
        options: ["office", "school", "book", "hello"],
        answer: "school",
        explain: "Same family as English “madrasah.”",
      },
      {
        prompt: "Levantine “I know” is often heard as…",
        options: ["katabtu", "baʿref", "istaktaba", "maktab"],
        answer: "baʿref",
        explain: "Street knowledge verb — not the dictionary MSA form.",
      },
    ],
  },
  "s3-u3-l2": {
    kind: "reading",
    mode: "headline",
    title: "Headline mode",
    intro:
      "News-style reading: fewer marks. Get meaning from the knowledge root ع ل م.",
    items: [
      { arabic: "عِلْم", latin: "ilm", gloss: "knowledge / science" },
      { arabic: "مَعْلُوم", latin: "maaloom", gloss: "known / information" },
    ],
    rootId: "elm",
    patternId: "noun-fi3al",
    tashkeelMode: "minimal",
  },
  "s3-u3-l3": {
    kind: "quiz",
    mode: "scene-pick",
    title: "Pick the register",
    intro: "News desk leans formal. Friends lean dialect.",
    questions: [
      {
        prompt: "A TV news opener is most likely to use…",
        options: [
          "Only Egyptian street slang",
          "MSA-style phrasing",
          "Only a shadda mark",
          "No Arabic",
        ],
        answer: "MSA-style phrasing",
        explain: "Broadcast Arabic leans formal so everyone can follow.",
      },
      {
        prompt: "Ordering coffee with a friend, you’re more likely to use…",
        options: [
          "Full classical endings",
          "Dialect-friendly greetings",
          "Only Form X verbs",
          "Hebrew",
        ],
        answer: "Dialect-friendly greetings",
        explain: "Friends → dialect. Desk → MSA.",
      },
    ],
  },
};

export function getLessonContent(lessonId: string): LessonBodyContent | undefined {
  return LESSON_CONTENT[lessonId];
}
