-- Fix script for gamification level column conflict
-- Run this if you already ran the old gamification.sql and got the error
-- This script renames the gamification level column to avoid conflict with existing 'level' column

BEGIN;

-- Check if the problematic column exists and rename it
DO $$
BEGIN
    -- Check if 'level' column exists as INTEGER (gamification column)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'level' 
        AND data_type = 'integer'
    ) THEN
        -- Rename the gamification level column
        ALTER TABLE profiles RENAME COLUMN level TO gamification_level;
        
        -- Update the index
        DROP INDEX IF EXISTS idx_profiles_level;
        CREATE INDEX IF NOT EXISTS idx_profiles_gamification_level ON profiles(gamification_level DESC);
    END IF;
    
    -- Ensure gamification_level column exists (in case it doesn't)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'gamification_level'
    ) THEN
        ALTER TABLE profiles ADD COLUMN gamification_level INTEGER DEFAULT 1;
        CREATE INDEX IF NOT EXISTS idx_profiles_gamification_level ON profiles(gamification_level DESC);
    END IF;
END $$;

-- Update the award_points function to use gamification_level
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
    SELECT COALESCE(gamification_level, 1) INTO old_level FROM profiles WHERE id = p_user_id;
    
    -- Update points
    UPDATE profiles
    SET points = COALESCE(points, 0) + p_points
    WHERE id = p_user_id;
    
    -- Calculate new level
    SELECT calculate_level(COALESCE(points, 0)) INTO new_level
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

-- Update the check_and_award_badges function
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
    SELECT COALESCE(points, 0), COALESCE(total_posts, 0), COALESCE(total_answers, 0), COALESCE(total_comments, 0), 
           COALESCE(total_likes_received, 0), COALESCE(accepted_answers_count, 0), COALESCE(gamification_level, 1)
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
    IF (SELECT COALESCE(current_streak, 0) FROM profiles WHERE id = p_user_id) >= 7 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'streak_7', 'Dedicated', '7 day activity streak', '🔥')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    -- 30 Day Streak
    IF (SELECT COALESCE(current_streak, 0) FROM profiles WHERE id = p_user_id) >= 30 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
        VALUES (p_user_id, 'streak_30', 'Unstoppable', '30 day activity streak', '⚡')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

