"use client";

import { create } from "zustand";
import { forgeWordCard, getWordCard, wordIdsFromUnlocks } from "@/data/combatDictionary";
import {
  makeWordId,
  type AppHydrationPayload,
  type FsrsItem,
  type MasteryLevel,
  type UnlockedVocab,
} from "@/types/app-progress";
import { plantByRoot, type TreeRow } from "@/data/garden";
import { createClient } from "@/utils/supabase/client";

type HydrateStatus = "idle" | "loading" | "ready" | "error";

type AppStore = {
  userId: string | null;
  email: string | null;
  hibrBalance: number;
  unlockedVocab: UnlockedVocab[];
  /** Word Card IDs in the player's deck */
  unlockedDeck: string[];
  fsrsItems: FsrsItem[];
  unlockedCities: string[];
  completedLessonIds: string[];
  trees: TreeRow[];

  status: HydrateStatus;
  error: string | null;
  hydratedAt: number | null;

  hydrate: () => Promise<boolean>;
  applyHydration: (payload: AppHydrationPayload) => void;
  reset: () => void;
  clearGarden: () => void;

  setHibrBalance: (amount: number) => void;
  addHibrOptimistic: (delta: number) => void;
  unlockCityOptimistic: (cityId: string) => void;
  /** Unlock Word Cards by recipe pairs and/or direct card IDs */
  unlockVocabOptimistic: (
    pairs: Array<{ rootId: string; patternId: string; sourceNodeId?: string | null } | string>,
  ) => void;
  unlockDeckOptimistic: (wordIds: string[], sourceNodeId?: string | null) => void;
  setMasteryOptimistic: (wordId: string, masteryLevel: MasteryLevel, dueDate?: string) => void;
  markLessonCompleteOptimistic: (lessonId: string) => void;

  isRootUnlocked: (rootId: string) => boolean;
  isVocabUnlocked: (rootId: string, patternId: string) => boolean;
  isCardUnlocked: (wordId: string) => boolean;
  getMastery: (wordId: string) => MasteryLevel | null;
  getMasteryForPair: (rootId: string, patternId: string) => MasteryLevel | null;
  dueReviewCount: (now?: Date) => number;
};

const initialState = {
  userId: null as string | null,
  email: null as string | null,
  hibrBalance: 0,
  unlockedVocab: [] as UnlockedVocab[],
  unlockedDeck: [] as string[],
  fsrsItems: [] as FsrsItem[],
  unlockedCities: [] as string[],
  completedLessonIds: [] as string[],
  trees: [] as TreeRow[],
  status: "idle" as HydrateStatus,
  error: null as string | null,
  hydratedAt: null as number | null,
};

function deckFromVocab(vocab: UnlockedVocab[]): string[] {
  return wordIdsFromUnlocks(vocab.map((v) => ({ rootId: v.rootId, patternId: v.patternId })));
}

function mapVocabRows(
  rows: Array<{
    root_id: string;
    pattern_id: string;
    unlocked_at: string;
    source_node_id: string | null;
  }>,
): UnlockedVocab[] {
  return rows.map((r) => {
    const card = forgeWordCard(r.root_id, r.pattern_id);
    return {
      rootId: r.root_id,
      patternId: r.pattern_id,
      unlockedAt: r.unlocked_at,
      sourceNodeId: r.source_node_id,
      wordId: card?.id ?? makeWordId(r.root_id, r.pattern_id),
    };
  });
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

let hydrateInflight: Promise<boolean> | null = null;

async function readSession(supabase: ReturnType<typeof createClient>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let first: Awaited<ReturnType<typeof supabase.auth.getUser>>;
  try {
    first = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), 6000);
      }),
    ]);
  } catch (err) {
    if (!(err instanceof Error) || err.message !== "timeout") throw err;
    return supabase.auth.getUser();
  } finally {
    if (timer) clearTimeout(timer);
  }
  if (first.data.user) return first;
  await new Promise((resolve) => setTimeout(resolve, 400));
  return supabase.auth.getUser();
}

async function runHydrate(
  set: (partial: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>)) => void,
  get: () => AppStore,
): Promise<boolean> {
  if (get().status !== "loading") set({ status: "loading", error: null });

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await readSession(supabase);

      if (authError || !user) {
        if (get().userId) {
          set({ status: "ready", error: null });
          return true;
        }
        const missingSession = !authError || /session missing/i.test(authError.message);
        set({
          ...initialState,
          status: missingSession ? "ready" : "error",
          error: missingSession ? null : "Could not reach your account. Refresh and try again.",
          hydratedAt: Date.now(),
        });
        return false;
      }

      const [profileRes, vocabRes, fsrsRes, citiesRes, lessonsRes, treesRes] = await Promise.all([
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
        supabase.from("user_bustan_trees").select("root_id, letters, mastery_level").eq("user_id", user.id),
      ]);

      let hibrBalance = profileRes.data?.hibr_balance ?? 0;
      let email = profileRes.data?.email ?? user.email ?? null;

      if (profileRes.error) throw new Error(profileRes.error.message);
      if (!profileRes.data) {
        await supabase.from("user_profiles").upsert(
          { id: user.id, email: user.email ?? null, hibr_balance: 0 },
          { onConflict: "id", ignoreDuplicates: true },
        );
        const again = await supabase
          .from("user_profiles")
          .select("email, hibr_balance")
          .eq("id", user.id)
          .maybeSingle();
        if (again.error) throw new Error(again.error.message);
        hibrBalance = again.data?.hibr_balance ?? 0;
        email = again.data?.email ?? user.email ?? null;
      }

      if (vocabRes.error) throw new Error(vocabRes.error.message);
      if (fsrsRes.error) throw new Error(fsrsRes.error.message);
      if (citiesRes.error) throw new Error(citiesRes.error.message);
      if (lessonsRes.error) throw new Error(lessonsRes.error.message);

      const unlockedVocab = mapVocabRows(vocabRes.data ?? []);

      set({
        userId: user.id,
        email,
        hibrBalance,
        unlockedVocab,
        unlockedDeck: deckFromVocab(unlockedVocab),
        fsrsItems: mapFsrsRows(fsrsRes.data ?? []),
        unlockedCities: ((citiesRes.data ?? []) as Array<{ city_id: string }>).map((r) => r.city_id),
        completedLessonIds: ((lessonsRes.data ?? []) as Array<{ lesson_id: string }>).map(
          (r) => r.lesson_id,
        ),
        trees: treesRes.error
          ? []
          : ((treesRes.data ?? []) as Array<{ root_id: string; letters: string; mastery_level: number }>).map(
              (row) => ({
                rootId: row.root_id,
                letters: row.letters,
                masteryLevel: Number(row.mastery_level ?? 0),
              }),
            ),
        status: "ready",
        error: null,
        hydratedAt: Date.now(),
      });
      return true;
    } catch {
      if (get().userId) {
        set({ status: "ready", error: null });
        return true;
      }
      set({
        ...initialState,
        status: "error",
        error: "Could not reach your account. Refresh and try again.",
        hydratedAt: Date.now(),
      });
    return false;
  }
}

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  hydrate: () => {
    if (hydrateInflight) return hydrateInflight;
    hydrateInflight = runHydrate(set, get).finally(() => {
      hydrateInflight = null;
    });
    return hydrateInflight;
  },

  applyHydration: (payload) =>
    set({
      userId: payload.userId,
      email: payload.email,
      hibrBalance: payload.hibrBalance,
      unlockedVocab: payload.unlockedVocab,
      unlockedDeck: payload.unlockedDeck?.length
        ? payload.unlockedDeck
        : deckFromVocab(payload.unlockedVocab),
      fsrsItems: payload.fsrsItems,
      unlockedCities: payload.unlockedCities,
      completedLessonIds: payload.completedLessonIds,
      trees: [],
      status: "ready",
      error: null,
      hydratedAt: Date.now(),
    }),

  reset: () => set({ ...initialState }),

  clearGarden: () =>
    set((s) => ({
      ...initialState,
      userId: s.userId,
      email: s.email,
      status: "ready" as const,
      hydratedAt: Date.now(),
    })),

  setHibrBalance: (amount) => set({ hibrBalance: Math.max(0, amount) }),

  addHibrOptimistic: (delta) =>
    set((s) => ({ hibrBalance: Math.max(0, s.hibrBalance + delta) })),

  unlockCityOptimistic: (cityId) =>
    set((s) =>
      s.unlockedCities.includes(cityId)
        ? s
        : { unlockedCities: [...s.unlockedCities, cityId] },
    ),

  unlockDeckOptimistic: (wordIds, sourceNodeId = null) =>
    set((s) => {
      const existingDeck = new Set(s.unlockedDeck);
      const existingVocab = new Set(s.unlockedVocab.map((v) => v.wordId));
      const nextDeck = [...s.unlockedDeck];
      const nextVocab = [...s.unlockedVocab];
      const nextFsrs = [...s.fsrsItems];
      const fsrsIds = new Set(nextFsrs.map((f) => f.wordId));
      const now = new Date().toISOString();

      for (const id of wordIds) {
        const card = getWordCard(id);
        if (!card) continue;
        if (!existingDeck.has(card.id)) {
          existingDeck.add(card.id);
          nextDeck.push(card.id);
        }
        if (!existingVocab.has(card.id)) {
          existingVocab.add(card.id);
          nextVocab.push({
            rootId: card.rootId,
            patternId: card.patternId,
            unlockedAt: now,
            sourceNodeId,
            wordId: card.id,
          });
        }
        const fsrsKey = makeWordId(card.rootId, card.patternId);
        if (!fsrsIds.has(fsrsKey) && !fsrsIds.has(card.id)) {
          fsrsIds.add(fsrsKey);
          nextFsrs.push({
            wordId: fsrsKey,
            masteryLevel: 1,
            dueDate: now,
            reps: 0,
            lapses: 0,
            lastReview: null,
          });
        }
      }

      return { unlockedDeck: nextDeck, unlockedVocab: nextVocab, fsrsItems: nextFsrs };
    }),

  unlockVocabOptimistic: (pairs) => {
    const wordIds: string[] = [];
    const recipes: Array<{ rootId: string; patternId: string; sourceNodeId?: string | null }> =
      [];
    for (const p of pairs) {
      if (typeof p === "string") wordIds.push(p);
      else recipes.push(p);
    }
    const fromRecipes = wordIdsFromUnlocks(recipes);
    const source = recipes[0]?.sourceNodeId ?? null;
    get().unlockDeckOptimistic([...wordIds, ...fromRecipes], source);
  },

  setMasteryOptimistic: (wordId, masteryLevel, dueDate) =>
    set((s) => {
      const rootId = wordId.split(":")[0] ?? "";
      const plant = plantByRoot(rootId);
      const trees = plant
        ? s.trees.some((tree) => tree.rootId === rootId)
          ? s.trees.map((tree) =>
              tree.rootId === rootId ? { ...tree, masteryLevel } : tree,
            )
          : [...s.trees, { rootId, letters: plant.letters, masteryLevel }]
        : s.trees;
      const idx = s.fsrsItems.findIndex((f) => f.wordId === wordId);
      if (idx === -1) {
        return {
          trees,
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
      return { trees, fsrsItems: next };
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

  isCardUnlocked: (wordId) => get().unlockedDeck.includes(wordId),

  getMastery: (wordId) => {
    const item = get().fsrsItems.find((f) => f.wordId === wordId);
    return item?.masteryLevel ?? null;
  },

  getMasteryForPair: (rootId, patternId) => {
    const card = forgeWordCard(rootId, patternId);
    return get().getMastery(card?.id ?? makeWordId(rootId, patternId));
  },

  dueReviewCount: (now = new Date()) => {
    const t = now.getTime();
    return get().fsrsItems.filter((f) => new Date(f.dueDate).getTime() <= t).length;
  },
}));
