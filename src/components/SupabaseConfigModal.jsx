'use client';

import React, { useState, useEffect } from 'react';
import { getSupabaseCredentials, saveSupabaseCredentials, getSupabaseClient } from '@/lib/supabase';
import { Database, Key, Globe, Check, Copy, X, ShieldAlert, CheckCircle2, Server } from 'lucide-react';

export function SupabaseConfigModal({
  isOpen,
  onClose,
  onSaved
}) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSupabaseCredentials(url, anonKey);
    onSaved();
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    saveSupabaseCredentials(url, anonKey);
    const client = getSupabaseClient();

    if (!client) {
      setTestResult({
        success: false,
        message: 'กรุณากรอก Supabase URL และ Anon Key ให้ครบถ้วน'
      });
      setIsTesting(false);
      return;
    }

    try {
      const { error } = await client.from('exam_attempts').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          setTestResult({
            success: true,
            message: 'เชื่อมต่อ Supabase สำเร็จ! (หมายเหตุ: ยังไม่พบตาราง exam_attempts อย่าลืมกดรัน SQL Schema ด้านล่าง)'
          });
        } else {
          setTestResult({
            success: false,
            message: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${error.message}`
          });
        }
      } else {
        setTestResult({
          success: true,
          message: 'การเชื่อมต่อไปยัง Supabase สำเร็จสมบูรณ์ 100% พร้อมใช้งาน!'
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `ไม่สามารถเชื่อมต่อได้: ${err.message || String(err)}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const sampleSql = `-- รันสคริปต์นี้ใน Supabase SQL Editor
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT DEFAULT 'ผู้เข้าสอบนิรนาม',
    mode TEXT NOT NULL,
    total_score NUMERIC(5, 2) NOT NULL,
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    correct_count INT NOT NULL,
    total_questions INT NOT NULL DEFAULT 80,
    time_spent_seconds INT NOT NULL,
    skill_breakdown JSONB NOT NULL,
    answers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON exam_attempts FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select" ON exam_attempts FOR SELECT TO public USING (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sampleSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div className="clean-card animate-fade-in" style={{
        maxWidth: '520px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                ตั้งค่าเชื่อมต่อ Supabase
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                บันทึกสถิติ ประวัติ และผลคะแนนขึ้น Cloud Database
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ padding: '6px', color: '#94A3B8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              <Globe size={14} color="#2563EB" />
              <span>Project URL</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              <Key size={14} color="#D97706" />
              <span>Anon Public API Key</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
            />
          </div>
        </div>

        {/* Test Result alert */}
        {testResult && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: testResult.success ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${testResult.success ? '#BBF7D0' : '#FECACA'}`,
            color: testResult.success ? '#166534' : '#991B1B',
            fontSize: '0.84rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            {testResult.success ? <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> : <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Test & Save buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={handleTestConnection}
            disabled={isTesting || !url || !anonKey}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              background: '#F1F5F9',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Server size={15} />
            <span>{isTesting ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
          </button>

          <button
            onClick={handleSave}
            className="btn-primary"
            style={{ flex: 1, padding: '9px 16px', fontSize: '0.88rem' }}
          >
            บันทึกการตั้งค่า
          </button>
        </div>

        {/* SQL Schema helper */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: '10px',
          padding: '14px',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
              SQL Schema สำหรับสร้าง Table:
            </span>
            <button
              onClick={copySqlToClipboard}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: '#EFF6FF',
                color: '#2563EB',
                fontSize: '0.74rem',
                fontWeight: 600
              }}
            >
              {copiedSql ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedSql ? 'คัดลอกแล้ว' : 'คัดลอก SQL'}</span>
            </button>
          </div>
          <pre style={{
            background: '#FFFFFF',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#64748B',
            overflowX: 'auto',
            maxHeight: '100px'
          }}>
            {sampleSql}
          </pre>
        </div>

      </div>
    </div>
  );
}
