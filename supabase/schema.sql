-- Nawā · Supabase schema
-- Run in the Supabase SQL Editor (Dashboard → SQL).
-- Safe to re-run: drops policies/triggers if they exist, then recreates.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  hibr_balance integer NOT NULL DEFAULT 0 CHECK (hibr_balance >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_bustan_trees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  root_id text NOT NULL,
  letters text NOT NULL,
  mastery_level integer NOT NULL DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 3),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_bustan_trees_user_root_unique UNIQUE (user_id, root_id)
);

CREATE INDEX IF NOT EXISTS user_bustan_trees_user_id_idx
  ON public.user_bustan_trees (user_id);

CREATE TABLE IF NOT EXISTS public.user_unlocked_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  city_id text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_unlocked_cities_user_city_unique UNIQUE (user_id, city_id)
);

CREATE INDEX IF NOT EXISTS user_unlocked_cities_user_id_idx
  ON public.user_unlocked_cities (user_id);

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
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bustan_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unlocked_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- user_profiles uses `id` as the user key (FK to auth.users)
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

-- user_bustan_trees
DROP POLICY IF EXISTS "user_bustan_trees_select_own" ON public.user_bustan_trees;
DROP POLICY IF EXISTS "user_bustan_trees_insert_own" ON public.user_bustan_trees;
DROP POLICY IF EXISTS "user_bustan_trees_update_own" ON public.user_bustan_trees;
DROP POLICY IF EXISTS "user_bustan_trees_delete_own" ON public.user_bustan_trees;

CREATE POLICY "user_bustan_trees_select_own"
  ON public.user_bustan_trees FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_bustan_trees_insert_own"
  ON public.user_bustan_trees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_bustan_trees_update_own"
  ON public.user_bustan_trees FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_bustan_trees_delete_own"
  ON public.user_bustan_trees FOR DELETE
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
-- Auto-create profile on signup
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
-- Atomic city unlock (currency check + deduct + insert)
-- ---------------------------------------------------------------------------

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

  -- Already unlocked → no-op (do not charge again)
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

-- Keep updated_at fresh on tree upserts/updates
CREATE OR REPLACE FUNCTION public.set_bustan_tree_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_bustan_trees_set_updated_at ON public.user_bustan_trees;
CREATE TRIGGER user_bustan_trees_set_updated_at
  BEFORE UPDATE ON public.user_bustan_trees
  FOR EACH ROW
  EXECUTE FUNCTION public.set_bustan_tree_updated_at();
