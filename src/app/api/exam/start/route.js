/**
 * API Route: GET /api/exam/start
 * หน้าที่: เริ่มรอบสอบใหม่ — สุ่มลำดับข้อสอบตามพิมพ์เขียว 16 หัวข้อย่อย + สุ่มช้อยส์
 * ส่งกลับ: { sessionId, questions, totalQuestions, durationSeconds }
 */

import { NextResponse } from 'next/server';
import { createExamSession, createPracticeQuestions } from '@/lib/examEngine';
import { TGAT2_QUESTIONS } from '@/data/tgat2Questions';
import { fetchQuestionsFromSupabase } from '@/lib/supabase';
import { getCurrentSession } from '@/lib/session';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'real_exam';

    if (mode !== 'real_exam' && mode !== 'practice') {
      return NextResponse.json({ error: 'โหมดการสอบไม่ถูกต้อง' }, { status: 400 });
    }

    // ผู้สอบมาจาก cookie session (ไม่เชื่อ userId ที่ส่งมาทาง URL)
    const { user } = await getCurrentSession();
    const userId = user?.userId || 'anonymous';

    // 1. ดึงข้อสอบสด ๆ จาก Supabase Table 'questions' (หากมี)
    const supabaseQuestions = await fetchQuestionsFromSupabase();
    const sourceQuestions = (supabaseQuestions && supabaseQuestions.length > 0)
      ? supabaseQuestions
      : TGAT2_QUESTIONS;

    // 2. ถ้าเป็นโหมดฝึกหัด (practice) จะต้องจัดเรียงตามหัวข้อย่อยและแนบเฉลยไปด้วย เพื่อให้ตรวจทันทีได้
    if (mode === 'practice') {
      const skillsParam = searchParams.get('skills');
      const subtopicsParam = searchParams.get('subtopics');

      const skills = skillsParam
        ? skillsParam.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        : [];
      const subtopics = subtopicsParam
        ? subtopicsParam.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        : [];

      const practiceQuestions = createPracticeQuestions(sourceQuestions, { skills, subtopics });

      return NextResponse.json({
        success: true,
        sessionId: 'practice_session',
        questions: practiceQuestions,
        totalQuestions: practiceQuestions.length,
        durationSeconds: 0,
        isFromSupabase: Boolean(supabaseQuestions && supabaseQuestions.length > 0)
      });
    }

    // 3. โหมดจำลองสอบเสมือนจริง (Real Exam)
    // สร้าง session ใหม่ โดยสุ่มข้อสอบล็อกตาม 16 หัวข้อย่อย (เช่น ข้อ 1-5 สื่อความหมาย, 6-10 การใช้ภาษา ฯลฯ)
    const session = createExamSession(userId, sourceQuestions);

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
