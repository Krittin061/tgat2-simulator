'use client';

/**
 * คอมโพเนนต์: LandingView
 * หน้าที่: หน้าแรก (Landing Page) สำหรับแนะนำระบบสอบเสมือนจริง TGAT2
 * ธีม: ทางการ (Professional White/Navy)
 */

import React from 'react';
import { BookOpen, Target, ShieldCheck, Clock, ArrowRight, BrainCircuit } from 'lucide-react';

export function LandingView({ onStart, onLogin }) {
  return (
    <div className="animate-fade-in-up" style={{ padding: '40px 0 80px' }}>
      
      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 60px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          fontWeight: 700,
          fontSize: '0.85rem',
          border: '1px solid var(--color-primary-border)',
          marginBottom: '24px'
        }}>
          <ShieldCheck size={16} />
          <span>ระบบสอบจำลองตามพิมพ์เขียว ทปอ. ปีล่าสุด</span>
        </div>

        <h1 style={{ 
          fontSize: 'clamp(1.75rem, 4.5vw, 2.9rem)', 
          fontWeight: 800, 
          color: 'var(--color-navy-deep)',
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
          marginBottom: '20px'
        }}>
          ระบบจำลองสอบเสมือนจริง<br />
          <span style={{ color: 'var(--color-primary)' }}>TGAT2 การคิดอย่างมีเหตุผล</span>
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(0.95rem, 2.2vw, 1.15rem)', 
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          marginBottom: '36px'
        }}>
          ฝึกทำข้อสอบเสมือนจริง 80 ข้อ ตามเกณฑ์เวลามาตรฐาน 90 นาที พร้อมระบบตรวจคะแนน<br />
          และบทวิเคราะห์จุดอ่อนแยกตาม 4 ทักษะย่อย เพื่อการเตรียมตัวที่แม่นยำที่สุด
        </p>

        <div className="hero-btn-group">
          <button onClick={onStart} className="btn-primary" style={{ padding: '16px 28px', fontSize: '1.05rem' }}>
            เริ่มทำข้อสอบจำลอง <ArrowRight size={20} />
          </button>
          <button onClick={onLogin} className="btn-outline" style={{ padding: '16px 28px', fontSize: '1.05rem' }}>
            เข้าสู่ระบบ
          </button>
        </div>
      </div>

      {/* Stats/Info Banner */}
      <div className="clean-card stats-banner-grid" style={{ 
        padding: '32px 20px',
        marginBottom: '60px',
        background: 'var(--color-bg)'
      }}>
        {[
          { icon: <BookOpen color="#38BDF8" size={30} />, value: '80', label: 'จำนวนข้อสอบ' },
          { icon: <Clock color="#34D399" size={30} />, value: '90', label: 'เวลามาตรฐาน (นาที)' },
          { icon: <Target color="#FBBF24" size={30} />, value: '100', label: 'คะแนนเต็ม' },
          { icon: <BrainCircuit color="#C084FC" size={30} />, value: '4', label: 'ทักษะย่อย' }
        ].map((stat, idx) => (
          <div key={idx} style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
            <div style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800, color: 'var(--color-navy-deep)', marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '12px' }}>
          ฟีเจอร์เด่นของระบบ
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>ครอบคลุมทุกขั้นตอนการเตรียมตัวสอบ TGAT2</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        {[
          {
            title: 'ข้อสอบมาตรฐาน ทปอ.',
            desc: 'ครอบคลุม 4 ทักษะ: ภาษา, ตัวเลข, มิติสัมพันธ์, และการใช้เหตุผล รวม 80 ข้อ',
            color: 'blue'
          },
          {
            title: 'เวลาสอบมาตรฐาน 90 นาที',
            desc: 'แสดงกรอบเวลาสอบมาตรฐาน 90 นาที ช่วยฝึกบริหารและจัดสรรเวลาการทำโจทย์ได้อย่างเหมาะสม',
            color: 'emerald'
          },
          {
            title: 'บทวิเคราะห์จุดแข็ง-จุดอ่อน',
            desc: 'ประเมินคะแนนแยกรายทักษะ เพื่อให้รู้ว่าควรเน้นทบทวนเรื่องใด',
            color: 'amber'
          },
          {
            title: 'เฉลยละเอียดรายข้อ',
            desc: 'มีคำอธิบายวิธีคิดและเหตุผลประกอบอย่างชัดเจนในทุกข้อสอบ',
            color: 'purple'
          }
        ].map((feature, idx) => (
          <div key={idx} className="clean-card" style={{ padding: '24px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '8px' }}>
              {feature.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
