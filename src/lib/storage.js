/**
 * ไฟล์: storage.js
 * หน้าที่: จัดการการจัดเก็บข้อมูลลงใน LocalStorage ของเบราว์เซอร์
 * ประกอบด้วยระบบ Autosave ระหว่างสอบ และการเก็บประวัติผลการสอบย้อนหลัง
 */

// คีย์สำหรับเก็บข้อมูลใน LocalStorage
const STORAGE_SESSION_KEY = 'tgat2_active_session_v1';
const STORAGE_HISTORY_KEY = 'tgat2_exam_history';

// ข้อมูลจำลองประวัติผลสอบ TGAT2 เริ่มต้น (กรณีที่ยังไม่เคยสอบจริงในเครื่อง)
export const DEFAULT_TGAT2_HISTORY = [
  {
    id: 'tgat2-attempt-1',
    mode: 'real_exam',
    title: 'TGAT2 การคิดอย่างมีเหตุผล (โหมดสอบจริง)',
    totalScore: 78.75,
    maxScore: 100,
    correctCount: 63,
    totalQuestions: 80,
    accuracyPercent: 78.8,
    timeSpentSeconds: 3480, // 58 นาที
    submittedAt: '2026-10-08T14:30:00.000Z',
    skillBreakdown: {
      verbal: {
        skill: 'verbal',
        title: 'ความสามารถทางภาษา',
        color: '#1CB0F6',
        totalQuestions: 20,
        answeredCount: 20,
        correctCount: 17,
        score: 21.25,
        maxScore: 25.00,
        accuracy: 85.0
      },
      numerical: {
        skill: 'numerical',
        title: 'ความสามารถทางตัวเลข',
        color: '#58CC02',
        totalQuestions: 20,
        answeredCount: 20,
        correctCount: 16,
        score: 20.00,
        maxScore: 25.00,
        accuracy: 80.0
      },
      spatial: {
        skill: 'spatial',
        title: 'ความสามารถทางมิติสัมพันธ์',
        color: '#FF4B4B',
        totalQuestions: 20,
        answeredCount: 20,
        correctCount: 11,
        score: 13.75,
        maxScore: 25.00,
        accuracy: 55.0
      },
      logical: {
        skill: 'logical',
        title: 'ความสามารถทางเหตุผล',
        color: '#FFC800',
        totalQuestions: 20,
        answeredCount: 20,
        correctCount: 19,
        score: 23.75,
        maxScore: 25.00,
        accuracy: 95.0
      }
    },
    answers: {
      1: 3, 2: 2, 3: 1, 4: 4, 5: 2, 6: 1, 7: 3, 8: 4, 9: 2, 10: 1,
      41: 2, 42: 1, 43: 3, 44: 4, 45: 1
    }
  },
  {
    id: 'tgat2-attempt-2',
    mode: 'practice',
    title: 'โหมดฝึกทำข้อสอบ TGAT2',
    totalScore: 82.50,
    maxScore: 100,
    correctCount: 41,
    totalQuestions: 50,
    accuracyPercent: 82.0,
    timeSpentSeconds: 2700, // 45 นาที
    submittedAt: '2026-10-06T10:15:00.000Z',
    skillBreakdown: {
      verbal: {
        skill: 'verbal',
        title: 'ความสามารถทางภาษา',
        color: '#1CB0F6',
        totalQuestions: 15,
        answeredCount: 15,
        correctCount: 13,
        score: 21.67,
        maxScore: 25.00,
        accuracy: 86.7
      },
      numerical: {
        skill: 'numerical',
        title: 'ความสามารถทางตัวเลข',
        color: '#58CC02',
        totalQuestions: 15,
        answeredCount: 15,
        correctCount: 12,
        score: 20.00,
        maxScore: 25.00,
        accuracy: 80.0
      },
      spatial: {
        skill: 'spatial',
        title: 'ความสามารถทางมิติสัมพันธ์',
        color: '#FF4B4B',
        totalQuestions: 10,
        answeredCount: 10,
        correctCount: 7,
        score: 17.50,
        maxScore: 25.00,
        accuracy: 70.0
      },
      logical: {
        skill: 'logical',
        title: 'ความสามารถทางเหตุผล',
        color: '#FFC800',
        totalQuestions: 10,
        answeredCount: 10,
        correctCount: 9,
        score: 22.50,
        maxScore: 25.00,
        accuracy: 90.0
      }
    },
    answers: {
      1: 3, 2: 2, 3: 1, 4: 4, 5: 2
    }
  }
];

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

// ฟังก์ชัน: ดึงประวัติการสอบทั้งหมดจาก LocalStorage (หากยังไม่มีจะดึงค่าเริ่มต้น DEFAULT_TGAT2_HISTORY)
export function getExamHistory() {
  if (typeof window === 'undefined') return DEFAULT_TGAT2_HISTORY;
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (!raw) return DEFAULT_TGAT2_HISTORY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TGAT2_HISTORY;
  } catch (err) {
    console.error('Failed to load exam history:', err);
    return DEFAULT_TGAT2_HISTORY;
  }
}

// ฟังก์ชัน: บันทึกผลสอบรอบใหม่ลงในประวัติการสอบ
export function saveExamHistory(newHistoryItem) {
  if (typeof window === 'undefined') return;
  try {
    const current = getExamHistory();
    const updated = [newHistoryItem, ...current];
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save exam history:', err);
  }
}

