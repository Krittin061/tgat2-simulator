'use client';

/**
 * คอมโพเนนต์: ResultAnalytics
 * หน้าที่: แสดงผลคะแนนและบทวิเคราะห์หลังสอบเสร็จ (ธีมทางการ)
 * วิเคราะห์ทั้ง 4 หมวดหลัก และ 16 หัวข้อย่อยตามพิมพ์เขียว TGAT2
 */

import { Clock, Target, Layers } from 'lucide-react';

export function ResultAnalytics({ result }) {
  const {
    totalScore,
    maxScore,
    accuracyPercent,
    timeSpentSeconds,
    skillBreakdown,
    subtopicBreakdown
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
        วิเคราะห์จุดแข็ง-จุดอ่อนรายทักษะ (4 หมวดหลัก)
      </h3>

      {/* Skill Breakdown Grid */}
      <div className="subskills-grid-4">
        {skillBreakdown && Object.values(skillBreakdown).map((skill) => {
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

      {/* Subtopic Breakdown Section */}
      {subtopicBreakdown && Object.keys(subtopicBreakdown).length > 0 && (
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="var(--color-primary)" /> วิเคราะห์เจาะลึก 16 หัวข้อย่อย (พิมพ์เขียว TGAT2)
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              เกณฑ์: ผ่าน 60% ขึ้นไป (3 ข้อขึ้นไปต่อหัวข้อย่อย)
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '12px'
          }}>
            {Object.values(subtopicBreakdown).map(sub => {
              const isPassed = sub.accuracy >= 60;
              const isBorderline = sub.accuracy >= 40 && sub.accuracy < 60;
              const statusColor = isPassed ? 'var(--color-success)' : isBorderline ? 'var(--color-warning)' : 'var(--color-danger)';
              const statusBg = isPassed ? 'var(--color-success-light)' : isBorderline ? 'var(--color-warning-light)' : 'var(--color-danger-light)';

              return (
                <div 
                  key={sub.id} 
                  className="clean-card" 
                  style={{ 
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                        {sub.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {sub.range} ({sub.totalQuestions} ข้อ)
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: statusColor,
                      background: statusBg,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {sub.accuracy}%
                    </span>
                  </div>

                  {/* Progress */}
                  <div style={{ width: '100%', height: '6px', background: 'var(--color-bg-alt)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${sub.accuracy}%`,
                      background: statusColor,
                      borderRadius: '3px'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    <span>ตอบถูก {sub.correctCount}/{sub.totalQuestions} ข้อ</span>
                    <span style={{ fontWeight: 600 }}>{sub.score} / {sub.maxScore} คะแนน</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
    </div>
  );
}
