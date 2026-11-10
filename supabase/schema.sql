-- ========================================================
-- TGAT2 Simulator - โครงสร้างตาราง (ตรงกับฐานข้อมูล Production)
--
-- ลำดับการติดตั้งฐานข้อมูลใหม่ใน Supabase SQL Editor:
--   1. supabase/schema.sql          (ไฟล์นี้: ตาราง + RLS แบบอ่านอย่างเดียว)
--   2. supabase/seed_questions.sql  (ข้อสอบ 80 ข้อ — สร้างใหม่ด้วย node scripts/generate_sql_seed.mjs)
--   3. supabase/secure_auth.sql     (ฟังก์ชันสมัคร/เข้าสู่ระบบ + แปลงรหัสผ่าน + ปิดสิทธิ์สาธารณะ)
--   4. supabase/sessions_history.sql (session, ประวัติสอบ, ล็อกบัญชี)
-- ========================================================

create extension if not exists pgcrypto with schema extensions;

-- ข้อสอบ (อ่านได้สาธารณะ แก้ไขผ่าน SQL Editor หรือ service role เท่านั้น)
create table if not exists public.questions (
  id serial primary key,
  skill text not null,
  skill_label text not null,
  topic text not null,
  content text not null,
  choices jsonb not null,
  correct_answer integer not null,
  explanation jsonb,
  svg_illustration text,
  image text,
  created_at timestamptz default now()
);
alter table public.questions enable row level security;
drop policy if exists "Allow public read questions" on public.questions;
create policy "Allow public read questions" on public.questions for select to public using (true);

-- บัญชีผู้ใช้ (ไม่มี policy: เข้าถึงผ่านฟังก์ชันใน secure_auth.sql / sessions_history.sql เท่านั้น)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text not null,            -- bcrypt hash
  role text default 'student',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.users enable row level security;

-- ผลสอบ (ไม่มี policy: บันทึก/อ่านผ่านฟังก์ชันที่ตรวจ session)
create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  user_name text default 'ผู้เข้าสอบนิรนาม',
  mode text not null,
  total_score numeric not null,
  max_score numeric not null default 100.00,
  correct_count integer not null,
  total_questions integer not null default 80,
  time_spent_seconds integer not null,
  skill_breakdown jsonb not null,
  answers jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.exam_attempts enable row level security;
