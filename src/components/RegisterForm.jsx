'use client';

/**
 * คอมโพเนนต์: RegisterForm
 * หน้าที่: ฟอร์มสมัครสมาชิก (ธีมทางการ) พร้อมเชื่อมต่อ Backend API
 */

import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';

export function RegisterForm({ onRegister, onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg(data.error || 'การสมัครสมาชิกล้มเหลว');
      } else {
        onRegister(data.user);
      }
    } catch (err) {
      console.error('Register submit error:', err);
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
              สมัครสมาชิกใหม่
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              สร้างบัญชีเพื่อบันทึกประวัติการทำข้อสอบ TGAT2
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
                ชื่อ - นามสกุล
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="ชื่อของคุณ"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

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
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
                รหัสผ่าน
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-input"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', padding: '6px' }}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
                ยืนยันรหัสผ่าน
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="form-input"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', padding: '6px' }}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: '100%', height: '48px', marginTop: '8px' }}
            >
              {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            มีบัญชีผู้ใช้อยู่แล้ว?{' '}
            <button
              onClick={() => onNavigate('login')}
              style={{ color: 'var(--color-primary)', fontWeight: 700 }}
            >
              เข้าสู่ระบบ
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
