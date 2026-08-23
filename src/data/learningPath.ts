import {
  COMBAT_PATTERNS,
  COMBAT_ROOTS,
  validateWeave,
} from "@/data/combatDictionary";

export type PathVocabUnlock = {
  rootId: string;
  patternId: string;
};

export type PathLessonRef = {
  id: string;
  title: string;
};

export type PathNode = {
  /** Stable id — also stored in `user_lesson_progress.lesson_id` when the node is cleared */
  id: string;
  unit: string;
  title: string;
  /** Learning-first blurb (fun / curiosity — not combat marketing) */
  description: string;
  accent: "sky" | "emerald" | "amber" | "violet";
  /** Curriculum lessons the learner plays for this node */
  lessons: PathLessonRef[];
  /** Optional Arena bonus when the node is finished */
  unlocks: PathVocabUnlock[];
};

/**
 * Linear Learning Path — play lessons in order.
 * Finishing a node’s lessons also unlocks optional Arena vocabulary.
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
    unit: "Unit 1 · Form I Verbs",
    title: "Build “he wrote”",
    description:
      "Three letters — ك ت ب — carry the idea of writing. Slot them into Form I and watch كَتَبَ appear.",
    accent: "emerald",
    lessons: [
      { id: "s1-u0-l1", title: "What is a root?" },
      { id: "s1-u0-l2", title: "Build kataba" },
    ],
    unlocks: [{ rootId: "ktb", patternId: "form-1" }],
  },
  {
    id: "path-node-form-i-drs",
    unit: "Unit 1 · Form I Verbs",
    title: "Same Frame, new Thread",
    description:
      "Reuse Form I with د ر س (studying). Feel how the Frame stays while the meaning changes.",
    accent: "emerald",
    lessons: [{ id: "s1-u0-l3", title: "Build darasa" }],
    unlocks: [{ rootId: "drs", patternId: "form-1" }],
  },
  {
    id: "path-node-form-i-slm",
    unit: "Unit 1 · Form I Verbs",
    title: "Peace & safety",
    description:
      "س ل م opens doors to “peace” and “safety.” Learn the Form I shape سَلِمَ.",
    accent: "emerald",
    lessons: [{ id: "s1-u1-l2", title: "Peace root: salima" }],
    unlocks: [{ rootId: "slm", patternId: "form-1" }],
  },
  {
    id: "path-node-form-i-nsr",
    unit: "Unit 1 · Form I Verbs",
    title: "Past tense quiz",
    description:
      "Lock in Form I past — including ن ص ر (help / victory) — with a short matching game.",
    accent: "amber",
    lessons: [{ id: "s1-u1-l3", title: "Past tense quiz" }],
    unlocks: [{ rootId: "nsr", patternId: "form-1" }],
  },
  {
    id: "path-node-participle-ktb",
    unit: "Unit 2 · Doer & done",
    title: "The done: maktūb",
    description:
      "Turn writing into “what is written” — مَكْتُوب, the passive participle from ك ت ب.",
    accent: "violet",
    lessons: [{ id: "s1-u3-l1", title: "The done: maktūb" }],
    unlocks: [{ rootId: "ktb", patternId: "passive-participle" }],
  },
  {
    id: "path-node-participle-nsr",
    unit: "Unit 2 · Doer & done",
    title: "Place noun: maktab",
    description:
      "Same Thread, new job: مَكْتَب — the place of writing. Spot how the Frame shifts meaning.",
    accent: "violet",
    lessons: [
      { id: "s1-u3-l2", title: "Place noun: maktab" },
      { id: "s1-u3-l3", title: "Doer & done quiz" },
    ],
    unlocks: [
      { rootId: "ktb", patternId: "active-participle" },
      { rootId: "nsr", patternId: "active-participle" },
    ],
  },
  {
    id: "path-node-form-ii",
    unit: "Unit 3 · Intensives",
    title: "Turn up the intensity",
    description:
      "Form II doubles the middle letter — more force, more causation. Hear the difference from Form I.",
    accent: "amber",
    lessons: [
      { id: "s2-u0-l1", title: "Form II: kattaba" },
      { id: "s2-u0-l2", title: "Form II: ʿallama" },
    ],
    unlocks: [
      { rootId: "ktb", patternId: "form-2" },
      { rootId: "nsr", patternId: "form-2" },
    ],
  },
  {
    id: "path-node-hfz-drb",
    unit: "Unit 4 · Seeking",
    title: "The seeking pattern",
    description:
      "Meet اِسْتَفْعَلَ — Form X — where استـ means “seek / request.” Play with writing and knowing.",
    accent: "emerald",
    lessons: [
      { id: "s2-u1-l1", title: "Form X: istaktaba" },
      { id: "s2-u1-l2", title: "Form X: istaʿlama" },
    ],
    unlocks: [
      { rootId: "hfz", patternId: "form-1" },
      { rootId: "drb", patternId: "form-1" },
    ],
  },
  {
    id: "path-node-boss-deck",
    unit: "Unit 5 · Going further",
    title: "Places & bare script",
    description:
      "Build a place noun, then practice reading as vowel marks fade — the fun part of getting fluent.",
    accent: "amber",
    lessons: [
      { id: "s2-u2-l1", title: "School: madrasa" },
      { id: "s2-u3-l1", title: "Full → Minimal" },
    ],
    unlocks: [
      { rootId: "hkm", patternId: "form-1" },
      { rootId: "kshf", patternId: "form-1" },
      { rootId: "drs", patternId: "active-participle" },
      { rootId: "slm", patternId: "active-participle" },
    ],
  },
];

export function getPathNode(nodeId: string): PathNode | undefined {
  return LEARNING_PATH_NODES.find((n) => n.id === nodeId);
}

export function getPathNodeIndex(nodeId: string): number {
  return LEARNING_PATH_NODES.findIndex((n) => n.id === nodeId);
}

export function isPathNodeAvailable(
  nodeId: string,
  completedNodeIds: string[],
): boolean {
  const idx = getPathNodeIndex(nodeId);
  if (idx < 0) return false;
  if (idx === 0) return true;
  const prev = LEARNING_PATH_NODES[idx - 1];
  return prev ? completedNodeIds.includes(prev.id) : false;
}

export function isPathNodeComplete(nodeId: string, completedNodeIds: string[]): boolean {
  return completedNodeIds.includes(nodeId);
}

/** First incomplete lesson on a node, or null if all lessons are done. */
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

/** Path node that contains this curriculum lesson (if any). */
export function getPathNodeForLesson(lessonId: string): PathNode | undefined {
  return LEARNING_PATH_NODES.find((n) => n.lessons.some((l) => l.id === lessonId));
}

export function describeUnlock(pair: PathVocabUnlock): {
  rootLetters: string;
  patternName: string;
  arabic: string;
  english: string;
} {
  const root = COMBAT_ROOTS.find((r) => r.id === pair.rootId);
  const pattern = COMBAT_PATTERNS.find((p) => p.id === pair.patternId);
  const spell = validateWeave(pair.rootId, pair.patternId);
  return {
    rootLetters: root?.letters ?? pair.rootId,
    patternName: pattern?.name ?? pair.patternId,
    arabic: spell?.arabicWord ?? "؟؟؟",
    english: spell?.englishTranslation ?? "",
  };
}

export function lessonHref(lessonId: string, pathNodeId: string): string {
  return `/lesson/${lessonId}?node=${encodeURIComponent(pathNodeId)}`;
}
