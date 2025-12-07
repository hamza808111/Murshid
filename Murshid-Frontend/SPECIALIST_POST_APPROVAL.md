# Specialist Post Approval System

## Overview
This feature implements an approval workflow for posts created by specialists. When a specialist creates a post, it requires admin approval before appearing in the community section. Student posts are automatically approved and appear immediately.

## Database Changes

### SQL Migration
Run the SQL script `supabase_specialist_post_approval.sql` in your Supabase SQL editor to:
- Add `approval_status` column (pending/approved/rejected)
- Add `approved_by` column (tracks which admin approved)
- Add `approved_at` column (timestamp of approval)
- Add `rejection_reason` column (optional reason for rejection)
- Create index for performance
- Update existing posts (specialists set to pending, students/admins to approved)

## Implementation Details

### 1. Post Creation Flow
- **Students**: Posts are automatically set to `approval_status = 'approved'` and appear immediately
- **Specialists**: Posts are set to `approval_status = 'pending'` and require admin approval
- **Admins**: Posts are automatically set to `approval_status = 'approved'` and appear immediately

### 2. Post Visibility
- **Non-admins**: Only see posts with `approval_status = 'approved'`
- **Admins**: See all posts (pending, approved, rejected) in the admin community page

### 3. Admin Interface
The AdminCommunity page now includes:
- **Pending Posts Count**: Shows number of posts awaiting approval in stats
- **Approval Status Badges**: Visual indicators for pending/rejected posts
- **Approve/Reject Actions**: 
  - Approve button (green checkmark) - approves the post
  - Reject button (red X) - rejects the post with optional reason

### 4. User Experience
- **Specialists**: See a message after creating a post that it will be reviewed
- **MyPosts Page**: Shows approval status badges:
  - "Pending Review" (yellow) for pending posts
  - "Rejected" (red) for rejected posts with reason
- **Community Page**: Only approved posts are visible to non-admins

## Files Modified

### Database
- `supabase_specialist_post_approval.sql` - SQL migration script

### Types
- `src/types/community.ts` - Added approval fields to Post interface

### API
- `src/lib/communityApi.ts`:
  - Updated `mapPost()` to include approval fields
  - Updated `createCommunityPost()` to set approval_status based on role
  - Updated `getCommunityPosts()` to filter by approval_status for non-admins
  - Added `approvePost()` function
  - Added `rejectPost()` function
  - Added `getPendingPosts()` function
  - Added `checkIsAdmin()` helper function

### Pages
- `src/pages/CreatePost.tsx` - Shows approval message for specialists
- `src/pages/AdminCommunity.tsx` - Added approval UI and actions
- `src/pages/MyPosts.tsx` - Shows approval status badges

## Usage

### For Specialists
1. Create a post as usual
2. After submission, see message: "Post created successfully! It will be reviewed by an admin before being published."
3. Post appears in "My Posts" with "Pending Review" badge
4. Once approved, post appears in community section

### For Admins
1. Navigate to Admin Community page
2. See pending posts count in stats
3. View all posts with approval status badges
4. Click approve (✓) or reject (✗) buttons on pending posts
5. If rejecting, optionally provide a reason

## Testing

1. **As Specialist**:
   - Create a post
   - Verify it shows "Pending Review" in MyPosts
   - Verify it does NOT appear in community section

2. **As Admin**:
   - View Admin Community page
   - See pending posts count
   - Approve a pending post
   - Verify it now appears in community section

3. **As Student**:
   - Create a post
   - Verify it appears immediately in community section
   - Verify no approval status badge in MyPosts

## Notes

- Rejected posts remain visible to admins but not to regular users
- Rejection reason is optional but recommended
- Approval/rejection actions are logged with admin ID and timestamp
- Existing posts are automatically updated during migration:
  - Specialist posts → pending
  - Student/Admin posts → approved

