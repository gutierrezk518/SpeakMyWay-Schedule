-- =============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) SETUP
-- SpeakMyWay Schedule Application - MVP Security Configuration
-- =============================================================================
--
-- IMPORTANT: Run these commands in your Supabase SQL Editor
-- Dashboard -> SQL Editor -> New Query -> Paste this entire file -> Run
--
-- This sets up security for your MVP where:
-- - Activity cards are PUBLIC (all authenticated users can read)
-- - Categories are PUBLIC (all authenticated users can read)
-- - User schedules and favorites are stored in browser localStorage (not in DB)
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- -----------------------------------------------------------------------------
-- This is the MOST IMPORTANT step - it prevents unauthorized access

ALTER TABLE schedule_vocabulary_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedulecategories ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. CREATE RLS POLICIES FOR schedule_vocabulary_cards
-- -----------------------------------------------------------------------------
-- These policies allow all authenticated users to READ activity cards
-- but prevent them from modifying the data (since it's public content)

-- Policy: Allow all authenticated users to READ activity cards
CREATE POLICY "Allow authenticated users to read activity cards"
ON schedule_vocabulary_cards
FOR SELECT
TO authenticated
USING (true);

-- Policy: Prevent users from inserting cards (admin only via dashboard)
-- If you want to allow users to create custom cards in the future, modify this
CREATE POLICY "Prevent users from inserting activity cards"
ON schedule_vocabulary_cards
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Policy: Prevent users from updating cards (admin only via dashboard)
CREATE POLICY "Prevent users from updating activity cards"
ON schedule_vocabulary_cards
FOR UPDATE
TO authenticated
USING (false);

-- Policy: Prevent users from deleting cards (admin only via dashboard)
CREATE POLICY "Prevent users from deleting activity cards"
ON schedule_vocabulary_cards
FOR DELETE
TO authenticated
USING (false);

-- -----------------------------------------------------------------------------
-- 3. CREATE RLS POLICIES FOR schedulecategories
-- -----------------------------------------------------------------------------
-- Same as activity cards - public read, admin-only modifications

-- Policy: Allow all authenticated users to READ categories
CREATE POLICY "Allow authenticated users to read categories"
ON schedulecategories
FOR SELECT
TO authenticated
USING (true);

-- Policy: Prevent users from inserting categories (admin only)
CREATE POLICY "Prevent users from inserting categories"
ON schedulecategories
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Policy: Prevent users from updating categories (admin only)
CREATE POLICY "Prevent users from updating categories"
ON schedulecategories
FOR UPDATE
TO authenticated
USING (false);

-- Policy: Prevent users from deleting categories (admin only)
CREATE POLICY "Prevent users from deleting categories"
ON schedulecategories
FOR DELETE
TO authenticated
USING (false);

-- -----------------------------------------------------------------------------
-- 4. VERIFICATION QUERIES
-- -----------------------------------------------------------------------------
-- Run these to verify RLS is enabled and policies are created

-- Check if RLS is enabled on tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('schedule_vocabulary_cards', 'schedulecategories');
-- Expected: rowsecurity should be 'true' for both tables

-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('schedule_vocabulary_cards', 'schedulecategories')
ORDER BY tablename, cmd;
-- Expected: You should see 8 policies total (4 per table)

-- -----------------------------------------------------------------------------
-- 5. FUTURE ENHANCEMENT: USER-SPECIFIC CUSTOM CARDS
-- -----------------------------------------------------------------------------
-- When you're ready to allow users to create their own custom cards:
--
-- Step 1: Add a user_id column to schedule_vocabulary_cards
-- ALTER TABLE schedule_vocabulary_cards ADD COLUMN user_id UUID REFERENCES auth.users(id);
--
-- Step 2: Replace the INSERT policy with this:
-- DROP POLICY "Prevent users from inserting activity cards" ON schedule_vocabulary_cards;
-- CREATE POLICY "Users can create their own custom cards"
-- ON schedule_vocabulary_cards
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (auth.uid() = user_id);
--
-- Step 3: Add UPDATE and DELETE policies for user's own cards:
-- DROP POLICY "Prevent users from updating activity cards" ON schedule_vocabulary_cards;
-- CREATE POLICY "Users can update their own custom cards"
-- ON schedule_vocabulary_cards
-- FOR UPDATE
-- TO authenticated
-- USING (auth.uid() = user_id);
--
-- DROP POLICY "Prevent users from deleting activity cards" ON schedule_vocabulary_cards;
-- CREATE POLICY "Users can delete their own custom cards"
-- ON schedule_vocabulary_cards
-- FOR DELETE
-- TO authenticated
-- USING (auth.uid() = user_id);
--
-- Step 4: Modify the SELECT policy to show both public and user's custom cards:
-- DROP POLICY "Allow authenticated users to read activity cards" ON schedule_vocabulary_cards;
-- CREATE POLICY "Users can read public cards and their own custom cards"
-- ON schedule_vocabulary_cards
-- FOR SELECT
-- TO authenticated
-- USING (user_id IS NULL OR auth.uid() = user_id);
-- -----------------------------------------------------------------------------

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================
-- Your database is now secured with Row Level Security.
--
-- Next steps:
-- 1. Test by logging in as a regular user and trying to query the tables
-- 2. Verify you can read cards and categories
-- 3. Try to insert/update/delete (should fail - that's good!)
-- =============================================================================
