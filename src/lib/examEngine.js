/**
 * ไฟล์: examEngine.js (Backend Logic)
 * หน้าที่: ตรรกะหลักของระบบสอบฝั่งเซิร์ฟเวอร์
 * 1. จัดเรียงข้อสอบตามพิมพ์เขียวทางการ TGAT2 ครบ 16 หัวข้อย่อย (5 ข้อต่อหัวข้อย่อย รวม 80 ข้อ)
 * 2. สุ่มลำดับข้อสอบเฉพาะภายในแต่ละหัวข้อย่อย (เช่น ข้อ 1-5 สุ่มเฉพาะการสื่อความหมาย) เพื่อคงโครงสร้างเสมือนจริง
 * 3. สุ่มลำดับช้อยส์ในแต่ละข้อ (พร้อมอัปเดต correctAnswer)
 * 4. สร้าง Exam Session พร้อม Token ป้องกันการโกง
 * 5. ตรวจคำตอบฝั่ง Server (ไม่ส่งเฉลยไปยัง Frontend ก่อนสอบเสร็จ)
 * 6. วิเคราะห์คะแนนทั้งระดับหมวดวิชาหลัก (4 หมวด) และระดับหัวข้อย่อย (16 หัวข้อ)
 */

import { TGAT2_QUESTIONS, SCORE_PER_QUESTION, MAX_EXAM_SCORE, EXAM_DURATION_SECONDS } from '@/data/tgat2Questions';
import { SKILL_METADATA, TGAT2_BLUEPRINT, SUBTOPIC_MAP, getQuestionSubtopicId } from '@/types/exam';

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
 * @param {Array} array - อาร์เรย์ที่ต้องการสุ่ม
 * @returns {Array} อาร์เรย์ที่สุ่มลำดับแล้ว (สร้างอาร์เรย์ใหม่ ไม่แก้ไขตัวเดิม)
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * ฟังก์ชัน: shuffleChoices
 * หน้าที่: สุ่มลำดับช้อยส์ในข้อสอบ 1 ข้อ พร้อมอัปเดตคำตอบที่ถูกต้อง
 * @param {Object} question - ข้อสอบต้นฉบับ (มี choices และ correctAnswer)
 * @returns {Object} ข้อสอบที่ช้อยส์ถูกสุ่มแล้ว + correctAnswer อัปเดตตามตำแหน่งใหม่
 */
export function shuffleChoices(question) {
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

  const originalChoices = question.choices || [];
  if (originalChoices.length === 0) return question;

  const correctChoiceId = question.correctAnswer;

  // สุ่มลำดับช้อยส์
  const shuffledChoices = shuffleArray(originalChoices);

  // กำหนด id ใหม่ตามลำดับ (1, 2, 3, 4, 5)
  // และหา id ใหม่ของช้อยส์ที่ถูกต้อง
  let newCorrectAnswer = 1;
  const renamedChoices = shuffledChoices.map((choice, index) => {
    const newId = index + 1;
    if (choice.id === correctChoiceId) {
      newCorrectAnswer = newId;
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
  const random = Math.random().toString(36).substring(2, 7);
  return `exam_${timestamp}_${random}`;
}

/**
 * ฟังก์ชัน: createExamSession
 * หน้าที่: สร้างชุดข้อสอบใหม่เสมือนจริง โดยจัดเรียงตามพิมพ์เขียวทางการ 16 หัวข้อย่อย
 * - ข้อ 1 - 5: สื่อความหมาย (สุ่มเฉพาะเรื่องสื่อความหมาย)
 * - ข้อ 6 - 10: การใช้ภาษา (สุ่มเฉพาะเรื่องการใช้ภาษา)
 * - ข้อ 11 - 15: การอ่าน (สุ่มเฉพาะเรื่องการอ่าน)
 * - ข้อ 16 - 20: การเข้าใจสาร (สุ่มเฉพาะเรื่องการเข้าใจสาร)
 * - ข้อ 21 - 25: อนุกรมมิติ
 * - ข้อ 26 - 30: สดมภ์
 * - ข้อ 31 - 35: ความเพียงพอของข้อมูล
 * - ข้อ 36 - 40: โจทย์ปัญหาคณิตศาสตร์
 * - ข้อ 41 - 45: แบบพับกล่อง
 * - ข้อ 46 - 50: รูปทรงเรขาคณิต 3 มิติ
 * - ข้อ 51 - 55: แบบหมุนภาพสามมิติ
 * - ข้อ 56 - 60: แบบประกอบภาพ
 * - ข้อ 61 - 65: อนุกรมภาพ
 * - ข้อ 66 - 70: ความสัมพันธ์ของภาพ
 * - ข้อ 71 - 75: เงื่อนไขสัญลักษณ์ / ตรรกศาสตร์
 * - ข้อ 76 - 80: เงื่อนไขสถานการณ์
 *
 * @param {string} userId - รหัสผู้ใช้
 * @param {Array} sourceQuestions - คลังข้อสอบทั้งหมด (จาก Supabase หรือชุดมาตรฐาน)
 * @returns {Object} { sessionId, questions (ไม่มีเฉลย), totalQuestions, durationSeconds, startedAt, expiresAt }
 */
export function createExamSession(userId, sourceQuestions = TGAT2_QUESTIONS) {
  const sessionId = generateSessionId();

  // สร้างชุดข้อสอบโดยจัดตามพิมพ์เขียว 16 หัวข้อย่อย
  const orderedQuestions = [];
  const assignedIds = new Set();

  TGAT2_BLUEPRINT.forEach(subtopic => {
    // กรองข้อสอบที่ตรงกับหัวข้อย่อยนี้
    const candidates = sourceQuestions.filter(
      q => !assignedIds.has(q.id) && getQuestionSubtopicId(q) === subtopic.id
    );

    // สุ่มลำดับเฉพาะภายในหัวข้อย่อยนี้
    const shuffledSubtopic = shuffleArray(candidates);

    // เลือกจำนวน 5 ข้อตามพิมพ์เขียว
    const picked = shuffledSubtopic.slice(0, subtopic.itemCount || 5);

    picked.forEach(q => {
      assignedIds.add(q.id);
      orderedQuestions.push({
        ...q,
        subtopicId: subtopic.id,
        subtopicName: subtopic.name
      });
    });
  });

  // Fallback: หากบางหัวข้อย่อยมีข้อสอบไม่ครบ ให้เติมจากข้อสอบที่เหลือในหมวดเดียวกัน
  if (orderedQuestions.length < 80 && sourceQuestions.length >= 80) {
    const remaining = sourceQuestions.filter(q => !assignedIds.has(q.id));
    orderedQuestions.push(...remaining.slice(0, 80 - orderedQuestions.length));
  }

  // สุ่มลำดับช้อยส์เฉพาะข้อสอบที่ไม่ได้อิงตัวเลือกตามรูปภาพหรือตาราง
  const questionsWithShuffledChoices = orderedQuestions.map(q => shuffleChoices(q));

  // เก็บข้อมูลเฉลยไว้ฝั่ง Server (ส่วนนี้ Frontend จะไม่ได้รับ)
  const answerKey = {};
  questionsWithShuffledChoices.forEach((q, index) => {
    answerKey[q.id] = {
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      subtopicId: q.subtopicId || getQuestionSubtopicId(q),
      subtopicName: q.subtopicName || SUBTOPIC_MAP[getQuestionSubtopicId(q)]?.name || q.topic,
      order: index
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
  const clientQuestions = questionsWithShuffledChoices.map((q, index) => {
    const subtopicId = q.subtopicId || getQuestionSubtopicId(q);
    const subtopicMeta = SUBTOPIC_MAP[subtopicId];

    return {
      id: q.id,
      skill: q.skill,
      skillLabel: q.skillLabel || SKILL_METADATA[q.skill]?.name,
      subtopicId,
      subtopicName: subtopicMeta?.name || q.topic,
      subtopicRange: subtopicMeta?.range || '',
      topic: q.topic,
      content: q.content,
      choices: q.choices,
      image: q.image || null,
      svgIllustration: q.svgIllustration || null,
      displayOrder: index + 1
    };
  });

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
 * ฟังก์ชัน: createPracticeQuestions
 * หน้าที่: สร้างชุดข้อสอบสำหรับโหมดฝึกหัด โดยจัดเรียงตามหัวข้อย่อยอย่างเป็นระบบ
 * @param {Array} sourceQuestions - คลังข้อสอบ
 * @param {Object} options - { skills: ['verbal'], subtopics: ['verbal_meaning', 'numerical_series'] }
 * @returns {Array} รายการข้อสอบที่เรียงตามหัวข้อย่อย พร้อมเฉลยสำหรับแสดงผลทันที
 */
export function createPracticeQuestions(sourceQuestions = TGAT2_QUESTIONS, options = {}) {
  const { skills = [], subtopics = [] } = options;

  let targetSubtopics = TGAT2_BLUEPRINT;

  if (subtopics && subtopics.length > 0) {
    const subtopicSet = new Set(subtopics.map(s => s.toLowerCase()));
    targetSubtopics = TGAT2_BLUEPRINT.filter(st => subtopicSet.has(st.id.toLowerCase()));
  } else if (skills && skills.length > 0) {
    const skillSet = new Set(skills.map(s => s.toLowerCase()));
    targetSubtopics = TGAT2_BLUEPRINT.filter(st => skillSet.has(st.skill.toLowerCase()));
  }

  const orderedQuestions = [];
  const assignedIds = new Set();

  targetSubtopics.forEach(subtopic => {
    const candidates = sourceQuestions.filter(
      q => !assignedIds.has(q.id) && getQuestionSubtopicId(q) === subtopic.id
    );

    // สุ่มลำดับเฉพาะภายในหัวข้อย่อย เพื่อให้ทำโจทย์ได้หลากหลายแต่ยังเป็นหมวดหมู่
    const shuffled = shuffleArray(candidates);

    shuffled.forEach(q => {
      assignedIds.add(q.id);
      orderedQuestions.push({
        ...q,
        subtopicId: subtopic.id,
        subtopicName: subtopic.name,
        subtopicRange: subtopic.range
      });
    });
  });

  // กำหนดลำดับแสดงผล displayOrder
  return orderedQuestions.map((q, index) => ({
    ...q,
    displayOrder: index + 1
  }));
}

/**
 * ฟังก์ชัน: submitExam
 * หน้าที่: รับคำตอบจาก Frontend แล้วตรวจคะแนนฝั่ง Server
 * วิเคราะห์ผลทั้ง 4 ทักษะหลัก และ 16 หัวข้อย่อย
 * @param {string} sessionId - รหัส session ของรอบสอบนี้
 * @param {Object} answers - คำตอบ { questionId: choiceId }
 * @param {number} timeSpentSeconds - เวลาที่ใช้ (วินาที)
 * @returns {Object} ผลคะแนนพร้อมเฉลยละเอียดและบทวิเคราะห์จุดแข็งจุดอ่อน
 */
export function submitExam(sessionId, answers, timeSpentSeconds) {
  let session = activeSessions.get(sessionId);

  // ตรวจสอบว่า session มีอยู่ในหน่วยความจำหรือไม่ หากไม่มีให้สร้างเฉลยสำรองจากคลังข้อสอบหลัก
  if (!session) {
    const fallbackAnswerKey = {};
    TGAT2_QUESTIONS.forEach((q, index) => {
      fallbackAnswerKey[q.id] = {
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        subtopicId: getQuestionSubtopicId(q),
        subtopicName: SUBTOPIC_MAP[getQuestionSubtopicId(q)]?.name || q.topic,
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

  session.isSubmitted = true;

  const answerKey = session.answerKey;
  let correctCount = 0;

  // นับคะแนนแยกตาม 4 ทักษะหลัก
  const skillCount = {
    verbal: { total: 0, answered: 0, correct: 0 },
    numerical: { total: 0, answered: 0, correct: 0 },
    spatial: { total: 0, answered: 0, correct: 0 },
    logical: { total: 0, answered: 0, correct: 0 }
  };

  // นับคะแนนแยกตาม 16 หัวข้อย่อย
  const subtopicCount = {};
  TGAT2_BLUEPRINT.forEach(sub => {
    subtopicCount[sub.id] = {
      id: sub.id,
      name: sub.name,
      skill: sub.skill,
      range: sub.range,
      total: 0,
      answered: 0,
      correct: 0
    };
  });

  const questionMap = session.questionMap || {};
  if (Object.keys(questionMap).length === 0) {
    TGAT2_QUESTIONS.forEach(q => { questionMap[q.id] = q; });
  }

  // วนตรวจทุกข้อ
  Object.keys(answerKey).forEach(qId => {
    const questionId = parseInt(qId, 10);
    const originalQ = questionMap[questionId];
    if (!originalQ) return;

    const skill = originalQ.skill;
    if (skillCount[skill]) {
      skillCount[skill].total += 1;
    }

    const subtopicId = answerKey[questionId]?.subtopicId || getQuestionSubtopicId(originalQ);
    if (subtopicCount[subtopicId]) {
      subtopicCount[subtopicId].total += 1;
    }

    const userAnswer = answers[questionId];
    if (userAnswer !== undefined && userAnswer !== null) {
      if (skillCount[skill]) skillCount[skill].answered += 1;
      if (subtopicCount[subtopicId]) subtopicCount[subtopicId].answered += 1;

      if (userAnswer === answerKey[questionId].correctAnswer) {
        correctCount += 1;
        if (skillCount[skill]) skillCount[skill].correct += 1;
        if (subtopicCount[subtopicId]) subtopicCount[subtopicId].correct += 1;
      }
    }
  });

  // คำนวณคะแนนรวม
  const totalQuestions = Object.keys(answerKey).length;
  const scorePerQuestion = totalQuestions === 80 ? SCORE_PER_QUESTION : parseFloat((100 / (totalQuestions || 1)).toFixed(2));
  const totalScore = parseFloat((correctCount * scorePerQuestion).toFixed(2));
  const accuracyPercent = totalQuestions > 0
    ? parseFloat(((correctCount / totalQuestions) * 100).toFixed(1))
    : 0;

  // ผลคะแนน 4 หมวดหลัก
  const skillBreakdown = {};
  for (const [skill, counts] of Object.entries(skillCount)) {
    skillBreakdown[skill] = {
      skill,
      title: SKILL_METADATA[skill]?.name || skill,
      color: SKILL_METADATA[skill]?.color || '#64748B',
      totalQuestions: counts.total,
      answeredCount: counts.answered,
      correctCount: counts.correct,
      score: parseFloat((counts.correct * scorePerQuestion).toFixed(2)),
      maxScore: parseFloat((counts.total * scorePerQuestion).toFixed(2)),
      accuracy: counts.total > 0 ? parseFloat(((counts.correct / counts.total) * 100).toFixed(1)) : 0
    };
  }

  // ผลคะแนน 16 หัวข้อย่อย
  const subtopicBreakdown = {};
  for (const [subId, data] of Object.entries(subtopicCount)) {
    if (data.total > 0) {
      subtopicBreakdown[subId] = {
        id: subId,
        name: data.name,
        skill: data.skill,
        range: data.range,
        totalQuestions: data.total,
        answeredCount: data.answered,
        correctCount: data.correct,
        score: parseFloat((data.correct * scorePerQuestion).toFixed(2)),
        maxScore: parseFloat((data.total * scorePerQuestion).toFixed(2)),
        accuracy: data.total > 0 ? parseFloat(((data.correct / data.total) * 100).toFixed(1)) : 0
      };
    }
  }

  // สร้างเฉลยละเอียดรายข้อ
  const questionOrder = session.questionOrder || Object.keys(answerKey).map(Number);
  const detailedAnswers = questionOrder.map(qId => {
    const originalQ = questionMap[qId];
    const serverAnswer = answerKey[qId];
    const userAnswer = answers[qId];
    const isCorrect = userAnswer === serverAnswer.correctAnswer;
    const subtopicId = serverAnswer.subtopicId || getQuestionSubtopicId(originalQ);
    const subtopicMeta = SUBTOPIC_MAP[subtopicId];

    return {
      questionId: qId,
      displayOrder: serverAnswer.order + 1,
      skill: originalQ.skill,
      skillLabel: originalQ.skillLabel || SKILL_METADATA[originalQ.skill]?.name,
      subtopicId,
      subtopicName: subtopicMeta?.name || originalQ.topic,
      subtopicRange: subtopicMeta?.range || '',
      topic: originalQ.topic,
      content: originalQ.content,
      choices: originalQ.choices,
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
    subtopicBreakdown,
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
  if (!user) {
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
