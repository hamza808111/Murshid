# Gamification System Implementation

## Overview
A comprehensive gamification system to encourage user participation, sharing experiences, and interaction in the Murshid community platform.

## Features

### 1. Points System
Users earn points for various community activities:
- **Creating a post**: 10 points
- **Answering a question**: 15 points
- **Commenting**: 5 points
- **Receiving a like**: 2 points
- **Accepted answer**: 25 points

### 2. Levels
Users progress through levels based on their total points:
- **Formula**: `Level = floor(sqrt(points / 100)) + 1`
- Levels are automatically calculated and updated
- Visual progress bar shows progress to next level

### 3. Badges/Achievements
Users unlock badges for milestones:
- **First Post** 📝 - Created your first post
- **Helper** 💡 - Answered your first question
- **Active Member** 📚 - Created 10 posts
- **Community Leader** 👑 - Created 50 posts
- **Helpful** 🤝 - Answered 10 questions
- **Expert Helper** ⭐ - Answered 50 questions
- **Best Answer** ✅ - Got your first accepted answer
- **Trusted Expert** 🏆 - Got 10 accepted answers
- **Popular** ❤️ - Received 100 likes
- **Rising Star** 🌟 - Reached level 5
- **Veteran** 💎 - Reached level 10
- **Milestone** 🎯 - Earned 1000 points
- **Dedicated** 🔥 - 7 day activity streak
- **Unstoppable** ⚡ - 30 day activity streak

### 4. Daily Streaks
- Tracks consecutive days of activity
- Resets if user misses a day
- Tracks both current and longest streak
- Awards badges for streak milestones

### 5. Leaderboard
- Shows top users by points
- Displays rank, name, avatar, points, level, and badge count
- Updates in real-time

### 6. Statistics Tracking
Tracks comprehensive user statistics:
- Total posts created
- Total answers given
- Total comments made
- Total likes received
- Accepted answers count

## Database Schema

### New Columns in `profiles` table:
- `points` (INTEGER) - Total points earned
- `level` (INTEGER) - Current level
- `current_streak` (INTEGER) - Current daily streak
- `longest_streak` (INTEGER) - Longest streak achieved
- `last_activity_date` (DATE) - Last activity date for streak tracking
- `total_posts` (INTEGER) - Total posts created
- `total_answers` (INTEGER) - Total answers given
- `total_comments` (INTEGER) - Total comments made
- `total_likes_received` (INTEGER) - Total likes received
- `accepted_answers_count` (INTEGER) - Accepted answers count

### New Tables:

1. **`user_badges`** - Stores unlocked badges
   - `user_id`, `badge_type`, `badge_name`, `badge_description`, `badge_icon`, `unlocked_at`

2. **`points_history`** - Tracks all point transactions
   - `user_id`, `points`, `action_type`, `action_description`, `related_id`, `created_at`

## Automatic Point Awards

Points are automatically awarded via database triggers:
- **Post Created**: When a post is created (or approved for specialists)
- **Answer Created**: When an answer is submitted
- **Comment Created**: When a comment is posted
- **Answer Accepted**: When an answer is marked as accepted
- **Like Received**: When content receives a like (via API)

## Implementation Files

### Database
- `supabase_gamification.sql` - Complete database schema and triggers

### Types
- `src/types/gamification.ts` - TypeScript interfaces

### API
- `src/lib/gamificationApi.ts` - API functions for gamification

### Integration
- `src/lib/communityApi.ts` - Updated like functions to award points

## Usage

### Getting User Stats
```typescript
import { getUserStats } from '@/lib/gamificationApi';
const stats = await getUserStats(userId);
```

### Getting User Badges
```typescript
import { getUserBadges } from '@/lib/gamificationApi';
const badges = await getUserBadges(userId);
```

### Getting Leaderboard
```typescript
import { getLeaderboard } from '@/lib/gamificationApi';
const leaderboard = await getLeaderboard(100); // Top 100
```

### Calculating Level Info
```typescript
import { calculateLevelInfo } from '@/lib/gamificationApi';
const levelInfo = calculateLevelInfo(points);
```

## Next Steps

1. **Run Database Migration**: Execute `supabase_gamification.sql` in Supabase SQL editor
2. **Create UI Components**: 
   - Points display component
   - Badges display component
   - Leaderboard page
   - Level progress bar
3. **Integrate into Profile**: Show stats, badges, and level
4. **Add to Navbar**: Quick stats display
5. **Create Leaderboard Page**: Full leaderboard view

## Points Breakdown

| Action | Points | Description |
|--------|--------|-------------|
| Create Post | 10 | Encourages content creation |
| Answer Question | 15 | Rewards helpful responses |
| Comment | 5 | Encourages discussion |
| Receive Like | 2 | Rewards quality content |
| Accepted Answer | 25 | Rewards best answers |

## Level Progression

- **Level 1**: 0-99 points
- **Level 2**: 100-399 points
- **Level 3**: 400-899 points
- **Level 4**: 900-1599 points
- **Level 5**: 1600-2499 points
- And so on...

Each level requires exponentially more points, creating a sense of progression and achievement.

