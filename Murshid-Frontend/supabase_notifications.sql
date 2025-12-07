-- Notifications system for community interactions
-- Run this script in Supabase SQL editor to provision the notifications feature

BEGIN;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('answer', 'comment', 'reply')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    related_answer_id UUID REFERENCES community_answers(id) ON DELETE CASCADE,
    related_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name TEXT,
    actor_avatar TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- System can create notifications (via triggers)
CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

-- Function to create notification for answer
CREATE OR REPLACE FUNCTION notify_post_author_on_answer()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    post_title TEXT;
    actor_name TEXT;
    actor_avatar TEXT;
BEGIN
    -- Get post author and title
    SELECT author_id, title INTO post_author_id, post_title
    FROM community_posts
    WHERE id = NEW.post_id;

    -- Get actor info
    SELECT name, avatar_url INTO actor_name, actor_avatar
    FROM profiles
    WHERE id = NEW.author_id;

    -- Don't notify if user is answering their own post
    IF post_author_id != NEW.author_id THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            related_post_id,
            related_answer_id,
            actor_id,
            actor_name,
            actor_avatar
        ) VALUES (
            post_author_id,
            'answer',
            CASE 
                WHEN post_title IS NOT NULL THEN 
                    'New answer on your ' || (SELECT post_type FROM community_posts WHERE id = NEW.post_id) || ': ' || LEFT(post_title, 50)
                ELSE 
                    'New answer on your post'
            END,
            COALESCE(actor_name, NEW.author_name, 'Someone') || ' answered your ' || 
            (SELECT post_type FROM community_posts WHERE id = NEW.post_id),
            NEW.post_id,
            NEW.id,
            NEW.author_id,
            COALESCE(actor_name, NEW.author_name, 'Anonymous'),
            COALESCE(actor_avatar, NEW.author_avatar)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for comment
CREATE OR REPLACE FUNCTION notify_answer_author_on_comment()
RETURNS TRIGGER AS $$
DECLARE
    answer_author_id UUID;
    post_author_id UUID;
    post_id UUID;
    post_title TEXT;
    actor_name TEXT;
    actor_avatar TEXT;
BEGIN
    -- Get answer author and post info
    SELECT a.author_id, a.post_id, p.author_id, p.title 
    INTO answer_author_id, post_id, post_author_id, post_title
    FROM community_answers a
    JOIN community_posts p ON p.id = a.post_id
    WHERE a.id = NEW.answer_id;

    -- Get actor info
    SELECT name, avatar_url INTO actor_name, actor_avatar
    FROM profiles
    WHERE id = NEW.author_id;

    -- Notify answer author if different from comment author
    IF answer_author_id IS NOT NULL AND answer_author_id != NEW.author_id THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            related_post_id,
            related_answer_id,
            related_comment_id,
            actor_id,
            actor_name,
            actor_avatar
        ) VALUES (
            answer_author_id,
            'comment',
            CASE 
                WHEN post_title IS NOT NULL THEN 
                    'New comment on your answer: ' || LEFT(post_title, 50)
                ELSE 
                    'New comment on your answer'
            END,
            COALESCE(actor_name, NEW.author_name, 'Someone') || ' commented on your answer',
            post_id,
            NEW.answer_id,
            NEW.id,
            NEW.author_id,
            COALESCE(actor_name, NEW.author_name, 'Anonymous'),
            COALESCE(actor_avatar, NEW.author_avatar)
        );
    END IF;

    -- Also notify post author if different from comment author and answer author
    IF post_author_id IS NOT NULL 
       AND post_author_id != NEW.author_id 
       AND post_author_id != answer_author_id THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            related_post_id,
            related_answer_id,
            related_comment_id,
            actor_id,
            actor_name,
            actor_avatar
        ) VALUES (
            post_author_id,
            'comment',
            CASE 
                WHEN post_title IS NOT NULL THEN 
                    'New comment on ' || (SELECT post_type FROM community_posts WHERE id = post_id) || ': ' || LEFT(post_title, 50)
                ELSE 
                    'New comment on your post'
            END,
            COALESCE(actor_name, NEW.author_name, 'Someone') || ' commented on an answer to your ' || 
            (SELECT post_type FROM community_posts WHERE id = post_id),
            post_id,
            NEW.answer_id,
            NEW.id,
            NEW.author_id,
            COALESCE(actor_name, NEW.author_name, 'Anonymous'),
            COALESCE(actor_avatar, NEW.author_avatar)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for reply to comment
CREATE OR REPLACE FUNCTION notify_comment_author_on_reply()
RETURNS TRIGGER AS $$
DECLARE
    parent_comment_author_id UUID;
    post_id UUID;
    post_title TEXT;
    actor_name TEXT;
    actor_avatar TEXT;
BEGIN
    -- Only process if this is a reply (has parent_comment_id)
    IF NEW.parent_comment_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Get parent comment author and post info
    SELECT c.author_id, a.post_id, p.title
    INTO parent_comment_author_id, post_id, post_title
    FROM community_comments c
    JOIN community_answers a ON a.id = c.answer_id
    JOIN community_posts p ON p.id = a.post_id
    WHERE c.id = NEW.parent_comment_id;

    -- Get actor info
    SELECT name, avatar_url INTO actor_name, actor_avatar
    FROM profiles
    WHERE id = NEW.author_id;

    -- Notify parent comment author if different from reply author
    IF parent_comment_author_id IS NOT NULL AND parent_comment_author_id != NEW.author_id THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            related_post_id,
            related_answer_id,
            related_comment_id,
            actor_id,
            actor_name,
            actor_avatar
        ) VALUES (
            parent_comment_author_id,
            'reply',
            CASE 
                WHEN post_title IS NOT NULL THEN 
                    'New reply to your comment: ' || LEFT(post_title, 50)
                ELSE 
                    'New reply to your comment'
            END,
            COALESCE(actor_name, NEW.author_name, 'Someone') || ' replied to your comment',
            post_id,
            NEW.answer_id,
            NEW.id,
            NEW.author_id,
            COALESCE(actor_name, NEW.author_name, 'Anonymous'),
            COALESCE(actor_avatar, NEW.author_avatar)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_on_answer ON community_answers;
CREATE TRIGGER trigger_notify_on_answer
    AFTER INSERT ON community_answers
    FOR EACH ROW
    WHEN (NEW.is_deleted = FALSE)
    EXECUTE FUNCTION notify_post_author_on_answer();

DROP TRIGGER IF EXISTS trigger_notify_on_comment ON community_comments;
CREATE TRIGGER trigger_notify_on_comment
    AFTER INSERT ON community_comments
    FOR EACH ROW
    WHEN (NEW.is_deleted = FALSE AND NEW.parent_comment_id IS NULL)
    EXECUTE FUNCTION notify_answer_author_on_comment();

DROP TRIGGER IF EXISTS trigger_notify_on_reply ON community_comments;
CREATE TRIGGER trigger_notify_on_reply
    AFTER INSERT ON community_comments
    FOR EACH ROW
    WHEN (NEW.is_deleted = FALSE AND NEW.parent_comment_id IS NOT NULL)
    EXECUTE FUNCTION notify_comment_author_on_reply();

COMMIT;

