-- Add approval status for specialist posts
-- Run this script in Supabase SQL editor to add post approval functionality

BEGIN;

-- Add approval_status column to community_posts table
ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add approved_by and approved_at columns for tracking
ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add rejection_reason column
ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_approval_status 
ON community_posts(approval_status);

-- Update existing posts: 
-- - Students and admins: keep as 'approved'
-- - Specialists: set to 'pending' (they need approval)
UPDATE community_posts
SET approval_status = 'pending'
WHERE author_role = 'specialist' 
  AND (approval_status IS NULL OR approval_status = 'approved');

-- Set all student and admin posts to approved
UPDATE community_posts
SET approval_status = 'approved'
WHERE author_role IN ('student', 'admin')
  AND (approval_status IS NULL);

COMMIT;

