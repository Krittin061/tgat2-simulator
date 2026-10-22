-- ========================================================
-- TGAT2 Simulator - Setup Supabase Storage for Exam Images
-- Run this in Supabase SQL Editor
-- ========================================================

-- 1. Create the public bucket 'exam-images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-images', 'exam-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Configure RLS Policies for 'exam-images' (No ALTER TABLE needed)
DROP POLICY IF EXISTS "Public read exam-images" ON storage.objects;
CREATE POLICY "Public read exam-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exam-images');

DROP POLICY IF EXISTS "Public upload exam-images" ON storage.objects;
CREATE POLICY "Public upload exam-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'exam-images');

DROP POLICY IF EXISTS "Public update exam-images" ON storage.objects;
CREATE POLICY "Public update exam-images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'exam-images');

-- Verify bucket
SELECT id, name, public FROM storage.buckets WHERE id = 'exam-images';
