/**
 * API Route: GET /api/exam/review/[id]
 * หน้าที่: ดึงผลสอบพร้อมเฉลยละเอียด เฉพาะผลสอบของผู้ใช้ที่ล็อกอินอยู่ (ตรวจจาก cookie session)
 * ส่งกลับ: { result (รวมเฉลยละเอียด) }
 */

import { NextResponse } from 'next/server';
import { getResultById, hydrateResult } from '@/lib/examEngine';
import { getExamAttemptFromSupabase } from '@/lib/supabase';
import { getCurrentSession, isMemoryToken } from '@/lib/session';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request, { params }) {
  try {
    // Next.js 15+: params เป็น Promise ต้อง await ก่อนใช้
    const { id } = await params;
    const { user, token } = await getCurrentSession();

    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบเพื่อดูผลสอบ' }, { status: 401 });
    }

    let result = null;
    if (token && !isMemoryToken(token) && UUID_PATTERN.test(id)) {
      const fromDb = await getExamAttemptFromSupabase(token, id);
      if (fromDb) result = hydrateResult(fromDb);
    }
    if (!result) {
      result = getResultById(user.userId, id);
    }

    if (!result) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลผลสอบนี้' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Review route error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเฉลย' },
      { status: 500 }
    );
  }
}
