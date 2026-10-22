'use client';

/**
 * ไฟล์: page.jsx
 * หน้าที่: ควบคุม State หลักและการเปลี่ยนหน้าของระบบ (Routing Controller)
 * แยก View ต่าง ๆ เป็นคอมโพเนนต์ย่อยอย่างเป็นสัดส่วน (Landing, Auth, Dashboard, Exam, Result)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { LandingView } from '@/components/LandingView';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { DashboardView } from '@/components/DashboardView';
import { ExamView } from '@/components/ExamView';
import { ResultView } from '@/components/ResultView';
import { SupabaseConfigModal } from '@/components/SupabaseConfigModal';
import { saveActiveSession, loadActiveSession, clearActiveSession } from '@/lib/storage';
import { saveExamAttemptToSupabase } from '@/lib/supabase';
import { RotateCcw } from 'lucide-react';

export default function Home() {
  // State สลับธีม Dark Mode / Light Mode
  const [theme, setTheme] = useState('light');

  // State หลัก: 'landing' | 'login' | 'register' | 'dashboard' | 'exam' | 'result'
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  
  // State สำหรับข้อสอบ
  const [examSession, setExamSession] = useState(null);
  const [examMode, setExamMode] = useState('real_exam');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [isRevealed, setIsRevealed] = useState(false); // สำหรับ practice mode
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examStartTime, setExamStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState(null);
  
  // สถานะ Modal
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  
  // สถานะสำหรับกู้คืนข้อสอบที่ทำค้างไว้ (Autosave Recovery)
  const [recoverableSession, setRecoverableSession] = useState(null);

  // โหลดและบันทึกธีม
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('tgat2_theme');
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (e) {
      console.error('Error loading theme:', e);
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('tgat2_theme', nextTheme);
    } catch (e) {
      console.error('Error saving theme:', e);
    }
  };

  // ดึงข้อมูลประวัติผู้ใช้
  const loadHistory = useCallback(async (userId) => {
    try {
      const res = await fetch(`/api/exam/history?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadHistory(user.userId);
    }
  }, [user, loadHistory]);

  // ตรวจสอบเซสชันข้อสอบที่บันทึกไว้ใน LocalStorage (Autosave Recovery) เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    const saved = loadActiveSession();
    if (saved && saved.examSession && saved.questions && saved.questions.length > 0) {
      let adjustedTime = saved.timeRemaining;
      if (saved.examMode === 'real_exam' && saved.lastSavedAt) {
        const elapsedSeconds = Math.floor((Date.now() - saved.lastSavedAt) / 1000);
        adjustedTime = Math.max(0, (saved.timeRemaining !== undefined ? saved.timeRemaining : 5400) - elapsedSeconds);
      }
      setRecoverableSession({
        ...saved,
        timeRemaining: adjustedTime
      });
    }
  }, []);

  // บันทึกความคืบหน้าระหว่างสอบลงใน LocalStorage โดยอัตโนมัติ (Autosave)
  useEffect(() => {
    if (currentView === 'exam' && examSession && questions.length > 0) {
      saveActiveSession({
        examSession,
        examMode,
        questions,
        currentQuestionIndex,
        answers,
        flaggedQuestions,
        timeRemaining,
        examStartTime,
        lastSavedAt: Date.now()
      });
    }
  }, [currentView, examSession, examMode, questions, currentQuestionIndex, answers, flaggedQuestions, timeRemaining, examStartTime]);

  // ป้องกันการเผลอปิดแท็บหรือรีเฟรชหน้าระหว่างทำข้อสอบ
  useEffect(() => {
    if (currentView !== 'exam') return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'คุณกำลังทำข้อสอบอยู่ ข้อสอบได้รับการบันทึกอัตโนมัติ คุณแน่ใจหรือไม่ว่าต้องการออกจากหน้านี้?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentView]);

  // ฟังก์ชันกู้คืนข้อสอบที่ทำค้างไว้
  const handleRestoreSession = () => {
    if (!recoverableSession) return;
    setExamSession(recoverableSession.examSession);
    setExamMode(recoverableSession.examMode);
    setQuestions(recoverableSession.questions);
    setCurrentQuestionIndex(recoverableSession.currentQuestionIndex || 0);
    setAnswers(recoverableSession.answers || {});
    setFlaggedQuestions(recoverableSession.flaggedQuestions || []);
    setTimeRemaining(recoverableSession.timeRemaining !== undefined ? recoverableSession.timeRemaining : 5400);
    setExamStartTime(recoverableSession.examStartTime || Date.now());
    setCurrentView('exam');
    setRecoverableSession(null);
  };

  // ฟังก์ชันยกเลิก / ไม่กู้คืนข้อสอบเดิม
  const handleDiscardSession = () => {
    clearActiveSession();
    setRecoverableSession(null);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setHistory([]);
    setCurrentView('landing');
  };

  // เริ่มสอบ
  const startExam = async (mode, options = {}) => {
    clearActiveSession();
    setExamMode(mode);
    setAnswers({});
    setFlaggedQuestions([]);
    setCurrentQuestionIndex(0);
    setIsRevealed(false);

    try {
      const userId = user ? user.userId : 'anonymous';
      let url = `/api/exam/start?userId=${userId}&mode=${mode}`;
      if (mode === 'practice' && options?.skills && options.skills.length > 0) {
        url += `&skills=${options.skills.join(',')}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setExamSession(data.sessionId);
        setQuestions(data.questions);
        setExamStartTime(Date.now());
        if (mode === 'real_exam') {
          setTimeRemaining(data.durationSeconds || 5400);
        }
        setCurrentView('exam');
      } else {
        alert('ไม่สามารถเริ่มข้อสอบได้');
      }
    } catch (err) {
      console.error('Start exam error:', err);
      alert('เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่');
    }
  };

  // ยืนยันการส่งข้อสอบ (เรียก API)
  const executeSubmitExam = async () => {
    setIsSubmitting(true);
    // คำนวณเวลาที่ใช้จริงจากการเริ่มสอบ
    const timeSpent = examStartTime ? Math.max(1, Math.round((Date.now() - examStartTime) / 1000)) : 0;

    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: examSession,
          answers,
          timeSpentSeconds: timeSpent
        })
      });

      const data = await res.json();

      if (data.success) {
        clearActiveSession();
        setExamResult(data.result);
        saveExamAttemptToSupabase(data.result);
        if (user) loadHistory(user.userId);
        setCurrentView('result');
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Submit exam error:', err);
      alert('ส่งข้อสอบไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        view={currentView} 
        user={user} 
        onNavigate={setCurrentView} 
        onLogout={handleLogout} 
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main style={{ flex: 1 }}>
        {currentView === 'landing' && (
          <div className="app-container">
            <LandingView 
              onStart={() => setCurrentView('dashboard')} 
              onLogin={() => setCurrentView('login')} 
            />
          </div>
        )}

        {currentView === 'login' && (
          <LoginForm onLogin={handleLogin} onNavigate={setCurrentView} />
        )}
        
        {currentView === 'register' && (
          <RegisterForm onRegister={handleLogin} onNavigate={setCurrentView} />
        )}

        {currentView === 'dashboard' && (
          <div className="app-container">
            <DashboardView 
              user={user} 
              history={history} 
              onStartExam={startExam} 
              onViewResult={(res) => {
                setExamResult(res);
                setCurrentView('result');
              }}
            />
          </div>
        )}

        {currentView === 'exam' && questions.length > 0 && (
          <ExamView
            examSession={examSession}
            examMode={examMode}
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            answers={answers}
            setAnswers={setAnswers}
            flaggedQuestions={flaggedQuestions}
            setFlaggedQuestions={setFlaggedQuestions}
            isRevealed={isRevealed}
            setIsRevealed={setIsRevealed}
            timeRemaining={timeRemaining}
            setTimeRemaining={setTimeRemaining}
            isSubmitting={isSubmitting}
            onSubmitExam={executeSubmitExam}
            onExitPractice={() => {
              clearActiveSession();
              setCurrentView('dashboard');
            }}
          />
        )}

        {currentView === 'result' && examResult && (
          <ResultView 
            examResult={examResult}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onNewExam={() => setCurrentView('dashboard')}
          />
        )}

        {/* Supabase Database Configuration Modal */}
        <SupabaseConfigModal 
          isOpen={showSupabaseModal}
          onClose={() => setShowSupabaseModal(false)}
          onSaved={() => {
            if (user) loadHistory(user.userId);
          }}
        />

        {/* Session Recovery Modal (กู้คืนข้อสอบที่ทำค้างไว้) */}
        {recoverableSession && currentView !== 'exam' && (
          <div className="modal-overlay" style={{ zIndex: 1500 }}>
            <div className="modal-card animate-scale-in" style={{ padding: '0', overflow: 'hidden', maxWidth: '480px', width: '100%' }}>
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%)',
                color: '#FFFFFF'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <RotateCcw size={20} color="#60A5FA" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    พบข้อสอบที่คุณทำค้างไว้
                  </h3>
                </div>
                <p style={{ color: '#93C5FD', fontSize: '0.88rem', margin: 0 }}>
                  ระบบบันทึกความคืบหน้าไว้ล่าสุด สามารถกลับไปทำต่อจากจุดเดิมได้ทันที
                </p>
              </div>

              <div style={{ padding: '20px 24px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ padding: '12px', background: 'var(--color-bg-alt, #F8FAFC)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>โหมดการสอบ</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-navy-deep)' }}>
                      {recoverableSession.examMode === 'real_exam' ? 'สอบเสมือนจริง' : 'โหมดฝึกหัด'}
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: 'var(--color-bg-alt, #F8FAFC)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>ความคืบหน้า</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-success)' }}>
                      ตอบแล้ว {Object.keys(recoverableSession.answers || {}).length} / {recoverableSession.questions?.length || 80} ข้อ
                    </div>
                  </div>

                  {recoverableSession.examMode === 'real_exam' && (
                    <div style={{ padding: '12px', background: 'var(--color-bg-alt, #F8FAFC)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', gridColumn: 'span 2' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>เวลาคงเหลือโดยประมาณ</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {Math.floor((recoverableSession.timeRemaining || 0) / 60)} นาที {(recoverableSession.timeRemaining || 0) % 60} วินาที
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  📌 บันทึกไว้เมื่อ: {recoverableSession.lastSavedAt ? new Date(recoverableSession.lastSavedAt).toLocaleTimeString('th-TH') : 'ไม่ระบุ'}
                </div>
              </div>

              <div className="modal-btn-group">
                <button
                  onClick={handleDiscardSession}
                  className="btn-outline modal-btn-cancel"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ละทิ้ง / เริ่มใหม่
                </button>
                <button
                  onClick={handleRestoreSession}
                  className="btn-primary modal-btn-confirm"
                  style={{ gap: '8px' }}
                >
                  <RotateCcw size={16} /> ทำข้อสอบต่อทันที
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
