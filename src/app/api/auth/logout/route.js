/**
 * API Route: POST /api/auth/logout
 * หน้าที่: ออกจากระบบ — ลบ session ในฐานข้อมูล/หน่วยความจำ และลบ cookie
 */

import { NextResponse } from 'next/server';
import { endSession } from '@/lib/session';

export async function POST() {
  try {
    await endSession();
  } catch (error) {
    console.error('Logout route error:', error);
  }
  return NextResponse.json({ success: true });
}
