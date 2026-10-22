'use client';

/**
 * คอมโพเนนต์: QuestionCard
 * หน้าที่: แสดงโจทย์ข้อสอบ ช้อยส์ตัวเลือก
 * ธีม: ทางการ
 * หมายเหตุ: ในโหมด real_exam จะไม่มีเฉลยแสดง
 */

import React from 'react';
import { Flag, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export function QuestionCard({
  question,
  userAnswer,
  isFlagged,
  onSelectAnswer,
  onClearAnswer,
  onToggleFlag,
  mode = 'real_exam',
  isRevealed, // ใช้ใน practice mode
  onRevealAnswer, // ใช้ใน practice mode
  onNext,
  onPrev,
  isFirst,
  isLast,
  currentIndex
}) {
  return (
    <div className="clean-card animate-fade-in" style={{ padding: '0', display: 'flex', flexDirection: 'column', width: '100%' }}>
      
      {/* Top Meta Bar */}
      <div style={{
        padding: '14px clamp(12px, 3vw, 24px)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--color-bg)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'var(--color-navy)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-sm)'
          }}>
            ข้อ {currentIndex + 1}
          </div>
          <div style={{
            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)'
          }}>
            {question.skillLabel} • {question.topic}
          </div>
        </div>
        
        <button
          onClick={onToggleFlag}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: isFlagged ? 'var(--color-warning-light)' : 'var(--color-bg)',
            border: `1px solid ${isFlagged ? 'var(--color-warning)' : 'var(--color-border)'}`,
            color: isFlagged ? 'var(--color-warning)' : 'var(--color-text-secondary)',
            fontWeight: 600,
            fontSize: 'clamp(0.78rem, 2vw, 0.85rem)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Flag size={15} fill={isFlagged ? "currentColor" : "none"} />
          <span>{isFlagged ? 'ปักหมุดแล้ว' : 'ปักหมุดข้อนี้'}</span>
        </button>
      </div>

      {/* Question Content */}
      <div style={{ padding: 'clamp(20px, 4vw, 32px) clamp(14px, 3.5vw, 24px)' }}>
        <div style={{ fontSize: 'clamp(1.05rem, 2.8vw, 1.25rem)', color: 'var(--color-text)', lineHeight: 1.7, marginBottom: '24px', whiteSpace: 'pre-line' }}>
          {question.content}
        </div>

        {question.image && (
          <div style={{ marginBottom: '28px', textAlign: 'center', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <img 
              src={question.image} 
              alt={`โจทย์ข้อ ${currentIndex + 1}`} 
              style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', margin: '0 auto', display: 'block', borderRadius: '6px' }} 
            />
          </div>
        )}

        {question.svgIllustration && (
          <div 
            style={{ marginBottom: '32px', textAlign: 'center' }}
            dangerouslySetInnerHTML={{ __html: question.svgIllustration }}
          />
        )}

        {/* Choices List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {question.choices.map((choice) => {
            const isSelected = userAnswer === choice.id;
            let choiceStatusClass = '';
            let icon = null;

            if (mode === 'practice' && (isRevealed || userAnswer !== undefined) && question.correctAnswer) {
              if (choice.id === question.correctAnswer) {
                choiceStatusClass = 'choice-correct';
                icon = <CheckCircle2 size={20} className="text-green-600" />;
              } else if (isSelected && choice.id !== question.correctAnswer) {
                choiceStatusClass = 'choice-incorrect';
                icon = <AlertCircle size={20} className="text-red-500" />;
              }
            }

            return (
              <label 
                key={choice.id}
                className={`choice-card-duo ${choiceStatusClass}`}
                style={{
                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                  background: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg)',
                  color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                  pointerEvents: (mode === 'practice' && (isRevealed || userAnswer !== undefined)) ? 'none' : 'auto',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: isSelected ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {choice.id}
                </div>
                
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={choice.id}
                  checked={isSelected}
                  onChange={() => onSelectAnswer(choice.id)}
                  style={{ display: 'none' }}
                />
                
                <span style={{ fontSize: '1.05rem', lineHeight: 1.6, flexGrow: 1 }}>
                  {choice.text}
                </span>

                {icon}
              </label>
            );
          })}
        </div>
      </div>

      {/* Practice Mode Explanation Box */}
      {mode === 'practice' && (
        <div style={{ padding: '0 24px', marginBottom: '24px' }}>
          {userAnswer === undefined && !isRevealed ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              background: 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border)'
            }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                💡 คลิกเลือกตัวเลือกเพื่อตรวจคำตอบและดูเฉลยทันที
              </span>
              <button
                onClick={onRevealAnswer}
                className="btn-outline"
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                ดูเฉลยทันที
              </button>
            </div>
          ) : (
            question.explanation && (
              <div className="animate-slide-down" style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                {/* ถ้าตอบถูก: ขึ้นแค่คำอธิบาย (ไม่ขึ้นข้อถูก) */}
                {userAnswer === question.correctAnswer ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#065F46',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    marginBottom: '16px'
                  }}>
                    <CheckCircle2 size={22} className="text-green-600" />
                    <span>ตอบถูกต้อง! 🎉</span>
                  </div>
                ) : (
                  /* ถ้าตอบผิด: ขึ้นข้อที่ถูกต้อง + คำอธิบาย */
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#DC2626',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      marginBottom: '6px'
                    }}>
                      <AlertCircle size={20} />
                      <span>{userAnswer !== undefined ? `คำตอบยังไม่ถูกต้อง (คุณเลือกตัวเลือกที่ ${userAnswer})` : 'เฉลยคำตอบ'}</span>
                    </div>
                    <div style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: 'var(--color-navy-deep)'
                    }}>
                      ✓ ข้อที่ถูกต้องคือ: ตัวเลือกที่ {question.correctAnswer}
                      {question.choices.find(c => c.id === question.correctAnswer)?.text && (
                        <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginLeft: '8px' }}>
                          ({question.choices.find(c => c.id === question.correctAnswer)?.text})
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* คำอธิบายวิธีคิด */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '8px' }}>
                    คำอธิบายวิธีคิด:
                  </h4>
                  <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '14px', lineHeight: 1.6 }}>
                    {question.explanation.summary}
                  </p>
                  
                  {question.explanation.steps && question.explanation.steps.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <ol style={{ paddingLeft: '20px', margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                        {question.explanation.steps.map((step, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {question.explanation.tip && (
                    <div style={{
                      background: 'var(--color-warning-light)',
                      border: '1px solid var(--color-warning-border)',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>💡</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-warning)', lineHeight: 1.5 }}>
                        <strong>เทคนิค TGAT:</strong> {question.explanation.tip}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="exam-nav-footer">
        {!isFirst ? (
          <button
            onClick={onPrev}
            className="btn-outline exam-nav-btn-prev"
          >
            <ChevronLeft size={18} /> ย้อนกลับ
          </button>
        ) : (
          <div className="exam-nav-btn-prev" style={{ opacity: 0, pointerEvents: 'none' }} />
        )}

        {userAnswer !== undefined && (
          <button
            onClick={() => onClearAnswer(question.id)}
            className="exam-nav-btn-clear"
          >
            <RotateCcw size={14} /> ล้างคำตอบ
          </button>
        )}

        <button
          onClick={onNext}
          disabled={isLast}
          className={`btn-primary exam-nav-btn-next ${isFirst ? 'solo-next' : ''}`}
          style={{ opacity: isLast ? 0.5 : 1 }}
        >
          <span>{isLast ? 'ข้อสุดท้าย' : 'ข้อถัดไป'}</span>
          <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
}
