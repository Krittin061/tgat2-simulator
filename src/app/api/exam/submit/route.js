/**
 * API Route: POST /api/exam/submit
 * หน้าที่: รับคำตอบจาก Frontend แล้วตรวจคะแนนฝั่ง Server
 * รับ: { sessionId, answers, timeSpentSeconds }
 * ส่งกลับ: ผลคะแนนรวม คะแนนแยกทักษะ และเฉลยละเอียดทุกข้อ
 * 
 * ข้อสำคัญ: เฉลยละเอียดจะถูกส่งเฉพาะหลังส่งข้อสอบเท่านั้น
 */

import { NextResponse } from 'next/server';
import { submitExam } from '@/lib/examEngine';

export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, answers, timeSpentSeconds } = body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!sessionId) {
      return NextResponse.json(
        { error: 'ไม่พบรหัสรอบสอบ (sessionId)' },
        { status: 400 }
      );
    }

    // ตรวจคำตอบฝั่ง Server
    const result = submitExam(
      sessionId,
      answers || {},
      timeSpentSeconds || 0
    );

    // ตรวจว่ามี error หรือไม่
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Submit exam route error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจข้อสอบ กรุณาลองใหม่' },
      { status: 500 }
    );
  }
}
