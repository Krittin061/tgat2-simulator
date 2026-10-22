'use client';

/**
 * คอมโพเนนต์: DashboardView
 * หน้าที่: หน้าแรกหลังผู้ใช้ Login (Dashboard)
 * ธีม: ทางการ (Professional White/Navy)
 */

import React, { useState } from 'react';
import { 
  PlayCircle, FileText, History, Trophy, Clock, ArrowRight, 
  ShieldCheck, CheckSquare, Square, 
  CheckCircle2, Target, Filter 
} from 'lucide-react';

export function DashboardView({ user, history = [], onStartExam, onViewResult }) {
  const [activeTab, setActiveTab] = useState('exam'); // 'exam' | 'history'
  const [showStartModal, setShowStartModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);

  // รายการหัวข้อที่เลือกสำหรับโหมดฝึกหัด (ค่าเริ่มต้นเลือกครบ 4 หัวข้อ)
  const [selectedSkills, setSelectedSkills] = useState(['verbal', 'numerical', 'spatial', 'logical']);

  // ข้อมูลหัวข้อย่อย TGAT2 ทั้ง 4 ด้าน
  const skillOptions = [
    { id: 'verbal', no: 1, name: 'ความสามารถทางภาษา', count: 20, desc: 'การสรุปความ ตีความ บริบทคำ และการใช้เหตุผลเชิงภาษา', color: '#3B82F6' },
    { id: 'numerical', no: 2, name: 'ความสามารถทางตัวเลข', count: 20, desc: 'อนุกรมตัวเลขและมิติ โอเปอเรชัน ตรรกะคณิตศาสตร์', color: '#10B981' },
    { id: 'spatial', no: 3, name: 'ความสามารถทางมิติสัมพันธ์', count: 20, desc: 'ภาพพับและคลี่ลูกบาศก์ อนุกรมภาพ 2D/3D การหมุนภาพ', color: '#8B5CF6' },
    { id: 'logical', no: 4, name: 'ความสามารถทางเหตุผล', count: 20, desc: 'ตรรกศาสตร์เงื่อนไข อุปมาอุปไมย และการสรุปความสอดคล้อง', color: '#F59E0B' }
  ];

  const toggleSkill = (skillId) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(s => s !== skillId) 
        : [...prev, skillId]
    );
  };

  const selectAllSkills = () => {
    setSelectedSkills(['verbal', 'numerical', 'spatial', 'logical']);
  };

  const clearAllSkills = () => {
    setSelectedSkills([]);
  };

  const latestAttempt = history.length > 0 ? history[0] : null;

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0 60px' }}>
      
      {/* Header Profile & Latest Score */}
      {/* Header Profile & Latest Score */}
      <div className="clean-card" style={{
        padding: 'clamp(20px, 4vw, 32px)',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%)',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ flex: '1 1 280px' }}>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 1.8rem)', fontWeight: 800, marginBottom: '8px', color: '#FFFFFF' }}>
            สวัสดี, {user?.name || 'ผู้ใช้งาน'}
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 'clamp(0.85rem, 2vw, 1rem)', margin: 0 }}>
            เตรียมพร้อมสำหรับการสอบ TGAT2 ของคุณ ทดสอบทักษะการคิดอย่างมีเหตุผลผ่านข้อสอบจำลองเสมือนจริง
          </p>
        </div>

        {latestAttempt && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '14px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            flex: '1 1 auto'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '2px' }}>คะแนนสอบล่าสุด</div>
              <div style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800, color: '#34D399' }}>
                {latestAttempt.totalScore} <span style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 500 }}>/ 100</span>
              </div>
            </div>
            <button 
              onClick={() => onViewResult(latestAttempt)}
              style={{
                background: '#FFFFFF',
                color: '#0A192F',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ดูรายละเอียด <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '2%',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '24px',
        width: '100%'
      }}>
        {[
          { id: 'exam', icon: <PlayCircle size={18} />, label: 'สอบจำลองเสมือนจริง' },
          { id: 'history', icon: <History size={18} />, label: 'ประวัติผลสอบ' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: '1 1 48%',
              padding: '12px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
              transition: 'all 0.15s ease',
              textAlign: 'center'
            }}
          >
            {tab.icon} <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        
        {/* EXAM TAB */}
        {activeTab === 'exam' && (
          <div className="mode-grid">
            <div className="clean-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '56px', height: '56px',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Target size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '12px' }}>
                จำลองสอบเสมือนจริง (Real Exam)
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px', flexGrow: 1 }}>
                สุ่มข้อสอบ 80 ข้อ ตามเกณฑ์เวลามาตรฐาน 90 นาที ระบบจะบันทึกคะแนนและวิเคราะห์จุดอ่อนอัตโนมัติ (เฉลยละเอียดจะแสดงหลังจากส่งข้อสอบ)
              </p>
              <button 
                onClick={() => { setPendingMode('real_exam'); setShowStartModal(true); }} 
                className="btn-primary"
                style={{ width: '100%', height: '50px' }}
              >
                เริ่มทำข้อสอบจำลอง <ArrowRight size={18} />
              </button>
            </div>

            <div className="clean-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '56px', height: '56px',
                background: 'var(--color-success-light)',
                color: 'var(--color-success)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <FileText size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '12px' }}>
                โหมดฝึกหัด (Practice Mode)
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px', flexGrow: 1 }}>
                เลือกหัวข้อที่ต้องการฝึกฝนได้ตามใจชอบ พร้อมระบบตรวจเฉลยทันที (หากตอบผิดจะแสดงข้อถูกพร้อมคำอธิบาย หากตอบถูกจะแสดงเฉพาะคำอธิบาย)
              </p>
              <button 
                onClick={() => setShowPracticeModal(true)} 
                className="btn-outline"
                style={{ width: '100%', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Filter size={18} /> เลือกหัวข้อและเริ่มฝึกทำโจทย์
              </button>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                ประวัติการทำข้อสอบ ({history.length} ครั้ง)
              </h3>
            </div>

            {history.length === 0 ? (
              <div className="clean-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
                <Clock size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>ยังไม่มีประวัติการสอบ</div>
                <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>ลองเริ่มทำข้อสอบจำลองเพื่อดูพัฒนาการของคุณ</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {history.map((record, index) => (
                  <div 
                    key={record.sessionId || index} 
                    className="clean-card" 
                    style={{ 
                      padding: '20px 24px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '44px', height: '44px',
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '1.1rem'
                      }}>
                        #{history.length - index}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1.05rem', marginBottom: '4px' }}>
                          การสอบแบบ: {record.mode === 'real_exam' ? 'สอบเสมือนจริง (90 นาที)' : 'ฝึกหัด (Practice)'}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} /> {Math.floor(record.timeSpentSeconds / 60)} นาที
                          </span>
                          <span>{new Date(record.submittedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                          {(record.totalScore !== undefined ? record.totalScore : (record.score || 0))} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>/ 100</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          ตอบถูก {record.correctCount} จาก {record.totalQuestions} ข้อ
                        </div>
                      </div>

                      <button 
                        onClick={() => onViewResult(record)}
                        className="btn-outline"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        ดูรายงาน
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Practice Mode Setup Modal (เลือกหัวข้อที่จะฝึก) */}
      {showPracticeModal && (
        <div className="modal-overlay">
          <div className="modal-card animate-scale-in" style={{ padding: '0', overflow: 'hidden', maxWidth: '520px' }}>
            {/* Header */}
            <div style={{ 
              padding: '20px 24px 16px', 
              background: 'linear-gradient(135deg, #0B192E 0%, #172E54 100%)', 
              color: '#FFFFFF',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.15)'
                }}>
                  <Filter size={20} color="#38BDF8" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  เลือกหัวข้อสำหรับโหมดฝึกหัด
                </h3>
              </div>
              <p style={{ color: '#93C5FD', fontSize: '0.85rem', margin: 0 }}>
                เลือกหัวข้อที่ต้องการฝึกฝน (สามารถเลือก 1 หรือหลายหัวข้อร่วมกันได้)
              </p>
            </div>

            {/* Quick Actions */}
            <div style={{ 
              padding: '12px 24px', 
              background: 'var(--color-bg-alt)', 
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                เลือกแล้ว: <strong style={{ color: 'var(--color-primary)' }}>{selectedSkills.length}</strong> จาก 4 หัวข้อ 
                ({selectedSkills.length * 20} ข้อ)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={selectAllSkills}
                  style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700, padding: '4px 8px' }}
                >
                  เลือกทั้งหมด
                </button>
                <button 
                  onClick={clearAllSkills}
                  style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, padding: '4px 8px' }}
                >
                  ล้างการเลือก
                </button>
              </div>
            </div>

            {/* Skill Checklist */}
            <div style={{ 
              padding: '18px 24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '10px',
              overflowY: 'auto',
              flex: '1 1 auto',
              maxHeight: '45vh'
            }}>
              {skillOptions.map(skill => {
                const isSelected = selectedSkills.includes(skill.id);
                return (
                  <div
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? skill.color : 'var(--color-border)'}`,
                      background: isSelected ? `${skill.color}15` : 'var(--color-bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ color: isSelected ? skill.color : '#CBD5E1', marginTop: '2px' }}>
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-navy)' }}>
                          หัวข้อ {skill.no}: {skill.name}
                        </span>
                        <span style={{ 
                          fontSize: '0.78rem', 
                          fontWeight: 700, 
                          color: skill.color,
                          background: `${skill.color}18`,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)'
                        }}>
                          {skill.count} ข้อ
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                        {skill.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="modal-btn-group">
              <button 
                onClick={() => setShowPracticeModal(false)}
                className="btn-outline modal-btn-cancel"
              >
                ยกเลิก
              </button>
              <button 
                onClick={() => {
                  if (selectedSkills.length === 0) return;
                  setShowPracticeModal(false);
                  onStartExam('practice', { skills: selectedSkills });
                }}
                disabled={selectedSkills.length === 0}
                className="btn-primary modal-btn-confirm"
                style={{ 
                  opacity: selectedSkills.length === 0 ? 0.5 : 1,
                  cursor: selectedSkills.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                เริ่มฝึกทำโจทย์ ({selectedSkills.length * 20} ข้อ) <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgraded Start Exam Confirmation Modal (ระบบเตือนก่อนเข้าห้องสอบทางการ) */}
      {showStartModal && (
        <div className="modal-overlay">
          <div className="modal-card animate-scale-in" style={{ padding: '0', overflow: 'hidden', maxWidth: '520px' }}>
            
            {/* Header: Official Academic & Compact Style */}
            <div style={{ 
              padding: '20px 24px 18px', 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, #0B192E 0%, #172E54 100%)',
              color: '#FFFFFF',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              flexShrink: 0
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                marginBottom: '10px'
              }}>
                <ShieldCheck size={14} />
                TCAS • TGAT2 OFFICIAL SIMULATION
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 4px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                ระเบียบและข้อแนะนำก่อนเข้าห้องสอบ
              </h3>
              <p style={{ color: '#93C5FD', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>
                วิชา TGAT2 การคิดอย่างมีเหตุผล (รหัสวิชา 92)
              </p>
            </div>

            {/* Quick Stats Chips */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              padding: '12px 20px',
              background: 'var(--color-bg-alt)',
              borderBottom: '1px solid var(--color-border)',
              flexShrink: 0
            }}>
              <div style={{ textAlign: 'center', padding: '8px 6px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>จำนวนข้อสอบ</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)' }}>80 ข้อ</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px 6px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>เกณฑ์เวลา</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>90 นาที</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px 6px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>คะแนนเต็ม</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-success)' }}>100 คะแนน</div>
              </div>
            </div>

            {/* Guidelines Body - scrollable if needed */}
            <div style={{ 
              padding: '16px 20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '10px',
              overflowY: 'auto',
              flex: '1 1 auto',
              maxHeight: '42vh'
            }}>
              
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                padding: '10px 14px', 
                background: 'var(--color-bg-alt)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                alignItems: 'flex-start'
              }}>
                <div style={{ 
                  color: 'var(--color-primary)', 
                  background: 'var(--color-primary-light)', 
                  padding: '6px', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Clock size={18} />
                </div>
                <div style={{ fontSize: '0.86rem', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--color-text)', display: 'block', marginBottom: '2px' }}>
                    การนับเวลาถอยหลัง 90 นาที:
                  </strong>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    ระบบจะเริ่มนับเวลาถอยหลังเพื่อจำลองบรรยากาศห้องสอบจริง โดยไม่ตัดจบอัตโนมัติ เพื่อให้ท่านทำและตรวจทานข้อสอบได้อย่างสมบูรณ์
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                padding: '10px 14px', 
                background: 'var(--color-bg-alt)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                alignItems: 'flex-start'
              }}>
                <div style={{ 
                  color: 'var(--color-success)', 
                  background: 'var(--color-success-light)', 
                  padding: '6px', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <CheckCircle2 size={18} />
                </div>
                <div style={{ fontSize: '0.86rem', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--color-text)', display: 'block', marginBottom: '2px' }}>
                    บันทึกคำตอบอัตโนมัติ (Autosave):
                  </strong>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    คำตอบจะถูกบันทึกทันที สามารถเปลี่ยนตัวเลือก หรือปักหมุดข้อที่ต้องการเพื่อย้อนกลับมาทบทวนได้ตลอดเวลา
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                padding: '10px 14px', 
                background: 'var(--color-bg-alt)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                alignItems: 'flex-start'
              }}>
                <div style={{ 
                  color: 'var(--color-purple)', 
                  background: 'rgba(192, 132, 252, 0.12)', 
                  padding: '6px', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Trophy size={18} />
                </div>
                <div style={{ fontSize: '0.86rem', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--color-text)', display: 'block', marginBottom: '2px' }}>
                    การส่งข้อสอบและเฉลยละเอียด:
                  </strong>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    เมื่อทำข้อสอบเสร็จสิ้น ให้กด &ldquo;ส่งข้อสอบ&rdquo; เพื่อประเมินผลคะแนน พร้อมเฉลยละเอียดและบทวิเคราะห์จุดแข็ง-จุดอ่อนทันที
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Buttons - Always pinned and clearly visible */}
            <div className="modal-btn-group">
              <button 
                onClick={() => setShowStartModal(false)}
                className="btn-outline modal-btn-cancel"
              >
                ยกเลิก / ย้อนกลับ
              </button>
              <button 
                onClick={() => {
                  setShowStartModal(false);
                  onStartExam(pendingMode);
                }}
                className="btn-primary modal-btn-confirm"
                style={{ gap: '8px' }}
              >
                พร้อมแล้ว เข้าสู่ห้องสอบ <ArrowRight size={18} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
