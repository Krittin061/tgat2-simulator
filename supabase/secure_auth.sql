-- ========================================================
-- TGAT2 Simulator - บัญชีผู้ใช้แบบปลอดภัย + ปิดสิทธิ์สาธารณะที่อันตราย
--
-- ปัญหาเดิม: anon key เป็นค่าสาธารณะ (ส่งไปถึงเบราว์เซอร์ทุกคน) แต่ policy เดิมอนุญาตให้
--   - อ่านตาราง users ทั้งหมด รวมรหัสผ่านที่เก็บเป็นข้อความธรรมดา
--   - แก้ไขตาราง users ของใครก็ได้ (เปลี่ยนรหัสผ่านคนอื่นได้)
--   - เพิ่ม/แก้ไขข้อสอบและเฉลยในตาราง questions
--   - อ่านผลสอบ (ชื่อ คำตอบ คะแนน) ของทุกคนในตาราง exam_attempts
--   - อัปโหลด/แก้ไขรูปใน bucket exam-images
--
-- แนวทางใหม่: แอปเรียกฟังก์ชัน register_user / login_user (SECURITY DEFINER)
-- ซึ่งแฮชและตรวจรหัสผ่านด้วย bcrypt ภายในฐานข้อมูล จึงปิดการเข้าถึงตาราง users ได้ทั้งหมด
-- โดยไม่ต้องใช้ service_role key ในแอป
--
-- ลำดับที่ใช้กับ Production (ห้ามสลับ):
--   ส่วนที่ 1 (ฟังก์ชัน) → deploy โค้ดที่เรียก rpc('login_user' / 'register_user') → ส่วนที่ 2
-- หลังรันส่วนที่ 2 การแก้ข้อสอบต้องทำผ่าน SQL Editor หรือสคริปต์ที่ใช้ SUPABASE_SERVICE_ROLE_KEY
-- ========================================================

-- --------------------------------------------------------
-- ส่วนที่ 1: ฟังก์ชันสมัครสมาชิก / เข้าสู่ระบบ
-- --------------------------------------------------------
create extension if not exists pgcrypto with schema extensions;

create or replace function public.register_user(p_name text, p_email text, p_password text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_user public.users;
begin
  if coalesce(trim(p_name), '') = '' or v_email = '' or p_password is null or length(p_password) < 6 then
    return json_build_object('error', 'invalid_input');
  end if;

  if exists (select 1 from public.users where email = v_email) then
    return json_build_object('error', 'email_taken');
  end if;

  insert into public.users (name, email, password)
  values (trim(p_name), v_email, extensions.crypt(p_password, extensions.gen_salt('bf', 10)))
  returning * into v_user;

  return json_build_object('id', v_user.id, 'name', v_user.name, 'email', v_user.email);
exception
  when unique_violation then
    return json_build_object('error', 'email_taken');
end;
$$;

create or replace function public.login_user(p_email text, p_password text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user public.users;
begin
  if p_email is null or p_password is null then
    return json_build_object('error', 'invalid_input');
  end if;

  select * into v_user from public.users where email = lower(trim(p_email));
  if not found then
    return json_build_object('error', 'not_found');
  end if;

  if v_user.password like '$2%' then
    if extensions.crypt(p_password, v_user.password) <> v_user.password then
      return json_build_object('error', 'wrong_password');
    end if;
  else
    -- รหัสผ่านแบบเก่า (ข้อความธรรมดา): ตรวจแล้วอัปเกรดเป็น bcrypt
    if v_user.password is distinct from p_password then
      return json_build_object('error', 'wrong_password');
    end if;
    update public.users
      set password = extensions.crypt(p_password, extensions.gen_salt('bf', 10)), updated_at = now()
      where id = v_user.id;
  end if;

  return json_build_object('id', v_user.id, 'name', v_user.name, 'email', v_user.email);
end;
$$;

revoke all on function public.register_user(text, text, text) from public;
revoke all on function public.login_user(text, text) from public;
grant execute on function public.register_user(text, text, text) to anon, authenticated, service_role;
grant execute on function public.login_user(text, text) to anon, authenticated, service_role;

-- --------------------------------------------------------
-- ส่วนที่ 2: แปลงรหัสผ่านเดิม + ปิดสิทธิ์สาธารณะ (รันหลัง deploy โค้ดใหม่แล้ว)
-- --------------------------------------------------------

-- รหัสผ่านที่ยังเป็นข้อความธรรมดา → bcrypt (ผู้ใช้ยังใช้รหัสผ่านเดิมได้)
update public.users
  set password = extensions.crypt(password, extensions.gen_salt('bf', 10)), updated_at = now()
  where password is not null and password not like '$2%';

-- users: ปิดการเข้าถึงจากสาธารณะทั้งหมด (ใช้ผ่านฟังก์ชันด้านบนเท่านั้น)
alter table public.users enable row level security;
drop policy if exists "Public select users" on public.users;
drop policy if exists "Public insert users" on public.users;
drop policy if exists "Public update users" on public.users;

-- questions: อ่านได้ แต่ห้ามเพิ่ม/แก้จากสาธารณะ
alter table public.questions enable row level security;
drop policy if exists "Allow public insert on questions" on public.questions;
drop policy if exists "Allow public update on questions" on public.questions;

-- exam_attempts: บันทึกผลสอบได้ แต่ห้ามอ่านผลสอบของผู้อื่น
alter table public.exam_attempts enable row level security;
drop policy if exists "Allow public select" on public.exam_attempts;
drop policy if exists "Allow public select of exam_attempts" on public.exam_attempts;

-- storage: รูปข้อสอบอ่านได้ แต่ห้ามอัปโหลด/แก้จากสาธารณะ
drop policy if exists "Public upload exam-images" on storage.objects;
drop policy if exists "Public update exam-images" on storage.objects;
