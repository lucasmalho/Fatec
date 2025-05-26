/*
  # Fix profiles table RLS policies

  1. Changes
    - Drop existing RLS policies for profiles table
    - Add new RLS policies that properly handle:
      - Profile creation during registration
      - Profile reading for authenticated users
      - Profile updates for own profile
  
  2. Security
    - Enable RLS on profiles table
    - Add policies for:
      - INSERT: Allow public to create profiles during registration
      - SELECT: Allow authenticated users to read their own profile
      - UPDATE: Allow authenticated users to update their own profile
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable profile creation during registration" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Partners can view client profiles" ON profiles;

-- Create new policies
CREATE POLICY "Enable profile creation during registration"
ON profiles
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Partners can view client profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  (EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
    AND p.type = 'partner'
    AND profiles.type = 'client'
  )) OR (auth.uid() = id)
);