/**
 * Shared domain types for Nawā V1 pillars (Path → Arena → Passports → Review).
 * Column names mirror Supabase tables in `supabase/migrations/20260823_v1_mvp_pillars.sql`.
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

/** Client-friendly unlocked vocab entry (combat deck ammo). */
export type UnlockedVocab = {
  rootId: string;
  patternId: string;
  unlockedAt: string;
  sourceNodeId: string | null;
  /** Canonical word id: `${rootId}:${patternId}` */
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
  fsrsItems: FsrsItem[];
  unlockedCities: string[];
  completedLessonIds: string[];
};

/** Build the shared word_id key used across vocab + FSRS + combat. */
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
