/**
 * API Route: GET /api/auth/me
 * หน้าที่: คืนข้อมูลผู้ใช้ที่ล็อกอินอยู่ จาก cookie session (ใช้ตอนเปิด/รีเฟรชหน้าเว็บ)
 * ส่งกลับ: { user: { userId, name, email } | null }
 */

import { NextResponse } from 'next/server';
import { getCurrentSession, clearSessionCookie } from '@/lib/session';

export async function GET() {
  try {
    const { user, expired } = await getCurrentSession();
    if (expired) await clearSessionCookie();
    return NextResponse.json({ user: user || null });
  } catch (error) {
    console.error('Me route error:', error);
    return NextResponse.json({ user: null });
  }
}
