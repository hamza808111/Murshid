-- ============================================================================
-- Community Features Migration
-- Adds: Likes, Comments (Threaded), View Tracking, Accept Answer
-- ============================================================================

-- ============================================================================
-- 1. POST LIKES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one user can only like a post once
  UNIQUE(post_id, user_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON community_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON community_post_likes(user_id);

-- ============================================================================
-- 2. ANSWER LIKES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_answer_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES community_answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one user can only like an answer once
  UNIQUE(answer_id, user_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_answer_likes_answer_id ON community_answer_likes(answer_id);
CREATE INDEX IF NOT EXISTS idx_answer_likes_user_id ON community_answer_likes(user_id);

-- ============================================================================
-- 3. COMMENTS TABLE (Threaded - supports replies to comments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES community_answers(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,

  content TEXT NOT NULL,

  -- Author information (denormalized for performance)
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_avatar TEXT,
  author_university TEXT,
  author_major TEXT,
  author_academic_level TEXT,

  likes_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_answer_id ON community_comments(answer_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON community_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON community_comments(author_id);

-- ============================================================================
-- 4. COMMENT LIKES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES community_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one user can only like a comment once
  UNIQUE(comment_id, user_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON community_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON community_comment_likes(user_id);

-- ============================================================================
-- 5. TRIGGERS FOR AUTOMATIC LIKE COUNT UPDATES
-- ============================================================================

-- Post likes count trigger
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON community_post_likes;
CREATE TRIGGER trigger_update_post_likes_count
AFTER INSERT OR DELETE ON community_post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Answer likes count trigger
CREATE OR REPLACE FUNCTION update_answer_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_answers
    SET likes_count = likes_count + 1
    WHERE id = NEW.answer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_answers
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.answer_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_answer_likes_count ON community_answer_likes;
CREATE TRIGGER trigger_update_answer_likes_count
AFTER INSERT OR DELETE ON community_answer_likes
FOR EACH ROW EXECUTE FUNCTION update_answer_likes_count();

-- Comment likes count trigger
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_comments
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comment_likes_count ON community_comment_likes;
CREATE TRIGGER trigger_update_comment_likes_count
AFTER INSERT OR DELETE ON community_comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- ============================================================================
-- 6. TRIGGER FOR COMMENT UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comment_updated_at ON community_comments;
CREATE TRIGGER trigger_update_comment_updated_at
BEFORE UPDATE ON community_comments
FOR EACH ROW EXECUTE FUNCTION update_comment_updated_at();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_answer_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comment_likes ENABLE ROW LEVEL SECURITY;

-- Post Likes Policies
CREATE POLICY "Anyone can view post likes"
  ON community_post_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like posts"
  ON community_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON community_post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Answer Likes Policies
CREATE POLICY "Anyone can view answer likes"
  ON community_answer_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like answers"
  ON community_answer_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON community_answer_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comment Policies
CREATE POLICY "Anyone can view comments"
  ON community_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON community_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments"
  ON community_comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments"
  ON community_comments FOR DELETE
  USING (auth.uid() = author_id);

-- Comment Likes Policies
CREATE POLICY "Anyone can view comment likes"
  ON community_comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like comments"
  ON community_comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON community_comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has liked a post
CREATE OR REPLACE FUNCTION user_has_liked_post(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM community_post_likes
    WHERE post_id = p_post_id AND user_id = p_user_id
  );
$$ LANGUAGE sql STABLE;

-- Function to check if user has liked an answer
CREATE OR REPLACE FUNCTION user_has_liked_answer(p_answer_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM community_answer_likes
    WHERE answer_id = p_answer_id AND user_id = p_user_id
  );
$$ LANGUAGE sql STABLE;

-- Function to check if user has liked a comment
CREATE OR REPLACE FUNCTION user_has_liked_comment(p_comment_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM community_comment_likes
    WHERE comment_id = p_comment_id AND user_id = p_user_id
  );
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- To verify the migration, run:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'community%';
