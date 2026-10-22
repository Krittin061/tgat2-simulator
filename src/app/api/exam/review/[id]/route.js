/**
 * API Route: GET /api/exam/review/[id]
 * หน้าที่: ดึงข้อมูลเฉลยละเอียดของผลสอบ (เฉพาะที่สอบเสร็จแล้ว)
 * รับ: params.id (Result ID) และ ?userId=xxx
 * ส่งกลับ: { result (รวมเฉลยละเอียด) }
 */

import { NextResponse } from 'next/server';
import { getResultById } from '@/lib/examEngine';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';

    const result = getResultById(userId, id);

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
