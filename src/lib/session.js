/**
 * ไฟล์: session.js (ใช้ฝั่ง Server / Route Handler เท่านั้น)
 * หน้าที่: จัดการ session ผู้ใช้ผ่าน cookie แบบ HttpOnly (JavaScript ในเบราว์เซอร์อ่านไม่ได้)
 * - token จากฐานข้อมูล (Supabase: ตาราง user_sessions เก็บเฉพาะ SHA-256 ของ token)
 * - token ที่ขึ้นต้นด้วย "mem_" คือ session สำรองในหน่วยความจำ เมื่อ Supabase ใช้งานไม่ได้
 */

import { cookies } from 'next/headers';
import { getSessionUserFromSupabase, logoutSessionInSupabase } from '@/lib/supabase';
import { createMemorySession, getMemorySessionUser, deleteMemorySession } from '@/lib/examEngine';

export const SESSION_COOKIE = 'tgat2_session';
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export const isMemoryToken = (token) => typeof token === 'string' && token.startsWith('mem_');

export async function getSessionToken() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value || null;
}

export async function setSessionCookie(token) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * เริ่ม session หลังล็อกอิน/สมัครสำเร็จ
 * @param {Object} user - { userId, name, email, token? } (token มาจากฐานข้อมูล ถ้ามี)
 * @returns {Object} ข้อมูลผู้ใช้ที่ส่งให้หน้าเว็บได้ (ไม่มี token)
 */
export async function startSession(user) {
  const token = user.token || createMemorySession({ userId: user.userId, name: user.name, email: user.email });
  await setSessionCookie(token);
  return { userId: user.userId, name: user.name, email: user.email };
}

/**
 * ผู้ใช้ปัจจุบันจาก cookie
 * @returns {Promise<{ user: Object|null, token: string|null }>}
 */
export async function getCurrentSession() {
  const token = await getSessionToken();
  if (!token) return { user: null, token: null };

  if (isMemoryToken(token)) {
    return { user: getMemorySessionUser(token), token };
  }

  const result = await getSessionUserFromSupabase(token);
  if (!result || result.error) {
    // null = ฐานข้อมูลใช้งานไม่ได้ชั่วคราว (ยังไม่ลบ cookie), error = session หมดอายุ/ไม่ถูกต้อง
    return { user: null, token: result?.error ? null : token, expired: Boolean(result?.error) };
  }
  return { user: result, token };
}

export async function endSession() {
  const token = await getSessionToken();
  if (token) {
    if (isMemoryToken(token)) deleteMemorySession(token);
    else await logoutSessionInSupabase(token);
  }
  await clearSessionCookie();
}
