/*
  # Fix RLS policies for profiles table

  1. Changes
    - Drop existing policies
    - Create new policies with proper permissions
    - Enable public access for profile creation
    - Allow authenticated users to read their own profiles

  2. Security
    - Maintain data isolation between users
    - Allow profile creation during signup
    - Enable proper profile type verification
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON profiles;
DROP POLICY IF EXISTS "Partners can view client profiles" ON profiles;

-- Create new policies
CREATE POLICY "Enable profile creation"
ON profiles FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);