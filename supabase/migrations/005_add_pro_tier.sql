-- ============================================================
-- StudyOS — Migration 005: Add Pro Tier & AI Usage Tracking
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add subscription_tier column to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' 
  CHECK (subscription_tier IN ('free', 'pro'));

-- 2. Add ai_extractions_count to track monthly AI usage
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS ai_extractions_count INT DEFAULT 0;

-- 3. Add an index for quick lookup of subscription tier if needed
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
