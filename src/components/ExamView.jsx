'use client';

/**
 * คอมโพเนนต์: ExamView
 * หน้าที่: ควบคุมการแสดงผลห้องสอบ (ทั้งโหมด Real Exam และ Practice Mode)
 * พร้อมระบบ Keyboard Shortcuts (1-5, N, P, F)
 */

import React, { useState, useCallback } from 'react';
import { ExamTimer } from '@/components/ExamTimer';
import { QuestionCard } from '@/components/QuestionCard';
import { Send, CheckCircle2, ArrowLeft } from 'lucide-react';

export function ExamView({
  examSession,
  examMode,
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  answers,
  setAnswers,
  flaggedQuestions,
  setFlaggedQuestions,
  isRevealed,
  setIsRevealed,
  timeRemaining,
  setTimeRemaining,
  isSubmitting,
  onSubmitExam,
  onExitPractice
}) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const currentQ = questions[currentQuestionIndex];

  // เลือกคำตอบ
  const handleSelectAnswer = useCallback((choiceId) => {
    if (!currentQ) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: choiceId }));
    if (examMode === 'practice') {
      setIsRevealed(true);
    }
  }, [currentQ, examMode, setAnswers, setIsRevealed]);

  // ล้างคำตอบ
  const handleClearAnswer = useCallback((qId) => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
    if (examMode === 'practice') {
      setIsRevealed(false);
    }
  }, [examMode, setAnswers, setIsRevealed]);

  // ปักหมุด / ถอนหมุด
  const handleToggleFlag = useCallback(() => {
    if (!currentQ) return;
    const qId = currentQ.id;
    setFlaggedQuestions(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  }, [currentQ, setFlaggedQuestions]);

  // ข้อถัดไป
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      if (examMode === 'practice') {
        const nextQId = questions[nextIdx].id;
        setIsRevealed(answers[nextQId] !== undefined);
      }
    }
  }, [currentQuestionIndex, questions, examMode, answers, setCurrentQuestionIndex, setIsRevealed]);

  // ข้อก่อนหน้า
  const handlePrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
      if (examMode === 'practice') {
        const prevQId = questions[prevIdx].id;
        setIsRevealed(answers[prevQId] !== undefined);
      }
    }
  }, [currentQuestionIndex, questions, examMode, answers, setCurrentQuestionIndex, setIsRevealed]);

  if (!currentQ) return null;

  return (
    <div className="app-container" style={{ padding: 'clamp(14px, 3.5vw, 24px) clamp(10px, 3vw, 16px)', maxWidth: '960px' }}>
      
      {/* Top Meta & Action Bar */}
      <div className="exam-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)', fontWeight: 800, color: 'var(--color-navy)' }}>
            {examMode === 'real_exam' ? 'โหมดสอบเสมือนจริง (TGAT2)' : 'โหมดฝึกหัด (Practice Mode)'}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--color-success)',
            background: 'var(--color-success-light)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600
          }}>
            <CheckCircle2 size={13} />
            <span>บันทึกอัตโนมัติ</span>
          </div>
        </div>
        
        {examMode === 'real_exam' ? (
          <div className="exam-top-actions">
            <div>
              <ExamTimer 
                key={examSession} 
                initialTime={timeRemaining || 5400} 
                onTick={setTimeRemaining} 
              />
            </div>
            <button 
              onClick={() => setShowSubmitModal(true)} 
              className="btn-primary exam-submit-btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังส่ง...' : <><Send size={16} /> ส่งข้อสอบ</>}
            </button>
          </div>
        ) : (
          <button 
            onClick={onExitPractice} 
            className="btn-outline exam-exit-practice-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
          >
            <ArrowLeft size={16} /> ออกจากการฝึก
          </button>
        )}
      </div>

      {/* Progress Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 18px',
        marginBottom: '16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        fontSize: '0.88rem',
        color: 'var(--color-text-secondary)',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>ความคืบหน้า:</span>
          <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>
            ตอบแล้ว {Object.keys(answers).length} / {questions.length} ข้อ
          </span>
        </div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)' }}>
          {questions.length > 0 ? `${Math.round((Object.keys(answers).length / questions.length) * 100)}% เสร็จสิ้น` : ''}
        </div>
      </div>

      {/* Main Question Card */}
      <QuestionCard 
        question={currentQ}
        userAnswer={answers[currentQ.id]}
        isFlagged={flaggedQuestions.includes(currentQ.id)}
        mode={examMode}
        isRevealed={isRevealed || answers[currentQ.id] !== undefined}
        onSelectAnswer={handleSelectAnswer}
        onClearAnswer={handleClearAnswer}
        onToggleFlag={handleToggleFlag}
        onRevealAnswer={() => setIsRevealed(true)}
        onNext={handleNext}
        onPrev={handlePrev}
        isFirst={currentQuestionIndex === 0}
        isLast={currentQuestionIndex === questions.length - 1}
        currentIndex={currentQuestionIndex}
        totalCount={questions.length}
      />

      {/* Jump Navigator Grid */}
      <div className="clean-card" style={{ padding: '20px', marginTop: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-navy)' }}>
            กระดาษคำตอบ (คลิกเพื่อกระโดดไปยังข้อที่ต้องการ)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--color-primary)' }}></span> ข้อปัจจุบัน
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)' }}></span> ตอบแล้ว
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-warning)' }}></span> ปักหมุด
            </span>
          </div>
        </div>

        <div className="answer-sheet-grid">
          {questions.map((q, idx) => {
            const isAns = answers[q.id] !== undefined;
            const isCur = idx === currentQuestionIndex;
            const isFlg = flaggedQuestions.includes(q.id);
            
            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentQuestionIndex(idx);
                  if (examMode === 'practice') {
                    setIsRevealed(answers[q.id] !== undefined);
                  }
                }}
                className="answer-sheet-item"
                style={{
                  background: isCur ? 'var(--color-primary)' : isAns ? 'var(--color-primary-light)' : 'var(--color-bg)',
                  color: isCur ? '#FFFFFF' : isAns ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  border: `1px solid ${isCur ? 'var(--color-primary)' : isAns ? 'var(--color-primary-border)' : 'var(--color-border)'}`,
                }}
              >
                {idx + 1}
                {isFlg && (
                  <div style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: '7px',
                    height: '7px',
                    background: 'var(--color-warning)',
                    borderRadius: '50%',
                    border: '1px solid var(--color-bg)'
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal: Submit Exam */}
      {showSubmitModal && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-card animate-scale-in" style={{ padding: '0', overflow: 'hidden', maxWidth: '420px', width: '100%' }}>
            
            <div style={{ padding: '28px 24px 20px', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{
                width: '48px', height: '48px',
                borderRadius: '50%',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <Send size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '6px' }}>
                ยืนยันการส่งข้อสอบ
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                คุณต้องการส่งข้อสอบและประมวลผลคะแนนเลยหรือไม่?
              </p>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--color-text)' }}>ทำไปแล้ว</span>
                <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                  {Object.keys(answers).length} ข้อ
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--color-text)' }}>ยังไม่ทำ</span>
                <span style={{ fontWeight: 700, color: 'var(--color-danger)' }}>
                  {questions.length - Object.keys(answers).length} ข้อ
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--color-text)' }}>ปักหมุดไว้</span>
                <span style={{ fontWeight: 700, color: 'var(--color-warning)' }}>
                  {flaggedQuestions.length} ข้อ
                </span>
              </div>
            </div>

            <div className="modal-btn-group">
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="btn-outline modal-btn-cancel"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                กลับไปทำต่อ
              </button>
              <button 
                onClick={() => {
                  setShowSubmitModal(false);
                  onSubmitExam();
                }}
                className="btn-primary modal-btn-confirm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'กำลังส่ง...' : 'ยืนยันส่งข้อสอบ'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
