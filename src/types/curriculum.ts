/**

 * Phase 1 — strict curriculum & root/pattern data schema for Nawā.

 * Celestial Loom pedagogical phases: observatory → cursive_connection → cosmic_loom → epiphany.

 */



export type PartOfSpeech = "noun" | "verb" | "adjective" | "particle";



export type ElementalSchool = "flame" | "frost" | "mind" | "kinetic";



export interface ArabicRoot {

  readonly id: string;

  readonly letters: readonly [string, string, string];

  readonly transliteration: string;

  readonly primaryMeaning: string;

  readonly ttsOverride?: string;

}



/** Visual pattern mold — static vowels/affixes + sockets for root letters. */

export interface PatternMold {

  readonly id: string;

  readonly name: string;

  readonly meaning: string;

  /** e.g. `['slot1', 'َ', 'ا', 'slot2', 'ِ', 'slot3']` */

  readonly visualSlots: readonly string[];

}



export interface VocabularyItem {

  readonly id: string;

  readonly arabic: string;

  readonly transliteration: string;

  readonly english: string;

  readonly partOfSpeech: PartOfSpeech;

  readonly elementalSchool: ElementalSchool;

  readonly rootId: string;

  readonly pattern: PatternMold;

  readonly grammarNote?: string;

  readonly ttsOverride?: string;

  readonly semanticTags: readonly string[];

  readonly validTargetTags?: readonly string[];

}



export type InteractiveStepType =

  | "narrative"

  | "handwriting"

  | "observatory"

  /** @deprecated Alias — routes to Cursive Morph Theater (cursive_connection). */
  | "constellation"

  | "cursive_connection"

  | "cosmic_loom"

  | "epiphany";



export interface InteractiveStepOption {

  readonly id: string;

  readonly label: string;

  readonly subLabel?: string;

  readonly isCorrect: boolean;

}



export interface InteractiveStep {

  readonly id: string;

  readonly type: InteractiveStepType;

  readonly promptTitle: string;

  readonly promptDescription: string;

  readonly targetRoot?: ArabicRoot;

  readonly patternMold?: PatternMold;

  readonly forgeVocab?: VocabularyItem;

  readonly targetVocab?: readonly VocabularyItem[];

  readonly options: readonly InteractiveStepOption[];

  readonly explanation: string;

}



export interface CurriculumLesson {

  readonly id: string;

  readonly chapterId: string;

  readonly title: string;

  readonly subtitle: string;

  readonly root: ArabicRoot;

  readonly unlockableVocab: readonly VocabularyItem[];

  readonly steps: readonly InteractiveStep[];

}



/** Slot tokens in a PatternMold map to root letter indices. */

export function isRootSlot(token: string): boolean {

  return /^slot[123]$/.test(token);

}



/** Assemble display Arabic from mold + triliteral root. */

export function assembleFromMold(

  mold: PatternMold,

  root: readonly [string, string, string],

): string {

  let slotIdx = 0;

  return mold.visualSlots

    .map((token) => {

      if (isRootSlot(token)) {

        const letter = root[slotIdx];

        slotIdx += 1;

        return letter ?? "";

      }

      return token;

    })

    .join("");

}


