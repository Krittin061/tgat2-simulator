'use client';

/**
 * คอมโพเนนต์: ResultView
 * หน้าที่: แสดงผลคะแนนการสอบ บทวิเคราะห์เชิงลึก 4 ด้าน และเฉลยข้อสอบครบทุกข้อ
 */

import React from 'react';
import { ResultAnalytics } from '@/components/ResultAnalytics';
import { AnswerKeyReview } from '@/components/AnswerKeyReview';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export function ResultView({ examResult, onBackToDashboard, onNewExam }) {
  if (!examResult) return null;

  return (
    <div className="app-container animate-fade-in" style={{ padding: '24px 16px', maxWidth: '1000px' }}>
      
      {/* Top Action Bar with Prominent Back Button */}
      <div className="result-top-bar">
        <button 
          onClick={onBackToDashboard}
          className="btn-outline result-back-btn"
          style={{
            background: 'var(--color-bg)',
            color: 'var(--color-navy-deep)',
            border: '1.5px solid var(--color-border)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={18} /> ย้อนกลับหน้าหลัก (Dashboard)
        </button>

        <button
          onClick={onNewExam || onBackToDashboard}
          className="btn-primary result-new-exam-btn"
        >
          <RotateCcw size={16} /> ทำข้อสอบชุดใหม่
        </button>
      </div>

      {/* Result Summary & Skill Breakdown Analytics */}
      <ResultAnalytics result={examResult} />

      {/* Answer Key Review with Explanations */}
      <div style={{ marginTop: '40px' }}>
        <AnswerKeyReview 
          detailedAnswers={examResult.detailedAnswers} 
          skillBreakdown={examResult.skillBreakdown}
        />
      </div>

      {/* Bottom Action Card */}
      <div style={{
        marginTop: '40px',
        padding: '24px 28px',
        background: 'var(--color-bg)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-navy-deep)', marginBottom: '4px' }}>
            ตรวจสอบผลสอบและเฉลยครบถ้วนแล้ว?
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            ระบบได้บันทึกคะแนนและบทวิเคราะห์ของคุณไว้ในประวัติการสอบเรียบร้อยแล้ว
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button 
            onClick={onBackToDashboard}
            className="btn-primary"
            style={{
              padding: '12px 24px',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: 'var(--radius-md)',
              width: '100%'
            }}
          >
            <ArrowLeft size={18} /> ย้อนกลับหน้าหลัก (Dashboard)
          </button>
        </div>
      </div>

    </div>
  );
}
