"use client";

import { create } from "zustand";
import { curriculumData } from "@/content/curriculumData";
import {
  FLAME_BURN_RATIO,
  FLAME_BURN_TICKS,
  getWordCard,
  getWordCards,
  syntaxMultiplier,
  type ElementSchool,
  type WordCard,
} from "@/data/combatDictionary";
import { type CombatState, delay, RESONANCE_CRIT_MULT } from "@/lib/combatPacing";
import { validateSyntax } from "@/lib/syntax";
import type { SemanticTag } from "@/types/cards";
import type {
  ElementalSchool,
  PartOfSpeech as CurriculumPartOfSpeech,
  VocabularyItem,
} from "@/types/curriculum";
import { findSemanticPair, generateNaturalTranslation } from "@/utils/grammarEngine";

const MIN_PLAYER_DECK_SIZE = 5;

/** Combat lexicon IDs used when mastered curriculum vocab is too small. */
const STARTER_CARD_IDS = [
  "drb-noun-of-instrument",
  "hfz-active-participle",
  "ktb-noun-book",
  "kbr-adjective",
  "ktb-form-1",
  "drb-form-1",
] as const;

function collectCurriculumVocab(): VocabularyItem[] {
  const items: VocabularyItem[] = [];
  const seen = new Set<string>();

  for (const lesson of curriculumData) {
    for (const vocab of lesson.unlockableVocab) {
      if (seen.has(vocab.id)) continue;
      seen.add(vocab.id);
      items.push(vocab);
    }
    for (const step of lesson.steps) {
      if (step.forgeVocab && !seen.has(step.forgeVocab.id)) {
        seen.add(step.forgeVocab.id);
        items.push(step.forgeVocab);
      }
      for (const vocab of step.targetVocab ?? []) {
        if (seen.has(vocab.id)) continue;
        seen.add(vocab.id);
        items.push(vocab);
      }
    }
  }

  return items;
}

function wordCardToVocabularyItem(card: WordCard): VocabularyItem {
  const posMap: Record<WordCard["partOfSpeech"], CurriculumPartOfSpeech> = {
    NOUN: "noun",
    VERB: "verb",
    ADJECTIVE: "adjective",
  };
  const schoolMap: Record<ElementSchool, ElementalSchool> = {
    FLAME: "flame",
    FROST: "frost",
    MIND: "mind",
    KINETIC: "kinetic",
  };

  return {
    id: card.id,
    arabic: card.word,
    transliteration: card.transliteration,
    english: card.translation,
    partOfSpeech: posMap[card.partOfSpeech],
    elementalSchool: schoolMap[card.school],
    rootId: card.rootId.startsWith("root-") ? card.rootId : `root-${card.rootId}`,
    pattern: {
      id: card.patternId,
      name: card.patternId,
      meaning: "",
      visualSlots: [],
    },
    semanticTags: card.tags,
    validTargetTags: card.validTargets,
  };
}

function defaultBasePower(partOfSpeech: CurriculumPartOfSpeech): number {
  switch (partOfSpeech) {
    case "verb":
      return 18;
    case "noun":
      return 14;
    case "adjective":
      return 12;
    case "particle":
      return 8;
    default:
      return 12;
  }
}

function vocabToWordCard(vocab: VocabularyItem): WordCard {
  const posMap: Record<CurriculumPartOfSpeech, WordCard["partOfSpeech"]> = {
    noun: "NOUN",
    verb: "VERB",
    adjective: "ADJECTIVE",
    particle: "NOUN",
  };
  const schoolMap: Record<ElementalSchool, ElementSchool> = {
    flame: "FLAME",
    frost: "FROST",
    mind: "MIND",
    kinetic: "KINETIC",
  };

  return {
    id: vocab.id,
    word: vocab.arabic,
    translation: vocab.english,
    transliteration: vocab.transliteration,
    partOfSpeech: posMap[vocab.partOfSpeech],
    school: schoolMap[vocab.elementalSchool],
    basePower: defaultBasePower(vocab.partOfSpeech),
    rootId: vocab.rootId.replace(/^root-/, ""),
    patternId: vocab.pattern.id ?? vocab.pattern.name,
    tags: vocab.semanticTags as SemanticTag[],
    validTargets: vocab.validTargetTags as SemanticTag[] | undefined,
    lemmaEn: vocab.english.split("/")[0]?.trim(),
  };
}

function getStarterVocabulary(): VocabularyItem[] {
  return STARTER_CARD_IDS.map((id) => getWordCard(id))
    .filter((card): card is WordCard => Boolean(card))
    .map(wordCardToVocabularyItem);
}

function resolveWordCards(ids: string[], playerDeck: VocabularyItem[]): WordCard[] {
  const vocabById = new Map(playerDeck.map((v) => [v.id, v]));
  const cards: WordCard[] = [];

  for (const id of ids) {
    const vocab = vocabById.get(id);
    if (vocab) {
      cards.push(vocabToWordCard(vocab));
      continue;
    }
    const legacy = getWordCard(id);
    if (legacy) cards.push(legacy);
  }

  return cards;
}

function playerDeckAsWordCards(playerDeck: VocabularyItem[]): WordCard[] {
  return playerDeck.map(vocabToWordCard);
}

/**
 * Deal up to `count` cards, guaranteeing at least one noun↔modifier semantic pair when possible.
 */
function dealGuidedHandCards(
  poolCards: WordCard[],
  count: number,
): { hand: WordCard[]; rest: WordCard[] } {
  const pool = shuffle([...poolCards]);
  const n = Math.min(count, pool.length);
  if (n <= 0) return { hand: [], rest: pool };

  const pair = findSemanticPair(pool);
  const hand: WordCard[] = [];
  const used = new Set<string>();

  if (pair && n >= 2) {
    hand.push(pair.noun, pair.partner);
    used.add(pair.noun.id);
    used.add(pair.partner.id);
  }

  for (const card of pool) {
    if (hand.length >= n) break;
    if (used.has(card.id)) continue;
    hand.push(card);
    used.add(card.id);
  }

  const rest = pool.filter((card) => !used.has(card.id));
  return { hand: shuffle(hand), rest };
}

function buildPlayerDeck(masteredVocabIds: string[]): VocabularyItem[] {
  const catalog = collectCurriculumVocab();
  const mastered = new Set(masteredVocabIds);
  const deck: VocabularyItem[] = [];
  const seen = new Set<string>();

  for (const vocab of catalog) {
    if (!mastered.has(vocab.id) || seen.has(vocab.id)) continue;
    seen.add(vocab.id);
    deck.push(vocab);
  }

  if (deck.length < MIN_PLAYER_DECK_SIZE) {
    for (const starter of getStarterVocabulary()) {
      if (deck.length >= MIN_PLAYER_DECK_SIZE) break;
      if (seen.has(starter.id)) continue;
      seen.add(starter.id);
      deck.push(starter);
    }
  }

  if (deck.length === 0) {
    return getStarterVocabulary();
  }

  return deck;
}

export type EnemyIntent = {
  kind: "heavy-strike" | "probe" | "ward-shield";
  label: string;
  damage: number;
  turnsUntil: number;
  icon: "sword" | "shield" | "eye";
};

export type CastResultKind = "hit" | "syntax-fail" | "shield-break" | "fizzle" | "block";

export type LastCastResult = {
  kind: CastResultKind;
  arabic: string;
  english: string;
  damage: number;
  multiplier: number;
  schools: ElementSchool[];
  /** True when Resonance Check scored a Critical Strike */
  critical?: boolean;
};

/** Battle-turn Ink (حِبْر) — spent to play cards / redraw; refills each turn. */
export const MAX_BATTLE_INK = 5;
export const CARD_INK_COST = 1;
export const REDRAW_INK_COST = 1;

type BattleStore = {
  started: boolean;
  victory: boolean;
  defeat: boolean;
  combatState: CombatState;
  /** Pending sentence awaiting Resonance Check before resolveTurn */
  pendingCastCards: WordCard[];
  isCriticalStrike: boolean;
  playerHp: number;
  playerMaxHp: number;
  playerShield: number;
  enemyHp: number;
  enemyMaxHp: number;
  enemyName: string;
  enemyNameAr: string;
  enemyIntent: EnemyIntent | null;
  enemyShield: number;
  burnTicks: number;
  burnDamage: number;
  frostSkip: boolean;
  weakTo: ElementSchool | null;
  ink: number;
  maxInk: number;
  hand: WordCard[];
  deckPool: string[];
  playerDeck: VocabularyItem[];
  currentSentence: WordCard[];
  syntaxValid: boolean;
  syntaxError: string | null;
  log: string[];
  lastResult: LastCastResult | null;
  lastEnemyHit: number | null;
  turnBanner: {
    id: number;
    title: string;
    detail: string;
    tone: "player" | "enemy" | "system";
  } | null;
  screenShake: boolean;
  hibrAwarded: number | null;
  rustActive: boolean;

  startEncounter: (opts: {
    deck: string[];
    rustActive?: boolean;
  }) => { ok: boolean; error?: string };
  initializeDeck: (masteredVocabIds: string[]) => void;
  resetBattle: () => void;
  drawHand: (count?: number) => void;
  playCard: (cardId: string) => { ok: boolean; error?: string };
  removeFromSentence: (index: number) => void;
  removeCardFromSyntax: (cardId: string) => void;
  clearSentence: () => void;
  redrawHand: () => { ok: boolean; error?: string };
  castSentence: () => { ok: boolean; error?: string };
  /** Answer the Resonance Check; resumes combat into player_attacking */
  resolveResonance: (success: boolean) => void;
  resolveTurn: (cards: WordCard[]) => Promise<void>;
  clearLastResult: () => void;
  clearTurnBanner: () => void;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function sumBase(cards: WordCard[]): number {
  return cards.reduce((n, c) => n + c.basePower, 0);
}

function applyElemental(
  schools: ElementSchool[],
  damage: number,
  state: {
    enemyShield: number;
    burnTicks: number;
    burnDamage: number;
    frostSkip: boolean;
    playerShield: number;
  },
): {
  enemyShield: number;
  burnTicks: number;
  burnDamage: number;
  frostSkip: boolean;
  playerShield: number;
  pierce: boolean;
  logs: string[];
} {
  const logs: string[] = [];
  let { enemyShield, burnTicks, burnDamage, frostSkip, playerShield } = state;
  let pierce = false;

  for (const school of [...new Set(schools)]) {
    if (school === "FLAME") {
      burnTicks = FLAME_BURN_TICKS;
      burnDamage = Math.max(2, Math.round(damage * FLAME_BURN_RATIO));
      logs.push(`Flame Burn: ${burnDamage} dmg × ${burnTicks} turns`);
    }
    if (school === "FROST") {
      const gain = Math.max(18, Math.round(damage * 1.1));
      playerShield += gain;
      frostSkip = false;
      logs.push(`Frost Ward: +${gain} player shield`);
    }
    if (school === "MIND") {
      pierce = true;
      if (enemyShield > 0) {
        logs.push(`Mind: pierced shield (${enemyShield} → 0)`);
        enemyShield = 0;
      } else {
        logs.push("Mind: intent revealed");
      }
    }
    if (school === "KINETIC") {
      logs.push("Kinetic: raw force");
    }
  }

  return {
    enemyShield,
    burnTicks,
    burnDamage,
    frostSkip,
    playerShield,
    pierce,
    logs,
  };
}

const initialBattle = {
  started: false,
  victory: false,
  defeat: false,
  combatState: "idle" as CombatState,
  pendingCastCards: [] as WordCard[],
  isCriticalStrike: false,
  playerHp: 40,
  playerMaxHp: 40,
  playerShield: 0,
  enemyHp: 70,
  enemyMaxHp: 70,
  enemyName: "Shadow of Ignorance",
  enemyNameAr: "ظِلُّ الْجَهْل",
  enemyIntent: null as EnemyIntent | null,
  enemyShield: 0,
  burnTicks: 0,
  burnDamage: 0,
  frostSkip: false,
  weakTo: null as ElementSchool | null,
  ink: MAX_BATTLE_INK,
  maxInk: MAX_BATTLE_INK,
  hand: [] as WordCard[],
  deckPool: [] as string[],
  playerDeck: [] as VocabularyItem[],
  currentSentence: [] as WordCard[],
  syntaxValid: true,
  syntaxError: null as string | null,
  log: [] as string[],
  lastResult: null as LastCastResult | null,
  lastEnemyHit: null as number | null,
  turnBanner: null as BattleStore["turnBanner"],
  screenShake: false,
  hibrAwarded: null as number | null,
  rustActive: false,
};

let bannerId = 0;
let resolveLock = false;

export const useBattleStore = create<BattleStore>((set, get) => ({
  ...initialBattle,

  initializeDeck: (masteredVocabIds) => {
    const playerDeck = buildPlayerDeck(masteredVocabIds);
    set({ playerDeck });
  },

  startEncounter: ({ deck, rustActive = false }) => {
    let { playerDeck } = get();
    let poolCards: WordCard[];

    if (playerDeck.length > 0) {
      poolCards = shuffle(playerDeckAsWordCards(playerDeck));
    } else {
      const unique = [...new Set(deck)].filter((id) => getWordCard(id));
      if (unique.length > 0) {
        poolCards = getWordCards(unique);
      } else {
        playerDeck = buildPlayerDeck([]);
        if (playerDeck.length === 0) {
          return { ok: false, error: "Forge Word Cards on the Learning Path first." };
        }
        poolCards = shuffle(playerDeckAsWordCards(playerDeck));
      }
    }

    if (poolCards.length === 0) {
      return { ok: false, error: "Forge Word Cards on the Learning Path first." };
    }

    const { hand, rest } = dealGuidedHandCards(poolCards, Math.min(5, poolCards.length));

    resolveLock = false;
    set({
      ...initialBattle,
      started: true,
      combatState: "idle",
      rustActive,
      playerDeck,
      deckPool: rest.map((c) => c.id),
      hand,
      enemyShield: poolCards.length >= 4 ? 18 : 0,
      weakTo: "FLAME",
      enemyIntent: {
        kind: "heavy-strike",
        label: "Preparing Heavy Strike",
        damage: 14,
        turnsUntil: 1,
        icon: "sword",
      },
      log: ["Battle start — chain Word Cards into a sentence, then Cast."],
      turnBanner: {
        id: ++bannerId,
        title: "Your turn",
        detail: "Build a sentence in the Syntax Bar",
        tone: "player",
      },
    });
    return { ok: true };
  },

  resetBattle: () => {
    const { playerDeck } = get();
    resolveLock = false;
    set({ ...initialBattle, playerDeck });
  },

  drawHand: (count = 5) => {
    const { deckPool, hand, playerDeck } = get();
    const need = Math.max(0, count - hand.length);
    if (need === 0 || deckPool.length === 0) return;

    const poolCards = resolveWordCards(deckPool, playerDeck);
    if (poolCards.length === 0) return;

    if (hand.length === 0) {
      const { hand: dealt, rest } = dealGuidedHandCards(poolCards, Math.min(need, poolCards.length));
      set({
        hand: dealt,
        deckPool: rest.map((c) => c.id),
      });
      return;
    }

    const take = poolCards.slice(0, need);
    const rest = poolCards.slice(need);
    set({
      hand: [...hand, ...take],
      deckPool: rest.map((c) => c.id),
    });
  },

  playCard: (cardId) => {
    const { hand, currentSentence, victory, defeat, ink, combatState } = get();
    if (victory || defeat) return { ok: false, error: "Battle over." };
    if (combatState !== "idle") return { ok: false, error: "Wait for combat to resolve." };
    const idx = hand.findIndex((c) => c.id === cardId);
    if (idx < 0) return { ok: false, error: "Card not in hand." };
    if (currentSentence.length >= 4) return { ok: false, error: "Syntax chamber full." };
    if (ink < CARD_INK_COST) return { ok: false, error: "Not enough Ink." };
    const card = hand[idx]!;
    const nextHand = [...hand];
    nextHand.splice(idx, 1);
    const nextSentence = [...currentSentence, card];
    const syntax = validateSyntax(nextSentence);
    set({
      hand: nextHand,
      currentSentence: nextSentence,
      ink: ink - CARD_INK_COST,
      syntaxValid: syntax.ok,
      syntaxError: syntax.error ?? null,
    });
    return { ok: true };
  },

  removeFromSentence: (index) => {
    const { currentSentence, hand, ink, maxInk, combatState } = get();
    if (combatState !== "idle") return;
    const card = currentSentence[index];
    if (!card) return;
    const nextSentence = currentSentence.filter((_, i) => i !== index);
    const syntax = validateSyntax(nextSentence);
    set({
      currentSentence: nextSentence,
      hand: [...hand, card],
      ink: Math.min(maxInk, ink + CARD_INK_COST),
      syntaxValid: nextSentence.length === 0 ? true : syntax.ok,
      syntaxError: nextSentence.length === 0 ? null : (syntax.error ?? null),
    });
  },

  removeCardFromSyntax: (cardId) => {
    const { currentSentence, combatState } = get();
    if (combatState !== "idle") return;
    const index = currentSentence.findIndex((c) => c.id === cardId);
    if (index < 0) return;
    get().removeFromSentence(index);
  },

  clearSentence: () => {
    const { currentSentence, hand, ink, maxInk, combatState } = get();
    if (combatState !== "idle") return;
    const refund = currentSentence.length * CARD_INK_COST;
    set({
      hand: [...hand, ...currentSentence],
      currentSentence: [],
      ink: Math.min(maxInk, ink + refund),
      syntaxValid: true,
      syntaxError: null,
    });
  },

  redrawHand: () => {
    const s = get();
    if (!s.started || s.victory || s.defeat) return { ok: false, error: "Not in battle." };
    if (s.combatState !== "idle") return { ok: false, error: "Wait for combat to resolve." };
    if (s.ink < REDRAW_INK_COST) return { ok: false, error: "Not enough Ink to redraw." };

    const returned = [
      ...s.hand.map((c) => c.id),
      ...s.currentSentence.map((c) => c.id),
      ...s.deckPool,
    ];
    const poolCards = shuffle(resolveWordCards(returned, s.playerDeck));
    const { hand, rest } = dealGuidedHandCards(poolCards, Math.min(5, poolCards.length));
    set({
      ink: s.ink - REDRAW_INK_COST,
      hand,
      deckPool: rest.map((c) => c.id),
      currentSentence: [],
      syntaxValid: true,
      syntaxError: null,
      log: [...s.log, `Redraw (−${REDRAW_INK_COST} Ink)`].slice(-24),
    });
    return { ok: true };
  },

  castSentence: () => {
    const s = get();
    if (!s.started || s.victory || s.defeat) return { ok: false, error: "Not in battle." };
    if (s.combatState !== "idle" || resolveLock) {
      return { ok: false, error: "Combat is resolving." };
    }
    if (s.currentSentence.length === 0) {
      return { ok: false, error: "Play cards into the Syntax Bar." };
    }

    const cards = [...s.currentSentence];
    const syntax = validateSyntax(cards);
    if (!syntax.ok) {
      set({
        syntaxValid: false,
        syntaxError: syntax.error ?? "Invalid grammar",
        lastResult: {
          kind: "syntax-fail",
          arabic: cards.map((c) => c.word).join(" "),
          english: syntax.error ?? "Broken chain",
          damage: 0,
          multiplier: 0,
          schools: cards.map((c) => c.school),
        },
        screenShake: true,
        log: [...s.log, `Syntax fail — ${syntax.error}`].slice(-24),
      });
      window.setTimeout(() => set({ screenShake: false }), 400);
      return { ok: false, error: syntax.error };
    }

    set({
      currentSentence: [],
      syntaxValid: true,
      syntaxError: null,
      pendingCastCards: cards,
      isCriticalStrike: false,
      combatState: "resonance_check",
      turnBanner: {
        id: ++bannerId,
        title: "Resonance Check",
        detail: "Channel the meaning of your spell",
        tone: "system",
      },
    });
    return { ok: true };
  },

  resolveResonance: (success) => {
    const s = get();
    if (s.combatState !== "resonance_check" || s.pendingCastCards.length === 0) return;
    const cards = [...s.pendingCastCards];
    set({
      isCriticalStrike: success,
      pendingCastCards: [],
      log: [
        ...s.log,
        success
          ? "Resonance aligned — Critical Strike!"
          : "Meaning slipped — base damage only.",
      ].slice(-24),
    });
    void get().resolveTurn(cards);
  },

  resolveTurn: async (cards) => {
    if (resolveLock) return;
    resolveLock = true;

    const s0 = get();
    const mult = syntaxMultiplier(cards.length);
    const crit = s0.isCriticalStrike;
    const critMult = crit ? RESONANCE_CRIT_MULT : 1;
    let base = sumBase(cards);
    if (s0.rustActive) base = Math.round(base * 0.7);

    const schools = cards.map((c) => c.school);
    const arabic = cards.map((c) => c.word).join(" · ");
    const english = generateNaturalTranslation(cards);

    // Preview cast result before HP lands (for VFX)
    let previewDamage = Math.round(base * mult * critMult);
    if (s0.weakTo && schools.includes(s0.weakTo)) {
      previewDamage = Math.round(previewDamage * 1.35);
    }

    set({
      combatState: "player_attacking",
      lastResult: {
        kind: "hit",
        arabic,
        english,
        damage: previewDamage,
        multiplier: mult * critMult,
        schools,
        critical: crit,
      },
      turnBanner: {
        id: ++bannerId,
        title: crit ? "CRITICAL STRIKE!" : `${mult}× Combo!`,
        detail: crit ? "Meaning channeled — full power" : "Spell in flight",
        tone: "player",
      },
      lastEnemyHit: null,
    });

    await delay(1000);

    const s = get();
    if (!s.started) {
      resolveLock = false;
      set({ isCriticalStrike: false });
      return;
    }

    const elemental = applyElemental(schools, Math.round(base * mult * critMult), {
      enemyShield: s.enemyShield,
      burnTicks: s.burnTicks,
      burnDamage: s.burnDamage,
      frostSkip: s.frostSkip,
      playerShield: s.playerShield,
    });

    let damage = Math.round(base * mult * critMult);
    if (s.weakTo && schools.includes(s.weakTo)) {
      damage = Math.round(damage * 1.35);
      elemental.logs.push(`Weakness (${s.weakTo}) ×1.35`);
    }
    if (crit) {
      elemental.logs.push(`Critical Resonance ×${RESONANCE_CRIT_MULT}`);
    }

    let enemyShield = elemental.enemyShield;
    let dealt = damage;
    let kind: CastResultKind = "hit";

    if (!elemental.pierce && enemyShield > 0) {
      const absorbed = Math.min(enemyShield, damage);
      enemyShield -= absorbed;
      dealt = damage - absorbed;
      if (dealt <= 0) {
        kind = "shield-break";
        dealt = 0;
      }
      elemental.logs.push(`Shield absorbed ${absorbed}`);
    }

    const enemyHp = Math.max(0, s.enemyHp - dealt);
    const victory = enemyHp <= 0;

    set({
      enemyHp,
      enemyShield,
      burnTicks: elemental.burnTicks,
      burnDamage: elemental.burnDamage,
      frostSkip: elemental.frostSkip,
      playerShield: elemental.playerShield,
      lastResult: {
        kind,
        arabic,
        english,
        damage: dealt,
        multiplier: mult * critMult,
        schools,
        critical: crit,
      },
      log: [
        ...s.log,
        `Cast (${mult}×${crit ? ` Crit×${RESONANCE_CRIT_MULT}` : ""}): ${arabic} → −${dealt}`,
        ...elemental.logs,
      ].slice(-24),
      victory,
      hibrAwarded: victory ? 25 + cards.length * 5 + (crit ? 10 : 0) : null,
      screenShake: dealt > 0 || crit,
      isCriticalStrike: false,
    });
    window.setTimeout(() => set({ screenShake: false }), crit ? 550 : 400);

    if (victory) {
      set({
        combatState: "idle",
        turnBanner: {
          id: ++bannerId,
          title: "Victory",
          detail: "Sentence power wins",
          tone: "player",
        },
      });
      resolveLock = false;
      return;
    }

    // Burn tick between player strike and enemy turn
    let nextBurn = get().burnTicks;
    let nextHp = get().enemyHp;
    const burnLogs: string[] = [];
    if (nextBurn > 0 && get().burnDamage > 0) {
      nextHp = Math.max(0, nextHp - get().burnDamage);
      nextBurn -= 1;
      burnLogs.push(`Burn tick −${get().burnDamage}`);
      set({ enemyHp: nextHp, burnTicks: nextBurn });
      if (nextHp <= 0) {
        set({
          victory: true,
          hibrAwarded: 30,
          combatState: "idle",
          log: [...get().log, ...burnLogs, "Burn finished the enemy."].slice(-24),
        });
        resolveLock = false;
        return;
      }
    }

    const cur = get();
    if (cur.frostSkip) {
      set({
        frostSkip: false,
        ink: cur.maxInk,
        combatState: "idle",
        log: [...cur.log, ...burnLogs, "Enemy turn skipped (Frost).", "Ink restored."].slice(-24),
        turnBanner: {
          id: ++bannerId,
          title: "Enemy delayed",
          detail: "Frost holds them back",
          tone: "system",
        },
      });
      get().drawHand(5);
      resolveLock = false;
      return;
    }

    // Enemy turn transition banner (short), clear, then attack
    set({
      combatState: "enemy_turn_transition",
      turnBanner: {
        id: ++bannerId,
        title: "ENEMY TURN",
        detail: cur.enemyIntent?.label ?? "Attack incoming",
        tone: "enemy",
      },
    });
    await delay(800);

    set({ combatState: "enemy_idle", turnBanner: null });
    await delay(300);

    const livePre = get();
    const intent = livePre.enemyIntent;
    let rawHit = intent?.damage ?? 10;
    let shieldPre = livePre.playerShield;
    let blocked = false;
    let finalHit = rawHit;
    if (shieldPre > 0) {
      const absorbed = Math.min(shieldPre, rawHit);
      shieldPre -= absorbed;
      finalHit = rawHit - absorbed;
      blocked = absorbed > 0;
    }

    set({
      combatState: "enemy_attacking",
      lastEnemyHit: blocked && finalHit === 0 ? 0 : finalHit,
    });
    await delay(1000);

    const live = get();
    const playerHp = Math.max(0, live.playerHp - finalHit);
    const defeat = playerHp <= 0;

    const spentIds = cards.map((c) => c.id);
    const returnedIds = [
      ...new Set([
        ...live.deckPool,
        ...spentIds,
        ...live.hand.map((h) => h.id),
      ]),
    ];
    const poolCards = shuffle(resolveWordCards(returnedIds, live.playerDeck));
    const { hand: newHand, rest } = dealGuidedHandCards(poolCards, Math.min(5, poolCards.length));
    const newPool = rest.map((c) => c.id);

    set({
      playerHp,
      playerShield: shieldPre,
      defeat,
      screenShake: finalHit > 0,
      log: [
        ...live.log,
        ...burnLogs,
        blocked && finalHit === 0
          ? "BLOCKED! Frost Ward held."
          : blocked
            ? `Enemy hits −${finalHit} (partial block)`
            : `Enemy hits −${finalHit}`,
        ...(defeat ? [] : ["Ink restored."]),
      ].slice(-24),
      turnBanner: defeat
        ? {
            id: ++bannerId,
            title: "Defeat",
            detail: "Forge more cards on the Path",
            tone: "enemy",
          }
        : blocked && finalHit === 0
          ? {
              id: ++bannerId,
              title: "BLOCKED!",
              detail: "Your Frost Ward absorbed the blow",
              tone: "system",
            }
          : {
              id: ++bannerId,
              title: "Enemy strike",
              detail: `−${finalHit} HP`,
              tone: "enemy",
            },
      enemyIntent: {
        kind: "probe",
        label: "Preparing Strike",
        damage: 10 + Math.floor(Math.random() * 6),
        turnsUntil: 1,
        icon: "sword",
      },
    });
    window.setTimeout(() => set({ screenShake: false }), 450);

    await delay(1000);

    if (get().defeat) {
      set({ combatState: "idle" });
      resolveLock = false;
      return;
    }

    set({
      combatState: "idle",
      hand: newHand,
      deckPool: newPool,
      ink: get().maxInk,
      lastEnemyHit: null,
      turnBanner: {
        id: ++bannerId,
        title: "Your turn",
        detail: "Ink restored — weave another sentence",
        tone: "player",
      },
    });
    resolveLock = false;
  },

  clearLastResult: () => set({ lastResult: null }),
  clearTurnBanner: () => set({ turnBanner: null }),
}));

export function getMasteryLevel(
  map: Record<string, 1 | 2 | 3>,
  rootId: string,
  patternId: string,
): 1 | 2 | 3 {
  return map[`${rootId}:${patternId}`] ?? 1;
}

export const TUTORIAL_STORAGE_KEY = "nawa-syntax-tutorial-v1";
