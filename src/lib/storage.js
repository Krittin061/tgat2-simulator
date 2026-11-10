/**
 * ไฟล์: storage.js
 * หน้าที่: บันทึกความคืบหน้าระหว่างทำข้อสอบลง LocalStorage (Autosave)
 * เพื่อกู้คืนได้เมื่อเผลอรีเฟรชหรือปิดแท็บ — ประวัติผลสอบเก็บในฐานข้อมูลฝั่ง Server
 */

const STORAGE_SESSION_KEY = 'tgat2_active_session_v1';

// ฟังก์ชัน: บันทึกสถานะการสอบปัจจุบันลง LocalStorage (Autosave อัตโนมัติระหว่างทำข้อสอบ)
export function saveActiveSession(session) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to autosave session:', err);
  }
}

// ฟังก์ชัน: โหลดสถานะการสอบที่บันทึกไว้ขึ้นมาทำต่อ (ป้องกันปัญหากดรีเฟรชหรือปิดแท็บโดยไม่ตั้งใจ)
export function loadActiveSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse autosaved session:', err);
    return null;
  }
}

// ฟังก์ชัน: ล้างสถานะการสอบปัจจุบันออกจากเครื่อง (เรียกใช้เมื่อส่งข้อสอบเสร็จสิ้น)
export function clearActiveSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear active session:', err);
  }
}
