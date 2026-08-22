import { getPatternById, PATTERNS } from "@/data/mockPatterns";
import {
  DERIVED_WORDS,
  DIALECT_VARIANTS,
  getRootById,
  ROOTS,
} from "@/data/mockRoots";
import { createEmptySrsItem } from "@/lib/fsrs";
import { DEMO_SRS_USER_ID } from "@/lib/srs-constants";
import type { PopulatedSrsItem, SrsCardContent, SrsItem, SrsLog } from "@/types/srs";

export { DEMO_SRS_USER_ID };

/** In-memory stand-in for Supabase `srs_items` + `srs_logs`. */
const srsItemsByUser = new Map<string, SrsItem[]>();
const srsLogsByUser = new Map<string, SrsLog[]>();

function wordRefId(rootId: string, patternId: string) {
  return `${rootId}:${patternId}`;
}

function dialectTagsForRoot(rootId: string): string[] {
  const tags = new Set<string>();
  for (const v of DIALECT_VARIANTS) {
    if (v.rootId !== rootId) continue;
    for (const t of v.usageTags) tags.add(t);
  }
  return [...tags].slice(0, 4);
}

export function resolveSrsContent(
  itemType: SrsItem["item_type"],
  referenceId: string,
): SrsCardContent | null {
  if (itemType === "root") {
    const root = getRootById(referenceId);
    if (!root) return null;
    return {
      kind: "root",
      arabic: root.consonants.map((c) => c.arabic).join(" "),
      transliteration: root.transliteration,
      translation: root.gloss,
      consonants: root.consonants,
      dialectTags: dialectTagsForRoot(root.id),
    };
  }

  if (itemType === "pattern") {
    const pattern = getPatternById(referenceId);
    if (!pattern) return null;
    return {
      kind: "pattern",
      arabic: pattern.templateArabic,
      transliteration: pattern.templateName,
      translation: pattern.description,
      templateName: pattern.templateName,
      description: pattern.description,
      dialectTags: ["morphology", "pattern"],
    };
  }

  const [rootId, patternId] = referenceId.split(":");
  const word = DERIVED_WORDS.find((w) => w.rootId === rootId && w.patternId === patternId);
  if (!word) return null;
  return {
    kind: "word",
    arabic: word.arabic,
    transliteration: word.transliteration,
    translation: word.translation,
    grammaticalCategory: word.grammaticalCategory,
    rootId: word.rootId,
    patternId: word.patternId,
    dialectTags: dialectTagsForRoot(word.rootId),
  };
}

export function populateSrsItem(item: SrsItem): PopulatedSrsItem | null {
  const content = resolveSrsContent(item.item_type, item.reference_id);
  if (!content) return null;
  return { ...item, content };
}

function seedUserDeck(userId: string): SrsItem[] {
  const now = new Date();
  const items: SrsItem[] = [];

  // Core roots due now
  for (const root of ROOTS.slice(0, 4)) {
    items.push(
      createEmptySrsItem({
        user_id: userId,
        reference_id: root.id,
        item_type: "root",
        now,
      }),
    );
  }

  // High-value Form I / II words
  const wordSeeds = DERIVED_WORDS.filter(
    (w) =>
      (w.patternId === "verb-i" || w.patternId === "verb-ii" || w.patternId === "noun-fi3al") &&
      ["ktb", "drs", "elm", "slm", "klm"].includes(w.rootId),
  ).slice(0, 12);

  for (const w of wordSeeds) {
    items.push(
      createEmptySrsItem({
        user_id: userId,
        reference_id: wordRefId(w.rootId, w.patternId),
        item_type: "word",
        now,
      }),
    );
  }

  // A couple of patterns
  for (const p of PATTERNS.filter((x) => x.id === "verb-i" || x.id === "verb-ii")) {
    items.push(
      createEmptySrsItem({
        user_id: userId,
        reference_id: p.id,
        item_type: "pattern",
        now,
      }),
    );
  }

  return items;
}

export function getOrCreateUserItems(userId: string): SrsItem[] {
  let items = srsItemsByUser.get(userId);
  if (!items) {
    items = seedUserDeck(userId);
    srsItemsByUser.set(userId, items);
    srsLogsByUser.set(userId, []);
  }
  return items;
}

export function getUserLogs(userId: string): SrsLog[] {
  return srsLogsByUser.get(userId) ?? [];
}

export function upsertSrsItem(item: SrsItem): void {
  const items = getOrCreateUserItems(item.user_id);
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx === -1) items.push(item);
  else items[idx] = item;
  srsItemsByUser.set(item.user_id, items);
}

export function appendSrsLog(log: SrsLog): void {
  const logs = getUserLogs(log.user_id);
  logs.push(log);
  srsLogsByUser.set(log.user_id, logs);
}

export function findSrsItem(userId: string, itemId: string): SrsItem | undefined {
  return getOrCreateUserItems(userId).find((i) => i.id === itemId);
}

export function countDueItems(userId: string, now: Date = new Date()): number {
  return getOrCreateUserItems(userId).filter((i) => new Date(i.due).getTime() <= now.getTime())
    .length;
}
