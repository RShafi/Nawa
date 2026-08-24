import {
  COMBAT_PATTERNS,
  COMBAT_ROOTS,
  forgeWordCard,
  getWordCard,
} from "@/data/combatDictionary";

/** Word Card IDs unlocked when a path node is finished */
export type PathVocabUnlock = string;

export type PathLessonRef = {
  id: string;
  title: string;
  /** Optional lesson mode override on the path map */
  kind?: "forge" | "syntax" | "default";
};

export type PathNode = {
  id: string;
  unit: string;
  title: string;
  description: string;
  accent: "sky" | "emerald" | "amber" | "violet";
  lessons: PathLessonRef[];
  /** Word Card IDs added to the player's deck */
  unlocks: PathVocabUnlock[];
};

/**
 * Linear Learning Path — Card Forge + syntax bridges.
 * Finishing a node unlocks Word Cards for the Arena deck.
 */
export const LEARNING_PATH_NODES: PathNode[] = [
  {
    id: "path-node-sound-gate",
    unit: "Unit 0 · Foundations",
    title: "The Sound Gate",
    description:
      "Meet sounds English doesn’t write as letters. Tap, listen, and get comfortable looking at Arabic.",
    accent: "sky",
    lessons: [
      { id: "s0-u0-l1", title: "Throat letters" },
      { id: "s0-u0-l2", title: "Emphatic consonants" },
    ],
    unlocks: [],
  },
  {
    id: "path-node-form-i-ktb",
    unit: "Unit 1 · The Card Forge",
    title: "Forge “he wrote”",
    description:
      "Combine Thread ك-ت-ب with Frame Form I to forge the Word Card كَتَبَ — then it joins your deck.",
    accent: "emerald",
    lessons: [
      { id: "s1-u0-l1", title: "What is a root?", kind: "forge" },
      { id: "s1-u0-l2", title: "Forge kataba", kind: "forge" },
    ],
    unlocks: ["ktb-form-1"],
  },
  {
    id: "path-node-form-i-drs",
    unit: "Unit 1 · The Card Forge",
    title: "Forge “he studied”",
    description: "Same Frame, new Thread — forge دَرَسَ (Mind school) for your deck.",
    accent: "emerald",
    lessons: [{ id: "s1-u0-l3", title: "Forge darasa", kind: "forge" }],
    unlocks: ["drs-form-1"],
  },
  {
    id: "path-node-form-i-slm",
    unit: "Unit 1 · The Card Forge",
    title: "Forge peace",
    description: "Forge سَلِمَ — a Frost card about safety.",
    accent: "emerald",
    lessons: [{ id: "s1-u1-l2", title: "Forge salima", kind: "forge" }],
    unlocks: ["slm-form-1"],
  },
  {
    id: "path-node-syntax-intro",
    unit: "Unit 1 · Syntax Bridge",
    title: "Noun before adjective",
    description:
      "In Arabic, adjectives follow nouns. Line up Word Cards in the right order to pass.",
    accent: "amber",
    lessons: [{ id: "syntax-na-1", title: "Order: Noun → Adjective", kind: "syntax" }],
    unlocks: ["slm-active-participle"],
  },
  {
    id: "path-node-form-i-nsr",
    unit: "Unit 1 · The Card Forge",
    title: "Forge victory",
    description: "Forge نَصَرَ — Kinetic aid — and lock Form I with a short quiz.",
    accent: "amber",
    lessons: [{ id: "s1-u1-l3", title: "Past tense quiz" }],
    unlocks: ["nsr-form-1"],
  },
  {
    id: "path-node-participle-ktb",
    unit: "Unit 2 · Doer & done",
    title: "Forge maktūb",
    description: "Forge مَكْتُوب — the written thing — as an Adjective card.",
    accent: "violet",
    lessons: [{ id: "s1-u3-l1", title: "Forge maktūb", kind: "forge" }],
    unlocks: ["ktb-passive-participle"],
  },
  {
    id: "path-node-participle-nsr",
    unit: "Unit 2 · Doer & done",
    title: "Forge place & doer",
    description: "Forge مَكْتَب and نَاصِر — nouns for your syntax chains.",
    accent: "violet",
    lessons: [
      { id: "s1-u3-l2", title: "Forge maktab", kind: "forge" },
      { id: "s1-u3-l3", title: "Doer & done quiz" },
    ],
    unlocks: ["ktb-place-noun", "nsr-active-participle"],
  },
  {
    id: "path-node-syntax-vso",
    unit: "Unit 2 · Syntax Bridge",
    title: "Verb leads the sentence",
    description:
      "Arabic often puts the Verb first (VSO). Chain Verb → Noun → Adjective for massive Arena power.",
    accent: "amber",
    lessons: [{ id: "syntax-vso-1", title: "Order: Verb → Noun → Adj", kind: "syntax" }],
    unlocks: ["drb-form-1"],
  },
  {
    id: "path-node-form-ii",
    unit: "Unit 3 · Intensives",
    title: "Forge intensives",
    description: "Form II intensifies meaning — forge Flame and Kinetic power cards.",
    accent: "amber",
    lessons: [
      { id: "s2-u0-l1", title: "Forge kattaba", kind: "forge" },
      { id: "s2-u0-l2", title: "Forge ʿallama", kind: "forge" },
    ],
    unlocks: ["ktb-form-2", "nsr-form-2"],
  },
  {
    id: "path-node-hfz-drb",
    unit: "Unit 4 · Guard & strike",
    title: "Forge frost & flame",
    description: "Unlock حَفِظَ (Frost) and reinforce strike cards for the Arena.",
    accent: "emerald",
    lessons: [
      { id: "s2-u1-l1", title: "Form X: istaktaba", kind: "forge" },
      { id: "s2-u1-l2", title: "Form X: istaʿlama", kind: "forge" },
    ],
    unlocks: ["hfz-form-1", "drb-active-participle"],
  },
  {
    id: "path-node-boss-deck",
    unit: "Unit 5 · Going further",
    title: "Mind deck & bare script",
    description: "Forge Mind-school cards, then practice reading as vowel marks fade.",
    accent: "amber",
    lessons: [
      { id: "s2-u2-l1", title: "Forge madrasa", kind: "forge" },
      { id: "s2-u3-l1", title: "Full → Minimal" },
    ],
    unlocks: ["hkm-form-1", "kshf-form-1", "drs-active-participle", "drs-noun-of-place"],
  },
];

export function getPathNode(nodeId: string): PathNode | undefined {
  return LEARNING_PATH_NODES.find((n) => n.id === nodeId);
}

export function getPathNodeIndex(nodeId: string): number {
  return LEARNING_PATH_NODES.findIndex((n) => n.id === nodeId);
}

export function isPathNodeAvailable(nodeId: string, completedNodeIds: string[]): boolean {
  const idx = getPathNodeIndex(nodeId);
  if (idx < 0) return false;
  if (idx === 0) return true;
  const prev = LEARNING_PATH_NODES[idx - 1];
  return prev ? completedNodeIds.includes(prev.id) : false;
}

export function isPathNodeComplete(nodeId: string, completedNodeIds: string[]): boolean {
  return completedNodeIds.includes(nodeId);
}

export function getNextLessonForNode(
  node: PathNode,
  completedLessonIds: string[],
): PathLessonRef | null {
  for (const lesson of node.lessons) {
    if (!completedLessonIds.includes(lesson.id)) return lesson;
  }
  return null;
}

export function areNodeLessonsComplete(
  node: PathNode,
  completedLessonIds: string[],
): boolean {
  return node.lessons.every((l) => completedLessonIds.includes(l.id));
}

export function getPathNodeForLesson(lessonId: string): PathNode | undefined {
  return LEARNING_PATH_NODES.find((n) => n.lessons.some((l) => l.id === lessonId));
}

/** Convert Word Card unlock IDs → DB root/pattern pairs */
export function unlocksToPairs(
  unlocks: PathVocabUnlock[],
): Array<{ rootId: string; patternId: string }> {
  const pairs: Array<{ rootId: string; patternId: string }> = [];
  for (const id of unlocks) {
    const card = getWordCard(id);
    if (card) pairs.push({ rootId: card.rootId, patternId: card.patternId });
  }
  return pairs;
}

export function describeUnlock(wordId: PathVocabUnlock): {
  rootLetters: string;
  patternName: string;
  arabic: string;
  english: string;
  school: string;
} {
  const card = getWordCard(wordId);
  if (!card) {
    return {
      rootLetters: "?",
      patternName: "?",
      arabic: "؟؟؟",
      english: "",
      school: "",
    };
  }
  const root = COMBAT_ROOTS.find((r) => r.id === card.rootId);
  const pattern = COMBAT_PATTERNS.find((p) => p.id === card.patternId);
  return {
    rootLetters: root?.letters ?? card.rootId,
    patternName: pattern?.name ?? card.patternId,
    arabic: card.word,
    english: card.translation,
    school: card.school,
  };
}

export function lessonHref(lessonId: string, pathNodeId: string): string {
  return `/lesson/${lessonId}?node=${encodeURIComponent(pathNodeId)}`;
}

/** Resolve a forge recipe for a morph lesson from its unlocks / ids */
export function recipeForLesson(
  lessonId: string,
): { rootId: string; patternId: string; wordId: string } | null {
  const node = getPathNodeForLesson(lessonId);
  const first = node?.unlocks[0];
  if (first) {
    const card = getWordCard(first);
    if (card) {
      return { rootId: card.rootId, patternId: card.patternId, wordId: card.id };
    }
  }
  // Fallback map for known morph lessons
  const FALLBACK: Record<string, string> = {
    "s1-u0-l2": "ktb-form-1",
    "s1-u0-l3": "drs-form-1",
    "s1-u1-l2": "slm-form-1",
    "s1-u3-l1": "ktb-passive-participle",
    "s1-u3-l2": "ktb-place-noun",
    "s2-u0-l1": "ktb-form-2",
    "s2-u2-l1": "drs-noun-of-place",
  };
  const id = FALLBACK[lessonId];
  if (!id) return null;
  const card = getWordCard(id);
  if (!card) return null;
  return { rootId: card.rootId, patternId: card.patternId, wordId: card.id };
}

export { forgeWordCard, getWordCard };
