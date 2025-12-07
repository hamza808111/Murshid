-- Gamification System for Murshid Community
-- Run this script in Supabase SQL editor to provision the gamification feature

BEGIN;

-- Add gamification columns to profiles table
-- Note: Using 'gamification_level' instead of 'level' to avoid conflict with existing 'level' column (academic level)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gamification_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS total_posts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_answers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_comments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_likes_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS accepted_answers_count INTEGER DEFAULT 0;

-- Create badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    badge_description TEXT,
    badge_icon TEXT,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_type)
);

-- Create points history table (for tracking and transparency)
CREATE TABLE IF NOT EXISTS points_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    action_description TEXT,
    related_id UUID, -- ID of the post/answer/comment that triggered the points
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_gamification_level ON profiles(gamification_level DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON points_history(created_at DESC);

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges"
    ON user_badges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view all badges (for leaderboard)"
    ON user_badges FOR SELECT
    USING (true);

-- RLS Policies for points_history
CREATE POLICY "Users can view their own points history"
    ON points_history FOR SELECT
    USING (auth.uid() = user_id);

-- Function to calculate level from points
CREATE OR REPLACE FUNCTION calculate_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Level formula: sqrt(points / 100) + 1, minimum level 1
    RETURN GREATEST(1, FLOOR(SQRT(points / 100.0)) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to award points and update level
CREATE OR REPLACE FUNCTION award_points(
    p_user_id UUID,
    p_points INTEGER,
    p_action_type TEXT,
    p_action_description TEXT DEFAULT NULL,
    p_related_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    new_level INTEGER;
    old_level INTEGER;
BEGIN
    -- Get current level
    SELECT gamification_level INTO old_level FROM profiles WHERE id = p_user_id;
    
    -- Update points
    UPDATE profiles
    SET points = points + p_points
    WHERE id = p_user_id;
    
    -- Calculate new level
    SELECT calculate_level(points) INTO new_level
    FROM profiles
    WHERE id = p_user_id;
    
    -- Update level if changed
    IF new_level > old_level THEN
        UPDATE profiles
        SET gamification_level = new_level
        WHERE id = p_user_id;
    END IF;
    
    -- Record in points history
    INSERT INTO points_history (user_id, points, action_type, action_description, related_id)
    VALUES (p_user_id, p_points, p_action_type, p_action_description, p_related_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    user_points INTEGER;
    user_posts INTEGER;
    user_answers INTEGER;
    user_comments INTEGER;
    user_likes INTEGER;
    user_accepted INTEGER;
    user_level INTEGER;
BEGIN
    -- Get user stats
    SELECT points, total_posts, total_answers, total_comments, 
           total_likes_received, accepted_answers_count, gamification_level
    INTO user_points, user_posts, user_answers, user_comments, 
         user_likes, user_accepted, user_level
    FROM profiles
    WHERE id = p_user_id;
    
    -- Badge definitions (check and award if not already awarded)
    
    -- First Post
    IF user_posts >= 1 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'first_post', 'First Post', 'Created your first post', '📝')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    -- First Answer
    IF user_answers >= 1 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'first_answer', 'Helper', 'Answered your first question', '💡')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    -- 10 Posts
    IF user_posts >= 10 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'posts_10', 'Active Member', 'Created 10 posts', '📚')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    -- 50 Posts
    IF user_posts >= 50 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'posts_50', 'Community Leader', 'Created 50 posts', '👑')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    -- 10 Answers
    IF user_answers >= 10 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'answers_10', 'Helpful', 'Answered 10 questions', '🤝')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    -- 50 Answers
    IF user_answers >= 50 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'answers_50', 'Expert Helper', 'Answered 50 questions', '⭐')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    -- Accepted Answer
    IF user_accepted >= 1 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'accepted_answer', 'Best Answer', 'Got your first accepted answer', '✅')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    -- 10 Accepted Answers
    IF user_accepted >= 10 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'accepted_10', 'Trusted Expert', 'Got 10 accepted answers', '🏆')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    -- 100 Likes Received
    IF user_likes >= 100 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'likes_100', 'Popular', 'Received 100 likes', '❤️')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    -- Level 5
    IF user_level >= 5 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'level_5', 'Rising Star', 'Reached level 5', '🌟')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    -- Level 10
    IF user_level >= 10 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'level_10', 'Veteran', 'Reached level 10', '💎')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    -- 1000 Points
    IF user_points >= 1000 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'points_1000', 'Milestone', 'Earned 1000 points', '🎯')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    -- 7 Day Streak
    IF (SELECT current_streak FROM profiles WHERE id = p_user_id) >= 7 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'streak_7', 'Dedicated', '7 day activity streak', '🔥')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    -- 30 Day Streak
    IF (SELECT current_streak FROM profiles WHERE id = p_user_id) >= 30 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'streak_30', 'Unstoppable', '30 day activity streak', '⚡')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update daily streak
CREATE OR REPLACE FUNCTION update_daily_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    last_date DATE;
    current_date DATE := CURRENT_DATE;
    current_streak_val INTEGER;
BEGIN
    SELECT last_activity_date, current_streak
    INTO last_date, current_streak_val
    FROM profiles
    WHERE id = p_user_id;
    
    -- If first activity or streak broken
    IF last_date IS NULL OR last_date < current_date - INTERVAL '1 day' THEN
        -- Reset streak if more than 1 day gap
        IF last_date IS NOT NULL AND last_date < current_date - INTERVAL '1 day' THEN
            UPDATE profiles
            SET current_streak = 1,
                last_activity_date = current_date
            WHERE id = p_user_id;
        ELSE
            -- First activity
            UPDATE profiles
            SET current_streak = 1,
                last_activity_date = current_date
            WHERE id = p_user_id;
        END IF;
    ELSIF last_date = current_date THEN
        -- Already updated today, do nothing
        RETURN;
    ELSE
        -- Consecutive day
        UPDATE profiles
        SET current_streak = current_streak + 1,
            last_activity_date = current_date,
            longest_streak = GREATEST(longest_streak, current_streak + 1)
        WHERE id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to award points when post is created
CREATE OR REPLACE FUNCTION trigger_award_post_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Award points for creating a post (only if approved or student)
    IF NEW.approval_status = 'approved' OR NEW.author_role = 'student' THEN
        PERFORM award_points(
            NEW.author_id,
            10, -- 10 points for creating a post
            'post_created',
            'Created a post',
            NEW.id
        );
        
        -- Update post count
        UPDATE profiles
        SET total_posts = total_posts + 1
        WHERE id = NEW.author_id;
        
        -- Update streak
        PERFORM update_daily_streak(NEW.author_id);
        
        -- Check badges
        PERFORM check_and_award_badges(NEW.author_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_post_points ON community_posts;
CREATE TRIGGER trigger_post_points
    AFTER INSERT ON community_posts
    FOR EACH ROW
    WHEN (NEW.is_deleted = FALSE)
    EXECUTE FUNCTION trigger_award_post_points();

-- Trigger to award points when post is approved (for specialists)
CREATE OR REPLACE FUNCTION trigger_award_approval_points()
RETURNS TRIGGER AS $$
BEGIN
    -- If post was just approved and was previously pending
    IF NEW.approval_status = 'approved' AND OLD.approval_status = 'pending' THEN
        PERFORM award_points(
            NEW.author_id,
            10, -- 10 points for post approval
            'post_approved',
            'Post was approved',
            NEW.id
        );
        
        -- Update post count
        UPDATE profiles
        SET total_posts = total_posts + 1
        WHERE id = NEW.author_id;
        
        -- Update streak
        PERFORM update_daily_streak(NEW.author_id);
        
        -- Check badges
        PERFORM check_and_award_badges(NEW.author_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_approval_points ON community_posts;
CREATE TRIGGER trigger_approval_points
    AFTER UPDATE ON community_posts
    FOR EACH ROW
    WHEN (NEW.approval_status = 'approved' AND OLD.approval_status = 'pending')
    EXECUTE FUNCTION trigger_award_approval_points();

-- Trigger to award points when answer is created
CREATE OR REPLACE FUNCTION trigger_award_answer_points()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM award_points(
        NEW.author_id,
        15, -- 15 points for answering
        'answer_created',
        'Answered a question',
        NEW.id
    );
    
    -- Update answer count
    UPDATE profiles
    SET total_answers = total_answers + 1
    WHERE id = NEW.author_id;
    
    -- Update streak
    PERFORM update_daily_streak(NEW.author_id);
    
    -- Check badges
    PERFORM check_and_award_badges(NEW.author_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_answer_points ON community_answers;
CREATE TRIGGER trigger_answer_points
    AFTER INSERT ON community_answers
    FOR EACH ROW
    WHEN (NEW.is_deleted = FALSE)
    EXECUTE FUNCTION trigger_award_answer_points();

-- Trigger to award points when answer is accepted
CREATE OR REPLACE FUNCTION trigger_award_accepted_points()
RETURNS TRIGGER AS $$
BEGIN
    -- If answer was just accepted
    IF NEW.is_accepted = TRUE AND (OLD.is_accepted = FALSE OR OLD IS NULL) THEN
        PERFORM award_points(
            NEW.author_id,
            25, -- 25 points for accepted answer
            'answer_accepted',
            'Answer was accepted',
            NEW.id
        );
        
        -- Update accepted answers count
        UPDATE profiles
        SET accepted_answers_count = accepted_answers_count + 1
        WHERE id = NEW.author_id;
        
        -- Check badges
        PERFORM check_and_award_badges(NEW.author_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_accepted_points ON community_answers;
CREATE TRIGGER trigger_accepted_points
    AFTER UPDATE ON community_answers
    FOR EACH ROW
    WHEN (NEW.is_accepted = TRUE AND (OLD.is_accepted = FALSE OR OLD IS NULL))
    EXECUTE FUNCTION trigger_award_accepted_points();

-- Trigger to award points when comment is created
CREATE OR REPLACE FUNCTION trigger_award_comment_points()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM award_points(
        NEW.author_id,
        5, -- 5 points for commenting
        'comment_created',
        'Commented on an answer',
        NEW.id
    );
    
    -- Update comment count
    UPDATE profiles
    SET total_comments = total_comments + 1
    WHERE id = NEW.author_id;
    
    -- Update streak
    PERFORM update_daily_streak(NEW.author_id);
    
    -- Check badges
    PERFORM check_and_award_badges(NEW.author_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_comment_points ON community_comments;
CREATE TRIGGER trigger_comment_points
    AFTER INSERT ON community_comments
    FOR EACH ROW
    WHEN (NEW.is_deleted = FALSE)
    EXECUTE FUNCTION trigger_award_comment_points();

-- Trigger to award points when post/answer/comment receives a like
-- Note: This requires tracking likes, which we'll handle via API

COMMIT;

