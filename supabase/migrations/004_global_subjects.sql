-- ============================================================
-- Migration: Global Subjects & Isolated User Progress
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Create the `topic_progress` table
CREATE TABLE IF NOT EXISTS topic_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id          UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  confidence_score  INT DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 10),
  time_spent_mins   INT DEFAULT 0,
  last_studied      TIMESTAMPTZ,
  next_revision     TIMESTAMPTZ,
  revision_count    INT DEFAULT 0,
  is_bookmarked     BOOLEAN DEFAULT FALSE,
  notes_completed   BOOLEAN DEFAULT FALSE,
  revision_completed BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id) -- A user can only have one progress record per topic
);

ALTER TABLE topic_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "topic_progress_all_own" ON topic_progress;
CREATE POLICY "topic_progress_all_own" ON topic_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS topic_progress_updated_at ON topic_progress;
CREATE TRIGGER topic_progress_updated_at
  BEFORE UPDATE ON topic_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. Migrate existing progress from `topics` to `topic_progress`
INSERT INTO topic_progress (user_id, topic_id, status, confidence_score, time_spent_mins, last_studied, next_revision, revision_count, is_bookmarked, notes_completed, revision_completed)
SELECT 
  s.user_id, 
  t.id, 
  t.status, 
  t.confidence_score, 
  t.time_spent_mins, 
  t.last_studied, 
  t.next_revision, 
  t.revision_count, 
  t.is_bookmarked,
  t.notes_completed,
  t.revision_completed
FROM topics t
JOIN subjects s ON s.id = t.subject_id
ON CONFLICT (user_id, topic_id) DO NOTHING;

-- 3. Update RLS on Subjects to allow Global Read
DROP POLICY IF EXISTS "subjects_all_own" ON subjects;
-- Anyone can read
CREATE POLICY "subjects_select_all" ON subjects
  FOR SELECT USING (true);
-- Only owner can modify
CREATE POLICY "subjects_modify_own" ON subjects
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Update RLS on Units to allow Global Read
DROP POLICY IF EXISTS "units_all_own" ON units;
CREATE POLICY "units_select_all" ON units
  FOR SELECT USING (true);
CREATE POLICY "units_modify_own" ON units
  FOR ALL USING (
    EXISTS (SELECT 1 FROM subjects s WHERE s.id = units.subject_id AND s.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM subjects s WHERE s.id = units.subject_id AND s.user_id = auth.uid())
  );

-- 5. Update RLS on Topics to allow Global Read
DROP POLICY IF EXISTS "topics_all_own" ON topics;
CREATE POLICY "topics_select_all" ON topics
  FOR SELECT USING (true);
CREATE POLICY "topics_modify_own" ON topics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM subjects s WHERE s.id = topics.subject_id AND s.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM subjects s WHERE s.id = topics.subject_id AND s.user_id = auth.uid())
  );

-- 6. Update Views to use the new topic_progress table
DROP VIEW IF EXISTS subject_stats;
CREATE VIEW subject_stats WITH (security_invoker = true) AS
SELECT
  s.id AS subject_id,
  s.user_id,
  s.name AS subject_name,
  COUNT(t.id) AS total_topics,
  COUNT(t.id) FILTER (WHERE tp.status = 'completed') AS completed_topics,
  COUNT(t.id) FILTER (WHERE tp.status = 'in_progress') AS in_progress_topics,
  ROUND(
    COUNT(t.id) FILTER (WHERE tp.status = 'completed')::NUMERIC
    / NULLIF(COUNT(t.id), 0) * 100, 1
  ) AS completion_pct,
  ROUND(AVG(COALESCE(tp.confidence_score, 0)), 1) AS avg_confidence
FROM subjects s
LEFT JOIN topics t ON t.subject_id = s.id
LEFT JOIN topic_progress tp ON tp.topic_id = t.id AND tp.user_id = auth.uid()
GROUP BY s.id, s.user_id, s.name;

DROP VIEW IF EXISTS overdue_topics;
CREATE VIEW overdue_topics WITH (security_invoker = true) AS
SELECT
  t.id, t.unit_id, t.subject_id, t.name, t.priority, t.difficulty, t.notes, t.formulas, t.resources, t.created_at, t.updated_at,
  COALESCE(tp.status, 'pending') as status,
  COALESCE(tp.confidence_score, 0) as confidence_score,
  tp.time_spent_mins,
  tp.last_studied,
  tp.next_revision,
  tp.revision_count,
  tp.is_bookmarked,
  s.name AS subject_name,
  s.color AS subject_color,
  u.name AS unit_name
FROM topics t
JOIN subjects s ON s.id = t.subject_id
JOIN units u ON u.id = t.unit_id
JOIN topic_progress tp ON tp.topic_id = t.id AND tp.user_id = auth.uid()
WHERE
  tp.next_revision IS NOT NULL
  AND tp.next_revision < NOW()
  AND tp.status != 'pending';

DROP VIEW IF EXISTS weak_topics;
CREATE VIEW weak_topics WITH (security_invoker = true) AS
SELECT
  t.id, t.unit_id, t.subject_id, t.name, t.priority, t.difficulty, t.notes, t.formulas, t.resources, t.created_at, t.updated_at,
  COALESCE(tp.status, 'pending') as status,
  COALESCE(tp.confidence_score, 0) as confidence_score,
  tp.time_spent_mins,
  tp.last_studied,
  tp.next_revision,
  tp.revision_count,
  tp.is_bookmarked,
  s.name AS subject_name,
  s.color AS subject_color,
  u.name AS unit_name
FROM topics t
JOIN subjects s ON s.id = t.subject_id
JOIN units u ON u.id = t.unit_id
JOIN topic_progress tp ON tp.topic_id = t.id AND tp.user_id = auth.uid()
WHERE
  tp.confidence_score > 0
  AND tp.confidence_score <= 4;
