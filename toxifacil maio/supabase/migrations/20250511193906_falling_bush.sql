/*
  # Fix profiles table RLS policies

  1. Changes
    - Add RLS policy for public registration
    - Add RLS policy for authenticated users
    - Add RLS policy for profile updates
    - Add RLS policy for profile reads

  2. Security
    - Enable RLS on profiles table
    - Add policies to allow:
      - Public registration during signup
      - Authenticated users to manage their own profiles
      - Profile creation during registration
*/

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow profile creation during registration" ON profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies with proper permissions
CREATE POLICY "Allow profile creation during registration"
ON profiles FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = id) OR 
  (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = profiles.id
  ))
);

CREATE POLICY "Enable insert for registration"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);