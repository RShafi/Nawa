"use server";

import { revalidatePath } from "next/cache";
import { LESSON_HIBR_BONUS, getCityById } from "@/data/passportCities";
import { mergeBustanTrees, type DbBustanTreeRow } from "@/lib/bustan-progress";
import type { BustanTree } from "@/store/useGamificationStore";
import { createClient } from "@/utils/supabase/server";

export type UserDashboardData = {
  email: string | null;
  currency: number;
  trees: BustanTree[];
  unlockedCities: string[];
  completedLessonIds: string[];
};

export type ProgressActionResult = {
  ok: boolean;
  error?: string;
  currency?: number;
  alreadyUnlocked?: boolean;
  alreadyCompleted?: boolean;
  bonusAwarded?: number;
};

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

/**
 * Profile + Bustān trees + unlocked cities + lesson completions for the signed-in user.
 */
export async function getUserDashboardData(): Promise<UserDashboardData | null> {
  const { supabase, user } = await requireUser();
  if (!user) return null;

  const [profileRes, treesRes, citiesRes, lessonsRes] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("email, hibr_currency")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_bustan_trees")
      .select("root_id, letters, mastery_level")
      .eq("user_id", user.id),
    supabase.from("user_unlocked_cities").select("city_id").eq("user_id", user.id),
    supabase.from("user_lesson_progress").select("lesson_id").eq("user_id", user.id),
  ]);

  // Ensure a profile exists (covers users created before the trigger was installed)
  let currency = profileRes.data?.hibr_currency ?? 0;
  let email = profileRes.data?.email ?? user.email ?? null;

  if (!profileRes.data) {
    const { data: created } = await supabase
      .from("user_profiles")
      .upsert(
        { id: user.id, email: user.email ?? null, hibr_currency: 0 },
        { onConflict: "id" },
      )
      .select("email, hibr_currency")
      .maybeSingle();

    currency = created?.hibr_currency ?? 0;
    email = created?.email ?? user.email ?? null;
  }

  const dbTrees = (treesRes.data ?? []) as DbBustanTreeRow[];

  return {
    email,
    currency,
    trees: mergeBustanTrees(dbTrees),
    unlockedCities: (citiesRes.data ?? []).map((r) => r.city_id as string),
    completedLessonIds: (lessonsRes.data ?? []).map((r) => r.lesson_id as string),
  };
}

/** Upsert mastery for one orchard tree belonging to the current user. */
export async function updateTreeMastery(
  rootId: string,
  letters: string,
  level: number,
): Promise<ProgressActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const mastery = Math.max(0, Math.min(3, Math.floor(level)));

  const { error } = await supabase.from("user_bustan_trees").upsert(
    {
      user_id: user.id,
      root_id: rootId,
      letters,
      mastery_level: mastery,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,root_id" },
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/bustan");
  revalidatePath("/passport");
  return { ok: true };
}

/**
 * Atomically verify currency, deduct `cost`, and unlock a city (Postgres RPC).
 */
export async function unlockCityAction(
  cityId: string,
  cost: number,
): Promise<ProgressActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const city = getCityById(cityId);
  if (!city) {
    return { ok: false, error: "Unknown city." };
  }

  // Trust the catalog cost, not a client-supplied arbitrary value
  const chargedCost = city.cost;
  if (cost !== chargedCost) {
    return { ok: false, error: "Cost mismatch. Refresh and try again." };
  }

  const { data, error } = await supabase.rpc("unlock_city", {
    p_city_id: cityId,
    p_cost: chargedCost,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const payload = data as {
    ok?: boolean;
    already_unlocked?: boolean;
    hibr_currency?: number;
  } | null;

  revalidatePath("/passport");
  revalidatePath("/bustan");

  return {
    ok: true,
    alreadyUnlocked: Boolean(payload?.already_unlocked),
    currency: typeof payload?.hibr_currency === "number" ? payload.hibr_currency : undefined,
  };
}

/** Record lesson completion and award bonus Hibr (once per lesson). */
export async function completeLessonAction(
  lessonId: string,
): Promise<ProgressActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  if (!lessonId.trim()) {
    return { ok: false, error: "Invalid lesson id." };
  }

  const { error: insertError } = await supabase.from("user_lesson_progress").insert({
    user_id: user.id,
    lesson_id: lessonId,
  });

  if (insertError) {
    // Unique violation → already completed; no second bonus
    if (insertError.code === "23505") {
      return { ok: true, alreadyCompleted: true, bonusAwarded: 0 };
    }
    return { ok: false, error: insertError.message };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("hibr_currency")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { ok: false, error: profileError?.message ?? "Profile not found." };
  }

  const nextCurrency = profile.hibr_currency + LESSON_HIBR_BONUS;
  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({ hibr_currency: nextCurrency })
    .eq("id", user.id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  revalidatePath("/");
  revalidatePath("/passport");
  revalidatePath(`/lesson/${lessonId}`);

  return { ok: true, bonusAwarded: LESSON_HIBR_BONUS, currency: nextCurrency };
}
