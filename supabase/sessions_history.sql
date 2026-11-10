-- ========================================================
-- TGAT2 Simulator - Session ผู้ใช้, ประวัติสอบในฐานข้อมูล, จำกัดการลองรหัสผ่าน
-- (รันต่อจาก supabase/secure_auth.sql)
--
-- - login_user / register_user คืน token ของ session (อายุ 30 วัน) ฐานข้อมูลเก็บเฉพาะ SHA-256 ของ token
--   แอปเก็บ token ใน cookie แบบ HttpOnly → รีเฟรชหน้าแล้วยังล็อกอินอยู่
-- - รหัสผ่านผิด 5 ครั้งติดกัน → ล็อกบัญชี 15 นาที (นับในฐานข้อมูล ใช้ได้ทุก Server instance)
-- - ประวัติสอบบันทึก/อ่านผ่านฟังก์ชันที่ตรวจ session ทุกครั้ง → ดูได้เฉพาะของตัวเอง
-- ========================================================

-- --------------------------------------------------------
-- ตารางและคอลัมน์
-- --------------------------------------------------------
alter table public.users
  add column if not exists failed_login_count integer not null default 0,
  add column if not exists locked_until timestamptz;

create table if not exists public.user_sessions (
  token_hash text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists idx_user_sessions_user on public.user_sessions(user_id);
alter table public.user_sessions enable row level security;  -- ไม่มี policy: เข้าถึงผ่านฟังก์ชันเท่านั้น

alter table public.exam_attempts add column if not exists result jsonb;
create index if not exists idx_exam_attempts_user_created on public.exam_attempts(user_id, created_at desc);

-- บันทึกผลสอบผ่าน save_exam_attempt เท่านั้น (เดิมเบราว์เซอร์ insert ตรง ซึ่งล้มเหลวอยู่แล้วเพราะส่งคอลัมน์ updated_at ที่ไม่มีจริง)
drop policy if exists "Allow public insert" on public.exam_attempts;
drop policy if exists "Allow public insert to exam_attempts" on public.exam_attempts;

-- --------------------------------------------------------
-- ฟังก์ชันภายใน (ไม่เปิดให้เรียกจากภายนอก)
-- --------------------------------------------------------
create or replace function public._create_session(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token text := encode(extensions.gen_random_bytes(32), 'hex');
begin
  delete from public.user_sessions where expires_at < now();
  insert into public.user_sessions (token_hash, user_id, expires_at)
  values (encode(extensions.digest(v_token, 'sha256'), 'hex'), p_user_id, now() + interval '30 days');
  return v_token;
end;
$$;

create or replace function public._session_user_id(p_token text)
returns uuid
language sql
stable
security definer
set search_path = public, extensions
as $$
  select s.user_id
  from public.user_sessions s
  where p_token is not null
    and s.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
    and s.expires_at > now()
$$;

revoke all on function public._create_session(uuid) from public, anon, authenticated;
revoke all on function public._session_user_id(text) from public, anon, authenticated;

-- --------------------------------------------------------
-- สมัครสมาชิก / เข้าสู่ระบบ (คืน token)
-- --------------------------------------------------------
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

  return json_build_object('id', v_user.id, 'name', v_user.name, 'email', v_user.email,
                           'token', public._create_session(v_user.id));
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
  v_ok boolean;
  v_failed integer;
begin
  if p_email is null or p_password is null then
    return json_build_object('error', 'invalid_input');
  end if;

  select * into v_user from public.users where email = lower(trim(p_email)) for update;
  if not found then
    return json_build_object('error', 'not_found');
  end if;

  if v_user.locked_until is not null and v_user.locked_until > now() then
    return json_build_object('error', 'locked',
      'retry_after_seconds', ceil(extract(epoch from v_user.locked_until - now()))::int);
  end if;

  if v_user.password like '$2%' then
    v_ok := extensions.crypt(p_password, v_user.password) = v_user.password;
  else
    v_ok := v_user.password is not distinct from p_password;  -- รหัสผ่านแบบเก่า
  end if;

  if not v_ok then
    v_failed := v_user.failed_login_count + 1;
    if v_failed >= 5 then
      update public.users set failed_login_count = 0, locked_until = now() + interval '15 minutes' where id = v_user.id;
      return json_build_object('error', 'locked', 'retry_after_seconds', 900);
    end if;
    update public.users set failed_login_count = v_failed where id = v_user.id;
    return json_build_object('error', 'wrong_password');
  end if;

  update public.users
    set failed_login_count = 0,
        locked_until = null,
        password = case when v_user.password like '$2%' then v_user.password
                        else extensions.crypt(p_password, extensions.gen_salt('bf', 10)) end,
        updated_at = now()
    where id = v_user.id;

  return json_build_object('id', v_user.id, 'name', v_user.name, 'email', v_user.email,
                           'token', public._create_session(v_user.id));
end;
$$;

-- --------------------------------------------------------
-- Session
-- --------------------------------------------------------
create or replace function public.get_session_user(p_token text)
returns json
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_user public.users;
begin
  select u.* into v_user from public.users u where u.id = public._session_user_id(p_token);
  if not found then
    return json_build_object('error', 'invalid_session');
  end if;
  return json_build_object('id', v_user.id, 'name', v_user.name, 'email', v_user.email);
end;
$$;

create or replace function public.logout_session(p_token text)
returns json
language sql
security definer
set search_path = public, extensions
as $$
  with deleted as (
    delete from public.user_sessions
    where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
    returning 1
  )
  select json_build_object('ok', true, 'deleted', (select count(*) from deleted))
$$;

-- --------------------------------------------------------
-- ประวัติสอบ (เฉพาะของเจ้าของ session)
-- --------------------------------------------------------
create or replace function public.save_exam_attempt(p_token text, p_result jsonb)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user public.users;
  v_id uuid;
begin
  select u.* into v_user from public.users u where u.id = public._session_user_id(p_token);
  if not found then
    return json_build_object('error', 'invalid_session');
  end if;
  if p_result is null or jsonb_typeof(p_result) <> 'object' or pg_column_size(p_result) > 512000 then
    return json_build_object('error', 'invalid_input');
  end if;

  insert into public.exam_attempts
    (user_id, user_name, mode, total_score, max_score, correct_count, total_questions,
     time_spent_seconds, skill_breakdown, answers, result)
  values
    (v_user.id::text, v_user.name,
     case when p_result->>'mode' = 'practice' then 'practice' else 'real_exam' end,
     coalesce((p_result->>'totalScore')::numeric, 0),
     coalesce((p_result->>'maxScore')::numeric, 100),
     coalesce((p_result->>'correctCount')::int, 0),
     coalesce((p_result->>'totalQuestions')::int, 80),
     coalesce((p_result->>'timeSpentSeconds')::int, 0),
     coalesce(p_result->'skillBreakdown', '{}'::jsonb),
     coalesce(p_result->'answers', '{}'::jsonb),
     p_result)
  returning id into v_id;

  return json_build_object('id', v_id);
end;
$$;

create or replace function public.list_exam_attempts(p_token text, p_limit integer default 30)
returns json
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := public._session_user_id(p_token);
begin
  if v_user_id is null then
    return json_build_object('error', 'invalid_session');
  end if;
  return coalesce((
    select json_agg(item order by created_at desc)
    from (
      select a.created_at,
             (coalesce(a.result, '{}'::jsonb) - 'detailedAnswers')
               || jsonb_build_object('id', a.id, 'submittedAt', a.created_at, 'mode', a.mode,
                                     'totalScore', a.total_score, 'correctCount', a.correct_count,
                                     'totalQuestions', a.total_questions, 'timeSpentSeconds', a.time_spent_seconds) as item
      from public.exam_attempts a
      where a.user_id = v_user_id::text
      order by a.created_at desc
      limit least(greatest(coalesce(p_limit, 30), 1), 100)
    ) t
  ), '[]'::json);
end;
$$;

create or replace function public.get_exam_attempt(p_token text, p_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := public._session_user_id(p_token);
  v_result jsonb;
begin
  if v_user_id is null then
    return json_build_object('error', 'invalid_session');
  end if;
  select coalesce(a.result, '{}'::jsonb) || jsonb_build_object('id', a.id, 'submittedAt', a.created_at)
    into v_result
    from public.exam_attempts a
    where a.id = p_id and a.user_id = v_user_id::text;
  if v_result is null then
    return json_build_object('error', 'not_found');
  end if;
  return v_result::json;
end;
$$;

-- --------------------------------------------------------
-- สิทธิ์: เรียกได้ด้วย anon key (ทุกฟังก์ชันตรวจ session หรือรหัสผ่านเอง)
-- --------------------------------------------------------
revoke all on function public.register_user(text, text, text) from public;
revoke all on function public.login_user(text, text) from public;
revoke all on function public.get_session_user(text) from public;
revoke all on function public.logout_session(text) from public;
revoke all on function public.save_exam_attempt(text, jsonb) from public;
revoke all on function public.list_exam_attempts(text, integer) from public;
revoke all on function public.get_exam_attempt(text, uuid) from public;

grant execute on function public.register_user(text, text, text) to anon, authenticated, service_role;
grant execute on function public.login_user(text, text) to anon, authenticated, service_role;
grant execute on function public.get_session_user(text) to anon, authenticated, service_role;
grant execute on function public.logout_session(text) to anon, authenticated, service_role;
grant execute on function public.save_exam_attempt(text, jsonb) to anon, authenticated, service_role;
grant execute on function public.list_exam_attempts(text, integer) to anon, authenticated, service_role;
grant execute on function public.get_exam_attempt(text, uuid) to anon, authenticated, service_role;
