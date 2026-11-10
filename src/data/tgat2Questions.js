/**
 * ไฟล์: tgat2Questions.js
 * หน้าที่: รวบรวมชุดข้อสอบ TGAT2 (การคิดอย่างมีเหตุผล) ทั้ง 4 ทักษะย่อย และเกณฑ์คะแนนทางการ
 * (การตรวจคะแนนอยู่ใน src/lib/examEngine.js)
 */

import { verbalQuestions } from './questions/verbal';
import { numericalQuestions } from './questions/numerical';
import { spatialQuestions } from './questions/spatial';
import { logicalQuestions } from './questions/logical';

// รวมข้อสอบ 4 ด้าน ด้านละ 20 ข้อ รวมทั้งหมด 80 ข้อตรงตามพิมพ์เขียว (Blueprint) ของ ทปอ.
export const TGAT2_QUESTIONS = [
  ...verbalQuestions,
  ...numericalQuestions,
  ...spatialQuestions,
  ...logicalQuestions
];

// เกณฑ์การสอบทางการ: 80 ข้อ, ข้อละ 1.25 คะแนน = 100 คะแนนเต็ม, เวลา 90 นาที (5400 วินาที)
export const SCORE_PER_QUESTION = 1.25;
export const MAX_EXAM_SCORE = 100.00;
export const EXAM_DURATION_SECONDS = 90 * 60;
