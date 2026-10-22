'use client';

/**
 * คอมโพเนนต์: Navbar
 * หน้าที่: แถบนำทางด้านบนสุด พร้อมปุ่มสลับ Dark Mode / Light Mode
 */

import React from 'react';
import { LogOut, Sun, Moon } from 'lucide-react';

export function Navbar({ view, user, onNavigate, onLogout, theme = 'light', onToggleTheme }) {
  return (
    <header style={{
      background: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      transition: 'background-color 0.2s ease, border-color 0.2s ease'
    }}>
      <div className="app-container" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}
        >
          <div style={{
            background: 'var(--color-brand-badge, #0F172A)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '1.2rem',
            padding: '4px 10px',
            borderRadius: '6px',
            letterSpacing: '1px'
          }}>
            TGAT
          </div>
          <span className="nav-brand-title" style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            color: 'var(--color-navy)',
            letterSpacing: '-0.5px'
          }}>
            Simulator
          </span>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            type="button"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง (Light Mode)' : 'เปลี่ยนเป็นโหมดมืด (Dark Mode)'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
              color: theme === 'dark' ? '#FBBF24' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)' }}>
                <div style={{
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.9rem'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="nav-user-name" style={{ fontWeight: 500, fontSize: '0.9rem' }}>{user.name}</span>
              </div>
              
              <div style={{ width: '1px', height: '20px', background: 'var(--color-border)' }}></div>
              
              <button 
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-danger)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
              >
                <LogOut size={16} /> ออกจากระบบ
              </button>
            </div>
          ) : (
            view !== 'login' && view !== 'register' && (
              <button 
                onClick={() => onNavigate('login')}
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                เข้าสู่ระบบ
              </button>
            )
          )}
        </div>
        
      </div>
    </header>
  );
}

