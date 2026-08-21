import type { DerivedWord, DialectVariant, Root, SampleSentence } from "@/types/arabic";

export const ROOTS: Root[] = [
  {
    id: "ktb",
    consonants: [
      { arabic: "ك", latin: "k" },
      { arabic: "ت", latin: "t" },
      { arabic: "ب", latin: "b" },
    ],
    transliteration: "k-t-b",
    gloss: "writing",
    semanticField: "literacy",
  },
  {
    id: "drs",
    consonants: [
      { arabic: "د", latin: "d" },
      { arabic: "ر", latin: "r" },
      { arabic: "س", latin: "s" },
    ],
    transliteration: "d-r-s",
    gloss: "studying",
    semanticField: "education",
  },
  {
    id: "slm",
    consonants: [
      { arabic: "س", latin: "s" },
      { arabic: "ل", latin: "l" },
      { arabic: "م", latin: "m" },
    ],
    transliteration: "s-l-m",
    gloss: "peace / safety",
    semanticField: "greeting",
  },
  {
    id: "elm",
    consonants: [
      { arabic: "ع", latin: "ʿ" },
      { arabic: "ل", latin: "l" },
      { arabic: "م", latin: "m" },
    ],
    transliteration: "ʿ-l-m",
    gloss: "knowledge",
    semanticField: "cognition",
  },
  {
    id: "klm",
    consonants: [
      { arabic: "ك", latin: "k" },
      { arabic: "ل", latin: "l" },
      { arabic: "م", latin: "m" },
    ],
    transliteration: "k-l-m",
    gloss: "speaking",
    semanticField: "communication",
  },
];

export const DERIVED_WORDS: DerivedWord[] = [
  // k-t-b
  {
    rootId: "ktb",
    patternId: "verb-i",
    arabic: "كَتَبَ",
    transliteration: "kataba",
    ipa: "/ˈkataba/",
    translation: "he wrote",
    grammaticalCategory: "verb · Form I · perfect",
  },
  {
    rootId: "ktb",
    patternId: "verb-ii",
    arabic: "كَتَّبَ",
    transliteration: "kattaba",
    ipa: "/katˈtaba/",
    translation: "he made (someone) write / dictated",
    grammaticalCategory: "verb · Form II · perfect",
  },
  {
    rootId: "ktb",
    patternId: "verb-iii",
    arabic: "كَاتَبَ",
    transliteration: "kātaba",
    ipa: "/ˈkaːtaba/",
    translation: "he corresponded with",
    grammaticalCategory: "verb · Form III · perfect",
  },
  {
    rootId: "ktb",
    patternId: "verb-x",
    arabic: "اِسْتَكْتَبَ",
    transliteration: "istaktaba",
    ipa: "/istaˈktaba/",
    translation: "he asked (someone) to write",
    grammaticalCategory: "verb · Form X · perfect",
  },
  {
    rootId: "ktb",
    patternId: "noun-maf3al",
    arabic: "مَكْتَب",
    transliteration: "maktab",
    ipa: "/ˈmaktab/",
    translation: "office / desk",
    grammaticalCategory: "noun · place",
  },
  {
    rootId: "ktb",
    patternId: "noun-maf3ul",
    arabic: "مَكْتُوب",
    transliteration: "maktūb",
    ipa: "/makˈtuːb/",
    translation: "written / letter",
    grammaticalCategory: "noun · passive participle",
  },
  {
    rootId: "ktb",
    patternId: "noun-fi3al",
    arabic: "كِتَاب",
    transliteration: "kitāb",
    ipa: "/kiˈtaːb/",
    translation: "book",
    grammaticalCategory: "noun · verbal noun related",
  },
  // d-r-s
  {
    rootId: "drs",
    patternId: "verb-i",
    arabic: "دَرَسَ",
    transliteration: "darasa",
    ipa: "/ˈdarasa/",
    translation: "he studied",
    grammaticalCategory: "verb · Form I · perfect",
  },
  {
    rootId: "drs",
    patternId: "verb-ii",
    arabic: "دَرَّسَ",
    transliteration: "darrasa",
    ipa: "/darˈrasa/",
    translation: "he taught",
    grammaticalCategory: "verb · Form II · perfect",
  },
  {
    rootId: "drs",
    patternId: "noun-maf3al",
    arabic: "مَدْرَسَة",
    transliteration: "madrasa",
    ipa: "/ˈmadrasa/",
    translation: "school",
    grammaticalCategory: "noun · place",
    notes: "Feminine place noun built on مَفْعَلَة",
  },
  {
    rootId: "drs",
    patternId: "noun-fi3al",
    arabic: "دِرَاسَة",
    transliteration: "dirāsa",
    ipa: "/diˈraːsa/",
    translation: "study / research",
    grammaticalCategory: "noun · verbal noun",
  },
  // s-l-m
  {
    rootId: "slm",
    patternId: "verb-i",
    arabic: "سَلِمَ",
    transliteration: "salima",
    ipa: "/ˈsalima/",
    translation: "he was safe / sound",
    grammaticalCategory: "verb · Form I · perfect",
  },
  {
    rootId: "slm",
    patternId: "verb-ii",
    arabic: "سَلَّمَ",
    transliteration: "sallama",
    ipa: "/salˈlama/",
    translation: "he greeted / submitted",
    grammaticalCategory: "verb · Form II · perfect",
  },
  {
    rootId: "slm",
    patternId: "noun-fi3al",
    arabic: "سَلَام",
    transliteration: "salām",
    ipa: "/saˈlaːm/",
    translation: "peace",
    grammaticalCategory: "noun",
  },
  {
    rootId: "slm",
    patternId: "noun-maf3ul",
    arabic: "مُسْلِم",
    transliteration: "muslim",
    ipa: "/ˈmuslim/",
    translation: "Muslim (one who submits)",
    grammaticalCategory: "noun · active participle (Form IV related)",
    notes: "Related Form IV إِسْلَام / أَسْلَمَ family",
  },
  // ʿ-l-m
  {
    rootId: "elm",
    patternId: "verb-i",
    arabic: "عَلِمَ",
    transliteration: "ʿalima",
    ipa: "/ˈʕalima/",
    translation: "he knew",
    grammaticalCategory: "verb · Form I · perfect",
  },
  {
    rootId: "elm",
    patternId: "verb-ii",
    arabic: "عَلَّمَ",
    transliteration: "ʿallama",
    ipa: "/ʕalˈlama/",
    translation: "he taught",
    grammaticalCategory: "verb · Form II · perfect",
  },
  {
    rootId: "elm",
    patternId: "verb-x",
    arabic: "اِسْتَعْلَمَ",
    transliteration: "istaʿlama",
    ipa: "/istaʕˈlama/",
    translation: "he inquired / sought knowledge",
    grammaticalCategory: "verb · Form X · perfect",
  },
  {
    rootId: "elm",
    patternId: "noun-fi3al",
    arabic: "عِلْم",
    transliteration: "ʿilm",
    ipa: "/ʕilm/",
    translation: "knowledge / science",
    grammaticalCategory: "noun",
  },
  {
    rootId: "elm",
    patternId: "noun-maf3ul",
    arabic: "مَعْلُوم",
    transliteration: "maʿlūm",
    ipa: "/maʕˈluːm/",
    translation: "known / information",
    grammaticalCategory: "noun · passive participle",
  },
  // k-l-m
  {
    rootId: "klm",
    patternId: "verb-ii",
    arabic: "كَلَّمَ",
    transliteration: "kallama",
    ipa: "/kalˈlama/",
    translation: "he spoke to",
    grammaticalCategory: "verb · Form II · perfect",
  },
  {
    rootId: "klm",
    patternId: "verb-i",
    arabic: "كَلِمَة",
    transliteration: "kalima",
    ipa: "/ˈkalima/",
    translation: "word",
    grammaticalCategory: "noun (related)",
    notes: "Shown under Form I slot for demo; historically a noun from k-l-m",
  },
  {
    rootId: "klm",
    patternId: "noun-fi3al",
    arabic: "كَلَام",
    transliteration: "kalām",
    ipa: "/kaˈlaːm/",
    translation: "speech / talk",
    grammaticalCategory: "noun",
  },
  {
    rootId: "klm",
    patternId: "verb-iii",
    arabic: "تَكَلَّمَ",
    transliteration: "takallama",
    ipa: "/taˈkallama/",
    translation: "he spoke / talked",
    grammaticalCategory: "verb · Form V related",
    notes: "Form V تَفَعَّلَ — related derived template",
  },
];

export const DIALECT_VARIANTS: DialectVariant[] = [
  {
    id: "phrase-i-wrote",
    rootId: "ktb",
    meaning: "I wrote",
    usageTags: ["Formal / Media", "Street / Casual"],
    variants: {
      msa: {
        script: "كَتَبْتُ",
        transliteration: "katabtu",
        ipa: "/kaˈtabtu/",
        audioLabel: "MSA · katabtu",
      },
      levantine: {
        script: "كَتَبْت",
        transliteration: "katabt",
        ipa: "/kaˈtabt/",
        audioLabel: "Levantine · katabt",
      },
      egyptian: {
        script: "كَتَبْت",
        transliteration: "katabt",
        ipa: "/kaˈtabt/",
        audioLabel: "Egyptian · katabt",
      },
    },
  },
  {
    id: "phrase-school",
    rootId: "drs",
    meaning: "school",
    usageTags: ["Everyday", "Education"],
    variants: {
      msa: {
        script: "مَدْرَسَة",
        transliteration: "madrasa",
        ipa: "/ˈmadrasa/",
        audioLabel: "MSA · madrasa",
      },
      levantine: {
        script: "مَدْرَسَة",
        transliteration: "madrase",
        ipa: "/ˈmadrase/",
        audioLabel: "Levantine · madrase",
      },
      egyptian: {
        script: "مَدْرَسَة",
        transliteration: "madrasa",
        ipa: "/ˈmadrasa/",
        audioLabel: "Egyptian · madrasa",
      },
    },
  },
  {
    id: "phrase-hello",
    rootId: "slm",
    meaning: "hello / peace be upon you",
    usageTags: ["Greeting", "Formal / Media", "Street / Casual"],
    variants: {
      msa: {
        script: "السَّلَامُ عَلَيْكُمْ",
        transliteration: "as-salāmu ʿalaykum",
        ipa: "/as.saˈlaːmu ʕaˈlajkum/",
        audioLabel: "MSA · as-salāmu ʿalaykum",
      },
      levantine: {
        script: "مَرْحَبا",
        transliteration: "marḥaba",
        ipa: "/ˈmarħaba/",
        audioLabel: "Levantine · marḥaba",
      },
      egyptian: {
        script: "أَهْلاً",
        transliteration: "ahlan",
        ipa: "/ˈahlan/",
        audioLabel: "Egyptian · ahlan",
      },
    },
  },
  {
    id: "phrase-i-know",
    rootId: "elm",
    meaning: "I know",
    usageTags: ["Street / Casual", "Conversation"],
    variants: {
      msa: {
        script: "أَعْلَمُ",
        transliteration: "aʿlamu",
        ipa: "/ˈaʕlamu/",
        audioLabel: "MSA · aʿlamu",
      },
      levantine: {
        script: "بَعْرِف",
        transliteration: "baʿref",
        ipa: "/baʕˈref/",
        audioLabel: "Levantine · baʿref",
      },
      egyptian: {
        script: "بَعْرَف",
        transliteration: "baʿraf",
        ipa: "/baʕˈraf/",
        audioLabel: "Egyptian · baʿraf",
      },
    },
  },
  {
    id: "phrase-speak",
    rootId: "klm",
    meaning: "speak / talk",
    usageTags: ["Street / Casual", "Conversation"],
    variants: {
      msa: {
        script: "تَكَلَّمْ",
        transliteration: "takallam",
        ipa: "/taˈkallam/",
        audioLabel: "MSA · takallam",
      },
      levantine: {
        script: "حْكي",
        transliteration: "ḥki",
        ipa: "/ħki/",
        audioLabel: "Levantine · ḥki",
      },
      egyptian: {
        script: "اِتْكَلِّم",
        transliteration: "itkallim",
        ipa: "/etˈkallim/",
        audioLabel: "Egyptian · itkallim",
      },
    },
  },
];

export const SAMPLE_SENTENCES: SampleSentence[] = [
  {
    id: "sent-ktb-1",
    rootId: "ktb",
    msa: "كَتَبْتُ رِسَالَةً.",
    dialect: "كَتَبْت مَكْتُوب.",
    dialectRegister: "levantine",
    translation: "I wrote a letter.",
  },
  {
    id: "sent-drs-1",
    rootId: "drs",
    msa: "دَرَسَ فِي الْمَدْرَسَةِ.",
    dialect: "دَرَس فِي الْمَدْرَسَة.",
    dialectRegister: "egyptian",
    translation: "He studied at school.",
  },
];

export function getRootById(id: string): Root | undefined {
  return ROOTS.find((r) => r.id === id);
}

export function getDialectVariantById(id: string): DialectVariant | undefined {
  return DIALECT_VARIANTS.find((d) => d.id === id);
}

export function getDialectVariantsForRoot(rootId: string): DialectVariant[] {
  return DIALECT_VARIANTS.filter((d) => d.rootId === rootId);
}
