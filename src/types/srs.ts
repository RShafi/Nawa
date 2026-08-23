/**
 * SRS (FSRS) types — map to future Supabase `srs_items` / `srs_logs` tables.
 */

import type { Pattern, Root } from "@/types/arabic";

/** FSRS card lifecycle (matches ts-fsrs State enum). */
export type SrsState = 0 | 1 | 2 | 3; // New | Learning | Review | Relearning

/** Review grade (matches ts-fsrs Rating). */
export type SrsRating = 1 | 2 | 3 | 4; // Again | Hard | Good | Easy

export type SrsItemType = "root" | "word" | "pattern";

export type SrsItem = {
  id: string;
  user_id: string;
  /** ID of the root / derived word key / pattern being reviewed. */
  reference_id: string;
  item_type: SrsItemType;
  state: SrsState;
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  /** FSRS learning-step index (ts-fsrs Card.learning_steps). */
  learning_steps: number;
  last_review: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type SrsLog = {
  id: string;
  user_id: string;
  srs_item_id: string;
  rating: SrsRating;
  state: SrsState;
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  review_duration_ms: number;
  reviewed_at: Date;
};

/** Word payload joined onto an SRS item for the flashcard UI. */
export type SrsWordContent = {
  kind: "word";
  arabic: string;
  transliteration: string;
  translation: string;
  grammaticalCategory: string;
  rootId: string;
  patternId: string;
  dialectTags: string[];
};

export type SrsRootContent = {
  kind: "root";
  arabic: string;
  transliteration: string;
  translation: string;
  consonants: Root["consonants"];
  dialectTags: string[];
};

export type SrsPatternContent = {
  kind: "pattern";
  arabic: string;
  transliteration: string;
  translation: string;
  templateName: string;
  description: Pattern["description"];
  dialectTags: string[];
};

export type SrsCardContent = SrsWordContent | SrsRootContent | SrsPatternContent;

export type PopulatedSrsItem = SrsItem & {
  content: SrsCardContent;
};

export type SessionStats = {
  reviewed: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
};

export type RatingPreview = {
  rating: SrsRating;
  label: string;
  dueLabel: string;
  due: Date;
};
