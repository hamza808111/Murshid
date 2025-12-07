export interface UserStats {
  points: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  total_posts: number;
  total_answers: number;
  total_comments: number;
  total_likes_received: number;
  accepted_answers_count: number;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  badge_description?: string;
  badge_icon?: string;
  unlocked_at: string;
}

export interface PointsHistory {
  id: string;
  user_id: string;
  points: number;
  action_type: string;
  action_description?: string;
  related_id?: string;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  points: number;
  level: number;
  rank: number;
  badges_count: number;
}

export interface LevelInfo {
  current_level: number;
  current_points: number;
  points_for_current_level: number;
  points_for_next_level: number;
  progress_percentage: number;
}

