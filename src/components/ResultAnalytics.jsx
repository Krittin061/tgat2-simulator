'use client';

/**
 * คอมโพเนนต์: ResultAnalytics
 * หน้าที่: แสดงผลคะแนนและบทวิเคราะห์หลังสอบเสร็จ (ธีมทางการ)
 */

import { Clock, Target } from 'lucide-react';

export function ResultAnalytics({ result }) {
  const {
    totalScore,
    maxScore,
    accuracyPercent,
    timeSpentSeconds,
    skillBreakdown
  } = result;

  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;

  return (
    <div className="animate-fade-in-up">
      
      {/* Head Summary */}
      <div className="clean-card" style={{
        padding: '40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%)',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '8px' }}>
            คะแนนรวม TGAT2 (จำลอง)
          </h2>
          <div style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.1, color: '#34D399' }}>
            {totalScore} <span style={{ fontSize: '2rem', color: '#94A3B8' }}>/ {maxScore}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#CBD5E1' }}>
              <Target size={20} /> ความแม่นยำ {accuracyPercent}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#CBD5E1' }}>
              <Clock size={20} /> ใช้เวลา {minutes} นาที {seconds} วินาที
            </div>
          </div>
        </div>
      </div>


      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '20px' }}>
        วิเคราะห์จุดแข็ง-จุดอ่อนรายทักษะ
      </h3>

      {/* Skill Breakdown Grid */}
      <div className="subskills-grid-4">
        {Object.values(skillBreakdown).map((skill) => {
          const isWeakness = skill.accuracy < 50;
          
          return (
            <div key={skill.skill} className="clean-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '8px' }}>
                {skill.title}
              </div>
              
              <div style={{ fontSize: '2rem', fontWeight: 800, color: skill.color, marginBottom: '12px' }}>
                {skill.score} <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>/ {skill.maxScore}</span>
              </div>
              
              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'var(--color-bg-alt)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${skill.accuracy}%`, 
                  background: skill.color,
                  borderRadius: '4px'
                }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-secondary)', flexGrow: 1 }}>
                <span>ถูก {skill.correctCount}/{skill.totalQuestions} ข้อ</span>
                <span style={{ fontWeight: 700, color: isWeakness ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {skill.accuracy}%
                </span>
              </div>
              
              {isWeakness && (
                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--color-danger)', background: 'var(--color-danger-light)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
                  ต้องทบทวนด่วน
                </div>
              )}
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
