import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserBookmarks, 
  isBookmarked, 
  toggleBookmark as toggleBookmarkApi,
  getBookmarkedUniversities,
  getBookmarkedMajors
} from '@/lib/bookmarksApi';
import type { BookmarkType, University, Major } from '@/types/database';
import { toast } from 'sonner';

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarkedUniversities, setBookmarkedUniversities] = useState<University[]>([]);
  const [bookmarkedMajors, setBookmarkedMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all bookmarks
  const fetchBookmarks = async () => {
    if (!user || user.id === 'guest') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [universities, majors] = await Promise.all([
        getBookmarkedUniversities(user.id),
        getBookmarkedMajors(user.id)
      ]);
      setBookmarkedUniversities(universities);
      setBookmarkedMajors(majors);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  // Toggle bookmark
  const toggleBookmark = async (itemType: BookmarkType, itemId: string) => {
    if (!user || user.id === 'guest') {
      toast.error('Please log in to bookmark items');
      return false;
    }

    try {
      const newState = await toggleBookmarkApi(user.id, itemType, itemId);
      
      // Update local state
      if (itemType === 'university') {
        if (newState) {
          toast.success('University bookmarked!');
        } else {
          setBookmarkedUniversities(prev => prev.filter(u => u.id !== itemId));
          toast.success('University removed from bookmarks');
        }
      } else {
        if (newState) {
          toast.success('Major bookmarked!');
        } else {
          setBookmarkedMajors(prev => prev.filter(m => m.id !== itemId));
          toast.success('Major removed from bookmarks');
        }
      }

      // Refresh bookmarks
      await fetchBookmarks();
      return newState;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
      return false;
    }
  };

  // Check if item is bookmarked
  const checkIsBookmarked = (itemType: BookmarkType, itemId: string): boolean => {
    if (itemType === 'university') {
      return bookmarkedUniversities.some(u => u.id === itemId);
    } else {
      return bookmarkedMajors.some(m => m.id === itemId);
    }
  };

  return {
    bookmarkedUniversities,
    bookmarkedMajors,
    loading,
    toggleBookmark,
    isBookmarked: checkIsBookmarked,
    refreshBookmarks: fetchBookmarks
  };
}

// Hook for checking if a single item is bookmarked
export function useIsBookmarked(itemType: BookmarkType, itemId: string) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBookmark = async () => {
      if (!user || user.id === 'guest') {
        setBookmarked(false);
        setLoading(false);
        return;
      }

      try {
        const result = await isBookmarked(user.id, itemType, itemId);
        setBookmarked(result);
      } catch (error) {
        console.error('Error checking bookmark:', error);
      } finally {
        setLoading(false);
      }
    };

    checkBookmark();
  }, [user, itemType, itemId]);

  return { bookmarked, loading };
}

