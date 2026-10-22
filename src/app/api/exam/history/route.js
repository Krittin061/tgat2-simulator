/**
 * API Route: GET /api/exam/history
 * หน้าที่: ดึงประวัติการสอบทั้งหมดของผู้ใช้
 * รับ: query parameter ?userId=xxx
 * ส่งกลับ: อาร์เรย์ประวัติการสอบ (เรียงจากใหม่ไปเก่า)
 */

import { NextResponse } from 'next/server';
import { getUserHistory } from '@/lib/examEngine';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';

    const history = getUserHistory(userId);

    return NextResponse.json({
      success: true,
      history
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
