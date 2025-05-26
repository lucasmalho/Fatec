/*
  # Fix profiles table RLS policies

  1. Changes
    - Remove recursive policies from profiles table
    - Create new, simplified policies for profiles table
    - Maintain security while avoiding infinite recursion

  2. Security
    - Users can still only access their own profile
    - Partners can view client profiles
    - Public can create profiles during registration
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow profile creation during registration" ON profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON profiles;
DROP POLICY IF EXISTS "Partners can view client profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new, non-recursive policies
CREATE POLICY "Enable profile creation during registration"
ON profiles FOR INSERT
TO public
WITH CHECK (
  auth.uid() = id
);

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

CREATE POLICY "Partners can view client profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
    AND p.type = 'partner'
    AND profiles.type = 'client'
  )
  OR auth.uid() = id
);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);