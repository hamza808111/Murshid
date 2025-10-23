# Database Migration Instructions

## Adding Establishment Name and Level Fields to Profiles Table

### Step 1: Run the SQL Migration

Execute the following SQL in your Supabase SQL editor:

```sql
-- Add establishment_name and level columns to profiles table
ALTER TABLE profiles 
ADD COLUMN establishment_name TEXT,
ADD COLUMN level TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN profiles.establishment_name IS 'Name of the educational institution (high school or university)';
COMMENT ON COLUMN profiles.level IS 'Current academic level or year of study';
```

### Step 2: Verify the Changes

After running the migration, verify that the columns were added:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
```

You should see the new columns:
- `establishment_name` (TEXT, nullable)
- `level` (TEXT, nullable)

### Step 3: Test the Application

1. Start your frontend application
2. Navigate to the Profile page
3. Click "Edit" to modify your profile
4. You should now see two new fields:
   - **Educational Institution**: For entering your school/university name
   - **Academic Level**: For entering your current year/level

### Features Added

- ✅ New database columns: `establishment_name` and `level`
- ✅ Updated user interface with new form fields
- ✅ Form validation for the new fields
- ✅ Profile display shows the new information
- ✅ Data persistence through Supabase

### Notes

- Both fields are optional (nullable in database)
- The fields use appropriate icons (GraduationCap for institution, BookOpen for level)
- Form validation allows empty values for these fields
- The data is stored in the `profiles` table and synced with the user's authentication profile
