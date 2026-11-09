/**
 * API Route: POST /api/auth/login
 * หน้าที่: เข้าสู่ระบบผู้ใช้
 * รับ: { email, password }
 * ส่งกลับ: { userId, name, email }
 */

import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/examEngine';
import { loginUserInSupabase } from '@/lib/supabase';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const { email, password } = body || {};

    // ตรวจสอบข้อมูลที่จำเป็น
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกอีเมลและรหัสผ่าน' },
        { status: 400 }
      );
    }

    // 1. ตรวจสอบข้อมูลผู้ใช้กับ Supabase Table 'users' ก่อนเป็นอันดับ 1
    const supabaseResult = await loginUserInSupabase(email, password);

    if (supabaseResult?.error) {
      return NextResponse.json({ error: supabaseResult.error }, { status: 401 });
    }

    // 2. สำรองข้อมูล (เมื่อ Supabase ใช้งานไม่ได้) — ตรวจรหัสผ่านเช่นกัน
    const user = supabaseResult || loginUser(email, password);

    if (user.error) {
      return NextResponse.json({ error: user.error }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user,
      isSupabase: Boolean(supabaseResult)
    });
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}
