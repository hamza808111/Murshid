-- Post Targeting Feature
-- Allows users to target questions to specific Major or University
-- Only students/specialists from that Major/University can respond
-- Run this script in Supabase SQL editor

BEGIN;

-- Add targeting columns to community_posts table
ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS is_targeted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS target_major_id UUID REFERENCES majors(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS target_university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS target_type TEXT CHECK (target_type IN ('major', 'university', NULL));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_target_major ON community_posts(target_major_id) WHERE is_targeted = TRUE;
CREATE INDEX IF NOT EXISTS idx_community_posts_target_university ON community_posts(target_university_id) WHERE is_targeted = TRUE;

COMMIT;

