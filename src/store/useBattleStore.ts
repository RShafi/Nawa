"use client";

import { create } from "zustand";
import {
  COMBAT_PATTERNS,
  COMBAT_ROOTS,
  catalogRootId,
  type CombatPattern,
  type CombatRoot,
  type ValidSpell,
} from "@/data/combatDictionary";
import {
  TUTORIAL_OPENING_INTENT,
  TUTORIAL_PATTERNS,
  TUTORIAL_ROOTS,
  TUTORIAL_SECOND_WARD,
  TUTORIAL_TARGET_WARD,
  findTutorialSpell,
  type EnemyIntent,
} from "@/data/tutorialDeck";
import {
  BATTLE_WIN_HIBR,
  RUST_DAMAGE_MULT,
  STAGGER_DAMAGE_MULT,
  WARD_CHIP_DAMAGE,
  dealWardEncounter,
  findSpell,
  type Ward,
} from "@/lib/wardDealer";
import type { MasteryLevel } from "@/types/app-progress";

export type MasteryMap = Record<string, MasteryLevel>;

export type LoadedForge = {
  root: CombatRoot;
  pattern: CombatPattern;
  spell: ValidSpell | null;
};

export type CastResult = {
  ok: boolean;
  error?: string;
  kind?: "ward-shatter" | "stagger-hit" | "fizzle" | "miss";
  damage?: number;
  english?: string;
  arabic?: string;
  wardId?: string;
};

export type TurnBanner = {
  id: number;
  title: string;
  detail: string;
  tone: "enemy" | "player" | "system";
};

type BattleState = {
  started: boolean;
  victory: boolean;
  defeat: boolean;
  isTutorialEncounter: boolean;

  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  enemyName: string;
  enemyNameAr: string;
  enemyIntent: EnemyIntent | null;

  maxInk: number;
  currentInk: number;

  wards: Ward[];
  isStaggered: boolean;

  handRoots: CombatRoot[];
  handPatterns: CombatPattern[];
  selectedRootId: string | null;
  loaded: LoadedForge | null;

  masteryByWordId: MasteryMap;
  tafsirHalvedRoots: string[];
  rustActive: boolean;

  recentRootIds: string[];
  log: string[];
  lastResult: CastResult | null;
  screenShake: number;
  hibrAwarded: number | null;
  turnBanner: TurnBanner | null;

  tutorialMode: boolean;
  tutorialStep: number;

  startEncounter: (opts: {
    vocab: Array<{ rootId: string; patternId: string }>;
    masteryByWordId: MasteryMap;
    rustActive: boolean;
    withTutorial?: boolean;
  }) => { ok: boolean; error?: string };
  selectRoot: (rootInstanceId: string) => void;
  selectPattern: (patternId: string) => void;
  clearLoaded: () => void;
  castLoaded: () => CastResult;
  revealTafsir: (rootId: string) => void;
  enemyTurn: () => void;
  resetBattle: () => void;
  clearLastResult: () => void;
  clearTurnBanner: () => void;
  startTutorial: () => void;
  advanceTutorial: () => void;
  skipTutorial: () => void;
  redrawHand: () => { ok: boolean; error?: string };
  flickInk: () => { ok: boolean; error?: string; damage?: number };
};

export const TUTORIAL_STORAGE_KEY = "nawa-ward-tutorial-v2";
export const TUTORIAL_STEP_COUNT = 4;

function markTutorialDone() {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

function stampRoot(root: CombatRoot, i: number): CombatRoot {
  return { ...root, id: `${root.id}-${i}-${Math.random().toString(36).slice(2, 6)}` };
}

function masteryFor(map: MasteryMap, rootId: string, patternId: string): MasteryLevel {
  return map[`${rootId}:${patternId}`] ?? 1;
}

function resolveSpell(
  rootId: string,
  patternId: string,
  isTutorialEncounter: boolean,
): ValidSpell | null {
  if (isTutorialEncounter) {
    return findTutorialSpell(rootId, patternId) ?? findSpell(rootId, patternId);
  }
  return findSpell(rootId, patternId);
}

function nextIntent(prev: EnemyIntent | null, isStaggered: boolean): EnemyIntent {
  if (isStaggered) {
    return {
      kind: "probe",
      label: "Weakened Probe",
      damage: 6,
      turnsUntil: 1,
      icon: "eye",
    };
  }
  const cycle: EnemyIntent[] = [
    {
      kind: "heavy-strike",
      label: "Preparing Heavy Strike",
      damage: 20,
      turnsUntil: 1,
      icon: "sword",
    },
    {
      kind: "ward-shield",
      label: "Channeling Ward Shield",
      damage: 0,
      turnsUntil: 2,
      icon: "shield",
    },
    {
      kind: "probe",
      label: "Scanning Weaknesses",
      damage: 10,
      turnsUntil: 1,
      icon: "eye",
    },
  ];
  if (!prev) return cycle[0]!;
  const idx = cycle.findIndex((c) => c.kind === prev.kind);
  return cycle[(idx + 1) % cycle.length]!;
}

let bannerSeq = 0;

export const useBattleStore = create<BattleState>((set, get) => ({
  started: false,
  victory: false,
  defeat: false,
  isTutorialEncounter: false,
  playerHp: 40,
  playerMaxHp: 40,
  enemyHp: 60,
  enemyMaxHp: 60,
  enemyName: "Shadow of Ignorance",
  enemyNameAr: "ظِلُّ الْجَهْل",
  enemyIntent: null,
  maxInk: 10,
  currentInk: 10,
  wards: [],
  isStaggered: false,
  handRoots: [],
  handPatterns: [],
  selectedRootId: null,
  loaded: null,
  masteryByWordId: {},
  tafsirHalvedRoots: [],
  rustActive: false,
  recentRootIds: [],
  log: [],
  lastResult: null,
  screenShake: 0,
  hibrAwarded: null,
  turnBanner: null,
  tutorialMode: false,
  tutorialStep: 0,

  startEncounter: ({ vocab, masteryByWordId, rustActive, withTutorial }) => {
    if (withTutorial) {
      const roots = TUTORIAL_ROOTS.map((r, i) => stampRoot(r, i));
      const wards = [
        { ...TUTORIAL_TARGET_WARD },
        { ...TUTORIAL_SECOND_WARD },
      ];
      set({
        started: true,
        victory: false,
        defeat: false,
        isTutorialEncounter: true,
        playerHp: 40,
        playerMaxHp: 40,
        enemyHp: 80,
        enemyMaxHp: 80,
        enemyName: "Shadow of Ignorance",
        enemyNameAr: "ظِلُّ الْجَهْل",
        enemyIntent: { ...TUTORIAL_OPENING_INTENT },
        maxInk: 10,
        currentInk: 10,
        wards,
        isStaggered: false,
        handRoots: roots,
        handPatterns: [...TUTORIAL_PATTERNS],
        selectedRootId: null,
        loaded: null,
        masteryByWordId: {
          ...masteryByWordId,
          // Force one Level-3 card so Tafsīr step is demonstrable
          "slm:form-1": 3,
          "drs:noun-of-place": 1,
          "drb:form-1": 1,
        },
        tafsirHalvedRoots: [],
        rustActive: false,
        log: [
          "Tutorial deck loaded — powerful roots ready.",
          "Enemy raised Concept Locks. Study their intent badge above.",
        ],
        lastResult: null,
        screenShake: 0,
        hibrAwarded: null,
        turnBanner: null,
        tutorialMode: true,
        tutorialStep: 0,
      });
      return { ok: true };
    }

    const dealt = dealWardEncounter(vocab, get().recentRootIds);
    if (dealt.wards.length === 0) {
      return {
        ok: false,
        error: "No words in your Arena deck yet — finish a Learning Path stop to unlock some.",
      };
    }

    const roots = dealt.rootIds
      .map((id, i) => {
        const base = COMBAT_ROOTS.find((r) => r.id === id);
        return base ? stampRoot(base, i) : null;
      })
      .filter((r): r is CombatRoot => !!r);

    const patterns = dealt.patternIds
      .map((id) => COMBAT_PATTERNS.find((p) => p.id === id))
      .filter((p): p is CombatPattern => !!p);

    set({
      started: true,
      victory: false,
      defeat: false,
      isTutorialEncounter: false,
      playerHp: 40,
      playerMaxHp: 40,
      enemyHp: 60,
      enemyMaxHp: 60,
      enemyIntent: nextIntent(null, false),
      maxInk: 10,
      currentInk: 10,
      wards: dealt.wards,
      isStaggered: false,
      handRoots: roots,
      handPatterns: patterns.length ? patterns : COMBAT_PATTERNS.slice(0, 3),
      selectedRootId: null,
      loaded: null,
      masteryByWordId,
      tafsirHalvedRoots: [],
      rustActive,
      log: [
        "Enemy raised Concept Locks — shatter every English Ward.",
        rustActive ? "Rust debuff active — overdue reviews weaken your strikes." : "",
      ].filter(Boolean),
      lastResult: null,
      screenShake: 0,
      hibrAwarded: null,
      turnBanner: null,
      tutorialMode: false,
      tutorialStep: 0,
    });
    return { ok: true };
  },

  selectRoot: (rootInstanceId) => {
    const { handRoots, started, victory, defeat } = get();
    if (!started || victory || defeat) return;
    if (!handRoots.some((r) => r.id === rootInstanceId)) return;
    set({ selectedRootId: rootInstanceId, loaded: null });
  },

  selectPattern: (patternId) => {
    const {
      selectedRootId,
      handRoots,
      handPatterns,
      started,
      victory,
      defeat,
      isTutorialEncounter,
    } = get();
    if (!started || victory || defeat || !selectedRootId) return;
    const root = handRoots.find((r) => r.id === selectedRootId);
    const pattern = handPatterns.find((p) => p.id === patternId);
    if (!root || !pattern) return;
    const spell = resolveSpell(catalogRootId(root.id), pattern.id, isTutorialEncounter);
    set({
      loaded: { root, pattern, spell },
      selectedRootId: null,
    });
  },

  clearLoaded: () => set({ loaded: null, selectedRootId: null }),

  castLoaded: () => {
    const state = get();
    const { loaded, wards, isStaggered, tafsirHalvedRoots, rustActive, tutorialMode, tutorialStep } =
      state;
    if (!loaded) {
      return { ok: false, error: "Forge a word first (Root → Pattern)." };
    }

    const rootId = catalogRootId(loaded.root.id);
    const spell = loaded.spell;

    if (!spell) {
      const result: CastResult = {
        ok: true,
        kind: "fizzle",
        damage: 0,
        arabic: "؟؟؟",
        english: "Invalid morphology",
      };
      set({
        loaded: null,
        lastResult: result,
        log: [...state.log, "Fizzle — that root×pattern is not a real weave."].slice(-24),
      });
      queueMicrotask(() => get().enemyTurn());
      return result;
    }

    const matchingWard = wards.find(
      (w) => !w.shattered && w.rootId === spell.root && w.patternId === spell.pattern,
    );

    let damage = 0;
    let kind: CastResult["kind"] = "miss";
    let wardId: string | undefined;
    const nextWards = wards.map((w) => ({ ...w }));

    if (matchingWard) {
      kind = "ward-shatter";
      wardId = matchingWard.id;
      damage = WARD_CHIP_DAMAGE;
      const idx = nextWards.findIndex((w) => w.id === matchingWard.id);
      if (idx >= 0) nextWards[idx] = { ...nextWards[idx]!, shattered: true };
    } else if (isStaggered) {
      kind = "stagger-hit";
      damage = Math.round(spell.baseValue * STAGGER_DAMAGE_MULT);
    } else {
      kind = "miss";
      damage = Math.max(2, Math.round(spell.baseValue * 0.25));
    }

    if (tafsirHalvedRoots.includes(rootId)) {
      damage = Math.round(damage * 0.5);
    }
    if (rustActive) {
      damage = Math.round(damage * RUST_DAMAGE_MULT);
    }

    const allShattered = nextWards.every((w) => w.shattered);
    const nowStaggered = allShattered;
    let enemyHp = Math.max(0, state.enemyHp - damage);
    const victory = enemyHp <= 0;

    const lines = [
      kind === "ward-shatter"
        ? `You shattered the ward “${matchingWard!.english}” (−${damage}).`
        : kind === "stagger-hit"
          ? `Stagger strike with ${spell.arabicWord} (−${damage}).`
          : `Glance hit (−${damage}) — match a Ward for a full shatter.`,
    ];
    if (nowStaggered && !isStaggered) {
      lines.push("All wards down — enemy is Staggered! Form I strikes hit critically.");
    }
    if (victory) {
      lines.push(`Victory — earned ${BATTLE_WIN_HIBR} Hibr.`);
    }

    let nextTutStep = tutorialStep;
    if (tutorialMode) {
      if (tutorialStep === 1 && kind === "ward-shatter" && spell.id.includes("noun-of-place")) {
        nextTutStep = 2;
      } else if (tutorialStep === 2 && (kind === "stagger-hit" || nowStaggered)) {
        nextTutStep = 3;
      }
    }

    const result: CastResult = {
      ok: true,
      kind,
      damage,
      english: spell.englishTranslation,
      arabic: spell.arabicWord,
      wardId,
    };

    set({
      loaded: null,
      wards: nextWards,
      isStaggered: nowStaggered || isStaggered,
      enemyHp,
      victory,
      lastResult: result,
      recentRootIds: [...state.recentRootIds, rootId].slice(-8),
      log: [...state.log, ...lines].slice(-24),
      screenShake: kind === "ward-shatter" || kind === "stagger-hit" ? Date.now() : 0,
      hibrAwarded: victory ? BATTLE_WIN_HIBR : null,
      handRoots: state.handRoots.filter((r) => r.id !== loaded.root.id),
      tutorialStep: nextTutStep,
      turnBanner: {
        id: ++bannerSeq,
        title: kind === "ward-shatter" ? "Ward shattered!" : "You cast",
        detail: `${spell.arabicWord} — ${lines[0]}`,
        tone: "player",
      },
    });

    if (!victory) {
      queueMicrotask(() => get().enemyTurn());
    }
    return result;
  },

  revealTafsir: (rootId) => {
    set((s) => ({
      tafsirHalvedRoots: s.tafsirHalvedRoots.includes(rootId)
        ? s.tafsirHalvedRoots
        : [...s.tafsirHalvedRoots, rootId],
      log: [
        ...s.log,
        "Tafsīr used — English revealed; that root deals half damage this battle.",
      ].slice(-24),
      tutorialStep: s.tutorialMode && s.tutorialStep === 3 ? 3 : s.tutorialStep,
    }));
  },

  enemyTurn: () => {
    const { victory, defeat, playerHp, wards, isStaggered, handRoots, enemyIntent, isTutorialEncounter } =
      get();
    if (victory || defeat) return;

    let intent = enemyIntent ?? nextIntent(null, isStaggered);
    let dealt = 0;
    let logLine = "";
    let banner: TurnBanner | null = null;

    if (intent.turnsUntil <= 1) {
      if (intent.kind === "ward-shield") {
        dealt = 0;
        logLine = "Enemy channels a Ward Shield — no damage this beat, but locks harden.";
        banner = {
          id: ++bannerSeq,
          title: "Enemy channels shield",
          detail: "Ward Shield raised — shatter locks before the next heavy strike.",
          tone: "enemy",
        };
      } else {
        const intact = wards.filter((w) => !w.shattered).length;
        dealt = Math.min(
          playerHp,
          intent.damage || (isStaggered ? 6 : 8 + intact * 2),
        );
        logLine = `Enemy strikes for ${dealt} damage!`;
        banner = {
          id: ++bannerSeq,
          title: "Enemy strikes!",
          detail: `${intent.label} lands for ${dealt} damage.`,
          tone: "enemy",
        };
      }
      intent = nextIntent(intent, isStaggered);
    } else {
      intent = { ...intent, turnsUntil: intent.turnsUntil - 1 };
      logLine = `Enemy winds up — ${intent.label} in ${intent.turnsUntil} turn${intent.turnsUntil === 1 ? "" : "s"}.`;
      banner = {
        id: ++bannerSeq,
        title: "Enemy preparing…",
        detail: logLine,
        tone: "system",
      };
    }

    const nextHp = playerHp - dealt;
    const isDefeat = nextHp <= 0;

    let nextRoots = handRoots;
    if (nextRoots.length === 0 && !isDefeat) {
      const source = isTutorialEncounter ? TUTORIAL_ROOTS : COMBAT_ROOTS;
      const ids = isTutorialEncounter
        ? TUTORIAL_ROOTS.map((r) => r.id)
        : [...new Set(wards.map((w) => w.rootId))];
      nextRoots = ids
        .map((id, i) => {
          const baseRoot = source.find((r) => r.id === id) ?? COMBAT_ROOTS.find((r) => r.id === id);
          return baseRoot ? stampRoot(baseRoot, i) : null;
        })
        .filter((r): r is CombatRoot => !!r);
    }

    set((s) => ({
      playerHp: Math.max(0, nextHp),
      defeat: isDefeat,
      handRoots: nextRoots,
      enemyIntent: intent,
      currentInk: Math.min(s.maxInk, s.currentInk + 1),
      log: [
        ...s.log,
        isDefeat ? "Defeat — revisit the Learning Path, then try again." : logLine,
        !isDefeat ? "Ink +1." : "",
      ]
        .filter(Boolean)
        .slice(-24),
      screenShake: dealt > 0 ? Date.now() : s.screenShake,
      turnBanner: banner,
    }));
  },

  clearLastResult: () => set({ lastResult: null }),
  clearTurnBanner: () => set({ turnBanner: null }),

  startTutorial: () => set({ tutorialMode: true, tutorialStep: 0 }),

  advanceTutorial: () => {
    const { tutorialStep } = get();
    if (tutorialStep >= TUTORIAL_STEP_COUNT - 1) {
      markTutorialDone();
      set({ tutorialMode: false, tutorialStep: 0 });
      return;
    }
    set({ tutorialStep: tutorialStep + 1 });
  },

  skipTutorial: () => {
    markTutorialDone();
    set({ tutorialMode: false, tutorialStep: 0 });
  },

  redrawHand: () => {
    const { currentInk, started, victory, defeat, isTutorialEncounter, wards } = get();
    if (!started || victory || defeat) return { ok: false, error: "Not in battle." };
    if (currentInk < 2) return { ok: false, error: "Need 2 Ink to redraw." };

    const source = isTutorialEncounter ? TUTORIAL_ROOTS : COMBAT_ROOTS;
    const ids = isTutorialEncounter
      ? TUTORIAL_ROOTS.map((r) => r.id)
      : [...new Set(wards.map((w) => w.rootId))];
    const shuffled = [...ids].sort(() => Math.random() - 0.5);
    const nextRoots = shuffled
      .slice(0, Math.min(4, shuffled.length))
      .map((id, i) => {
        const base = source.find((r) => r.id === id) ?? COMBAT_ROOTS.find((r) => r.id === id);
        return base ? stampRoot(base, i) : null;
      })
      .filter((r): r is CombatRoot => !!r);

    set((s) => ({
      currentInk: s.currentInk - 2,
      handRoots: nextRoots,
      selectedRootId: null,
      loaded: null,
      log: [...s.log, "Redraw — spent 2 Ink for a fresh Thread hand."].slice(-24),
    }));
    return { ok: true };
  },

  flickInk: () => {
    const { started, victory, defeat, enemyHp } = get();
    if (!started || victory || defeat) return { ok: false, error: "Not in battle." };
    const damage = 2;
    const nextHp = Math.max(0, enemyHp - damage);
    const won = nextHp <= 0;
    set((s) => ({
      enemyHp: nextHp,
      victory: won,
      hibrAwarded: won ? BATTLE_WIN_HIBR : s.hibrAwarded,
      log: [...s.log, `Flick Ink — chip damage (−${damage}).`].slice(-24),
      lastResult: {
        ok: true,
        kind: "miss",
        damage,
        english: "Ink flick",
        arabic: "حِبْر",
      },
      turnBanner: {
        id: ++bannerSeq,
        title: "Ink flick!",
        detail: `Chip damage −${damage}.`,
        tone: "player",
      },
      screenShake: Date.now(),
    }));
    if (!won) queueMicrotask(() => get().enemyTurn());
    return { ok: true, damage };
  },

  resetBattle: () =>
    set({
      started: false,
      victory: false,
      defeat: false,
      isTutorialEncounter: false,
      wards: [],
      isStaggered: false,
      handRoots: [],
      handPatterns: [],
      selectedRootId: null,
      loaded: null,
      lastResult: null,
      log: [],
      hibrAwarded: null,
      enemyIntent: null,
      turnBanner: null,
      tutorialMode: false,
      tutorialStep: 0,
      maxInk: 10,
      currentInk: 10,
    }),
}));

export function getMasteryLevel(
  map: MasteryMap,
  rootId: string,
  patternId: string,
): MasteryLevel {
  return masteryFor(map, rootId, patternId);
}

export const TUTORIAL_TARGET = { rootId: "drs", patternId: "noun-of-place" } as const;
