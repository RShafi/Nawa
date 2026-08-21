import type { Pattern } from "@/types/arabic";

export const PATTERNS: Pattern[] = [
  {
    id: "verb-i",
    kind: "verb",
    verbForm: "I",
    templateArabic: "فَعَلَ",
    templateName: "Form I",
    description: "Basic triliteral verb — do / act",
  },
  {
    id: "verb-ii",
    kind: "verb",
    verbForm: "II",
    templateArabic: "فَعَّلَ",
    templateName: "Form II",
    description: "Intensive / causative — make someone do",
  },
  {
    id: "verb-iii",
    kind: "verb",
    verbForm: "III",
    templateArabic: "فَاعَلَ",
    templateName: "Form III",
    description: "Reciprocal / attempt — act with",
  },
  {
    id: "verb-x",
    kind: "verb",
    verbForm: "X",
    templateArabic: "اِسْتَفْعَلَ",
    templateName: "Form X",
    description: "Seek / request — ask for the action",
  },
  {
    id: "noun-maf3al",
    kind: "noun",
    templateArabic: "مَفْعَل",
    templateName: "مَفْعَل",
    description: "Noun of place / instrument",
  },
  {
    id: "noun-maf3ul",
    kind: "noun",
    templateArabic: "مَفْعُول",
    templateName: "مَفْعُول",
    description: "Passive participle — that which is done",
  },
  {
    id: "noun-fi3al",
    kind: "noun",
    templateArabic: "فِعَال",
    templateName: "فِعَال",
    description: "Verbal noun / abstract noun pattern",
  },
];

export function getPatternById(id: string): Pattern | undefined {
  return PATTERNS.find((p) => p.id === id);
}
