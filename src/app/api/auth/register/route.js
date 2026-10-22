/**
 * API Route: POST /api/auth/register
 * หน้าที่: สมัครสมาชิกผู้ใช้ใหม่
 * รับ: { name, email, password }
 * ส่งกลับ: { userId, name, email }
 */

import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/examEngine';
import { registerUserInSupabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อ อีเมล และรหัสผ่านให้ครบ' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      );
    }

    // 1. ลองสมัครสมาชิกบน Supabase Table 'users' ก่อนเป็นอันดับ 1
    const supabaseResult = await registerUserInSupabase(name, email, password);
    if (supabaseResult?.error) {
      return NextResponse.json({ error: supabaseResult.error }, { status: 409 });
    }

    // 2. สำรองข้อมูลลงหน่วยความจำเซิร์ฟเวอร์
    const user = supabaseResult || registerUser(name, email, password);

    if (user.error) {
      return NextResponse.json({ error: user.error }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      user,
      isSupabase: Boolean(supabaseResult)
    }, { status: 201 });
  } catch (error) {
    console.error('Register route error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}
