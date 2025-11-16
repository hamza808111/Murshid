-- Community report table and policies
-- Run this in Supabase SQL editor

-- Helper (idempotent) to keep updated_at current
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'answer')),
    target_id UUID NOT NULL,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reporter_name TEXT,
    reason TEXT NOT NULL,
    target_title TEXT,
    target_excerpt TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_reports_target ON community_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_status ON community_reports(status);

-- RLS
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

-- Reporter can view their own reports
CREATE POLICY "Reporters can view their reports"
    ON community_reports FOR SELECT
    USING (auth.uid() = reporter_id);

-- Reporter can insert
CREATE POLICY "Users can create reports"
    ON community_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
    ON community_reports FOR SELECT
    USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE));

-- Admins can update reports
CREATE POLICY "Admins can manage reports"
    ON community_reports FOR ALL
    USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_community_reports_updated_at ON community_reports;
CREATE TRIGGER update_community_reports_updated_at
    BEFORE UPDATE ON community_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
