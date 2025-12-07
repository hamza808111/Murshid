import { supabase } from './supabase';
import type { UserStats, Badge, PointsHistory, LeaderboardEntry, LevelInfo } from '@/types/gamification';

/**
 * Get user's gamification stats
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const { data, error } = await supabase
    .from('profiles')
    .select('points, gamification_level, current_streak, longest_streak, total_posts, total_answers, total_comments, total_likes_received, accepted_answers_count')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }

  return {
    points: data.points || 0,
    level: data.gamification_level || 1,
    current_streak: data.current_streak || 0,
    longest_streak: data.longest_streak || 0,
    total_posts: data.total_posts || 0,
    total_answers: data.total_answers || 0,
    total_comments: data.total_comments || 0,
    total_likes_received: data.total_likes_received || 0,
    accepted_answers_count: data.accepted_answers_count || 0,
  };
}

/**
 * Get user's badges
 */
export async function getUserBadges(userId: string): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('Error fetching user badges:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get user's points history
 */
export async function getUserPointsHistory(userId: string, limit: number = 50): Promise<PointsHistory[]> {
  const { data, error } = await supabase
    .from('points_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching points history:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
  // Get top users by points
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, points, gamification_level')
    .order('points', { ascending: false })
    .limit(limit);

  if (profilesError) {
    console.error('Error fetching leaderboard:', profilesError);
    throw profilesError;
  }

  if (!profiles || profiles.length === 0) {
    return [];
  }

  // Get badge counts for each user
  const userIds = profiles.map(p => p.id);
  const { data: badges } = await supabase
    .from('user_badges')
    .select('user_id')
    .in('user_id', userIds);

  // Count badges per user
  const badgeCounts = new Map<string, number>();
  badges?.forEach(badge => {
    badgeCounts.set(badge.user_id, (badgeCounts.get(badge.user_id) || 0) + 1);
  });

  // Build leaderboard entries
  return profiles.map((profile, index) => ({
    user_id: profile.id,
    user_name: profile.name || 'Anonymous',
    user_avatar: profile.avatar_url || undefined,
    points: profile.points || 0,
    level: profile.gamification_level || 1,
    rank: index + 1,
    badges_count: badgeCounts.get(profile.id) || 0,
  }));
}

/**
 * Calculate level info from points
 */
export function calculateLevelInfo(points: number): LevelInfo {
  const currentLevel = Math.max(1, Math.floor(Math.sqrt(points / 100.0)) + 1);
  const pointsForCurrentLevel = Math.pow((currentLevel - 1), 2) * 100;
  const pointsForNextLevel = Math.pow(currentLevel, 2) * 100;
  const pointsInCurrentLevel = points - pointsForCurrentLevel;
  const pointsNeededForNext = pointsForNextLevel - pointsForCurrentLevel;
  const progressPercentage = Math.min(100, (pointsInCurrentLevel / pointsNeededForNext) * 100);

  return {
    current_level: currentLevel,
    current_points: points,
    points_for_current_level: pointsForCurrentLevel,
    points_for_next_level: pointsForNextLevel,
    progress_percentage: progressPercentage,
  };
}

/**
 * Award points for receiving a like (called from API when like is created)
 */
export async function awardLikePoints(userId: string, relatedId: string, contentType: 'post' | 'answer' | 'comment'): Promise<void> {
  try {
    const { error } = await supabase.rpc('award_points', {
      p_user_id: userId,
      p_points: 2, // 2 points for receiving a like
      p_action_type: `${contentType}_liked`,
      p_action_description: `Received a like on ${contentType}`,
      p_related_id: relatedId,
    });

    if (error) {
      console.error('Error awarding like points:', error);
      // Fallback: manually update points if RPC fails
      const { data: profile } = await supabase
        .from('profiles')
        .select('points, total_likes_received')
        .eq('id', userId)
        .single();
      
      if (profile) {
        await supabase
          .from('profiles')
          .update({
            points: (profile.points || 0) + 2,
            total_likes_received: (profile.total_likes_received || 0) + 1,
          })
          .eq('id', userId);
      }
    } else {
      // Update likes received count
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_likes_received')
        .eq('id', userId)
        .single();
      
      if (profile) {
        await supabase
          .from('profiles')
          .update({ total_likes_received: (profile.total_likes_received || 0) + 1 })
          .eq('id', userId);
      }
    }
  } catch (err) {
    console.error('Error in awardLikePoints:', err);
    // Don't throw - gamification is not critical
  }
}

