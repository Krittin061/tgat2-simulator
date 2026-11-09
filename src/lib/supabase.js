import { createClient } from '@supabase/supabase-js';
import { SKILL_METADATA } from '@/types/exam';

const STORAGE_KEY_URL = 'tgat2_supabase_url';
const STORAGE_KEY_KEY = 'tgat2_supabase_anon_key';

let cachedClient = null;
let lastUrl = '';
let lastKey = '';

// ---------------------------------------------------------------------------
// ป้องกันหน้าเว็บค้างเมื่อ Supabase ติดต่อไม่ได้ (เช่น DNS หาโดเมนไม่เจอ / โปรเจกต์ถูกพัก)
// เดิม supabase-js จะ retry หลายรอบ ทำให้ทุกคำขอ (เริ่มสอบ, ล็อกอิน) ช้าราว 7 วินาที
// - จำกัดเวลาแต่ละคำขอ
// - เมื่อเชื่อมต่อล้มเหลว ให้ข้าม Supabase ชั่วคราว แล้วใช้ข้อมูลสำรองในเครื่องทันที
// ---------------------------------------------------------------------------
const REQUEST_TIMEOUT_MS = 4000;
const OUTAGE_BACKOFF_MS = 60 * 1000;
let unavailableUntil = 0;

export function isSupabaseTemporarilyUnavailable() {
  return Date.now() < unavailableUntil;
}

async function fetchWithTimeout(input, init = {}) {
  if (isSupabaseTemporarilyUnavailable()) {
    throw new TypeError('Supabase is temporarily unreachable (skipping request)');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  if (init.signal) {
    if (init.signal.aborted) controller.abort();
    else init.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    // ติดต่อไม่ได้ (network/DNS/timeout) → พักการเรียก Supabase ชั่วคราว
    unavailableUntil = Date.now() + OUTAGE_BACKOFF_MS;
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function getSupabaseCredentials() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem(STORAGE_KEY_URL);
    const customKey = localStorage.getItem(STORAGE_KEY_KEY);
    if (customUrl) url = customUrl;
    if (customKey) anonKey = customKey;
  }

  const isConfigured = Boolean(url && anonKey && !url.includes('your-project-id'));
  return { url, anonKey, isConfigured };
}

export function saveSupabaseCredentials(url, anonKey) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  cachedClient = null;
}

export function getSupabaseClient() {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured || isSupabaseTemporarilyUnavailable()) return null;

  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }

  try {
    // ปิด retry ของ supabase-js (หน่วง 1s, 2s, 4s) เพราะ fetchWithTimeout จัดการกรณีติดต่อไม่ได้แทนแล้ว
    cachedClient = createClient(url, anonKey, { global: { fetch: fetchWithTimeout }, db: { retry: false } });
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function saveExamAttemptToSupabase(result) {
  const supabase = getSupabaseClient();

  if (typeof window !== 'undefined') {
    try {
      const historyKey = 'tgat2_exam_history';
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const newEntry = { ...result, savedLocallyAt: new Date().toISOString() };
      localStorage.setItem(historyKey, JSON.stringify([newEntry, ...existing].slice(0, 30)));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  if (!supabase) {
    return {
      success: true,
      isSupabase: false,
      message: 'บันทึกในหน่วยความจำเครื่อง (LocalStorage) เรียบร้อยแล้ว (สามารถเชื่อมต่อ Supabase ได้ที่เมนูตั้งค่า)'
    };
  }

  try {
    const { data, error } = await supabase
      .from('exam_attempts')
      .insert({
        user_id: result.userId || 'anonymous',
        user_name: result.userName || result.name || 'ผู้เข้าสอบ',
        mode: result.mode,
        total_score: result.totalScore,
        correct_count: result.correctCount,
        total_questions: result.totalQuestions,
        time_spent_seconds: result.timeSpentSeconds,
        skill_breakdown: result.skillBreakdown,
        answers: result.answers,
        created_at: result.submittedAt,
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.warn('Supabase insertion error:', error);
      return {
        success: true,
        isSupabase: false,
        message: `บันทึกในเครื่องสำเร็จ แต่เชื่อม Supabase ไม่ผ่าน: ${error.message}`
      };
    }

    return {
      success: true,
      id: data?.id,
      isSupabase: true,
      message: 'บันทึกผลการสอบขึ้น Supabase Cloud สำเร็จเรียบร้อย!'
    };
  } catch (err) {
    console.error('Unexpected Supabase save error:', err);
    return {
      success: true,
      isSupabase: false,
      message: 'บันทึกในเครื่องเรียบร้อย (เกิดข้อผิดพลาดในการติดต่อฐานข้อมูล)'
    };
  }
}

/**
 * ดึงชุดข้อสอบสด ๆ จาก Supabase Table 'questions'
 * @returns {Promise<Array|null>} รายการข้อสอบทั้งหมด หรือ null หากไม่พบ
 */
export async function fetchQuestionsFromSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Could not fetch questions from Supabase:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data.map(q => ({
      id: q.id,
      skill: q.skill,
      skillLabel: SKILL_METADATA[q.skill]?.name || q.skill_label || 'ทั่วไป',
      topic: q.topic || 'ทั่วไป',
      content: q.content,
      choices: typeof q.choices === 'string' ? JSON.parse(q.choices) : q.choices,
      correctAnswer: q.correct_answer !== undefined ? q.correct_answer : q.correctAnswer,
      explanation: typeof q.explanation === 'string' ? JSON.parse(q.explanation) : q.explanation,
      image: q.image || null
    }));
  } catch (err) {
    console.warn('Error querying Supabase questions:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Client ฝั่ง Server สำหรับตาราง users (ข้อมูลบัญชีผู้ใช้)
// ถ้าตั้งค่า SUPABASE_SERVICE_ROLE_KEY (ไม่ขึ้นต้นด้วย NEXT_PUBLIC_ จึงไม่ถูกส่งไปเบราว์เซอร์)
// จะใช้คีย์นี้ เพื่อให้ปิดสิทธิ์อ่าน/แก้ตาราง users จากสาธารณะได้ (ดู supabase/secure_policies.sql)
// ---------------------------------------------------------------------------
let cachedServerClient = null;

function getServerAuthClient() {
  const serviceKey = typeof window === 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined;
  if (!serviceKey) return getSupabaseClient();

  const { url } = getSupabaseCredentials();
  if (!url || isSupabaseTemporarilyUnavailable()) return null;
  if (!cachedServerClient) {
    cachedServerClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: fetchWithTimeout },
      db: { retry: false }
    });
  }
  return cachedServerClient;
}

/**
 * สมัครสมาชิกผู้ใช้ใหม่ลงใน Supabase Table 'users'
 * @param {string} passwordHash - รหัสผ่านที่แฮชแล้ว (ห้ามส่งรหัสผ่านจริง)
 */
export async function registerUserInSupabase(name, email, passwordHash) {
  const supabase = getServerAuthClient();
  if (!supabase) return null;

  try {
    const cleanEmail = email.trim().toLowerCase();

    // 1. ตรวจสอบว่ามีอีเมลนี้อยู่แล้วหรือไม่
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existing) {
      return { error: 'อีเมลนี้ถูกใช้สมัครสมาชิกแล้ว' };
    }

    // 2. เพิ่มผู้ใช้ใหม่
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: cleanEmail,
        password: passwordHash
      })
      .select('id, name, email')
      .single();

    if (error) {
      console.warn('Supabase register error:', error.message);
      return null;
    }

    return {
      userId: data.id,
      name: data.name,
      email: data.email
    };
  } catch (err) {
    console.warn('Unexpected Supabase register error:', err);
    return null;
  }
}

/**
 * เข้าสู่ระบบผู้ใช้โดยตรวจกับ Supabase Table 'users'
 * @param {Function} verifyPassword - (password, storedValue) => boolean (ฝั่ง Server, ดู lib/password.js)
 */
export async function loginUserInSupabase(email, password, verifyPassword) {
  const supabase = getServerAuthClient();
  if (!supabase) return null;

  try {
    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, password')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error) {
      console.warn('Supabase login query error:', error.message);
      return null;
    }

    if (!data) {
      return { error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ' };
    }

    if (!verifyPassword(password, data.password)) {
      return { error: 'รหัสผ่านไม่ถูกต้อง' };
    }

    return {
      userId: data.id,
      name: data.name,
      email: data.email
    };
  } catch (err) {
    console.warn('Unexpected Supabase login error:', err);
    return null;
  }
}

