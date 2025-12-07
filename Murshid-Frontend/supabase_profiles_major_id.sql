-- Add major_id to profiles and reference majors
-- This allows specialists and students to have a proper foreign key to the majors table
-- Run this script in Supabase SQL Editor

BEGIN;

-- Add major_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'major_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN major_id UUID;
  END IF;
END $$;

-- Add foreign key constraint to majors table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'majors'
  ) THEN
    -- Avoid duplicate constraint creation
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name = 'profiles' 
      AND constraint_type = 'FOREIGN KEY' 
      AND constraint_name = 'profiles_major_id_fkey'
    ) THEN
      ALTER TABLE profiles
        ADD CONSTRAINT profiles_major_id_fkey
        FOREIGN KEY (major_id) REFERENCES majors(id)
        ON UPDATE CASCADE ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_major_id ON profiles(major_id);

-- Add comment
COMMENT ON COLUMN profiles.major_id IS 'Foreign key to majors table - the user''s major/track';

COMMIT;

