import { supabase } from "./supabase";
import type { Bookmark, BookmarkType } from "@/types/database";

// Get all bookmarks for the current user
export async function getUserBookmarks(userId: string): Promise<Bookmark[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookmarks:', error);
    throw error;
  }

  return data || [];
}

// Check if an item is bookmarked
export async function isBookmarked(
  userId: string, 
  itemType: BookmarkType, 
  itemId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .maybeSingle();

  if (error) {
    console.error('Error checking bookmark:', error);
    return false;
  }

  return !!data;
}

// Add a bookmark
export async function addBookmark(
  userId: string,
  itemType: BookmarkType,
  itemId: string,
  notes?: string
): Promise<Bookmark> {
  const { data, error } = await supabase
    .from('bookmarks')
    .insert([{
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      notes
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding bookmark:', error);
    throw error;
  }

  return data;
}

// Remove a bookmark
export async function removeBookmark(
  userId: string,
  itemType: BookmarkType,
  itemId: string
): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId);

  if (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
}

// Toggle bookmark (add if not exists, remove if exists)
export async function toggleBookmark(
  userId: string,
  itemType: BookmarkType,
  itemId: string
): Promise<boolean> {
  const bookmarked = await isBookmarked(userId, itemType, itemId);

  if (bookmarked) {
    await removeBookmark(userId, itemType, itemId);
    return false;
  } else {
    await addBookmark(userId, itemType, itemId);
    return true;
  }
}

// Get bookmarked universities for a user
export async function getBookmarkedUniversities(userId: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      *,
      university:universities(*)
    `)
    .eq('user_id', userId)
    .eq('item_type', 'university');

  if (error) {
    console.error('Error fetching bookmarked universities:', error);
    throw error;
  }

  return data?.map(item => item.university) || [];
}

// Get bookmarked majors for a user
export async function getBookmarkedMajors(userId: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      *,
      major:majors(*)
    `)
    .eq('user_id', userId)
    .eq('item_type', 'major');

  if (error) {
    console.error('Error fetching bookmarked majors:', error);
    throw error;
  }

  return data?.map(item => item.major) || [];
}

