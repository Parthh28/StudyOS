-- ============================================================
-- StudyOS — Migration 006: Chat Messages Table
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Create chat_messages table for AI conversation history
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only access their own messages
DROP POLICY IF EXISTS "chat_messages_all_own" ON chat_messages;
CREATE POLICY "chat_messages_all_own" ON chat_messages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Index for fast history retrieval ordered by time
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created
  ON chat_messages(user_id, created_at DESC);
