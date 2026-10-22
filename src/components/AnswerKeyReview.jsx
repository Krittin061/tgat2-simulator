'use client';

/**
 * คอมโพเนนต์: AnswerKeyReview
 * หน้าที่: แสดงเฉลยละเอียดรายข้อ หลังจากส่งข้อสอบเสร็จสมบูรณ์
 * ธีม: ทางการ (Professional)
 */

import React, { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export function AnswerKeyReview({ detailedAnswers, skillBreakdown }) {
  const [filter, setFilter] = useState('all'); // all, incorrect, verbal, numerical, spatial, logical
  const [expandedId, setExpandedId] = useState(null);

  // กรองข้อสอบตามเงื่อนไข
  const filteredAnswers = useMemo(() => {
    let result = detailedAnswers;
    if (filter === 'incorrect') {
      result = result.filter(a => !a.isCorrect);
    } else if (['verbal', 'numerical', 'spatial', 'logical'].includes(filter)) {
      result = result.filter(a => a.skill === filter);
    }
    return result;
  }, [detailedAnswers, filter]);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px', width: '100%' }}>
        <h3 style={{ fontSize: 'clamp(1.15rem, 3vw, 1.4rem)', fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
          เฉลยละเอียดรายข้อ
        </h3>
        
        {/* ตัวกรอง (Filter) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 auto', maxWidth: '320px', minWidth: '220px' }}>
          <Filter size={18} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
          <select 
            className="form-input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '0.9rem' }}
          >
            <option value="all">ดูทุกข้อ</option>
            <option value="incorrect">เฉพาะข้อที่ผิด</option>
            <option value="verbal">ภาษา ({skillBreakdown.verbal.title})</option>
            <option value="numerical">ตัวเลข ({skillBreakdown.numerical.title})</option>
            <option value="spatial">มิติสัมพันธ์ ({skillBreakdown.spatial.title})</option>
            <option value="logical">เหตุผล ({skillBreakdown.logical.title})</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAnswers.length === 0 ? (
          <div className="clean-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            ไม่มีข้อมูลตรงกับเงื่อนไขที่เลือก
          </div>
        ) : (
          filteredAnswers.map((item) => {
            const isExpanded = expandedId === item.questionId;
            
            return (
              <div key={item.questionId} className="clean-card" style={{ overflow: 'hidden' }}>
                
                {/* Header (คลิกเพื่อเปิด/ปิด) */}
                <div 
                  onClick={() => toggleExpand(item.questionId)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: item.isCorrect ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                    borderBottom: isExpanded ? '1px solid var(--color-border)' : 'none',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {item.isCorrect ? (
                      <CheckCircle2 size={24} color="var(--color-success)" />
                    ) : (
                      <XCircle size={24} color="var(--color-danger)" />
                    )}
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-navy-deep)' }}>
                        ข้อ {item.displayOrder} <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>• {item.skillLabel}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        คุณตอบ: {item.userAnswer || 'ไม่ได้ตอบ'} | เฉลย: {item.correctAnswer}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} color="var(--color-text-secondary)" /> : <ChevronDown size={20} color="var(--color-text-secondary)" />}
                </div>

                {/* Body (รายละเอียด) */}
                {isExpanded && (
                  <div className="animate-slide-down" style={{ padding: '24px 20px', background: 'var(--color-bg)' }}>
                    <div style={{ fontSize: '1.05rem', color: 'var(--color-text)', marginBottom: '20px', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {item.content}
                    </div>

                    {item.image && (
                      <div style={{ marginBottom: '20px', textAlign: 'center', background: 'var(--color-bg-alt)', padding: '14px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                        <img 
                          src={item.image} 
                          alt={`โจทย์ข้อ ${item.displayOrder}`} 
                          style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', margin: '0 auto', display: 'block', borderRadius: '6px' }} 
                        />
                      </div>
                    )}

                    {item.svgIllustration && (
                      <div 
                        style={{ marginBottom: '24px', textAlign: 'center', background: 'var(--color-bg-alt)', padding: '16px', borderRadius: '10px' }}
                        dangerouslySetInnerHTML={{ __html: item.svgIllustration }}
                      />
                    )}

                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>ตัวเลือก:</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {item.choices.map(choice => {
                          let bgColor = 'var(--color-bg)';
                          let borderColor = 'var(--color-border)';
                          
                          if (choice.id === item.correctAnswer) {
                            bgColor = 'var(--color-success-light)';
                            borderColor = 'var(--color-success-border)';
                          } else if (choice.id === item.userAnswer) {
                            bgColor = 'var(--color-danger-light)';
                            borderColor = 'var(--color-danger-border)';
                          }

                          return (
                            <li key={choice.id} style={{
                              padding: '10px 16px',
                              borderRadius: 'var(--radius-md)',
                              background: bgColor,
                              border: `1px solid ${borderColor}`,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              fontSize: '0.95rem'
                            }}>
                              <span style={{ fontWeight: 700 }}>{choice.id}.</span>
                              <span>{choice.text}</span>
                              {choice.id === item.correctAnswer && <CheckCircle2 size={18} color="var(--color-success)" style={{ marginLeft: 'auto' }} />}
                              {choice.id === item.userAnswer && choice.id !== item.correctAnswer && <XCircle size={18} color="var(--color-danger)" style={{ marginLeft: 'auto' }} />}
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* คำอธิบาย */}
                    {item.explanation && (
                      <div style={{
                        background: 'var(--color-bg-alt)',
                        padding: '20px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)'
                      }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-navy)', marginBottom: '12px' }}>
                          คำอธิบายวิธีคิด:
                        </div>
                        <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '12px' }}>
                          {item.explanation.summary}
                        </p>
                        <ol style={{ paddingLeft: '20px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                          {item.explanation.steps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                        <div style={{
                          display: 'flex', gap: '8px', alignItems: 'flex-start',
                          color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '12px', borderRadius: 'var(--radius-sm)'
                        }}>
                          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ fontSize: '0.9rem' }}>
                            <strong>เทคนิค:</strong> {item.explanation.tip}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
