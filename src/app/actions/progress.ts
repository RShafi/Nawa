"use server";

import { revalidatePath } from "next/cache";
import { LESSON_HIBR_BONUS, getCityById } from "@/data/passportCities";
import { createClient } from "@/utils/supabase/server";

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
    hibr_balance?: number;
    hibr_currency?: number;
  } | null;

  revalidatePath("/passports");
  revalidatePath("/passport");
  revalidatePath("/path");

  return {
    ok: true,
    alreadyUnlocked: Boolean(payload?.already_unlocked),
    currency:
      typeof payload?.hibr_balance === "number"
        ? payload.hibr_balance
        : typeof payload?.hibr_currency === "number"
          ? payload.hibr_currency
          : undefined,
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
    if (insertError.code === "23505") {
      return { ok: true, alreadyCompleted: true, bonusAwarded: 0 };
    }
    return { ok: false, error: insertError.message };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("hibr_balance")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { ok: false, error: profileError?.message ?? "Profile not found." };
  }

  const nextCurrency = profile.hibr_balance + LESSON_HIBR_BONUS;
  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({ hibr_balance: nextCurrency })
    .eq("id", user.id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  revalidatePath("/");
  revalidatePath("/path");
  revalidatePath("/passports");
  revalidatePath(`/lesson/${lessonId}`);

  return { ok: true, bonusAwarded: LESSON_HIBR_BONUS, currency: nextCurrency };
}
