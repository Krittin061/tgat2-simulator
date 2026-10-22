/**
 * API Route: GET /api/exam/start
 * หน้าที่: เริ่มรอบสอบใหม่ — สุ่มลำดับข้อสอบ + สุ่มช้อยส์
 * ส่งกลับ: { sessionId, questions, totalQuestions, durationSeconds }
 */

import { NextResponse } from 'next/server';
import { createExamSession } from '@/lib/examEngine';
import { TGAT2_QUESTIONS } from '@/data/tgat2Questions';
import { fetchQuestionsFromSupabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const mode = searchParams.get('mode') || 'real_exam';

    // 1. ดึงข้อสอบสด ๆ จาก Supabase Table 'questions'
    const supabaseQuestions = await fetchQuestionsFromSupabase();
    const sourceQuestions = (supabaseQuestions && supabaseQuestions.length > 0)
      ? supabaseQuestions
      : TGAT2_QUESTIONS;

    // 2. สร้าง session การสอบใหม่
    const session = createExamSession(userId, sourceQuestions);

    // ถ้าเป็นโหมดฝึกหัด (practice) จะต้องแนบเฉลยไปด้วย เพื่อให้ตรวจทันทีได้
    if (mode === 'practice') {
      const skillsParam = searchParams.get('skills');
      let practiceQuestions = sourceQuestions;

      // กรองตามหัวข้อที่ผู้ใช้เลือก (เช่น verbal, numerical)
      if (skillsParam) {
        const selectedSkills = skillsParam.split(',').map(s => s.trim().toLowerCase());
        if (selectedSkills.length > 0) {
          practiceQuestions = sourceQuestions.filter(q => selectedSkills.includes(q.skill?.toLowerCase()));
        }
      }

      return NextResponse.json({
        success: true,
        sessionId: 'practice_session',
        questions: practiceQuestions, // ส่งข้อสอบตามหัวข้อพร้อมเฉลย
        totalQuestions: practiceQuestions.length,
        durationSeconds: 0,
        isFromSupabase: Boolean(supabaseQuestions && supabaseQuestions.length > 0)
      });
    }

    return NextResponse.json({
      success: true,
      isFromSupabase: Boolean(supabaseQuestions && supabaseQuestions.length > 0),
      ...session
    });
  } catch (error) {
    if (error?.digest !== 'NEXT_PRERENDER_INTERRUPTED') {
      console.error('Start exam route error:', error);
    }
    return NextResponse.json(
      { error: 'ไม่สามารถเริ่มรอบสอบได้ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
