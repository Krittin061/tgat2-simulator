'use client';

/**
 * คอมโพเนนต์: ExamTimer
 * หน้าที่: นับเวลาถอยหลังจาก 90 นาที เพื่อจำลองบรรยากาศสอบจริง
 * หมายเหตุ: เมื่อเวลาหมด (00:00) จะไม่มีการตัดจบอัตโนมัติ เพื่อให้ผู้สอบสามารถทำและตรวจทานข้อสอบต่อได้
 */

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function ExamTimer({ initialTime = 5400, onTick }) {
  const [secondsLeft, setSecondsLeft] = useState(initialTime);

  useEffect(() => {
    // นับถอยหลังทีละ 1 วินาที
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (onTick) {
      onTick(secondsLeft);
    }
  }, [secondsLeft, onTick]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isTimeUp = secondsLeft === 0;
  const isWarning = secondsLeft > 0 && secondsLeft <= 600; // เตือนเมื่อเหลือน้อยกว่า 10 นาที

  let bg = 'var(--color-bg)';
  let border = 'var(--color-border)';
  let textColor = 'var(--color-navy-deep)';
  let iconColor = 'var(--color-primary)';

  if (isTimeUp) {
    bg = 'var(--color-danger-light)';
    border = 'var(--color-danger-border)';
    textColor = 'var(--color-danger)';
    iconColor = 'var(--color-danger)';
  } else if (isWarning) {
    bg = 'var(--color-warning-light)';
    border = 'var(--color-warning-border)';
    textColor = 'var(--color-warning)';
    iconColor = 'var(--color-warning)';
  }

  return (
    <div 
      title={isTimeUp ? "ครบเวลา 90 นาทีแล้ว แต่สามารถทำข้อสอบต่อได้" : "เวลานับถอยหลัง (เกณฑ์มาตรฐาน 90 นาที)"}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: 'var(--radius-full)',
        background: bg,
        border: `1px solid ${border}`,
        color: textColor,
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        fontSize: '1.05rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease'
      }}
    >
      <Clock size={18} style={{ color: iconColor }} />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {isTimeUp && (
        <span style={{ 
          fontSize: '0.75rem', 
          fontFamily: 'var(--font-sans)', 
          background: 'var(--color-danger)', 
          color: '#FFFFFF',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)'
        }}>
          ครบเวลา (ทำต่อได้)
        </span>
      )}
    </div>
  );
}

