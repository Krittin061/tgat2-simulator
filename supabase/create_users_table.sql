-- ========================================================
-- TGAT2 Simulator - Create Users Table in Supabase
-- Run this in Supabase SQL Editor
-- ========================================================

-- 1. Create table 'users'
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Configure Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select users" ON public.users;
CREATE POLICY "Public select users" ON public.users FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public insert users" ON public.users;
CREATE POLICY "Public insert users" ON public.users FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Public update users" ON public.users;
CREATE POLICY "Public update users" ON public.users FOR UPDATE TO public USING (true);

-- 3. Ensure exam_attempts has user_id
ALTER TABLE public.exam_attempts ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Verify
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users';
