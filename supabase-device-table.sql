-- ============================================
-- Biometric Devices Table for Supabase
-- ============================================
-- Run this script in your Supabase SQL Editor
-- This creates a table to store biometric devices for each user
-- ============================================

-- Step 1: Create biometric_devices table
CREATE TABLE IF NOT EXISTS biometric_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  device_id TEXT NOT NULL,
  location TEXT NOT NULL,
  api_key TEXT NOT NULL,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected')),
  last_sync TEXT DEFAULT 'Never',
  registered_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_id) -- Ensure each user can't have duplicate device IDs
);

-- Step 2: Enable RLS (Row Level Security) on biometric_devices table
ALTER TABLE biometric_devices ENABLE ROW LEVEL SECURITY;

-- Step 3: Policy - Users can view their own devices
-- Note: If policy already exists, you'll get an error. Drop it first or ignore the error.
DROP POLICY IF EXISTS "Users can view own devices" ON biometric_devices;
CREATE POLICY "Users can view own devices"
  ON biometric_devices FOR SELECT
  USING (auth.uid() = user_id);

-- Step 4: Policy - Users can insert their own devices
DROP POLICY IF EXISTS "Users can insert own devices" ON biometric_devices;
CREATE POLICY "Users can insert own devices"
  ON biometric_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 5: Policy - Users can update their own devices
DROP POLICY IF EXISTS "Users can update own devices" ON biometric_devices;
CREATE POLICY "Users can update own devices"
  ON biometric_devices FOR UPDATE
  USING (auth.uid() = user_id);

-- Step 6: Policy - Users can delete their own devices
DROP POLICY IF EXISTS "Users can delete own devices" ON biometric_devices;
CREATE POLICY "Users can delete own devices"
  ON biometric_devices FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Expected Results:
-- ============================================
-- When you run this script successfully, you should see:
--
-- ✅ CREATE TABLE
-- ✅ ALTER TABLE (enabled RLS)
-- ✅ DROP POLICY (if policies existed, otherwise no output)
-- ✅ CREATE POLICY (4 policies created)
--
-- You can verify the table was created by running:
-- SELECT * FROM biometric_devices;
--
-- (This will show empty results if no devices are added yet, which is expected)
--
-- To verify policies exist, run:
-- SELECT * FROM pg_policies WHERE tablename = 'biometric_devices';
--
-- You should see 4 policies listed.
-- ============================================

