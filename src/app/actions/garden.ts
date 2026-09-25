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
  if (!lesson) return { ok: false, error: "That step is not on the path." };

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

  if (!hadLesson) {
    const { error: insertError } = await supabase.from("user_lesson_progress").insert({
      user_id: user.id,
      lesson_id: lessonId,
    });
    if (insertError && insertError.code !== "23505") {
      return { ok: false, error: insertError.message };
    }
  }

  if (card && !hadCard) {
    const { error: rpcError } = await supabase.rpc("unlock_vocab_batch", {
      p_pairs: [{ root_id: card.rootId, pattern_id: card.patternId }],
      p_source_node_id: lessonId,
    });
    if (rpcError) return { ok: false, error: rpcError.message };

    const plant = plantByRoot(card.rootId);
    if (plant) {
      const { data: tree } = await supabase
        .from("user_bustan_trees")
        .select("mastery_level")
        .eq("user_id", user.id)
        .eq("root_id", plant.rootId)
        .maybeSingle();
      const mastery = Math.max(1, Number(tree?.mastery_level ?? 0));
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
  if (!hadLesson) {
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("hibr_balance")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError || !profile) {
      return { ok: false, error: profileError?.message ?? "Profile not found." };
    }
    hibrBalance = profile.hibr_balance + VISIT_HIBR;
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ hibr_balance: hibrBalance })
      .eq("id", user.id);
    if (updateError) return { ok: false, error: updateError.message };
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

export async function openRegisterAction(registerId: string): Promise<RegisterActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const found = getRegister(registerId);
  if (!found) return { ok: false, error: "Unknown register." };

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
    return { ok: false, error: "Grow this root in the garden first." };
  }
  if (!registerReady(found.plant, [], ownedWordIds)) {
    return { ok: false, error: "Grow two frames of this root first." };
  }

  const { data, error } = await supabase.rpc("unlock_city", {
    p_city_id: found.register.id,
    p_cost: found.register.cost,
  });
  if (error) return { ok: false, error: error.message };

  const payload = data as { already_unlocked?: boolean; hibr_balance?: number } | null;
  revalidatePath("/passports");
  revalidatePath("/");

  return {
    ok: true,
    alreadyUnlocked: Boolean(payload?.already_unlocked),
    hibrBalance: typeof payload?.hibr_balance === "number" ? payload.hibr_balance : undefined,
  };
}
