-- Nawā V1.0 MVP · Pillars schema
-- Run in Supabase SQL Editor, or via: supabase db push
-- Safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS).
--
-- Extends the existing Nawā schema:
--   • user_profiles (rename currency → hibr_balance)
--   • user_unlocked_cities (already present)
--   • NEW user_unlocked_vocab  → combat deck ammo from Learning Path
--   • NEW user_fsrs_items      → Daily Review mastery + Arena tooltips
-- Keeps user_lesson_progress / user_bustan_trees for backward compatibility.

-- ---------------------------------------------------------------------------
-- 1) user_profiles · hibr_balance
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  hibr_balance integer NOT NULL DEFAULT 0 CHECK (hibr_balance >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Migrate legacy column name if this project already ran the prior schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'hibr_currency'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'hibr_balance'
  ) THEN
    ALTER TABLE public.user_profiles RENAME COLUMN hibr_currency TO hibr_balance;
  END IF;

  -- Fresh installs that somehow lack the column
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'hibr_balance'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD COLUMN hibr_balance integer NOT NULL DEFAULT 0
      CHECK (hibr_balance >= 0);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2) user_unlocked_vocab · Learning Path → Arena combat deck
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_unlocked_vocab (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  root_id text NOT NULL,
  pattern_id text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  source_node_id text,
  CONSTRAINT user_unlocked_vocab_unique UNIQUE (user_id, root_id, pattern_id)
);

CREATE INDEX IF NOT EXISTS user_unlocked_vocab_user_id_idx
  ON public.user_unlocked_vocab (user_id);

CREATE INDEX IF NOT EXISTS user_unlocked_vocab_user_root_idx
  ON public.user_unlocked_vocab (user_id, root_id);

-- ---------------------------------------------------------------------------
-- 3) user_fsrs_items · Daily Review + Arena mastery tooltips
-- mastery_level: 1 = Beginner, 2 = Familiar, 3 = Mastered
-- word_id convention: "<root_id>:<pattern_id>" (matches unlocked vocab)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_fsrs_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  word_id text NOT NULL,
  mastery_level smallint NOT NULL DEFAULT 1
    CHECK (mastery_level >= 1 AND mastery_level <= 3),
  due_date timestamptz NOT NULL DEFAULT now(),
  -- Lightweight FSRS card state (enough for V1; expand later if needed)
  stability real NOT NULL DEFAULT 0,
  difficulty real NOT NULL DEFAULT 0,
  elapsed_days integer NOT NULL DEFAULT 0,
  scheduled_days integer NOT NULL DEFAULT 0,
  reps integer NOT NULL DEFAULT 0,
  lapses integer NOT NULL DEFAULT 0,
  state smallint NOT NULL DEFAULT 0,
  last_review timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_fsrs_items_user_word_unique UNIQUE (user_id, word_id)
);

CREATE INDEX IF NOT EXISTS user_fsrs_items_user_id_idx
  ON public.user_fsrs_items (user_id);

CREATE INDEX IF NOT EXISTS user_fsrs_items_due_idx
  ON public.user_fsrs_items (user_id, due_date);

-- ---------------------------------------------------------------------------
-- 4) user_unlocked_cities · Dialect Passports (ensure exists)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_unlocked_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  city_id text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_unlocked_cities_user_city_unique UNIQUE (user_id, city_id)
);

CREATE INDEX IF NOT EXISTS user_unlocked_cities_user_id_idx
  ON public.user_unlocked_cities (user_id);

-- Path completion ledger (already used by lesson actions)
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_lesson_progress_user_lesson_unique UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS user_lesson_progress_user_id_idx
  ON public.user_lesson_progress (user_id);

-- ---------------------------------------------------------------------------
-- 5) Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unlocked_vocab ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_fsrs_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unlocked_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- user_profiles
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_own" ON public.user_profiles;

CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "user_profiles_insert_own"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_delete_own"
  ON public.user_profiles FOR DELETE
  USING (auth.uid() = id);

-- user_unlocked_vocab
DROP POLICY IF EXISTS "user_unlocked_vocab_select_own" ON public.user_unlocked_vocab;
DROP POLICY IF EXISTS "user_unlocked_vocab_insert_own" ON public.user_unlocked_vocab;
DROP POLICY IF EXISTS "user_unlocked_vocab_update_own" ON public.user_unlocked_vocab;
DROP POLICY IF EXISTS "user_unlocked_vocab_delete_own" ON public.user_unlocked_vocab;

CREATE POLICY "user_unlocked_vocab_select_own"
  ON public.user_unlocked_vocab FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_unlocked_vocab_insert_own"
  ON public.user_unlocked_vocab FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_unlocked_vocab_update_own"
  ON public.user_unlocked_vocab FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_unlocked_vocab_delete_own"
  ON public.user_unlocked_vocab FOR DELETE
  USING (auth.uid() = user_id);

-- user_fsrs_items
DROP POLICY IF EXISTS "user_fsrs_items_select_own" ON public.user_fsrs_items;
DROP POLICY IF EXISTS "user_fsrs_items_insert_own" ON public.user_fsrs_items;
DROP POLICY IF EXISTS "user_fsrs_items_update_own" ON public.user_fsrs_items;
DROP POLICY IF EXISTS "user_fsrs_items_delete_own" ON public.user_fsrs_items;

CREATE POLICY "user_fsrs_items_select_own"
  ON public.user_fsrs_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_fsrs_items_insert_own"
  ON public.user_fsrs_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_fsrs_items_update_own"
  ON public.user_fsrs_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_fsrs_items_delete_own"
  ON public.user_fsrs_items FOR DELETE
  USING (auth.uid() = user_id);

-- user_unlocked_cities
DROP POLICY IF EXISTS "user_unlocked_cities_select_own" ON public.user_unlocked_cities;
DROP POLICY IF EXISTS "user_unlocked_cities_insert_own" ON public.user_unlocked_cities;
DROP POLICY IF EXISTS "user_unlocked_cities_update_own" ON public.user_unlocked_cities;
DROP POLICY IF EXISTS "user_unlocked_cities_delete_own" ON public.user_unlocked_cities;

CREATE POLICY "user_unlocked_cities_select_own"
  ON public.user_unlocked_cities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_unlocked_cities_insert_own"
  ON public.user_unlocked_cities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_unlocked_cities_update_own"
  ON public.user_unlocked_cities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_unlocked_cities_delete_own"
  ON public.user_unlocked_cities FOR DELETE
  USING (auth.uid() = user_id);

-- user_lesson_progress
DROP POLICY IF EXISTS "user_lesson_progress_select_own" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "user_lesson_progress_insert_own" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "user_lesson_progress_update_own" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "user_lesson_progress_delete_own" ON public.user_lesson_progress;

CREATE POLICY "user_lesson_progress_select_own"
  ON public.user_lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_lesson_progress_insert_own"
  ON public.user_lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_lesson_progress_update_own"
  ON public.user_lesson_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_lesson_progress_delete_own"
  ON public.user_lesson_progress FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 6) Auth bootstrap · profile on signup
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, hibr_balance)
  VALUES (NEW.id, NEW.email, 0)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 7) RPCs used by later pillars (Hibr / Passports / Path unlocks)
-- ---------------------------------------------------------------------------

-- Atomic city unlock (Passports store)
CREATE OR REPLACE FUNCTION public.unlock_city(p_city_id text, p_cost integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  bal integer;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_city_id IS NULL OR length(trim(p_city_id)) = 0 THEN
    RAISE EXCEPTION 'Invalid city_id';
  END IF;

  IF p_cost IS NULL OR p_cost < 0 THEN
    RAISE EXCEPTION 'Invalid cost';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_unlocked_cities
    WHERE user_id = uid AND city_id = p_city_id
  ) THEN
    SELECT hibr_balance INTO bal FROM public.user_profiles WHERE id = uid;
    RETURN jsonb_build_object(
      'ok', true,
      'already_unlocked', true,
      'hibr_balance', COALESCE(bal, 0)
    );
  END IF;

  SELECT hibr_balance INTO bal
  FROM public.user_profiles
  WHERE id = uid
  FOR UPDATE;

  IF bal IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF bal < p_cost THEN
    RAISE EXCEPTION 'Insufficient Hibr';
  END IF;

  UPDATE public.user_profiles
  SET hibr_balance = hibr_balance - p_cost
  WHERE id = uid;

  INSERT INTO public.user_unlocked_cities (user_id, city_id)
  VALUES (uid, p_city_id);

  RETURN jsonb_build_object(
    'ok', true,
    'already_unlocked', false,
    'hibr_balance', bal - p_cost
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.unlock_city(text, integer) TO authenticated;

-- Award Hibr (Arena win / Review bonus)
CREATE OR REPLACE FUNCTION public.award_hibr(p_amount integer, p_reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  bal integer;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  UPDATE public.user_profiles
  SET hibr_balance = hibr_balance + p_amount
  WHERE id = uid
  RETURNING hibr_balance INTO bal;

  IF bal IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'hibr_balance', bal,
    'awarded', p_amount,
    'reason', p_reason
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_hibr(integer, text) TO authenticated;

-- Batch-unlock vocab from a Learning Path node (idempotent)
CREATE OR REPLACE FUNCTION public.unlock_vocab_batch(
  p_pairs jsonb,
  p_source_node_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  inserted integer := 0;
  pair jsonb;
  r_id text;
  p_id text;
  w_id text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_pairs IS NULL OR jsonb_typeof(p_pairs) <> 'array' THEN
    RAISE EXCEPTION 'p_pairs must be a JSON array of {root_id, pattern_id}';
  END IF;

  FOR pair IN SELECT * FROM jsonb_array_elements(p_pairs)
  LOOP
    r_id := pair ->> 'root_id';
    p_id := pair ->> 'pattern_id';

    IF r_id IS NULL OR p_id IS NULL OR length(trim(r_id)) = 0 OR length(trim(p_id)) = 0 THEN
      CONTINUE;
    END IF;

    INSERT INTO public.user_unlocked_vocab (user_id, root_id, pattern_id, source_node_id)
    VALUES (uid, r_id, p_id, p_source_node_id)
    ON CONFLICT (user_id, root_id, pattern_id) DO NOTHING;

    IF FOUND THEN
      inserted := inserted + 1;
    END IF;

    -- Seed FSRS item at mastery 1 if missing
    w_id := r_id || ':' || p_id;
    INSERT INTO public.user_fsrs_items (user_id, word_id, mastery_level, due_date)
    VALUES (uid, w_id, 1, now())
    ON CONFLICT (user_id, word_id) DO NOTHING;
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'inserted', inserted,
    'source_node_id', p_source_node_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.unlock_vocab_batch(jsonb, text) TO authenticated;

-- Keep FSRS updated_at fresh
CREATE OR REPLACE FUNCTION public.set_fsrs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_fsrs_items_set_updated_at ON public.user_fsrs_items;
CREATE TRIGGER user_fsrs_items_set_updated_at
  BEFORE UPDATE ON public.user_fsrs_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_fsrs_updated_at();
