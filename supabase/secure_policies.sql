-- ========================================================
-- TGAT2 Simulator - ปิดสิทธิ์สาธารณะที่อันตราย (Row Level Security)
--
-- ปัญหาเดิม: anon key เป็นค่าสาธารณะ (ส่งไปถึงเบราว์เซอร์ทุกคน) แต่ policy เดิมอนุญาตให้
--   - อ่านตาราง users ทั้งหมด รวมคอลัมน์ password
--   - แก้ไขตาราง users ของใครก็ได้ (เปลี่ยนรหัสผ่านคนอื่นได้)
--   - เพิ่ม/แก้ไขข้อสอบและเฉลยในตาราง questions
--   - อัปโหลด/แก้ไขรูปใน bucket exam-images
--
-- วิธีใช้ (ต้องทำคู่กัน):
--   1. ตั้งค่า SUPABASE_SERVICE_ROLE_KEY ใน .env.local และใน Vercel (Project Settings > Environment Variables)
--      ค่าอยู่ที่ Supabase > Project Settings > API > service_role (ห้ามขึ้นต้นด้วย NEXT_PUBLIC_)
--   2. รันสคริปต์นี้ใน Supabase SQL Editor
--   ถ้ารันข้อ 2 โดยไม่ทำข้อ 1 การสมัคร/ล็อกอินผ่าน Supabase จะใช้ไม่ได้
--   (ระบบจะใช้บัญชีสำรองในหน่วยความจำเซิร์ฟเวอร์แทน)
--
-- หมายเหตุ: การแก้ข้อสอบ (seed_questions.sql, scripts/sync_supabase_questions.mjs)
-- ต้องทำผ่าน SQL Editor หรือใช้ service_role key หลังรันสคริปต์นี้
-- ========================================================

-- 1. users: ปิดการเข้าถึงจากสาธารณะทั้งหมด (Server ใช้ service_role ซึ่งข้าม RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select users" ON public.users;
DROP POLICY IF EXISTS "Public insert users" ON public.users;
DROP POLICY IF EXISTS "Public update users" ON public.users;

-- 2. questions: อ่านได้ แต่ห้ามเพิ่ม/แก้จากสาธารณะ
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert on questions" ON public.questions;
DROP POLICY IF EXISTS "Allow public update on questions" ON public.questions;

-- 3. storage: รูปข้อสอบอ่านได้ แต่ห้ามอัปโหลด/แก้จากสาธารณะ
DROP POLICY IF EXISTS "Public upload exam-images" ON storage.objects;
DROP POLICY IF EXISTS "Public update exam-images" ON storage.objects;

-- ตรวจสอบ policy ที่เหลือ
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('users', 'questions', 'objects', 'exam_attempts')
ORDER BY tablename, policyname;
