/**
 * API Route: GET /api/exam/history
 * หน้าที่: ดึงประวัติการสอบของผู้ใช้ที่ล็อกอินอยู่ (จาก cookie session เท่านั้น — ดูของคนอื่นไม่ได้)
 * ส่งกลับ: อาร์เรย์ประวัติแบบสรุป เรียงจากใหม่ไปเก่า (ไม่มีเฉลยรายข้อ — ดูได้ที่ /api/exam/review/[id])
 */

import { NextResponse } from 'next/server';
import { getUserHistory } from '@/lib/examEngine';
import { listExamAttemptsFromSupabase } from '@/lib/supabase';
import { getCurrentSession, isMemoryToken } from '@/lib/session';

const toSummary = (result) => {
  const summary = { ...result };
  delete summary.detailedAnswers;
  return summary;
};

export async function GET() {
  try {
    const { user, token } = await getCurrentSession();
    if (!user) {
      return NextResponse.json({ success: true, history: [] });
    }

    // 1. ประวัติในฐานข้อมูล (คงอยู่ข้ามการรีสตาร์ตและทุก Server instance)
    if (token && !isMemoryToken(token)) {
      const fromDb = await listExamAttemptsFromSupabase(token);
      if (fromDb) {
        return NextResponse.json({ success: true, history: fromDb });
      }
    }

    // 2. สำรอง: ประวัติในหน่วยความจำ (เมื่อฐานข้อมูลใช้งานไม่ได้)
    return NextResponse.json({
      success: true,
      history: getUserHistory(user.userId).map(toSummary)
    });
  } catch (error) {
    if (error?.digest !== 'NEXT_PRERENDER_INTERRUPTED') {
      console.error('History route error:', error);
    }
    return NextResponse.json(
      { error: 'ไม่สามารถดึงประวัติการสอบได้' },
      { status: 500 }
    );
  }
}
