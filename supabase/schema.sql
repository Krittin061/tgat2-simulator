-- ========================================================
-- TGAT2 Virtual Exam Simulator - Supabase Database Schema
-- Run this script in your Supabase SQL Editor
-- ========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: exam_attempts
-- Stores completed and in-progress exam sessions
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT DEFAULT 'ผู้เข้าสอบนิรนาม',
    mode TEXT NOT NULL CHECK (mode IN ('real_exam', 'practice')),
    total_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    correct_count INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 80,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    skill_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for fast user history queries
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_created_at ON exam_attempts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous or authenticated insert for exam submissions
CREATE POLICY "Allow public insert to exam_attempts"
ON exam_attempts
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to read their own or public records
CREATE POLICY "Allow public select of exam_attempts"
ON exam_attempts
FOR SELECT
TO public
USING (true);

