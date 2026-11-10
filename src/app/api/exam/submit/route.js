/**
 * API Route: POST /api/exam/submit
 * หน้าที่: รับคำตอบจาก Frontend แล้วตรวจคะแนนฝั่ง Server
 * รับ: { sessionId, answers, timeSpentSeconds, questionIds? } (ผู้สอบมาจาก cookie session)
 * ส่งกลับ: ผลคะแนนรวม คะแนนแยกทักษะ และเฉลยละเอียดทุกข้อ
 * 
 * ข้อสำคัญ: เฉลยละเอียดจะถูกส่งเฉพาะหลังส่งข้อสอบเท่านั้น
 */

import { NextResponse } from 'next/server';
import { submitExam, compactResult } from '@/lib/examEngine';
import { saveExamAttemptInSupabase } from '@/lib/supabase';
import { getCurrentSession, isMemoryToken } from '@/lib/session';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const { sessionId, answers, timeSpentSeconds, questionIds } = body || {};
    const { user, token } = await getCurrentSession();

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'ไม่พบรหัสรอบสอบ (sessionId)' },
        { status: 400 }
      );
    }

    // รับเฉพาะคำตอบที่เป็นรูปแบบ { รหัสข้อ: เลขตัวเลือก 1-5 }
    const cleanAnswers = {};
    if (answers && typeof answers === 'object' && !Array.isArray(answers)) {
      for (const [qId, choice] of Object.entries(answers)) {
        if (/^\d+$/.test(qId) && Number.isInteger(choice) && choice >= 1 && choice <= 5) {
          cleanAnswers[qId] = choice;
        }
      }
    }

    // ตรวจคำตอบฝั่ง Server
    const result = submitExam(
      sessionId,
      cleanAnswers,
      Number.isFinite(timeSpentSeconds) && timeSpentSeconds > 0 ? Math.round(timeSpentSeconds) : 0,
      {
        userId: user?.userId,
        questionIds: Array.isArray(questionIds) ? questionIds : undefined
      }
    );

    // ตรวจว่ามี error หรือไม่
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // ผู้ใช้ที่ล็อกอิน: บันทึกผลสอบลงฐานข้อมูล (เก็บแบบย่อ) และใช้ id จากฐานข้อมูลสำหรับดูเฉลยย้อนหลัง
    if (user && token && !isMemoryToken(token)) {
      const savedId = await saveExamAttemptInSupabase(token, compactResult(result));
      if (savedId) result.id = savedId;
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
