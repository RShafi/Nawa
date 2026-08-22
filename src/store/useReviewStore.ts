"use client";

import { create } from "zustand";
import { submitCardReview } from "@/app/actions/srs";
import { DEMO_SRS_USER_ID } from "@/lib/srs-constants";
import type { PopulatedSrsItem, SessionStats, SrsRating } from "@/types/srs";

type ReviewStore = {
  queue: PopulatedSrsItem[];
  currentIndex: number;
  isRevealed: boolean;
  isSubmitting: boolean;
  cardShownAt: number | null;
  sessionStats: SessionStats;
  userId: string;

  initializeQueue: (items: PopulatedSrsItem[], userId?: string) => void;
  revealAnswer: () => void;
  submitRating: (rating: SrsRating) => void;
  resetSession: () => void;
};

const emptyStats = (): SessionStats => ({
  reviewed: 0,
  again: 0,
  hard: 0,
  good: 0,
  easy: 0,
});

function rehydrateItem(item: PopulatedSrsItem): PopulatedSrsItem {
  return {
    ...item,
    due: new Date(item.due),
    last_review: item.last_review ? new Date(item.last_review) : null,
    created_at: new Date(item.created_at),
    updated_at: new Date(item.updated_at),
  };
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  queue: [],
  currentIndex: 0,
  isRevealed: false,
  isSubmitting: false,
  cardShownAt: null,
  sessionStats: emptyStats(),
  userId: DEMO_SRS_USER_ID,

  initializeQueue: (items, userId = DEMO_SRS_USER_ID) => {
    set({
      queue: items.map(rehydrateItem),
      currentIndex: 0,
      isRevealed: false,
      isSubmitting: false,
      cardShownAt: Date.now(),
      sessionStats: emptyStats(),
      userId,
    });
  },

  revealAnswer: () => set({ isRevealed: true }),

  resetSession: () =>
    set({
      queue: [],
      currentIndex: 0,
      isRevealed: false,
      isSubmitting: false,
      cardShownAt: null,
      sessionStats: emptyStats(),
    }),

  submitRating: (rating) => {
    const { queue, currentIndex, sessionStats, userId, cardShownAt, isSubmitting } = get();
    if (isSubmitting) return;

    const current = queue[currentIndex];
    if (!current) return;

    const durationMs = cardShownAt ? Math.max(0, Date.now() - cardShownAt) : 0;

    const stats: SessionStats = {
      ...sessionStats,
      reviewed: sessionStats.reviewed + 1,
      again: sessionStats.again + (rating === 1 ? 1 : 0),
      hard: sessionStats.hard + (rating === 2 ? 1 : 0),
      good: sessionStats.good + (rating === 3 ? 1 : 0),
      easy: sessionStats.easy + (rating === 4 ? 1 : 0),
    };

    // Optimistic queue update: Again → back of queue; otherwise drop.
    const remaining = queue.filter((_, i) => i !== currentIndex);
    const nextQueue = rating === 1 ? [...remaining, current] : remaining;

    set({
      queue: nextQueue,
      currentIndex: 0,
      isRevealed: false,
      isSubmitting: false,
      cardShownAt: nextQueue.length ? Date.now() : null,
      sessionStats: stats,
    });

    // Persist in the background (mock → Supabase later).
    void submitCardReview(userId, current.id, rating, durationMs).catch((err) => {
      console.error("[srs] submitCardReview failed", err);
    });
  },
}));
