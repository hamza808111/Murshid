-- Fix for views count increment
-- This creates an RPC function with SECURITY DEFINER that bypasses RLS
-- allowing any user to increment the views count

BEGIN;

-- Create the increment_post_views function with SECURITY DEFINER
-- This allows any authenticated user to increment views, bypassing RLS
CREATE OR REPLACE FUNCTION increment_post_views(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE community_posts
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = p_post_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO authenticated;

-- Also grant to anon for non-logged-in users viewing posts
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO anon;

COMMIT;

