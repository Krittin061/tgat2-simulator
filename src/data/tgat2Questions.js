/**
 * ไฟล์: tgat2Questions.js
 * หน้าที่: รวบรวมชุดข้อสอบ TGAT2 (การคิดอย่างมีเหตุผล) ทั้ง 4 ทักษะย่อย
 * และฟังก์ชันคำนวณคะแนนตามเกณฑ์ทางการของ ทปอ.
 */

import { SKILL_METADATA } from '@/types/exam';
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
export const TOTAL_EXAM_QUESTIONS = 80;
export const SCORE_PER_QUESTION = 1.25; 
export const MAX_EXAM_SCORE = 100.00;
export const EXAM_DURATION_SECONDS = 90 * 60; 

// ฟังก์ชันค้นหาข้อสอบตาม ID
export function getQuestionById(id) {
  return TGAT2_QUESTIONS.find(q => q.id === id);
}

// ฟังก์ชันดึงข้อสอบแยกตามทักษะย่อย (ภาษา, ตัวเลข, มิติสัมพันธ์, เหตุผล)
export function getQuestionsBySkill(skill) {
  if (skill === 'all') return TGAT2_QUESTIONS;
  return TGAT2_QUESTIONS.filter(q => q.skill === skill);
}

/**
 * ฟังก์ชัน: calculateExamScore
 * หน้าที่: ตรวจคำตอบและคำนวณคะแนนสอบ TGAT2 อย่างละเอียด
 * @param {Object} answers - วัตถุเก็บคำตอบของผู้ใช้ เช่น { 1: 3, 2: 1 } (ข้อ: ช้อยส์ที่เลือก)
 * @param {number} timeSpentSeconds - เวลาที่ใช้ทำข้อสอบ (วินาที)
 * @param {string} mode - โหมดการสอบ ('real_exam' หรือ 'practice')
 * @param {Array} questionSet - ชุดข้อสอบที่นำมาตรวจ (ค่าเริ่มต้นคือ 80 ข้อของ TGAT2)
 * @returns {Object} ผลลัพธ์คะแนนรวม, เปอร์เซ็นต์ความแม่นยำ และคะแนนย่อยแยกตาม 4 ทักษะ
 */
export function calculateExamScore(answers, timeSpentSeconds, mode, questionSet = TGAT2_QUESTIONS) {
  let correctCount = 0;
  
  const skillCount = {
    verbal: { total: 0, answered: 0, correct: 0 },
    numerical: { total: 0, answered: 0, correct: 0 },
    spatial: { total: 0, answered: 0, correct: 0 },
    logical: { total: 0, answered: 0, correct: 0 }
  };

  questionSet.forEach(q => {
    if (skillCount[q.skill]) {
      skillCount[q.skill].total += 1;
    }
    const userAnswer = answers[q.id];
    if (userAnswer !== undefined && userAnswer !== null) {
      if (skillCount[q.skill]) skillCount[q.skill].answered += 1;
      if (userAnswer === q.correctAnswer) {
        correctCount += 1;
        if (skillCount[q.skill]) skillCount[q.skill].correct += 1;
      }
    }
  });

  // คำนวณคะแนนรวม: 80 ข้อ ข้อละ 1.25 คะแนน = 100 คะแนนเต็ม
  const totalQuestions = questionSet.length;
  const scorePerQuestion = totalQuestions === 80 ? SCORE_PER_QUESTION : parseFloat((100 / totalQuestions).toFixed(2));
  const totalScore = parseFloat((correctCount * scorePerQuestion).toFixed(2));
  const accuracyPercent = totalQuestions > 0 ? parseFloat(((correctCount / totalQuestions) * 100).toFixed(1)) : 0;

  const skillBreakdown = {
    verbal: {
      skill: 'verbal',
      title: SKILL_METADATA.verbal.name,
      color: SKILL_METADATA.verbal.color,
      totalQuestions: skillCount.verbal.total,
      answeredCount: skillCount.verbal.answered,
      correctCount: skillCount.verbal.correct,
      score: parseFloat((skillCount.verbal.correct * SCORE_PER_QUESTION).toFixed(2)),
      maxScore: parseFloat((skillCount.verbal.total * SCORE_PER_QUESTION).toFixed(2)),
      accuracy: skillCount.verbal.total > 0 ? parseFloat(((skillCount.verbal.correct / skillCount.verbal.total) * 100).toFixed(1)) : 0
    },
    numerical: {
      skill: 'numerical',
      title: SKILL_METADATA.numerical.name,
      color: SKILL_METADATA.numerical.color,
      totalQuestions: skillCount.numerical.total,
      answeredCount: skillCount.numerical.answered,
      correctCount: skillCount.numerical.correct,
      score: parseFloat((skillCount.numerical.correct * SCORE_PER_QUESTION).toFixed(2)),
      maxScore: parseFloat((skillCount.numerical.total * SCORE_PER_QUESTION).toFixed(2)),
      accuracy: skillCount.numerical.total > 0 ? parseFloat(((skillCount.numerical.correct / skillCount.numerical.total) * 100).toFixed(1)) : 0
    },
    spatial: {
      skill: 'spatial',
      title: SKILL_METADATA.spatial.name,
      color: SKILL_METADATA.spatial.color,
      totalQuestions: skillCount.spatial.total,
      answeredCount: skillCount.spatial.answered,
      correctCount: skillCount.spatial.correct,
      score: parseFloat((skillCount.spatial.correct * SCORE_PER_QUESTION).toFixed(2)),
      maxScore: parseFloat((skillCount.spatial.total * SCORE_PER_QUESTION).toFixed(2)),
      accuracy: skillCount.spatial.total > 0 ? parseFloat(((skillCount.spatial.correct / skillCount.spatial.total) * 100).toFixed(1)) : 0
    },
    logical: {
      skill: 'logical',
      title: SKILL_METADATA.logical.name,
      color: SKILL_METADATA.logical.color,
      totalQuestions: skillCount.logical.total,
      answeredCount: skillCount.logical.answered,
      correctCount: skillCount.logical.correct,
      score: parseFloat((skillCount.logical.correct * SCORE_PER_QUESTION).toFixed(2)),
      maxScore: parseFloat((skillCount.logical.total * SCORE_PER_QUESTION).toFixed(2)),
      accuracy: skillCount.logical.total > 0 ? parseFloat(((skillCount.logical.correct / skillCount.logical.total) * 100).toFixed(1)) : 0
    }
  };

  return {
    mode,
    totalScore,
    maxScore: MAX_EXAM_SCORE,
    correctCount,
    totalQuestions: TOTAL_EXAM_QUESTIONS,
    accuracyPercent,
    timeSpentSeconds,
    skillBreakdown,
    answers,
    submittedAt: new Date().toISOString()
  };
}
