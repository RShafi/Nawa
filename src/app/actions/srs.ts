"use server";

import {
  appendSrsLog,
  countDueItems,
  findSrsItem,
  getOrCreateUserItems,
  populateSrsItem,
  upsertSrsItem,
} from "@/data/mockSrs";
import { processReview } from "@/lib/fsrs";
import { DEMO_SRS_USER_ID } from "@/lib/srs-constants";
import type { PopulatedSrsItem, SrsItem, SrsRating } from "@/types/srs";

/**
 * Due cards for today’s review queue (mock Supabase query).
 * When Supabase is wired: `select * from srs_items where user_id = ? and due <= now() order by due asc limit 50`
 */
export async function getDueCards(userId: string = DEMO_SRS_USER_ID): Promise<PopulatedSrsItem[]> {
  const now = new Date();
  const due = getOrCreateUserItems(userId)
    .filter((item) => new Date(item.due).getTime() <= now.getTime())
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
    .slice(0, 50);

  return due
    .map(populateSrsItem)
    .filter((item): item is PopulatedSrsItem => item !== null)
    .map(serializePopulated);
}

export async function getDueCount(userId: string = DEMO_SRS_USER_ID): Promise<number> {
  return countDueItems(userId);
}

/**
 * Persist an FSRS rating for one card.
 * Mock: update in-memory row + append log. Real: transaction update + insert.
 */
export async function submitCardReview(
  userId: string,
  itemId: string,
  rating: SrsRating,
  durationMs: number,
): Promise<SrsItem> {
  const current = findSrsItem(userId, itemId);
  if (!current) {
    throw new Error(`SRS item not found: ${itemId}`);
  }

  const { nextCardState, reviewLog } = processReview(current, rating, {
    durationMs,
  });

  upsertSrsItem(nextCardState);
  appendSrsLog(reviewLog);

  return serializeItem(nextCardState);
}

/** Dates survive the server→client boundary as ISO strings; rehydrate for the client. */
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
  return {
    ...serializeItem(item),
    content: item.content,
  };
}
