/**
 * ไฟล์: password.js (ใช้ฝั่ง Server เท่านั้น)
 * หน้าที่: แฮชและตรวจสอบรหัสผ่านด้วย scrypt (มีใน Node.js ไม่ต้องติดตั้งแพ็กเกจเพิ่ม)
 * รูปแบบที่เก็บ: "scrypt$<salt hex>$<hash hex>"
 * รองรับรหัสผ่านเดิมที่เคยเก็บเป็นข้อความธรรมดา เพื่อให้บัญชีเก่ายังเข้าสู่ระบบได้
 */

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const PREFIX = 'scrypt';
const KEY_LENGTH = 64;

export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH);
  return `${PREFIX}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function isHashedPassword(stored) {
  return typeof stored === 'string' && stored.startsWith(`${PREFIX}$`);
}

export function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false;

  if (!isHashedPassword(stored)) {
    // บัญชีเก่าที่เก็บรหัสผ่านเป็นข้อความธรรมดา
    const a = Buffer.from(password);
    const b = Buffer.from(stored);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  const [, saltHex, hashHex] = stored.split('$');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
