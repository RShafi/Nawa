# Nawā Architecture Sync

> Generated snapshot of the codebase as of the current workspace state.  
> Purpose: give a Lead Architect AI an accurate map of files, flows, stores, and engines.

---

## 1. Full File Tree (`src/`)

```
src/
├── app/
│   ├── actions/
│   │   ├── economy.ts
│   │   ├── path.ts
│   │   ├── progress.ts
│   │   └── srs.ts
│   ├── api/
│   │   └── tts/
│   │       └── route.ts
│   ├── arena/
│   │   └── page.tsx
│   ├── bustan/
│   │   └── page.tsx
│   ├── forge/
│   │   └── page.tsx
│   ├── learning-path/
│   │   └── page.tsx
│   ├── lesson/
│   │   └── [id]/
│   │       ├── lesson-page-client.tsx
│   │       └── page.tsx
│   ├── login/
│   │   ├── actions.ts
│   │   ├── login-form.tsx
│   │   └── page.tsx
│   ├── loom/
│   │   └── [lessonId]/
│   │       └── page.tsx
│   ├── passport/
│   │   ├── page.tsx
│   │   └── passport-page-client.tsx
│   ├── passports/
│   │   └── page.tsx
│   ├── path/
│   │   ├── lesson/
│   │   │   └── [lessonId]/
│   │   │       └── page.tsx
│   │   └── page.tsx
│   ├── review/
│   │   ├── page.tsx
│   │   └── review-page-client.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── v0-template.tsx
├── components/
│   ├── battle/
│   │   ├── ActionLog.tsx
│   │   ├── ActionPanel.tsx
│   │   ├── AmbientParticles.tsx
│   │   ├── ArenaMuteButton.tsx
│   │   ├── BattleArena.tsx
│   │   ├── BattleEntities.tsx
│   │   ├── BattleResultOverlay.tsx
│   │   ├── BattleStage.tsx
│   │   ├── CelestialBackdrop.tsx
│   │   ├── CombatTurnBanner.tsx
│   │   ├── EnemyIntent.tsx
│   │   ├── EnemyStatus.tsx
│   │   ├── EnemyWards.tsx
│   │   ├── ForgeBoard.tsx
│   │   ├── InkPoolBar.tsx
│   │   ├── ResonanceCheck.tsx
│   │   ├── SpellCastVFX.tsx
│   │   ├── SyntaxBoard.tsx
│   │   ├── TutorialArena.tsx
│   │   ├── TutorialOverlay.tsx
│   │   └── WordCardView.tsx
│   ├── common/
│   │   ├── ArabicText.tsx
│   │   ├── GlobalCelestialLayer.tsx
│   │   ├── SiteHeader.tsx          # legacy wrapper; superseded by AppChrome
│   │   ├── SpeakButton.tsx
│   │   └── TashkeelToggle.tsx
│   ├── curriculum/
│   │   └── PathNode.tsx
│   ├── dialect/
│   │   └── DialectBridgeCard.tsx
│   ├── layout/
│   │   ├── AppChrome.tsx
│   │   ├── Navbar.tsx
│   │   └── NavShell.tsx
│   ├── lesson/
│   │   ├── CelestialLoomPlayer.tsx
│   │   ├── EnglishWithGrammarNote.tsx
│   │   ├── loomShared.ts
│   │   ├── successFlash.ts
│   │   ├── WelcomeBackModal.tsx
│   │   └── steps/
│   │       ├── ConstellationStep.tsx
│   │       ├── CosmicLoomStep.tsx
│   │       ├── EpiphanyStep.tsx
│   │       ├── ObservatoryStep.tsx
│   │       ├── PatternWeaverStep.tsx   # legacy; not wired to Loom player
│   │       ├── RootDiscoveryStep.tsx   # legacy; not wired to Loom player
│   │       └── SentenceBuilderStep.tsx # legacy; not wired to Loom player
│   ├── lessons/
│   │   ├── LessonAdvanceCard.tsx
│   │   ├── LessonBody.tsx
│   │   ├── PhoneticsLesson.tsx
│   │   ├── QuizLesson.tsx
│   │   └── ReadingLesson.tsx
│   ├── morph/
│   │   ├── MorphStudio.tsx
│   │   ├── PatternMatrix.tsx
│   │   ├── RootSelector.tsx
│   │   └── WordAssemblyCard.tsx
│   ├── passport/
│   │   └── CityCard.tsx
│   ├── path/
│   │   ├── CardForgeSlide.tsx
│   │   ├── HearButton.tsx
│   │   ├── LessonPlayer.tsx
│   │   ├── PathMap.tsx
│   │   ├── SyntaxBridgeLesson.tsx
│   │   └── slides/
│   │       ├── InfoSlide.tsx
│   │       ├── ListeningSlide.tsx
│   │       ├── MatchingSlide.tsx
│   │       ├── MorphologySlide.tsx
│   │       ├── PhoneticSlide.tsx
│   │       ├── ShapeSlide.tsx
│   │       ├── SlideRenderer.tsx
│   │       ├── SyntaxSlide.tsx
│   │       ├── TranslationSlide.tsx
│   │       └── VocabSlide.tsx
│   ├── progress/
│   │   └── AppStoreHydrator.tsx
│   ├── providers/
│   │   └── theme-provider.tsx
│   ├── sanctum/
│   │   └── SanctumHome.tsx
│   ├── srs/
│   │   └── Flashcard.tsx
│   └── ui/
│       ├── ArabicText.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── grammar-lore-tooltip.tsx
│       ├── InlineArabic.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── separator.tsx
│       ├── tabs.tsx
│       ├── toggle.tsx
│       ├── toggle-group.tsx
│       └── tooltip.tsx
├── content/
│   ├── curriculumData.ts    # Celestial Loom interactive lessons
│   └── ttsOverrides.ts
├── data/
│   ├── combatDictionary.ts
│   ├── curriculum.ts        # Star Map path curriculum (units/modules/slides)
│   ├── curriculumData.ts    # Legacy stage/unit subway-map curriculum
│   ├── learningPath.ts
│   ├── lessonContent.ts
│   ├── mockDeck.ts
│   ├── mockPatterns.ts
│   ├── mockRoots.ts
│   ├── passportCities.ts
│   └── tutorialDeck.ts
├── hooks/
│   ├── useAudio.ts
│   ├── useBGM.ts
│   ├── useLessonProgress.ts
│   ├── useNeuralAudio.ts
│   └── useSoundEffects.ts
├── lib/
│   ├── arabic-tts.ts
│   ├── arabic-utils.ts
│   ├── audio.ts
│   ├── bgmManager.ts
│   ├── combatPacing.ts
│   ├── fsrs.ts
│   ├── obfuscation.ts
│   ├── resonanceQuiz.ts
│   ├── speech.ts
│   ├── syntax.ts
│   ├── ttsClient.ts
│   ├── utils.ts
│   └── wardDealer.ts
├── store/
│   ├── nawa-store.ts
│   ├── useAppStore.ts
│   ├── useBattleStore.ts
│   ├── useLessonStore.ts
│   ├── useReviewStore.ts
│   └── useSettingsStore.ts
├── types/
│   ├── app-progress.ts
│   ├── arabic.ts
│   ├── cards.ts
│   ├── curriculum.ts
│   └── srs.ts
├── utils/
│   ├── grammarEngine.ts
│   ├── sentenceGenerator.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── tts.ts
└── middleware.ts
```

---

## 2. Global Layout & Navigation

### `src/app/layout.tsx`

Root shell for the entire app:

1. Loads fonts: **Inter** (`--font-inter`), **Marcellus** (`--font-marcellus`), **Aref Ruqaa** (`--font-aref`).
2. Wraps body in `ThemeProvider` (dark default) + `TooltipProvider`.
3. Renders `GlobalCelestialLayer` (full-viewport celestial backdrop behind all pages).
4. Wraps all page content in:
   ```tsx
   <AppChrome>
     <div className="game-stage">{children}</div>
   </AppChrome>
   ```
5. On large screens, `.game-stage` gets a centered card frame (`max-width: 72rem`, amber border, shadow).

### Navigation stack

| File | Role |
|------|------|
| `AppChrome.tsx` | **Server** component. Fetches Supabase user email, passes to `NavShell`. |
| `NavShell.tsx` | **Client** component. Reads `usePathname()`, conditionally renders `Navbar`. |
| `Navbar.tsx` | **Client** taskbar: logo, 3 nav links, Hibr badge, Tashkeel toggle, theme toggle, user menu / login. |

### Taskbar links (current)

```ts
{ href: "/",              label: "Sanctum" }
{ href: "/learning-path", label: "Star Map" }   // also matches /path/*
{ href: "/arena",         label: "The Crucible" }
```

**Removed from taskbar:** Review, Passports, Learning Path (old label).  
Review (`/review`) and Passports (`/passports`) routes still exist but are not in the navbar. Hibr badge still links to `/passports`.

### Where the taskbar appears / disappears

**Visible** on: `/` (Sanctum), `/learning-path`, `/path`, `/passports`, `/passport`, `/review`, `/login`, `/forge`, `/bustan`, and any route not listed below.

**Hidden** (`NavShell.shouldHideNav`) on immersive gameplay routes:

| Route prefix | Reason |
|--------------|--------|
| `/arena` | Crucible battle |
| `/lesson/` | Legacy lesson shell |
| `/loom/` | Celestial Loom player |
| `/path/lesson/` | Star Map slide lessons |

`SiteHeader.tsx` still exists but is **no longer imported** by any page — superseded by `AppChrome`.

### Home page (`src/app/page.tsx`)

Minimal server page:

```tsx
export default function HomePage() {
  return <SanctumHome />;
}
```

Does **not** override layout. Inherits global nav via `AppChrome`.

### `SanctumHome.tsx` (actual home UI)

Client component at `/`:

- Registers `curriculumData` into `useLessonStore` on mount.
- Syncs `useBattleStore.initializeDeck(masteredVocabIds)`.
- **Scribe's Codex** dashboard: roots discovered / cards forged stats from `ttsOverrides` + `useLessonStore`.
- Slow-spinning **Celestial Astrolabe** (Framer Motion, concentric rings) behind portal CTAs.
- Portals: Celestial Loom (`/loom/lesson-1-1`), Star Map (`/learning-path`), Crucible (`/arena`, gated by deck ≥ 5).

### Auth middleware (`src/middleware.ts`)

Supabase session refresh. Protected prefixes (redirect to `/login` if unauthenticated):

`/arena`, `/bustan`, `/forge`, `/review`, `/passport`, `/passports`, `/path`, `/lesson`

**Not protected:** `/`, `/learning-path`, `/loom/*`, `/login`.

---

## 3. State Engines

All game state uses **Zustand**. No dedicated React Context for progression/combat (only `ThemeProvider` + `TooltipProvider`).

### `useLessonStore` — Celestial Loom lesson progress

**File:** `src/store/useLessonStore.ts`  
**Persistence:** `localStorage` key `nawa-lesson-progress-v1`

```typescript
export interface LessonProgressState {
  // Active State
  activeLessonId: string | null;
  currentStepIndex: number;
  completedStepIds: string[];
  masteredVocabIds: string[];
  lastActiveTimestamp: number | null;
  showWelcomeBack: boolean;
  hasHydrated: boolean;

  // Actions
  startLesson: (lessonId: string) => void;
  submitStepAnswer: (stepId: string, isCorrect: boolean) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  completeLesson: () => void;
  dismissWelcomeBack: () => void;
  checkSessionResume: () => void;
  resetLessonProgress: (lessonId?: string) => void;
  unlockVocab: (vocabId: string) => void;
  setHasHydrated: (state: boolean) => void;
}
```

**Catalog helpers (module-level, not in store):**
- `registerLessons(lessons)` — populates in-memory `lessonCatalog` Map from `content/curriculumData.ts`.
- `getRegisteredLesson(lessonId)` — lookup.

**Key behavior:**
- `masteredVocabIds` updated on correct `submitStepAnswer` (epiphany steps via `forgeVocab`) and on `unlockVocab`.
- `completeLesson()` merges all `unlockableVocab` IDs, clears active session.
- Welcome-back modal triggers after 5 min idle (`SESSION_IDLE_MS`).

---

### `useBattleStore` — Arena combat

**File:** `src/store/useBattleStore.ts`  
**Not persisted.**

```typescript
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
  critical?: boolean;
};

export const MAX_BATTLE_INK = 5;
export const CARD_INK_COST = 1;
export const REDRAW_INK_COST = 1;

type BattleStore = {
  started: boolean;
  victory: boolean;
  defeat: boolean;
  combatState: CombatState;
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

  startEncounter: (opts: { deck: string[]; rustActive?: boolean }) => { ok: boolean; error?: string };
  initializeDeck: (masteredVocabIds: string[]) => void;
  resetBattle: () => void;
  drawHand: (count?: number) => void;
  playCard: (cardId: string) => { ok: boolean; error?: string };
  removeFromSentence: (index: number) => void;
  removeCardFromSyntax: (cardId: string) => void;
  clearSentence: () => void;
  redrawHand: () => { ok: boolean; error?: string };
  castSentence: () => { ok: boolean; error?: string };
  resolveResonance: (success: boolean) => void;
  resolveTurn: (cards: WordCard[]) => Promise<void>;
  clearLastResult: () => void;
  clearTurnBanner: () => void;
};
```

`CombatState` is defined in `src/lib/combatPacing.ts` (values include `"idle"`, `"resonance_check"`, `"player_attacking"`, etc.).

---

### `useAppStore` — Supabase-backed user progress

**File:** `src/store/useAppStore.ts`  
**Hydrated from Supabase** via `hydrate()` / `AppStoreHydrator`.

```typescript
type HydrateStatus = "idle" | "loading" | "ready" | "error";

type AppStore = {
  userId: string | null;
  email: string | null;
  hibrBalance: number;
  unlockedVocab: UnlockedVocab[];
  unlockedDeck: string[];
  fsrsItems: FsrsItem[];
  unlockedCities: string[];
  completedLessonIds: string[];

  status: HydrateStatus;
  error: string | null;
  hydratedAt: number | null;

  hydrate: () => Promise<boolean>;
  applyHydration: (payload: AppHydrationPayload) => void;
  reset: () => void;

  setHibrBalance: (amount: number) => void;
  addHibrOptimistic: (delta: number) => void;
  unlockCityOptimistic: (cityId: string) => void;
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
  hasRustDebuff: (now?: Date) => boolean;
};
```

---

### `useReviewStore` — SRS flashcard session

**File:** `src/store/useReviewStore.ts`

```typescript
type ReviewStore = {
  queue: PopulatedSrsItem[];
  currentIndex: number;
  isRevealed: boolean;
  isSubmitting: boolean;
  cardShownAt: number | null;
  sessionStats: SessionStats;

  initializeQueue: (items: PopulatedSrsItem[]) => void;
  revealAnswer: () => void;
  submitRating: (rating: SrsRating) => void;
  resetSession: () => void;
};
```

---

### `useSettingsStore` — Audio preference

**File:** `src/store/useSettingsStore.ts`  
**Persistence:** `localStorage` key `nawa-settings-v1`

```typescript
type SettingsState = {
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
};
```

---

### `useNawaStore` — Legacy local morph/dialect progress

**File:** `src/store/nawa-store.ts`  
**Persistence:** Zustand persist (localStorage).

```typescript
type NawaState = {
  selectedRootId: string;
  selectedPatternId: string;
  tashkeelMode: TashkeelMode;
  selectedDialectPhraseId: string | null;
  selectedDialect: SelectedDialect;
  userProgress: UserProgress;
  progressSeed: string;
  _hasHydrated: boolean;

  setRootId: (id: string) => void;
  setPatternId: (id: string) => void;
  setTashkeelMode: (mode: TashkeelMode) => void;
  setSelectedDialect: (dialect: SelectedDialect) => void;
  setDialectPhraseId: (id: string | null) => void;
  setActiveLessonId: (id: string) => void;
  completeLesson: (lessonId: string) => void;
  hydrateLessonTools: (lessonId: string) => void;
  hydrateLessonProgress: (completedLessonIds: string[]) => void;
  resetProgressIfStale: () => void;
  setHasHydrated: (v: boolean) => void;
};
```

Uses `src/data/curriculumData.ts` (stage/unit subway map), **not** `src/content/curriculumData.ts`.

---

### Hook bridge: `useLessonProgress`

**File:** `src/hooks/useLessonProgress.ts`

Wraps `useLessonStore` + auto-registers `content/curriculumData` on mount. Exposes:

```typescript
{
  ...useLessonStore,
  isLoaded: boolean,
  activeLesson: CurriculumLesson | null,
  currentStep: InteractiveStep | null,
  totalSteps: number,
  isStepCompleted: (stepId) => boolean,
  isVocabMastered: (vocabId) => boolean,
}
```

---

## 4. Arena & Combat Engine

### Route

`/arena` → `src/app/arena/page.tsx` → `BattleArena` (no global taskbar).

### Core component tree

```
BattleArena
├── TutorialArena / TutorialOverlay (first-run rail)
├── BattleStage (3-row HUD grid)
│   ├── HUD_BOSS: BossEntity, EnemyStatus, EnemyIntent, EnemyWards
│   ├── HUD_MIDDLE: SyntaxBoard → SyntaxChamber (slotted cards)
│   └── HUD_HAND: WordCardView hand + InkPoolBar + Cast/Redraw buttons
├── ResonanceCheck (translation quiz overlay)
├── CombatTurnBanner
├── SpellCastVFX / BossAttackFlash
├── BattleResultOverlay (victory/defeat)
└── ArenaMuteButton
```

### Key components

| Component | Purpose |
|-----------|---------|
| `BattleArena.tsx` | Top-level orchestrator: encounter start, VFX, Hibr award, BGM, tutorial gating. |
| `BattleStage.tsx` | CSS grid layout (`HUD_BOSS`, `HUD_MIDDLE`, `HUD_HAND`). |
| `SyntaxBoard.tsx` | **Spell Chamber** — hand cards, syntax slots, Cast/Redraw/Clear. Uses Framer Motion `layoutId` for card animations. |
| `SyntaxChamber` (internal) | Renders `currentSentence` slots; tap card to **unsocket** via `removeCardFromSyntax(cardId)`. |
| `WordCardView.tsx` | Individual draggable/display word card. |
| `InkPoolBar.tsx` | Ink (حِبْر) resource display. |
| `ResonanceCheck.tsx` | Post-cast English translation quiz; critical strike on success. |
| `BattleEntities.tsx` | Player hero + boss sprites, damage floats. |
| `ResonanceCheck` reads `pendingCastCards` from store when `combatState === "resonance_check"`. |

### Deck generation flow

1. **`initializeDeck(masteredVocabIds)`** (called from Sanctum + Loom player):
   - Collects all vocab from `content/curriculumData.ts` (`unlockableVocab`, `step.forgeVocab`, `step.targetVocab`).
   - Filters to IDs in `masteredVocabIds`.
   - If deck < 5 cards (`MIN_PLAYER_DECK_SIZE`), pads with `STARTER_CARD_IDS` from `combatDictionary.ts`.
   - Stores result in `playerDeck: VocabularyItem[]`.

2. **`startEncounter({ deck })`**:
   - Converts vocab → `WordCard` via `vocabToWordCard()`.
   - Shuffles pool, deals guided hand via `dealGuidedHandCards()` (tries to include noun↔modifier semantic pair from `grammarEngine.findSemanticPair`).

3. **Arena free-play** uses `useAppStore.unlockedDeck` (Supabase word card IDs) passed to `startEncounter`.

### Drag-and-drop / unsocketing

- **Not HTML5 drag-and-drop.** Cards are played by click/tap:
  - `playCard(cardId)` — moves card from `hand` → `currentSentence`, costs 1 Ink, validates via `validateSyntax()` from `lib/syntax.ts`.
  - `removeCardFromSyntax(cardId)` — finds card in sentence, calls `removeFromSentence(index)`, returns card to hand.
  - `clearSentence()` — empties all slots.
- **SyntaxBoard** uses Framer Motion `LayoutGroup id="syntax-chamber"` + shared `layoutId` on cards for snap animations between hand and chamber.
- **Cast flow:** `castSentence()` → if syntax valid → sets `combatState: "resonance_check"`, stores cards in `pendingCastCards` → `ResonanceCheck` → `resolveResonance(success)` → `resolveTurn(cards)`.

### Combat resolution

- Damage from `syntaxMultiplier(sentence length)` × card schools × resonance crit.
- Enemy intents, shields, burn/frost status effects in store.
- Hibr awarded on victory via `awardBattleWinHibrAction`.

---

## 5. Lesson Engine

Nawā currently has **three parallel lesson systems**:

### A. Celestial Loom (primary interactive morphology)

| Item | Detail |
|------|--------|
| **Route** | `/loom/[lessonId]` |
| **Page** | `src/app/loom/[lessonId]/page.tsx` |
| **Player** | `src/components/lesson/CelestialLoomPlayer.tsx` |
| **Data** | `src/content/curriculumData.ts` |
| **Types** | `src/types/curriculum.ts` |
| **Progress** | `useLessonStore` + `useLessonProgress` hook |
| **Nav hidden** | Yes |

**Step router in `CelestialLoomPlayer`:**

| `InteractiveStep.type` | Component | File |
|------------------------|-----------|------|
| `observatory` | `ObservatoryStep` | `steps/ObservatoryStep.tsx` |
| `constellation` | `ConstellationStep` | `steps/ConstellationStep.tsx` |
| `cosmic_loom` | `CosmicLoomStep` | `steps/CosmicLoomStep.tsx` |
| `epiphany` | `EpiphanyStep` | `steps/EpiphanyStep.tsx` |

**Pedagogical flow per lesson:** observatory → constellation → cosmic_loom → epiphany (not all lessons include every phase; e.g. `lesson-1-2` starts at cosmic_loom).

**Shared styling:** `src/components/lesson/loomShared.ts` (`LOOM_SHELL`, `LOOM_DEEP_SPACE`, `entrance` motion preset).

**Legacy step components (exist but NOT wired to Loom player):**
- `RootDiscoveryStep.tsx`
- `PatternWeaverStep.tsx`
- `SentenceBuilderStep.tsx`

### B. Star Map slide lessons

| Item | Detail |
|------|--------|
| **Map UI** | `src/components/path/PathMap.tsx` at `/learning-path` and `/path` |
| **Route** | `/path/lesson/[lessonId]` |
| **Player** | `src/components/path/LessonPlayer.tsx` |
| **Data** | `src/data/curriculum.ts` (`CURRICULUM` units/modules/lessons with `slides[]`) |
| **Slides** | `SlideRenderer.tsx` → individual slide types in `path/slides/` |
| **Progress** | `useAppStore.completedLessonIds` + server actions |
| **Nav hidden** | Yes |

### C. Legacy lesson route

| Item | Detail |
|------|--------|
| **Route** | `/lesson/[id]` |
| **Client** | `src/app/lesson/[id]/lesson-page-client.tsx` |
| **Body** | `src/components/lessons/LessonBody.tsx` |
| **Data** | `src/data/curriculumData.ts` (stage/unit `Lesson` type from `types/arabic.ts`) |
| **Progress** | `useNawaStore` + `useAppStore` |
| **Nav hidden** | Yes |

`LessonBody` dispatches by `lesson.type`: `CardForgeSlide`, `SyntaxBridgeLesson`, `PhoneticsLesson`, `QuizLesson`, `ReadingLesson`, `DialectBridgeCard`, etc.

---

## 6. Data & Progression (Passports / Codex)

### Curriculum types (`src/types/curriculum.ts`)

```typescript
export type PartOfSpeech = "noun" | "verb" | "adjective" | "particle";
export type ElementalSchool = "flame" | "frost" | "mind" | "kinetic";

export interface ArabicRoot {
  readonly id: string;
  readonly letters: readonly [string, string, string];
  readonly transliteration: string;
  readonly primaryMeaning: string;
  readonly ttsOverride?: string;
}

export interface PatternMold {
  readonly id: string;
  readonly name: string;
  readonly meaning: string;
  readonly visualSlots: readonly string[];  // e.g. ['slot1', 'َ', 'ا', 'slot2', 'ِ', 'slot3']
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
  | "observatory"
  | "constellation"
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
```

**Helpers:** `isRootSlot()`, `assembleFromMold(mold, root)`.

### Current Loom lessons (`content/curriculumData.ts`)

| ID | Title | Words unlocked |
|----|-------|----------------|
| `lesson-1-1` | The Seed of Writing | كِتَاب |
| `lesson-1-2` | The Scribe's Desk | مَكْتَب, كَتَبَ |
| `lesson-2-1` | The House of Study | مَدْرَسَة |

Pattern molds exported: `PATTERN_FI3AL`, `PATTERN_FA3IL`, `PATTERN_MAF3AL`, `PATTERN_FA3ALA`, `PATTERN_MAF3ALA`.

### User profile / app progress types (`src/types/app-progress.ts`)

```typescript
export type MasteryLevel = 1 | 2 | 3;

export type UnlockedVocab = {
  rootId: string;
  patternId: string;
  unlockedAt: string;
  sourceNodeId: string | null;
  wordId: string;
};

export type FsrsItem = {
  wordId: string;
  masteryLevel: MasteryLevel;
  dueDate: string;
  reps: number;
  lapses: number;
  lastReview: string | null;
};

export type AppHydrationPayload = {
  userId: string;
  email: string | null;
  hibrBalance: number;
  unlockedVocab: UnlockedVocab[];
  unlockedDeck: string[];
  fsrsItems: FsrsItem[];
  unlockedCities: string[];
  completedLessonIds: string[];
};
```

### Legacy arabic progress (`src/types/arabic.ts`)

```typescript
export type UserProgress = {
  activeLessonId: string;
  completedLessonIds: string[];
};
```

Used by `useNawaStore` for the stage/unit subway-map curriculum.

### Codex (Sanctum dashboard)

**Component:** `src/components/sanctum/SanctumHome.tsx`

Tracks locally (no dedicated Codex store):

| Stat | Source |
|------|--------|
| Roots Discovered | `countDiscoveredRoots(completedStepIds)` — observatory steps completed in `useLessonStore` |
| Cards Forged | `useBattleStore.playerDeck.length` vs `countCatalogVocab()` |
| Total roots/vocab | `countCatalogRoots()` / `countCatalogVocab()` from `content/ttsOverrides.ts` |

Epiphany step calls `useLessonStore.unlockVocab(forgeVocab.id)` + updates battle deck.

### Passports

| Item | Detail |
|------|--------|
| **Routes** | `/passports`, `/passport` |
| **UI** | `passport-page-client.tsx` + `CityCard.tsx` |
| **Data** | `src/data/passportCities.ts` |
| **Currency** | Hibr (`useAppStore.hibrBalance`) |
| **Unlock** | `unlockCityAction` server action → `unlockCityOptimistic` |
| **Progress** | `useAppStore.unlockedCities` |

Passports are **not** in the global taskbar but reachable via Hibr badge link in Navbar.

### Review (SRS)

| Item | Detail |
|------|--------|
| **Route** | `/review` (still exists, not in taskbar) |
| **UI** | `review-page-client.tsx` + `Flashcard.tsx` |
| **Store** | `useReviewStore` |
| **Backend** | `app/actions/srs.ts`, `lib/fsrs.ts` |
| **Types** | `src/types/srs.ts` |

---

## 7. Audio & TTS

### Architecture overview

```
UI component
  → speakArabic() [lib/audio.ts]
    → normalizeForSpeech() + prepareTextForElevenLabs() [utils/tts.ts]
    → getTtsOverrideForArabic() [content/ttsOverrides.ts]
    → fetchTtsBlob() [lib/ttsClient.ts]
      → GET /api/tts?text=...
        → ElevenLabs API (eleven_multilingual_v2)
        → Cache: public/tts/{sha256(voiceId_text)}.mp3
```

**No Web Speech API.** ElevenLabs only.

### Server route (`src/app/api/tts/route.ts`)

- **Method:** `GET /api/tts?text=...`
- **Env required:** `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`
- **Pipeline:** raw text → `prepareTextForElevenLabs()` → `getTtsOverrideForArabic()` → hash cache lookup → ElevenLabs synthesize on miss.
- **Max length:** 200 chars.
- **Missing keys:** returns 503 with log `[TTS] Missing ElevenLabs env keys`.

### Normalization (`src/utils/tts.ts`)

Key exports:

| Export | Purpose |
|--------|---------|
| `PHONETIC_CV` | Map bare letter → fatha form (e.g. `ك` → `كَ`) |
| `prepareTextForElevenLabs()` | Main entry; applies overrides, token sanitization |
| `sanitizeArabicToken()` | Isolated letters get fatha; word-final vowels → sukūn; Ta-Marbuta `ة` → `هْ` |
| `getLetterSoundForTts()` | Returns fatha form for Observatory letter drills |
| `getLetterPhoneticHint()` | Returns `{ sound, name }` for UI labels |
| `stripTaMarbutaForTts()` | Pausal form helper |

### Overrides (`src/content/ttsOverrides.ts`)

Built from:

- `LETTER_TTS_OVERRIDES` in `content/curriculumData.ts` (ك, ت, ب, د, ر, س with fatha)
- Per-vocab `ttsOverride` fields (e.g. مَدْرَسَة → `مَدْرَسَهْ`)
- Root-level overrides

Also exports Codex counting helpers: `countCatalogRoots`, `countCatalogVocab`, `countDiscoveredRoots`.

### Client entry points

| File | Usage |
|------|-------|
| `lib/audio.ts` → `speakArabic(text, { ttsOverride? })` | Primary speak function; shared `Audio` element, debounced |
| `lib/ttsClient.ts` → `fetchTtsBlob()`, `prefetchTtsTexts()` | HTTP fetch + in-flight dedup |
| `hooks/useNeuralAudio.ts` | Hook wrapper around `fetchTtsBlob` |
| `components/common/SpeakButton.tsx` | UI button calling neural audio |
| `components/path/HearButton.tsx` | Path slide hear control |
| `components/lesson/steps/ObservatoryStep.tsx` | `speakArabic(letter, { ttsOverride: getLetterSoundForTts(letter) })` |
| `components/lesson/steps/CosmicLoomStep.tsx` | TTS on forged word |
| `hooks/useSoundEffects.ts` | Procedural Web Audio SFX (tap, snap, success, celestial etch) — **not** ElevenLabs |

### Sound vs name (Observatory)

- **TTS speaks:** fatha-bound sound (`كَ` → "ka") via `getLetterSoundForTts()`.
- **UI shows:** `Sound: "Ka"` + `Letter: Kaf` from `getLetterPhoneticHint()`.

---

## Quick Reference: Which data file for what?

| File | Used by | Content |
|------|---------|---------|
| `content/curriculumData.ts` | Loom player, battle deck, Codex counts | Interactive `CurriculumLesson[]` with steps |
| `data/curriculum.ts` | PathMap, LessonPlayer | Star Map units/modules/slides |
| `data/curriculumData.ts` | nawa-store, legacy `/lesson/[id]` | Stage/unit subway-map `Lesson[]` |
| `data/combatDictionary.ts` | Battle store, Arena | `WordCard` combat lexicon |
| `data/passportCities.ts` | Passports page | City unlock catalog |

---

## Environment variables (TTS + Auth)

```env
NEXT_PUBLIC_SUPABASE_URL=       # Required — middleware crashes without it
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Required
ELEVENLABS_API_KEY=             # TTS
ELEVENLABS_VOICE_ID=            # TTS voice
```

---

*End of architecture sync.*
