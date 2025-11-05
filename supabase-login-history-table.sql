-- ============================================
-- Login History Table for Supabase
-- ============================================
-- Run this script in your Supabase SQL Editor
-- This creates a table to store login history for each user
-- ============================================

-- Step 1: Create login_history table
CREATE TABLE IF NOT EXISTS login_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  device_name TEXT, -- e.g., 'Windows Desktop', 'iPhone', 'Android Phone'
  location TEXT, -- e.g., 'Manila, Philippines'
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  login_at TIMESTAMPTZ DEFAULT NOW(),
  logout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS (Row Level Security) on login_history table
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Step 3: Policy - Users can view their own login history
DROP POLICY IF EXISTS "Users can view own login history" ON login_history;
CREATE POLICY "Users can view own login history"
  ON login_history FOR SELECT
  USING (auth.uid() = user_id);

-- Step 4: Policy - Users can insert their own login history
DROP POLICY IF EXISTS "Users can insert own login history" ON login_history;
CREATE POLICY "Users can insert own login history"
  ON login_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 5: Policy - Users can update their own login history (for logout_at)
DROP POLICY IF EXISTS "Users can update own login history" ON login_history;
CREATE POLICY "Users can update own login history"
  ON login_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Step 6: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_at ON login_history(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_session_id ON login_history(session_id);

-- Step 7: Create function to get device type from user agent
CREATE OR REPLACE FUNCTION get_device_type(user_agent_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF user_agent_text ILIKE '%mobile%' OR user_agent_text ILIKE '%android%' OR user_agent_text ILIKE '%iphone%' THEN
    RETURN 'mobile';
  ELSIF user_agent_text ILIKE '%tablet%' OR user_agent_text ILIKE '%ipad%' THEN
    RETURN 'tablet';
  ELSE
    RETURN 'desktop';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create function to get device name from user agent
CREATE OR REPLACE FUNCTION get_device_name(user_agent_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF user_agent_text ILIKE '%iphone%' THEN
    RETURN 'iPhone';
  ELSIF user_agent_text ILIKE '%ipad%' THEN
    RETURN 'iPad';
  ELSIF user_agent_text ILIKE '%android%' AND user_agent_text ILIKE '%mobile%' THEN
    RETURN 'Android Phone';
  ELSIF user_agent_text ILIKE '%android%' THEN
    RETURN 'Android Tablet';
  ELSIF user_agent_text ILIKE '%windows%' THEN
    RETURN 'Windows Desktop';
  ELSIF user_agent_text ILIKE '%mac%' OR user_agent_text ILIKE '%macintosh%' THEN
    RETURN 'Mac Desktop';
  ELSIF user_agent_text ILIKE '%linux%' THEN
    RETURN 'Linux Desktop';
  ELSE
    RETURN 'Unknown Device';
  END IF;
END;
$$ LANGUAGE plpgsql;

