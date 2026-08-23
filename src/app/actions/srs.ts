"use server";

import { revalidatePath } from "next/cache";
import { VALID_SPELLS } from "@/data/combatDictionary";
import { processReview } from "@/lib/fsrs";
import type { MasteryLevel } from "@/types/app-progress";
import type { PopulatedSrsItem, SrsItem, SrsRating } from "@/types/srs";
import { createClient } from "@/utils/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { supabase, user: null as null, error: "Not authenticated." };
  }
  return { supabase, user, error: null as null };
}

type FsrsRow = {
  id: string;
  user_id: string;
  word_id: string;
  mastery_level: number;
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

function rowToSrsItem(row: FsrsRow): SrsItem {
  return {
    id: row.id,
    user_id: row.user_id,
    reference_id: row.word_id,
    item_type: "word",
    state: (row.state as SrsItem["state"]) ?? 0,
    due: new Date(row.due_date),
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsed_days,
    scheduled_days: row.scheduled_days,
    reps: row.reps,
    lapses: row.lapses,
    learning_steps: 0,
    last_review: row.last_review ? new Date(row.last_review) : null,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

function populateFromWordId(item: SrsItem): PopulatedSrsItem | null {
  const [rootId, patternId] = item.reference_id.split(":");
  const spell = VALID_SPELLS.find((s) => s.root === rootId && s.pattern === patternId);
  if (!spell) return null;
  return {
    ...item,
    content: {
      kind: "word",
      arabic: spell.arabicWord,
      transliteration: spell.transliteration,
      translation: spell.englishTranslation,
      grammaticalCategory: spell.archetype,
      rootId: spell.root,
      patternId: spell.pattern,
      dialectTags: [],
    },
  };
}

function masteryFromReview(
  current: number,
  rating: SrsRating,
): MasteryLevel {
  let next = current;
  if (rating >= 3) next = Math.min(3, current + 1);
  if (rating === 1) next = Math.max(1, current - 1);
  return (next <= 1 ? 1 : next >= 3 ? 3 : 2) as MasteryLevel;
}

/** Due FSRS cards for the signed-in user (from `user_fsrs_items`). */
export async function getDueCards(): Promise<PopulatedSrsItem[]> {
  const { supabase, user } = await requireUser();
  if (!user) return [];

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("user_fsrs_items")
    .select("*")
    .eq("user_id", user.id)
    .lte("due_date", now)
    .order("due_date", { ascending: true })
    .limit(50);

  if (error || !data) return [];

  return (data as FsrsRow[])
    .map(rowToSrsItem)
    .map(populateFromWordId)
    .filter((x): x is PopulatedSrsItem => !!x)
    .map(serializePopulated);
}

export async function getDueCount(): Promise<number> {
  const { supabase, user } = await requireUser();
  if (!user) return 0;

  const now = new Date().toISOString();
  const { count } = await supabase
    .from("user_fsrs_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .lte("due_date", now);

  return count ?? 0;
}

export async function submitCardReview(
  itemId: string,
  rating: SrsRating,
  durationMs: number,
): Promise<SrsItem & { mastery_level?: MasteryLevel }> {
  const { supabase, user } = await requireUser();
  if (!user) throw new Error("Not authenticated");

  const { data: row, error } = await supabase
    .from("user_fsrs_items")
    .select("*")
    .eq("id", itemId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !row) throw new Error("SRS item not found");

  const current = rowToSrsItem(row as FsrsRow);
  const { nextCardState } = processReview(current, rating, { durationMs });
  const nextMastery = masteryFromReview((row as FsrsRow).mastery_level, rating);

  const { error: updateError } = await supabase
    .from("user_fsrs_items")
    .update({
      mastery_level: nextMastery,
      due_date: nextCardState.due.toISOString(),
      stability: nextCardState.stability,
      difficulty: nextCardState.difficulty,
      elapsed_days: nextCardState.elapsed_days,
      scheduled_days: nextCardState.scheduled_days,
      reps: nextCardState.reps,
      lapses: nextCardState.lapses,
      state: nextCardState.state,
      last_review: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/review");
  revalidatePath("/arena");

  return {
    ...serializeItem(nextCardState),
    mastery_level: nextMastery,
  };
}

function serializeItem(item: SrsItem): SrsItem {
  return {
    ...item,
    due: new Date(item.due),
    last_review: item.last_review ? new Date(item.last_review) : null,
    created_at: new Date(item.created_at),
    updated_at: new Date(item.updated_at),
  };
}

function serializePopulated(item: PopulatedSrsItem): PopulatedSrsItem {
  return { ...serializeItem(item), content: item.content };
}
