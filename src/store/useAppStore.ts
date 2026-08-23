"use client";

import { create } from "zustand";
import {
  makeWordId,
  type AppHydrationPayload,
  type FsrsItem,
  type MasteryLevel,
  type UnlockedVocab,
} from "@/types/app-progress";
import { createClient } from "@/utils/supabase/client";

type HydrateStatus = "idle" | "loading" | "ready" | "error";

type AppStore = {
  userId: string | null;
  email: string | null;
  hibrBalance: number;
  unlockedVocab: UnlockedVocab[];
  fsrsItems: FsrsItem[];
  unlockedCities: string[];
  completedLessonIds: string[];

  status: HydrateStatus;
  error: string | null;
  hydratedAt: number | null;

  /** Fetch profile + vocab + FSRS + cities + lessons for the signed-in user. */
  hydrate: () => Promise<boolean>;
  /** Apply a full server/client snapshot (e.g. after a server action). */
  applyHydration: (payload: AppHydrationPayload) => void;
  reset: () => void;

  // ——— Optimistic mutations (server actions confirm / reconcile later) ———
  setHibrBalance: (amount: number) => void;
  addHibrOptimistic: (delta: number) => void;
  unlockCityOptimistic: (cityId: string) => void;
  unlockVocabOptimistic: (
    pairs: Array<{ rootId: string; patternId: string; sourceNodeId?: string | null }>,
  ) => void;
  setMasteryOptimistic: (wordId: string, masteryLevel: MasteryLevel, dueDate?: string) => void;
  markLessonCompleteOptimistic: (lessonId: string) => void;

  // ——— Selectors as methods (battle / path / review consumers) ———
  isRootUnlocked: (rootId: string) => boolean;
  isVocabUnlocked: (rootId: string, patternId: string) => boolean;
  getMastery: (wordId: string) => MasteryLevel | null;
  getMasteryForPair: (rootId: string, patternId: string) => MasteryLevel | null;
  dueReviewCount: (now?: Date) => number;
  /** True when any due card has mastery dropped / overdue long enough to imply Rust. */
  hasRustDebuff: (now?: Date) => boolean;
};

const initialState = {
  userId: null as string | null,
  email: null as string | null,
  hibrBalance: 0,
  unlockedVocab: [] as UnlockedVocab[],
  fsrsItems: [] as FsrsItem[],
  unlockedCities: [] as string[],
  completedLessonIds: [] as string[],
  status: "idle" as HydrateStatus,
  error: null as string | null,
  hydratedAt: null as number | null,
};

function mapVocabRows(
  rows: Array<{
    root_id: string;
    pattern_id: string;
    unlocked_at: string;
    source_node_id: string | null;
  }>,
): UnlockedVocab[] {
  return rows.map((r) => ({
    rootId: r.root_id,
    patternId: r.pattern_id,
    unlockedAt: r.unlocked_at,
    sourceNodeId: r.source_node_id,
    wordId: makeWordId(r.root_id, r.pattern_id),
  }));
}

function mapFsrsRows(
  rows: Array<{
    word_id: string;
    mastery_level: number;
    due_date: string;
    reps: number;
    lapses: number;
    last_review: string | null;
  }>,
): FsrsItem[] {
  return rows.map((r) => ({
    wordId: r.word_id,
    masteryLevel: clampMastery(r.mastery_level),
    dueDate: r.due_date,
    reps: r.reps,
    lapses: r.lapses,
    lastReview: r.last_review,
  }));
}

function clampMastery(n: number): MasteryLevel {
  if (n <= 1) return 1;
  if (n >= 3) return 3;
  return 2;
}

/** Overdue by more than 3 days → Arena "Rust" debuff signal. */
const RUST_OVERDUE_MS = 3 * 24 * 60 * 60 * 1000;

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  hydrate: async () => {
    set({ status: "loading", error: null });

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        set({ ...initialState, status: "idle", error: authError?.message ?? "Not signed in." });
        return false;
      }

      const [profileRes, vocabRes, fsrsRes, citiesRes, lessonsRes] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("email, hibr_balance")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("user_unlocked_vocab")
          .select("root_id, pattern_id, unlocked_at, source_node_id")
          .eq("user_id", user.id),
        supabase
          .from("user_fsrs_items")
          .select("word_id, mastery_level, due_date, reps, lapses, last_review")
          .eq("user_id", user.id),
        supabase.from("user_unlocked_cities").select("city_id").eq("user_id", user.id),
        supabase.from("user_lesson_progress").select("lesson_id").eq("user_id", user.id),
      ]);

      // Ensure profile row exists (users created before trigger / rename)
      let hibrBalance = profileRes.data?.hibr_balance ?? 0;
      let email = profileRes.data?.email ?? user.email ?? null;

      if (!profileRes.data) {
        const { data: created } = await supabase
          .from("user_profiles")
          .upsert(
            { id: user.id, email: user.email ?? null, hibr_balance: 0 },
            { onConflict: "id" },
          )
          .select("email, hibr_balance")
          .maybeSingle();
        hibrBalance = created?.hibr_balance ?? 0;
        email = created?.email ?? user.email ?? null;
      }

      if (vocabRes.error) throw new Error(vocabRes.error.message);
      if (fsrsRes.error) throw new Error(fsrsRes.error.message);
      if (citiesRes.error) throw new Error(citiesRes.error.message);
      if (lessonsRes.error) throw new Error(lessonsRes.error.message);

      set({
        userId: user.id,
        email,
        hibrBalance,
        unlockedVocab: mapVocabRows(vocabRes.data ?? []),
        fsrsItems: mapFsrsRows(fsrsRes.data ?? []),
        unlockedCities: (citiesRes.data ?? []).map((r) => r.city_id as string),
        completedLessonIds: (lessonsRes.data ?? []).map((r) => r.lesson_id as string),
        status: "ready",
        error: null,
        hydratedAt: Date.now(),
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to hydrate app state.";
      set({ status: "error", error: message });
      return false;
    }
  },

  applyHydration: (payload) =>
    set({
      userId: payload.userId,
      email: payload.email,
      hibrBalance: payload.hibrBalance,
      unlockedVocab: payload.unlockedVocab,
      fsrsItems: payload.fsrsItems,
      unlockedCities: payload.unlockedCities,
      completedLessonIds: payload.completedLessonIds,
      status: "ready",
      error: null,
      hydratedAt: Date.now(),
    }),

  reset: () => set({ ...initialState }),

  setHibrBalance: (amount) => set({ hibrBalance: Math.max(0, amount) }),

  addHibrOptimistic: (delta) =>
    set((s) => ({ hibrBalance: Math.max(0, s.hibrBalance + delta) })),

  unlockCityOptimistic: (cityId) =>
    set((s) =>
      s.unlockedCities.includes(cityId)
        ? s
        : { unlockedCities: [...s.unlockedCities, cityId] },
    ),

  unlockVocabOptimistic: (pairs) =>
    set((s) => {
      const existing = new Set(s.unlockedVocab.map((v) => v.wordId));
      const nextVocab = [...s.unlockedVocab];
      const nextFsrs = [...s.fsrsItems];
      const fsrsIds = new Set(nextFsrs.map((f) => f.wordId));
      const now = new Date().toISOString();

      for (const pair of pairs) {
        const wordId = makeWordId(pair.rootId, pair.patternId);
        if (!existing.has(wordId)) {
          existing.add(wordId);
          nextVocab.push({
            rootId: pair.rootId,
            patternId: pair.patternId,
            unlockedAt: now,
            sourceNodeId: pair.sourceNodeId ?? null,
            wordId,
          });
        }
        if (!fsrsIds.has(wordId)) {
          fsrsIds.add(wordId);
          nextFsrs.push({
            wordId,
            masteryLevel: 1,
            dueDate: now,
            reps: 0,
            lapses: 0,
            lastReview: null,
          });
        }
      }

      return { unlockedVocab: nextVocab, fsrsItems: nextFsrs };
    }),

  setMasteryOptimistic: (wordId, masteryLevel, dueDate) =>
    set((s) => {
      const idx = s.fsrsItems.findIndex((f) => f.wordId === wordId);
      if (idx === -1) {
        return {
          fsrsItems: [
            ...s.fsrsItems,
            {
              wordId,
              masteryLevel,
              dueDate: dueDate ?? new Date().toISOString(),
              reps: 0,
              lapses: 0,
              lastReview: new Date().toISOString(),
            },
          ],
        };
      }
      const next = [...s.fsrsItems];
      const cur = next[idx]!;
      next[idx] = {
        ...cur,
        masteryLevel,
        dueDate: dueDate ?? cur.dueDate,
        lastReview: new Date().toISOString(),
      };
      return { fsrsItems: next };
    }),

  markLessonCompleteOptimistic: (lessonId) =>
    set((s) =>
      s.completedLessonIds.includes(lessonId)
        ? s
        : { completedLessonIds: [...s.completedLessonIds, lessonId] },
    ),

  isRootUnlocked: (rootId) => get().unlockedVocab.some((v) => v.rootId === rootId),

  isVocabUnlocked: (rootId, patternId) =>
    get().unlockedVocab.some((v) => v.rootId === rootId && v.patternId === patternId),

  getMastery: (wordId) => {
    const item = get().fsrsItems.find((f) => f.wordId === wordId);
    return item?.masteryLevel ?? null;
  },

  getMasteryForPair: (rootId, patternId) => get().getMastery(makeWordId(rootId, patternId)),

  dueReviewCount: (now = new Date()) => {
    const t = now.getTime();
    return get().fsrsItems.filter((f) => new Date(f.dueDate).getTime() <= t).length;
  },

  hasRustDebuff: (now = new Date()) => {
    const t = now.getTime();
    return get().fsrsItems.some((f) => {
      const due = new Date(f.dueDate).getTime();
      return due < t - RUST_OVERDUE_MS;
    });
  },
}));
