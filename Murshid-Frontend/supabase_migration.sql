-- Add establishment_name and level columns to profiles table
-- Run this in your Supabase SQL editor

ALTER TABLE profiles 
ADD COLUMN establishment_name TEXT,
ADD COLUMN level TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN profiles.establishment_name IS 'Name of the educational institution (high school or university)';
COMMENT ON COLUMN profiles.level IS 'Current academic level or year of study';

-- Optional: Add constraints if needed
-- ALTER TABLE profiles ADD CONSTRAINT check_level CHECK (level IN ('1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate', 'Other'));
