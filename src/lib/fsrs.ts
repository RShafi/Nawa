import {
  FSRS,
  Rating,
  State,
  createEmptyCard,
  type Card,
  type Grade,
} from "ts-fsrs";
import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import type { RatingPreview, SrsItem, SrsLog, SrsRating } from "@/types/srs";

/** Shared FSRS scheduler (default parameters). */
export const fsrs = new FSRS({});

export const RATING_LABELS: Record<SrsRating, string> = {
  1: "Again",
  2: "Hard",
  3: "Good",
  4: "Easy",
};

export function toFsrsCard(item: SrsItem): Card {
  return {
    due: new Date(item.due),
    stability: item.stability,
    difficulty: item.difficulty,
    elapsed_days: item.elapsed_days,
    scheduled_days: item.scheduled_days,
    learning_steps: item.learning_steps,
    reps: item.reps,
    lapses: item.lapses,
    state: item.state as State,
    last_review: item.last_review ? new Date(item.last_review) : undefined,
  };
}

export function formatDueLabel(due: Date, now: Date = new Date()): string {
  const mins = differenceInMinutes(due, now);
  if (mins < 1) return "<1m";
  if (mins < 60) return `${mins}m`;
  const hours = differenceInHours(due, now);
  if (hours < 24) return `${hours}h`;
  const days = differenceInDays(due, now);
  if (days < 30) return `${Math.max(days, 1)}d`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.round(days / 365)}y`;
}

export function previewRatings(item: SrsItem, now: Date = new Date()): RatingPreview[] {
  const card = toFsrsCard(item);
  const preview = fsrs.repeat(card, now);
  const grades: SrsRating[] = [1, 2, 3, 4];
  return grades.map((rating) => {
    const due = preview[rating as Grade].card.due;
    return {
      rating,
      label: RATING_LABELS[rating],
      due,
      dueLabel: formatDueLabel(due, now),
    };
  });
}

/**
 * Apply an FSRS rating to a stored SRS item.
 * Returns next card fields + a log row shaped for our schema.
 */
export function processReview(
  currentCardState: SrsItem,
  rating: SrsRating,
  options?: { now?: Date; durationMs?: number; logId?: string },
): { nextCardState: SrsItem; reviewLog: SrsLog } {
  const now = options?.now ?? new Date();
  const card = toFsrsCard(currentCardState);
  const { card: next, log } = fsrs.next(card, now, rating as Grade);

  const nextCardState: SrsItem = {
    ...currentCardState,
    state: next.state as SrsItem["state"],
    due: next.due,
    stability: next.stability,
    difficulty: next.difficulty,
    elapsed_days: next.elapsed_days,
    scheduled_days: next.scheduled_days,
    learning_steps: next.learning_steps,
    reps: next.reps,
    lapses: next.lapses,
    last_review: next.last_review ?? now,
    updated_at: now,
  };

  const reviewLog: SrsLog = {
    id: options?.logId ?? crypto.randomUUID(),
    user_id: currentCardState.user_id,
    srs_item_id: currentCardState.id,
    rating,
    state: log.state as SrsLog["state"],
    due: log.due,
    stability: log.stability,
    difficulty: log.difficulty,
    elapsed_days: log.elapsed_days,
    scheduled_days: log.scheduled_days,
    review_duration_ms: options?.durationMs ?? 0,
    reviewed_at: log.review,
  };

  return { nextCardState, reviewLog };
}

export function createEmptySrsItem(partial: {
  id?: string;
  user_id: string;
  reference_id: string;
  item_type: SrsItem["item_type"];
  now?: Date;
}): SrsItem {
  const now = partial.now ?? new Date();
  const empty = createEmptyCard(now);
  return {
    id: partial.id ?? crypto.randomUUID(),
    user_id: partial.user_id,
    reference_id: partial.reference_id,
    item_type: partial.item_type,
    state: empty.state as SrsItem["state"],
    due: empty.due,
    stability: empty.stability,
    difficulty: empty.difficulty,
    elapsed_days: empty.elapsed_days,
    scheduled_days: empty.scheduled_days,
    learning_steps: empty.learning_steps,
    reps: empty.reps,
    lapses: empty.lapses,
    last_review: null,
    created_at: now,
    updated_at: now,
  };
}

export { Rating, State };
