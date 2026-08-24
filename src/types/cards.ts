/**
 * Semantic tagging for Arena Word Cards — what a word is, and what it may attach to.
 */

export type SemanticTag =
  | "human"
  | "male"
  | "female"
  | "animate"
  | "inanimate"
  | "object"
  | "tool"
  | "place"
  | "text"
  | "abstract"
  | "action";

/** Fields mixed into WordCard for logical sentence building */
export type SemanticCardFields = {
  /** What this word *is* (esp. nouns). */
  tags: SemanticTag[];
  /**
   * For verbs/adjectives: tag(s) a partner noun must have.
   * Empty / omitted = no semantic restriction beyond POS syntax.
   */
  validTargets?: SemanticTag[];
  /**
   * Definiteness for translation rules (الـ / Al- or explicit flag).
   * Defaults inferred from Arabic script if omitted.
   */
  definite?: boolean;
  /** Clean English lemma for natural phrasing (avoids “He struck / …” dumps). */
  lemmaEn?: string;
};

export type { PartOfSpeech, ElementSchool, WordCard } from "@/data/combatDictionary";
