/**
 * Shared domain types for Nawā V1 pillars (Path → Arena → Passports → Review).
 */

/** 1 = Beginner, 2 = Familiar, 3 = Mastered */
export type MasteryLevel = 1 | 2 | 3;

export type UnlockedVocabRow = {
  id: string;
  user_id: string;
  root_id: string;
  pattern_id: string;
  unlocked_at: string;
  source_node_id: string | null;
};

export type FsrsItemRow = {
  id: string;
  user_id: string;
  word_id: string;
  mastery_level: MasteryLevel;
  due_date: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: string | null;
  created_at: string;
  updated_at: string;
};

export type UnlockedCityRow = {
  id: string;
  user_id: string;
  city_id: string;
  unlocked_at: string;
};

export type UserProfileRow = {
  id: string;
  email: string | null;
  hibr_balance: number;
  created_at: string;
};

/**
 * Client unlocked Word Card entry.
 * `wordId` is the WordCard.id (e.g. ktb-form-1).
 * rootId/patternId retained for Path forge recipes + DB rows.
 */
export type UnlockedVocab = {
  rootId: string;
  patternId: string;
  unlockedAt: string;
  sourceNodeId: string | null;
  wordId: string;
};

/** Client-friendly FSRS / mastery entry. */
export type FsrsItem = {
  wordId: string;
  masteryLevel: MasteryLevel;
  dueDate: string;
  reps: number;
  lapses: number;
  lastReview: string | null;
};

export type AppHydrationPayload = {
  userId: string;
  email: string | null;
  hibrBalance: number;
  unlockedVocab: UnlockedVocab[];
  /** Convenience: Word Card IDs for the Arena deck */
  unlockedDeck: string[];
  fsrsItems: FsrsItem[];
  unlockedCities: string[];
  completedLessonIds: string[];
};

/** Build legacy FSRS key root:pattern — prefer WordCard.id for deck. */
export function makeWordId(rootId: string, patternId: string): string {
  return `${rootId}:${patternId}`;
}

export function parseWordId(wordId: string): { rootId: string; patternId: string } | null {
  const idx = wordId.indexOf(":");
  if (idx <= 0 || idx === wordId.length - 1) return null;
  return {
    rootId: wordId.slice(0, idx),
    patternId: wordId.slice(idx + 1),
  };
}
