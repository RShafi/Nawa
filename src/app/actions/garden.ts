"use server";

import { revalidatePath } from "next/cache";
import { getWordCard } from "@/data/combatDictionary";
import {
  frameByLesson,
  getLesson,
  getRegister,
  plantByRoot,
  previousLessonId,
  registerReady,
} from "@/data/garden";
import { VISIT_HIBR } from "@/data/rewards";
import { makeWordId } from "@/types/app-progress";
import { createClient } from "@/utils/supabase/server";

export type VisitActionResult = {
  ok: boolean;
  error?: string;
  alreadyCompleted?: boolean;
  wordId?: string | null;
  bonusAwarded?: number;
  hibrBalance?: number;
};

export type RegisterActionResult = {
  ok: boolean;
  error?: string;
  alreadyUnlocked?: boolean;
  hibrBalance?: number;
};

export type ResetActionResult = {
  ok: boolean;
  error?: string;
};

function plainCityError(message: string): string {
  if (/insufficient hibr/i.test(message)) {
    return "Not enough score yet. Learn, review, or finish a sentence, then try again.";
  }
  if (/not authenticated/i.test(message)) return "Sign in first.";
  if (/profile not found/i.test(message)) return "Could not find your score. Sign in again.";
  return "Could not open that city. Try again.";
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null as null };
  return { supabase, user };
}

async function completedLessonIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId);
  return (data ?? []).map((row) => row.lesson_id as string);
}

async function ownsPattern(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  rootId: string,
  patternId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("user_unlocked_vocab")
    .select("id")
    .eq("user_id", userId)
    .eq("root_id", rootId)
    .eq("pattern_id", patternId)
    .maybeSingle();
  return Boolean(data);
}

async function stepIsDone(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  lessonId: string,
  completed: string[],
): Promise<boolean> {
  if (completed.includes(lessonId)) return true;
  const found = frameByLesson(lessonId);
  if (!found) return false;
  const card = getWordCard(found.frame.wordId);
  if (!card) return false;
  return ownsPattern(supabase, userId, card.rootId, card.patternId);
}

export async function completeVisitAction(lessonId: string): Promise<VisitActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const lesson = getLesson(lessonId);
  if (!lesson) return { ok: false, error: "That step is not in the course." };

  const completed = await completedLessonIds(supabase, user.id);
  const previous = previousLessonId(lessonId);
  if (previous && !(await stepIsDone(supabase, user.id, previous, completed))) {
    return { ok: false, error: "Finish the previous step first." };
  }

  const frame = lesson.kind === "frame" ? lesson.frame : null;
  const card = frame ? getWordCard(frame.wordId) : undefined;
  const hadLesson = completed.includes(lessonId);
  const hadCard = card
    ? await ownsPattern(supabase, user.id, card.rootId, card.patternId)
    : true;

  let insertedLesson = false;
  if (!hadLesson) {
    const { error: insertError } = await supabase.from("user_lesson_progress").insert({
      user_id: user.id,
      lesson_id: lessonId,
    });
    if (insertError && insertError.code !== "23505") {
      return { ok: false, error: "Could not save this step. Try again." };
    }
    insertedLesson = !insertError;
  }

  if (card && !hadCard) {
    const { error: rpcError } = await supabase.rpc("unlock_vocab_batch", {
      p_pairs: [{ root_id: card.rootId, pattern_id: card.patternId }],
      p_source_node_id: lessonId,
    });
    if (rpcError) return { ok: false, error: "Could not save this word. Try again." };

    const plant = plantByRoot(card.rootId);
    if (plant) {
      const { data: tree } = await supabase
        .from("user_bustan_trees")
        .select("mastery_level")
        .eq("user_id", user.id)
        .eq("root_id", plant.rootId)
        .maybeSingle();
      const existing = Number(tree?.mastery_level ?? 0);
      let seeded = existing;
      if (existing <= 0) {
        const wordIds = plant.frames.flatMap((frame) => {
          const word = getWordCard(frame.wordId);
          return word ? [word.id, makeWordId(word.rootId, word.patternId)] : [];
        });
        const { data: items } = wordIds.length
          ? await supabase
              .from("user_fsrs_items")
              .select("mastery_level, word_id")
              .eq("user_id", user.id)
              .in("word_id", wordIds)
          : { data: [] };
        const fromCards = Math.max(0, ...(items ?? []).map((row) => Number(row.mastery_level) || 0));
        seeded = Math.max(1, fromCards);
      }
      const mastery = Math.min(3, Math.max(1, seeded));
      const { error: treeError } = await supabase.from("user_bustan_trees").upsert(
        {
          user_id: user.id,
          root_id: plant.rootId,
          letters: plant.letters,
          mastery_level: Math.min(3, mastery),
        },
        { onConflict: "user_id,root_id" },
      );
      if (treeError) {
        console.error("[garden] bustan tree write failed", treeError.message);
      }
    }
  }

  const already = hadLesson && hadCard;
  let bonusAwarded = 0;
  let hibrBalance: number | undefined;
  if (insertedLesson) {
    const { data, error: awardError } = await supabase.rpc("award_hibr", {
      p_amount: VISIT_HIBR,
      p_reason: "lesson",
    });
    if (awardError) {
      return { ok: false, error: "Could not add your score. The step is saved." };
    }
    const payload = data as { hibr_balance?: number } | null;
    hibrBalance = payload?.hibr_balance;
    bonusAwarded = VISIT_HIBR;
  }

  revalidatePath("/");
  revalidatePath("/arena");
  revalidatePath("/review");
  revalidatePath("/passports");

  return {
    ok: true,
    alreadyCompleted: already,
    wordId: card?.id ?? null,
    bonusAwarded,
    hibrBalance,
  };
}

export async function resetProgressAction(): Promise<ResetActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const tables = [
    "user_lesson_progress",
    "user_unlocked_vocab",
    "user_fsrs_items",
    "user_bustan_trees",
    "user_unlocked_cities",
  ] as const;

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("user_id", user.id);
    if (error) return { ok: false, error: "Could not clear your progress. Try again." };
  }

  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({ hibr_balance: 0 })
    .eq("id", user.id);
  if (profileError) return { ok: false, error: "Could not clear your score. Try again." };

  revalidatePath("/");
  revalidatePath("/arena");
  revalidatePath("/review");
  revalidatePath("/passports");

  return { ok: true };
}

export async function openRegisterAction(registerId: string): Promise<RegisterActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const found = getRegister(registerId);
  if (!found) return { ok: false, error: "That city is not available." };

  const { data: vocab } = await supabase
    .from("user_unlocked_vocab")
    .select("root_id, pattern_id")
    .eq("user_id", user.id)
    .eq("root_id", found.plant.rootId);

  const ownedWordIds = found.plant.frames
    .filter((frame) => {
      const card = getWordCard(frame.wordId);
      if (!card) return false;
      return (vocab ?? []).some(
        (row) => row.root_id === card.rootId && row.pattern_id === card.patternId,
      );
    })
    .map((frame) => frame.wordId);

  if (ownedWordIds.length < 1) {
    return { ok: false, error: "Learn a word from these letters first." };
  }
  if (!registerReady(found.plant, [], ownedWordIds)) {
    return { ok: false, error: "Learn two words from these letters first." };
  }

  const { data, error } = await supabase.rpc("unlock_city", {
    p_city_id: found.register.id,
    p_cost: found.register.cost,
  });
  if (error) return { ok: false, error: plainCityError(error.message) };

  const payload = data as { already_unlocked?: boolean; hibr_balance?: number } | null;
  revalidatePath("/passports");
  revalidatePath("/");

  return {
    ok: true,
    alreadyUnlocked: Boolean(payload?.already_unlocked),
    hibrBalance: typeof payload?.hibr_balance === "number" ? payload.hibr_balance : undefined,
  };
}
