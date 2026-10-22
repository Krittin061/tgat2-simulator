'use client';

/**
 * คอมโพเนนต์: LoginForm
 * หน้าที่: ฟอร์มเข้าสู่ระบบ (ธีมทางการ) พร้อมเชื่อมต่อ Backend API
 */

import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';

export function LoginForm({ onLogin, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg(data.error || 'เข้าสู่ระบบล้มเหลว');
      } else {
        onLogin(data.user);
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-bg)',
      padding: 'clamp(14px, 4vw, 24px)'
    }}>
      
      <div>
        <button
          onClick={() => onNavigate('landing')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
        >
          <ArrowLeft size={18} /> กลับหน้าแรก
        </button>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 0 60px'
      }}>
        <div className="clean-card" style={{
          width: '100%',
          maxWidth: '440px',
          padding: 'clamp(20px, 6vw, 40px)',
          borderRadius: 'var(--radius-xl)'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-navy-deep)', marginBottom: '8px' }}>
              เข้าสู่ระบบ
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              เข้าสู่ระบบสอบจำลอง TGAT2 เสมือนจริง
            </p>
          </div>

          {errorMsg && (
            <div style={{
              background: 'var(--color-danger-light)',
              border: '1px solid var(--color-danger-border)',
              color: 'var(--color-danger)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
                อีเมล
              </label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  รหัสผ่าน
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    padding: '6px'
                  }}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: '100%', height: '48px', marginTop: '8px' }}
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              ยังไม่มีบัญชีผู้ใช้?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                style={{ color: 'var(--color-primary)', fontWeight: 700 }}
              >
                สมัครสมาชิกฟรี
              </button>
            </div>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textDecoration: 'underline' }}
              >
                ทดลองทำข้อสอบทันทีในฐานะบุคคลทั่วไป (Guest Mode)
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
