-- Migration: Add checklists to topics table
ALTER TABLE topics 
ADD COLUMN IF NOT EXISTS notes_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS revision_completed BOOLEAN DEFAULT FALSE;
