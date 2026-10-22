/**
 * ไฟล์: examEngine.js (Backend Logic)
 * หน้าที่: ตรรกะหลักของระบบสอบฝั่งเซิร์ฟเวอร์
 * 1. สุ่มลำดับข้อสอบ (Fisher-Yates Shuffle)
 * 2. สุ่มลำดับช้อยส์ในแต่ละข้อ (พร้อมอัปเดต correctAnswer)
 * 3. สร้าง Exam Session พร้อม Token ป้องกันการโกง
 * 4. ตรวจคำตอบฝั่ง Server (ไม่ส่งเฉลยไปยัง Frontend ก่อนสอบเสร็จ)
 */

import { TGAT2_QUESTIONS, SCORE_PER_QUESTION, MAX_EXAM_SCORE, EXAM_DURATION_SECONDS } from '@/data/tgat2Questions';
import { SKILL_METADATA } from '@/types/exam';

// เก็บ session ไว้ใน memory ของ server (ใช้ Map เพื่อค้นหาเร็ว)
// หมายเหตุ: ใน production ควรใช้ Redis หรือ Database แทน
const activeSessions = new Map();

// เก็บข้อมูลผู้ใช้จำลอง (ในระบบจริงจะเก็บใน Database)
const users = new Map();

// เก็บประวัติการสอบ
const examHistory = new Map();

/**
 * ฟังก์ชัน: shuffleArray
 * หน้าที่: สุ่มลำดับสมาชิกในอาร์เรย์ด้วยอัลกอริทึม Fisher-Yates
 * วิธีการ: วนลูปจากท้ายไปหน้า สลับตำแหน่งกับสมาชิกสุ่มที่อยู่ก่อนหน้า
 * @param {Array} array - อาร์เรย์ที่ต้องการสุ่ม
 * @returns {Array} อาร์เรย์ที่สุ่มลำดับแล้ว (สร้างอาร์เรย์ใหม่ ไม่แก้ไขตัวเดิม)
 */
function shuffleArray(array) {
  const shuffled = [...array]; // สำเนาอาร์เรย์เพื่อไม่ให้กระทบต้นฉบับ
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // สลับตำแหน่ง
  }
  return shuffled;
}

/**
 * ฟังก์ชัน: shuffleChoices
 * หน้าที่: สุ่มลำดับช้อยส์ในข้อสอบ 1 ข้อ พร้อมอัปเดตคำตอบที่ถูกต้อง
 * @param {Object} question - ข้อสอบต้นฉบับ (มี choices และ correctAnswer)
 * @returns {Object} ข้อสอบที่ช้อยส์ถูกสุ่มแล้ว + correctAnswer อัปเดตตามตำแหน่งใหม่
 */
function shuffleChoices(question) {
  // ไม่สุ่มช้อยส์สำหรับ:
  // 1. ข้อสอบมิติสัมพันธ์ที่มีภาพ (ตัวเลือกอิงตามหมายเลข 1-5 ในรูปภาพ)
  // 2. ข้อสอบสดมภ์ หรือ ความเพียงพอของข้อมูล หรือ เงื่อนไข ที่มีตัวเลือกมาตรฐาน ก-ค หรือ 1-5
  if (
    question.image ||
    question.skill === 'spatial' ||
    question.topic?.includes('สดมภ์') ||
    question.topic?.includes('ความเพียงพอของข้อมูล') ||
    question.topic?.includes('เงื่อนไขสถานการณ์') ||
    (question.choices && question.choices[0]?.text?.startsWith('ตัวเลือกที่')) ||
    (question.choices && question.choices[0]?.text?.includes('สดมภ์ ก')) ||
    (question.choices && question.choices[0]?.text?.includes('ข้อมูล ก'))
  ) {
    return question;
  }

  const originalChoices = question.choices;
  const correctChoiceId = question.correctAnswer; // id ของช้อยส์ที่ถูก

  // สุ่มลำดับช้อยส์
  const shuffledChoices = shuffleArray(originalChoices);

  // กำหนด id ใหม่ตามลำดับ (1, 2, 3, 4, 5)
  // และหา id ใหม่ของช้อยส์ที่ถูกต้อง
  let newCorrectAnswer = 1;
  const renamedChoices = shuffledChoices.map((choice, index) => {
    const newId = index + 1;
    if (choice.id === correctChoiceId) {
      newCorrectAnswer = newId; // บันทึกตำแหน่งใหม่ของคำตอบที่ถูก
    }
    return { id: newId, text: choice.text };
  });

  return {
    ...question,
    choices: renamedChoices,
    correctAnswer: newCorrectAnswer
  };
}

/**
 * ฟังก์ชัน: generateSessionId
 * หน้าที่: สร้างรหัส Session ไม่ซ้ำกันเพื่อระบุรอบการสอบ
 * @returns {string} รหัส session เช่น "exam_1696789012345_abc12"
 */
function generateSessionId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7); // สุ่ม 5 ตัวอักษร
  return `exam_${timestamp}_${random}`;
}

/**
 * ฟังก์ชัน: createExamSession
 * หน้าที่: สร้างชุดข้อสอบใหม่โดยสุ่มตามแต่ละหมวดวิชา (ภาษา, ตัวเลข, มิติสัมพันธ์, เหตุผล)
 * ส่งกลับเฉพาะโจทย์+ช้อยส์+ภาพ (ไม่มี correctAnswer, explanation) ไปยัง Frontend
 * เก็บเฉลยไว้ที่ Server เท่านั้น
 * @param {string} userId - รหัสผู้ใช้
 * @returns {Object} { sessionId, questions (ไม่มีเฉลย), startedAt, expiresAt }
 */
export function createExamSession(userId, sourceQuestions = TGAT2_QUESTIONS) {
  const sessionId = generateSessionId();

  // สุ่มข้อสอบแยกตามแต่ละหมวดวิชาอย่างเป็นสัดส่วนตามพิมพ์เขียว TGAT2:
  // 1. หมวดความสามารถทางภาษา (Verbal)
  // 2. หมวดความสามารถทางตัวเลข (Numerical)
  // 3. หมวดความสามารถทางมิติสัมพันธ์ (Spatial)
  // 4. หมวดความสามารถทางเหตุผล (Logical)
  const verbalQuestions = shuffleArray(sourceQuestions.filter(q => q.skill === 'verbal'));
  const numericalQuestions = shuffleArray(sourceQuestions.filter(q => q.skill === 'numerical'));
  const spatialQuestions = shuffleArray(sourceQuestions.filter(q => q.skill === 'spatial'));
  const logicalQuestions = shuffleArray(sourceQuestions.filter(q => q.skill === 'logical'));

  // รวมข้อสอบโดยเรียงตามหมวดของข้อสอบทางการ TGAT2
  const orderedQuestions = [
    ...verbalQuestions,
    ...numericalQuestions,
    ...spatialQuestions,
    ...logicalQuestions
  ];

  // สุ่มลำดับช้อยส์เฉพาะข้อสอบที่ไม่ได้อิงตัวเลือกตามรูปภาพ
  const questionsWithShuffledChoices = orderedQuestions.map(q => shuffleChoices(q));

  // เก็บข้อมูลเฉลยไว้ฝั่ง Server (ส่วนนี้ Frontend จะไม่ได้รับ)
  const answerKey = {};
  questionsWithShuffledChoices.forEach((q, index) => {
    answerKey[q.id] = {
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      order: index // ลำดับที่แสดงในชุดนี้
    };
  });

  const questionMap = {};
  sourceQuestions.forEach(q => { questionMap[q.id] = q; });

  const startedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + EXAM_DURATION_SECONDS * 1000).toISOString();

  // บันทึก session ไว้ใน memory
  activeSessions.set(sessionId, {
    sessionId,
    userId,
    answerKey,
    questionMap,
    questionOrder: questionsWithShuffledChoices.map(q => q.id),
    startedAt,
    expiresAt,
    isSubmitted: false
  });

  // สร้างข้อมูลที่จะส่งไปยัง Frontend (ไม่มีเฉลย)
  const clientQuestions = questionsWithShuffledChoices.map((q, index) => ({
    id: q.id,
    skill: q.skill,
    skillLabel: q.skillLabel,
    topic: q.topic,
    content: q.content,
    choices: q.choices,
    image: q.image || null,
    svgIllustration: q.svgIllustration || null,
    displayOrder: index + 1  // ลำดับที่แสดงบนหน้าจอ (1-80)
  }));

  return {
    sessionId,
    questions: clientQuestions,
    totalQuestions: clientQuestions.length,
    durationSeconds: EXAM_DURATION_SECONDS,
    startedAt,
    expiresAt
  };
}

/**
 * ฟังก์ชัน: submitExam
 * หน้าที่: รับคำตอบจาก Frontend แล้วตรวจคะแนนฝั่ง Server
 * @param {string} sessionId - รหัส session ของรอบสอบนี้
 * @param {Object} answers - คำตอบ { questionId: choiceId }
 * @param {number} timeSpentSeconds - เวลาที่ใช้ (วินาที)
 * @returns {Object} ผลคะแนนพร้อมเฉลยละเอียด
 */
export function submitExam(sessionId, answers, timeSpentSeconds) {
  let session = activeSessions.get(sessionId);

  // ตรวจสอบว่า session มีอยู่ในหน่วยความจำหรือไม่ หากไม่มี (เช่น รีสตาร์ทเซิร์ฟเวอร์ระหว่างที่ผู้ใช้กู้คืนข้อสอบ) ให้สร้างเฉลยสำรองจากคลังข้อสอบหลัก
  if (!session) {
    const fallbackAnswerKey = {};
    TGAT2_QUESTIONS.forEach((q, index) => {
      fallbackAnswerKey[q.id] = {
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        order: index
      };
    });

    session = {
      sessionId,
      userId: 'anonymous',
      answerKey: fallbackAnswerKey,
      questionOrder: Object.keys(fallbackAnswerKey).map(Number),
      isSubmitted: false
    };
    activeSessions.set(sessionId, session);
  }

  if (session.isSubmitted) {
    return { error: 'รอบสอบนี้ถูกส่งไปแล้ว ไม่สามารถส่งซ้ำได้' };
  }

  // ทำเครื่องหมายว่าส่งแล้ว (ป้องกันการส่งซ้ำ)
  session.isSubmitted = true;

  // ตรวจคำตอบโดยใช้เฉลยที่เก็บไว้ฝั่ง Server
  const answerKey = session.answerKey;
  let correctCount = 0;

  // นับคะแนนแยกตามทักษะย่อย
  const skillCount = {
    verbal: { total: 0, answered: 0, correct: 0 },
    numerical: { total: 0, answered: 0, correct: 0 },
    spatial: { total: 0, answered: 0, correct: 0 },
    logical: { total: 0, answered: 0, correct: 0 }
  };

  // หาข้อมูลทักษะของแต่ละข้อจาก session หรือชุดข้อสอบต้นฉบับ
  const questionMap = session.questionMap || {};
  if (Object.keys(questionMap).length === 0) {
    TGAT2_QUESTIONS.forEach(q => { questionMap[q.id] = q; });
  }

  // วนตรวจทุกข้อ
  Object.keys(answerKey).forEach(qId => {
    const questionId = parseInt(qId);
    const originalQ = questionMap[questionId];
    if (!originalQ) return;

    const skill = originalQ.skill;
    if (skillCount[skill]) {
      skillCount[skill].total += 1;
    }

    const userAnswer = answers[questionId];
    if (userAnswer !== undefined && userAnswer !== null) {
      if (skillCount[skill]) skillCount[skill].answered += 1;
      if (userAnswer === answerKey[questionId].correctAnswer) {
        correctCount += 1;
        if (skillCount[skill]) skillCount[skill].correct += 1;
      }
    }
  });

  // คำนวณคะแนน (ข้อละ 1.25 คะแนน = 100 คะแนนเต็ม)
  const totalScore = parseFloat((correctCount * SCORE_PER_QUESTION).toFixed(2));
  const totalQuestions = Object.keys(answerKey).length;
  const accuracyPercent = totalQuestions > 0
    ? parseFloat(((correctCount / totalQuestions) * 100).toFixed(1))
    : 0;

  // สร้างผลคะแนนแยกตามทักษะ
  const skillBreakdown = {};
  for (const [skill, counts] of Object.entries(skillCount)) {
    skillBreakdown[skill] = {
      skill,
      title: SKILL_METADATA[skill]?.name || skill,
      color: SKILL_METADATA[skill]?.color || '#64748B',
      totalQuestions: counts.total,
      answeredCount: counts.answered,
      correctCount: counts.correct,
      score: parseFloat((counts.correct * SCORE_PER_QUESTION).toFixed(2)),
      maxScore: parseFloat((counts.total * SCORE_PER_QUESTION).toFixed(2)),
      accuracy: counts.total > 0 ? parseFloat(((counts.correct / counts.total) * 100).toFixed(1)) : 0
    };
  }

  // สร้างเฉลยละเอียดรายข้อ (ส่งให้ Frontend หลังสอบเสร็จ)
  const questionOrder = session.questionOrder || Object.keys(answerKey).map(Number);
  const detailedAnswers = questionOrder.map(qId => {
    const originalQ = questionMap[qId];
    const serverAnswer = answerKey[qId];
    const userAnswer = answers[qId];
    const isCorrect = userAnswer === serverAnswer.correctAnswer;

    return {
      questionId: qId,
      displayOrder: serverAnswer.order + 1,
      skill: originalQ.skill,
      skillLabel: originalQ.skillLabel,
      topic: originalQ.topic,
      content: originalQ.content,
      choices: originalQ.choices, // ช้อยส์ลำดับเดิม (สำหรับเฉลย)
      correctAnswer: originalQ.correctAnswer,
      userAnswer: userAnswer || null,
      isCorrect,
      isAnswered: userAnswer !== undefined && userAnswer !== null,
      explanation: originalQ.explanation,
      image: originalQ.image || null,
      svgIllustration: originalQ.svgIllustration || null
    };
  });

  const resultId = `result_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;

  const result = {
    id: resultId,
    sessionId,
    mode: 'real_exam',
    totalScore,
    maxScore: MAX_EXAM_SCORE,
    correctCount,
    totalQuestions,
    accuracyPercent,
    timeSpentSeconds,
    skillBreakdown,
    answers,
    detailedAnswers,
    submittedAt: new Date().toISOString()
  };

  // บันทึกประวัติ
  const userId = session.userId || 'anonymous';
  if (!examHistory.has(userId)) {
    examHistory.set(userId, []);
  }
  examHistory.get(userId).unshift(result);

  // ลบ session หลังส่งแล้ว
  activeSessions.delete(sessionId);

  return result;
}

/**
 * ฟังก์ชัน: getSession
 * หน้าที่: ดึงข้อมูล session เพื่อตรวจสอบสถานะ
 */
export function getSession(sessionId) {
  return activeSessions.get(sessionId) || null;
}

/**
 * ฟังก์ชัน: registerUser / loginUser
 * หน้าที่: จัดการผู้ใช้จำลอง (ในระบบจริงจะเชื่อมต่อ Database)
 */
export function registerUser(name, email, password) {
  if (users.has(email)) {
    return { error: 'อีเมลนี้ถูกใช้สมัครแล้ว' };
  }
  const userId = `user_${Date.now()}`;
  users.set(email, { userId, name, email, password, createdAt: new Date().toISOString() });
  return { userId, name, email };
}

export function loginUser(email, password) {
  const user = users.get(email);
  // ในระบบทดสอบ อนุญาตให้เข้าสู่ระบบด้วยรหัสใดก็ได้ หรือสร้างผู้ใช้อัตโนมัติ
  if (!user) {
    // สร้างผู้ใช้อัตโนมัติ (Demo Mode)
    const userId = `user_${Date.now()}`;
    const newUser = { userId, name: email.split('@')[0], email, password, createdAt: new Date().toISOString() };
    users.set(email, newUser);
    return { userId, name: newUser.name, email };
  }
  return { userId: user.userId, name: user.name, email: user.email };
}

/**
 * ฟังก์ชัน: getUserHistory
 * หน้าที่: ดึงประวัติการสอบของผู้ใช้
 */
export function getUserHistory(userId) {
  return examHistory.get(userId) || [];
}

/**
 * ฟังก์ชัน: getResultById
 * หน้าที่: ดึงผลสอบจาก ID
 */
export function getResultById(userId, resultId) {
  const history = examHistory.get(userId) || [];
  return history.find(r => r.id === resultId) || null;
}
