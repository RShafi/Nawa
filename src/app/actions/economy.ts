"use server";

import { revalidatePath } from "next/cache";
import { BATTLE_WIN_HIBR, REVIEW_SESSION_HIBR } from "@/lib/wardDealer";
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

export type HibrActionResult = {
  ok: boolean;
  error?: string;
  hibrBalance?: number;
  awarded?: number;
};

export async function awardBattleWinHibrAction(): Promise<HibrActionResult> {
  return awardHibrInternal(BATTLE_WIN_HIBR, "arena_win");
}

export async function awardReviewSessionHibrAction(
  reviewedCount: number,
): Promise<HibrActionResult> {
  if (reviewedCount <= 0) {
    return { ok: true, awarded: 0 };
  }
  // Full bonus at 5+ cards; scale down for short sessions
  const amount =
    reviewedCount >= 5
      ? REVIEW_SESSION_HIBR
      : Math.max(10, Math.round((reviewedCount / 5) * REVIEW_SESSION_HIBR));
  return awardHibrInternal(amount, "daily_review");
}

async function awardHibrInternal(amount: number, reason: string): Promise<HibrActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { data, error } = await supabase.rpc("award_hibr", {
    p_amount: amount,
    p_reason: reason,
  });

  if (error) return { ok: false, error: error.message };

  const payload = data as { hibr_balance?: number; awarded?: number } | null;
  revalidatePath("/passports");
  revalidatePath("/passport");
  revalidatePath("/path");
  revalidatePath("/arena");
  revalidatePath("/review");

  return {
    ok: true,
    hibrBalance: payload?.hibr_balance,
    awarded: typeof payload?.awarded === "number" ? payload.awarded : amount,
  };
}
