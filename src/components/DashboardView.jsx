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
  CheckCircle2, Target, Filter, ChevronDown, ChevronRight
} from 'lucide-react';
import { TGAT2_BLUEPRINT } from '@/types/exam';

export function DashboardView({ user, history = [], onStartExam, onViewResult }) {
  const [activeTab, setActiveTab] = useState('exam'); // 'exam' | 'history'
  const [showStartModal, setShowStartModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);

  // รายการหัวข้อย่อยที่เลือกสำหรับโหมดฝึกหัด (ค่าเริ่มต้นเลือกครบทั้ง 16 หัวข้อ = 80 ข้อ)
  const [selectedSubtopics, setSelectedSubtopics] = useState(
    TGAT2_BLUEPRINT.map(st => st.id)
  );

  // ควบคุมการย่อ/ขยายของแต่ละหมวดเพื่อดูหัวข้อย่อย
  const [expandedSkills, setExpandedSkills] = useState({
    verbal: false,
    numerical: false,
    spatial: false,
    logical: false
  });

  // ข้อมูลหมวดวิชาหลัก TGAT2 ทั้ง 4 ด้าน
  const skillOptions = [
    { 
      id: 'verbal', 
      no: 1, 
      name: 'ความสามารถทางภาษา', 
      range: 'ข้อ 1 - 20',
      desc: 'การสื่อความหมาย (1-5), การใช้ภาษา (6-10), การอ่าน (11-15), การเข้าใจสาร (16-20)', 
      color: '#3B82F6' 
    },
    { 
      id: 'numerical', 
      no: 2, 
      name: 'ความสามารถทางตัวเลข', 
      range: 'ข้อ 21 - 40',
      desc: 'อนุกรมมิติ (21-25), สดมภ์ (26-30), ความเพียงพอของข้อมูล (31-35), โจทย์ปัญหา (36-40)', 
      color: '#10B981' 
    },
    { 
      id: 'spatial', 
      no: 3, 
      name: 'ความสามารถทางมิติสัมพันธ์', 
      range: 'ข้อ 41 - 60',
      desc: 'พับกล่อง (41-45), รูปทรงเรขาคณิต (46-50), หมุนภาพ 3D (51-55), ประกอบภาพ (56-60)', 
      color: '#8B5CF6' 
    },
    { 
      id: 'logical', 
      no: 4, 
      name: 'ความสามารถทางเหตุผล', 
      range: 'ข้อ 61 - 80',
      desc: 'อนุกรมภาพ (61-65), ความสัมพันธ์ของภาพ (66-70), เงื่อนไขสัญลักษณ์ (71-75), เงื่อนไขสถานการณ์ (76-80)', 
      color: '#F59E0B' 
    }
  ];

  const toggleSkillExpand = (skillId, e) => {
    e.stopPropagation();
    setExpandedSkills(prev => ({
      ...prev,
      [skillId]: !prev[skillId]
    }));
  };

  const toggleSkillSelection = (skillId) => {
    const subtopicsOfSkill = TGAT2_BLUEPRINT.filter(st => st.skill === skillId).map(st => st.id);
    const allSelected = subtopicsOfSkill.every(id => selectedSubtopics.includes(id));

    if (allSelected) {
      // เอาออกทั้งหมดของหมวดนี้
      setSelectedSubtopics(prev => prev.filter(id => !subtopicsOfSkill.includes(id)));
    } else {
      // เลือกทั้งหมดของหมวดนี้
      setSelectedSubtopics(prev => Array.from(new Set([...prev, ...subtopicsOfSkill])));
    }
  };

  const toggleSubtopic = (subtopicId, e) => {
    e.stopPropagation();
    setSelectedSubtopics(prev => 
      prev.includes(subtopicId)
        ? prev.filter(id => id !== subtopicId)
        : [...prev, subtopicId]
    );
  };

  const selectAll = () => {
    setSelectedSubtopics(TGAT2_BLUEPRINT.map(st => st.id));
  };

  const clearAll = () => {
    setSelectedSubtopics([]);
  };

  const latestAttempt = history.length > 0 ? history[0] : null;

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      
      {/* Welcome & Stats Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0A192F 0%, #172E54 100%)',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(20px, 4vw, 36px)',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38BDF8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <ShieldCheck size={16} /> ระบบจำลองสอบเสมือนจริง TGAT2 มาตรฐาน ทปอ.
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            สวัสดี, {user?.name || 'ผู้เข้าสอบ'}
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: 'clamp(0.88rem, 2vw, 1rem)', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
            เตรียมความพร้อมสู่สนามสอบ TCAS ด้วยชุดข้อสอบ 80 ข้อ จัดเรียงตามพิมพ์เขียวทางการ 16 หัวข้อย่อย สุ่มเสมือนข้อสอบจริง
          </p>
        </div>

        {latestAttempt && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
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
                สุ่มข้อสอบ 80 ข้อตามเกณฑ์เวลา 90 นาที <strong>จัดเรียงตรงตามพิมพ์เขียว 16 หัวข้อย่อย (เช่น ข้อ 1-5 สื่อความหมาย, 6-10 การใช้ภาษา ฯลฯ)</strong> พร้อมระบบบันทึกและตรวจเฉลยอัตโนมัติ
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
                เลือกฝึกฝนเจาะจงเฉพาะหมวดวิชาหรือหัวข้อย่อยได้ตามต้องการ (เรียงตามลำดับพิมพ์เขียว) พร้อมระบบตรวจคำตอบและแสดงเฉลยละเอียดทันทีรายข้อ
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
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-navy)', marginBottom: '4px' }}>
                          คะแนน {record.totalScore} / 100 ({record.accuracyPercent}%)
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <span>วันที่: {new Date(record.submittedAt).toLocaleDateString('th-TH')}</span>
                          <span>เวลาที่ใช้: {Math.floor(record.timeSpentSeconds / 60)} นาที</span>
                          <span>โหมด: {record.mode === 'real_exam' ? 'จำลองสอบเสมือนจริง' : 'ฝึกหัด'}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => onViewResult(record)}
                      className="btn-outline"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      ดูผลคะแนนละเอียด <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* PRACTICE MODE MODAL - เลือกระดับหมวดวิชาหรือหัวข้อย่อย */}
      {showPracticeModal && (
        <div className="modal-overlay">
          <div className="modal-card animate-scale-in" style={{ padding: '0', overflow: 'hidden', maxWidth: '580px', width: '92%' }}>
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
                เลือกฝึกทั้งหมวดวิชา หรือคลิกเพื่อเลือกเฉพาะหัวข้อย่อย (ข้อสอบเรียงลำดับตามพิมพ์เขียว)
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
              flexShrink: 0,
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                เลือกแล้ว: <strong style={{ color: 'var(--color-primary)' }}>{selectedSubtopics.length}</strong> จาก 16 หัวข้อย่อย 
                ({selectedSubtopics.length * 5} ข้อ)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={selectAll}
                  style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700, padding: '4px 8px' }}
                >
                  เลือกทั้งหมด
                </button>
                <button 
                  onClick={clearAll}
                  style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, padding: '4px 8px' }}
                >
                  ล้างการเลือก
                </button>
              </div>
            </div>

            {/* Subtopic Checklist with Expandable Categories */}
            <div style={{ 
              padding: '18px 24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              overflowY: 'auto',
              flex: '1 1 auto',
              maxHeight: '52vh'
            }}>
              {skillOptions.map(skill => {
                const subtopicsOfSkill = TGAT2_BLUEPRINT.filter(st => st.skill === skill.id);
                const selectedInSkill = subtopicsOfSkill.filter(st => selectedSubtopics.includes(st.id));
                const isAllSelected = selectedInSkill.length === subtopicsOfSkill.length;
                const isPartiallySelected = selectedInSkill.length > 0 && !isAllSelected;
                const isExpanded = expandedSkills[skill.id];

                return (
                  <div
                    key={skill.id}
                    style={{
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isAllSelected || isPartiallySelected ? skill.color : 'var(--color-border)'}`,
                      background: isAllSelected ? `${skill.color}0D` : 'var(--color-bg)',
                      overflow: 'hidden',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Skill Header */}
                    <div
                      onClick={() => toggleSkillSelection(skill.id)}
                      style={{
                        padding: '12px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexGrow: 1 }}>
                        <div style={{ color: isAllSelected ? skill.color : isPartiallySelected ? skill.color : '#CBD5E1' }}>
                          {isAllSelected ? (
                            <CheckSquare size={20} />
                          ) : isPartiallySelected ? (
                            <div style={{
                              width: '20px', height: '20px',
                              border: `2px solid ${skill.color}`,
                              borderRadius: '4px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: `${skill.color}20`
                            }}>
                              <div style={{ width: '8px', height: '8px', background: skill.color, borderRadius: '2px' }} />
                            </div>
                          ) : (
                            <Square size={20} />
                          )}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-navy)' }}>
                              หมวด {skill.no}: {skill.name}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              ({skill.range})
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                            เลือกแล้ว {selectedInSkill.length}/4 หัวข้อย่อย ({selectedInSkill.length * 5} ข้อ)
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => toggleSkillExpand(skill.id, e)}
                        style={{
                          background: 'var(--color-bg-alt)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--color-text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        {isExpanded ? 'ย่อ' : 'ดูหัวข้อย่อย'}
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </div>

                    {/* Subtopics List when expanded */}
                    {isExpanded && (
                      <div style={{
                        padding: '10px 14px 14px',
                        borderTop: '1px solid var(--color-border)',
                        background: 'var(--color-bg-alt)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        {subtopicsOfSkill.map(sub => {
                          const isSubSelected = selectedSubtopics.includes(sub.id);
                          return (
                            <div
                              key={sub.id}
                              onClick={(e) => toggleSubtopic(sub.id, e)}
                              style={{
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-sm)',
                                background: isSubSelected ? '#FFFFFF' : 'var(--color-bg)',
                                border: `1px solid ${isSubSelected ? skill.color : 'var(--color-border)'}`,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '10px',
                                transition: 'all 0.12s ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ color: isSubSelected ? skill.color : '#94A3B8' }}>
                                  {isSubSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                </div>
                                <div>
                                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-navy)' }}>
                                    {sub.name}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                                    ({sub.range})
                                  </span>
                                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                                    {sub.description}
                                  </div>
                                </div>
                              </div>

                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: isSubSelected ? skill.color : 'var(--color-text-muted)',
                                background: isSubSelected ? `${skill.color}15` : 'transparent',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                5 ข้อ
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                  if (selectedSubtopics.length === 0) return;
                  setShowPracticeModal(false);
                  onStartExam('practice', { subtopics: selectedSubtopics });
                }}
                disabled={selectedSubtopics.length === 0}
                className="btn-primary modal-btn-confirm"
                style={{ 
                  opacity: selectedSubtopics.length === 0 ? 0.5 : 1,
                  cursor: selectedSubtopics.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                เริ่มฝึกทำโจทย์ ({selectedSubtopics.length * 5} ข้อ) <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* START EXAM GUIDELINES MODAL */}
      {showStartModal && (
        <div className="modal-overlay">
          <div className="modal-card animate-scale-in" style={{ padding: '0', overflow: 'hidden', maxWidth: '540px' }}>
            
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0A192F 0%, #172E54 100%)',
              color: '#FFFFFF',
              padding: '20px 24px',
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

            {/* Guidelines Body */}
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
                  <Target size={18} />
                </div>
                <div style={{ fontSize: '0.86rem', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--color-text)', display: 'block', marginBottom: '2px' }}>
                    โครงสร้างข้อสอบพิมพ์เขียวเสมือนจริง:
                  </strong>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    ข้อสอบ 80 ข้อ จัดเรียงตาม 16 หัวข้อย่อยตามลำดับทางการ ทปอ. (ข้อ 1-5 สื่อความหมาย, 6-10 การใช้ภาษา ฯลฯ)
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

            {/* Footer Buttons */}
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
