-- ============================================
-- Supabase Row Level Security (RLS) Policies
-- ============================================
-- Run this script in your Supabase SQL Editor
-- This ensures users can only access their own data
-- ============================================

-- NOTE: The auth.users table is managed by Supabase and RLS is enabled by default
-- You cannot create policies directly on auth.users, but you can create policies
-- on tables that reference auth.uid()

-- ============================================
-- Example: Profiles Table (if you create one)
-- ============================================

-- Step 1: Create profiles table (if it doesn't exist)
-- CREATE TABLE IF NOT EXISTS profiles (
--   id UUID REFERENCES auth.users(id) PRIMARY KEY,
--   email TEXT,
--   full_name TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Step 2: Enable RLS on profiles table
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Policy: Users can view their own profile
-- CREATE POLICY "Users can view own profile"
--   ON profiles FOR SELECT
--   USING (auth.uid() = id);

-- Step 4: Policy: Users can update their own profile
-- CREATE POLICY "Users can update own profile"
--   ON profiles FOR UPDATE
--   USING (auth.uid() = id);

-- Step 5: Policy: Users can insert their own profile
-- CREATE POLICY "Users can insert own profile"
--   ON profiles FOR INSERT
--   WITH CHECK (auth.uid() = id);

-- ============================================
-- Example: Payroll Records Table
-- ============================================

-- Step 1: Create payroll_records table (if it doesn't exist)
-- CREATE TABLE IF NOT EXISTS payroll_records (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   user_id UUID REFERENCES auth.users(id) NOT NULL,
--   amount DECIMAL(10, 2),
--   period_start DATE,
--   period_end DATE,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Step 2: Enable RLS on payroll_records table
-- ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;

-- Step 3: Policy: Users can only access their own payroll records
-- CREATE POLICY "Users can view own payroll records"
--   ON payroll_records FOR SELECT
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert own payroll records"
--   ON payroll_records FOR INSERT
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update own payroll records"
--   ON payroll_records FOR UPDATE
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete own payroll records"
--   ON payroll_records FOR DELETE
--   USING (auth.uid() = user_id);

-- ============================================
-- Example: Employees Table
-- ============================================

-- CREATE TABLE IF NOT EXISTS employees (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   company_id UUID NOT NULL, -- If you have company/org structure
--   name TEXT NOT NULL,
--   email TEXT,
--   created_by UUID REFERENCES auth.users(id) NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access employees from their company/org
-- (Adjust based on your business logic)
-- CREATE POLICY "Users can view employees from their company"
--   ON employees FOR SELECT
--   USING (
--     -- Replace with your actual company/user relationship logic
--     auth.uid() = created_by
--     -- OR company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
--   );

-- ============================================
-- Verify RLS is Enabled
-- ============================================

-- Run this query to check which tables have RLS enabled:
-- SELECT 
--   schemaname,
--   tablename,
--   rowsecurity as rls_enabled
-- FROM pg_tables 
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- ============================================
-- Important Notes:
-- ============================================
-- 1. RLS is enabled by default on auth.users
-- 2. Always enable RLS on tables containing user data
-- 3. Test your policies thoroughly before production
-- 4. Use auth.uid() to get the current authenticated user's ID
-- 5. Adjust policies based on your specific business requirements
-- 6. For admin access, you may need separate policies or roles
-- ============================================

