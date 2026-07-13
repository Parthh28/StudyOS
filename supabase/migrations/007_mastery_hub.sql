-- ============================================================
-- StudyOS — Migration 007: Dedicated Mastery Hub Support
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add explicit mastery_status column to `subjects`
ALTER TABLE subjects
ADD COLUMN IF NOT EXISTS mastery_status TEXT DEFAULT 'normal'
CHECK (mastery_status IN ('weak', 'normal', 'mastered'));

-- 2. Add explicit mastery_level column to `topics`
ALTER TABLE topics
ADD COLUMN IF NOT EXISTS mastery_level TEXT DEFAULT 'normal'
CHECK (mastery_level IN ('weak', 'normal', 'mastered'));

-- 3. Add explicit mastery_level column to `topic_progress`
ALTER TABLE topic_progress
ADD COLUMN IF NOT EXISTS mastery_level TEXT DEFAULT 'normal'
CHECK (mastery_level IN ('weak', 'normal', 'mastered'));

-- 4. Create index for fast Mastery Hub diagnostic queries
CREATE INDEX IF NOT EXISTS idx_topic_progress_mastery_level ON topic_progress(user_id, mastery_level);
CREATE INDEX IF NOT EXISTS idx_topic_progress_confidence ON topic_progress(user_id, confidence_score);
