-- ============================================================
-- StudyOS — Initial Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── Enable UUID extension ───────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. PROFILES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  institution   TEXT DEFAULT 'SASTRA Deemed to be University',
  target_year   INT  DEFAULT 2026,
  weekly_goal_hours INT DEFAULT 20,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 2. SUBJECTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  code         TEXT,                           -- e.g. "MAT201R01"
  color        TEXT NOT NULL DEFAULT '#6366F1',-- hex color for subject card
  icon         TEXT DEFAULT 'BookOpen',        -- lucide icon name
  target_score NUMERIC(5,2) DEFAULT 75.00,
  subject_type TEXT DEFAULT 'theory'           -- theory | lab
    CHECK (subject_type IN ('theory', 'lab')),
  order_index  INT  DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subjects_all_own" ON subjects;
CREATE POLICY "subjects_all_own" ON subjects
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── 3. UNITS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS units (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  order_index INT  DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "units_all_own" ON units;

-- RLS via subject → user join
CREATE POLICY "units_all_own" ON units
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM subjects s
      WHERE s.id = units.subject_id AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subjects s
      WHERE s.id = units.subject_id AND s.user_id = auth.uid()
    )
  );

-- ─── 4. TOPICS ───────────────────────────────────────────────
-- 14 fields as per spec
CREATE TABLE IF NOT EXISTS topics (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id           UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  subject_id        UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  -- Status & classification
  status            TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority          TEXT DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high')),
  difficulty        TEXT DEFAULT 'medium'
    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  -- Confidence & progress
  confidence_score  INT  DEFAULT 0
    CHECK (confidence_score BETWEEN 0 AND 10),
  -- Content
  notes             TEXT,
  formulas          TEXT,
  resources         TEXT,
  -- Revision tracking
  last_studied      TIMESTAMPTZ,
  next_revision     TIMESTAMPTZ,
  revision_count    INT  DEFAULT 0,
  -- Time & bookmarks
  time_spent_mins   INT  DEFAULT 0,
  is_bookmarked     BOOLEAN DEFAULT FALSE,
  -- Timestamps
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "topics_all_own" ON topics;
CREATE POLICY "topics_all_own" ON topics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM subjects s
      WHERE s.id = topics.subject_id AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subjects s
      WHERE s.id = topics.subject_id AND s.user_id = auth.uid()
    )
  );

CREATE TRIGGER topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 5. STUDY SESSIONS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS study_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id    UUID REFERENCES subjects(id) ON DELETE SET NULL,
  topic_id      UUID REFERENCES topics(id) ON DELETE SET NULL,
  duration_mins INT  NOT NULL CHECK (duration_mins > 0),
  session_type  TEXT DEFAULT 'study'
    CHECK (session_type IN ('study', 'revision', 'practice', 'exam', 'pomodoro')),
  notes         TEXT,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at      TIMESTAMPTZ
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sessions_all_own" ON study_sessions;
CREATE POLICY "sessions_all_own" ON study_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── 6. EXAMS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id    UUID REFERENCES subjects(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  exam_date     DATE NOT NULL,
  duration_hrs  NUMERIC(4,1),
  status        TEXT DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'completed', 'missed')),
  score         NUMERIC(5,2),
  max_score     NUMERIC(5,2) DEFAULT 100,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exams_all_own" ON exams;
CREATE POLICY "exams_all_own" ON exams
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── 7. GOALS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id  UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  target_date DATE,
  is_auto     BOOLEAN DEFAULT FALSE,  -- generated by revision engine
  is_done     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "goals_all_own" ON goals;
CREATE POLICY "goals_all_own" ON goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Helpful views ───────────────────────────────────────────
-- security_invoker = true → views respect RLS, no UNRESTRICTED badge

-- Topic completion stats per subject
CREATE OR REPLACE VIEW subject_stats
WITH (security_invoker = true)
AS
SELECT
  s.id AS subject_id,
  s.user_id,
  s.name AS subject_name,
  COUNT(t.id) AS total_topics,
  COUNT(t.id) FILTER (WHERE t.status = 'completed') AS completed_topics,
  COUNT(t.id) FILTER (WHERE t.status = 'in_progress') AS in_progress_topics,
  ROUND(
    COUNT(t.id) FILTER (WHERE t.status = 'completed')::NUMERIC
    / NULLIF(COUNT(t.id), 0) * 100, 1
  ) AS completion_pct,
  ROUND(AVG(t.confidence_score), 1) AS avg_confidence
FROM subjects s
LEFT JOIN topics t ON t.subject_id = s.id
GROUP BY s.id, s.user_id, s.name;

-- Topics overdue for revision
CREATE OR REPLACE VIEW overdue_topics
WITH (security_invoker = true)
AS
SELECT
  t.*,
  s.name AS subject_name,
  s.color AS subject_color,
  u.name AS unit_name
FROM topics t
JOIN subjects s ON s.id = t.subject_id
JOIN units u ON u.id = t.unit_id
WHERE
  t.next_revision IS NOT NULL
  AND t.next_revision < NOW()
  AND t.status != 'pending';
