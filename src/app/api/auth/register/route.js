/**
 * API Route: POST /api/auth/register
 * หน้าที่: สมัครสมาชิกผู้ใช้ใหม่
 * รับ: { name, email, password }
 * ส่งกลับ: { userId, name, email }
 */

import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/examEngine';
import { registerUserInSupabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/password';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const { name, email, password } = body || {};

    // ตรวจสอบข้อมูลที่จำเป็น
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' ||
        !name.trim() || !email.trim() || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อ อีเมล และรหัสผ่านให้ครบ' },
        { status: 400 }
      );
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      return NextResponse.json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      );
    }

    // 1. ลองสมัครสมาชิกบน Supabase Table 'users' ก่อนเป็นอันดับ 1 (เก็บเฉพาะรหัสผ่านที่แฮชแล้ว)
    const supabaseResult = await registerUserInSupabase(name, email, hashPassword(password));
    if (supabaseResult?.error) {
      return NextResponse.json({ error: supabaseResult.error }, { status: 409 });
    }

    // 2. สำรองข้อมูลลงหน่วยความจำเซิร์ฟเวอร์
    const user = supabaseResult || registerUser(name.trim(), email, password);

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
