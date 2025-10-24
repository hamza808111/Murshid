# Integration Tests - Database Verification

These tests verify that all functionality works correctly with the actual Supabase database.

## Tests Included

### 1. ✅ Signup Tests (Valid/Invalid)
- **Invalid email format** - Rejects signup with bad email
- **Weak password** - Rejects passwords that are too short
- **Valid signup** - Creates user with valid credentials
- **Database verification** - Confirms user is added to profiles table
- **Profile update** - Updates profile with additional info

### 2. ✅ Login Tests
- **Successful login** - Logs in with created user
- **Wrong password** - Rejects incorrect password
- **Non-existent email** - Rejects email not in database

### 3. ✅ Duplicate User Test
- **Existing email** - Rejects signup with already registered email

### 4. ✅ Profile Edit Tests
- **Update name** - Changes user name and verifies in database
- **Update establishment** - Changes university name and verifies
- **Update multiple fields** - Changes level, track, and establishment
- **Database verification** - Confirms all edits persist in database

### 5. ✅ Admin Dashboard Tests
- **Admin login** - Logs in with admin credentials (admin1@admin.admin)
- **Admin flag verification** - Confirms is_admin = true in database
- **Retrieve all users** - Gets complete user list from database
- **Delete user** - Removes a user and verifies deletion
- **Search users by name** - Filters users by name (matches UI search)
- **Search by establishment** - Filters users by establishment (matches UI search)

## Running the Tests

```bash
# Run integration tests
npm run test:run

# Or watch mode
npm test
```

## Prerequisites

**These tests require:**
1. Valid Supabase credentials in `.env` file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Admin user in database:
   - Email: `admin1@admin.admin`
   - Password: `adminADMIN`
   - `is_admin` flag set to `true`

3. Active internet connection (tests connect to real database)

## Test Flow

```
1. Create test user with unique email
   ↓
2. Verify user exists in database
   ↓
3. Login with test user
   ↓
4. Try to create duplicate user (should fail)
   ↓
5. Edit profile and verify changes
   ↓
6. Login as admin
   ↓
7. View all users
   ↓
8. Delete a user
   ↓
9. Cleanup test data
```

## Expected Results

All tests should **PASS** if:
- ✅ Supabase is configured correctly
- ✅ Admin user exists with correct credentials
- ✅ Database triggers are working (profile creation)
- ✅ RLS policies allow the operations

## What Gets Tested

### Database Operations
- ✅ User creation (auth.users + profiles table)
- ✅ Profile updates and persistence
- ✅ User authentication
- ✅ User deletion
- ✅ Data querying and filtering
- ✅ Admin permissions

### Validation
- ✅ Email format validation
- ✅ Password strength requirements
- ✅ Duplicate email prevention

### Access Control
- ✅ Admin flag verification
- ✅ Admin-only operations

## Notes

- **Test user email** is generated with timestamp to avoid conflicts
- **Tests are sequential** - later tests depend on earlier ones
- **Cleanup runs automatically** - test user is deleted after tests
- **Real database** - These tests modify actual data (safely)

## Troubleshooting

### Tests failing?

1. **Check Supabase credentials** in `.env`
2. **Verify admin user exists** with correct password
3. **Check database connection** 
4. **Review RLS policies** - ensure they allow test operations

### Admin user doesn't exist?

Run this SQL in Supabase to create admin:

```sql
-- First create the user in Supabase Auth dashboard
-- Then set admin flag:
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin1@admin.admin';
```

## Success Output

When all tests pass, you'll see:

```
✓ User created: test.user.xxx@test.com
✓ Profile created in database
✓ Profile updated with details
✓ Login successful
✓ Wrong password rejected
✓ Non-existent email rejected
✓ Duplicate email rejected
✓ Profile name updated and verified
✓ Profile establishment updated and verified
✓ Multiple profile fields updated and verified
✓ Admin login successful
✓ Admin flag verified in database
✓ Retrieved X users from database
✓ User successfully deleted from database
✓ Search found X users
✓ Found X students
🧹 Cleaning up test data...
✓ Test user cleaned up

Test Files  1 passed (1)
Tests  17 passed (17)
```

---

**These tests verify that your entire authentication and user management system works end-to-end!** 🎉

