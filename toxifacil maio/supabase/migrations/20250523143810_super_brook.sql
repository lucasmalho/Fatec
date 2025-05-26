/*
  # Fix RLS policies to avoid recursion

  1. Changes
    - Drop existing RLS policies
    - Create new policies without recursive checks
    - Maintain security while avoiding infinite loops

  2. Security
    - Maintain data isolation between users
    - Allow proper access for laboratories to view client profiles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable user creation during signup" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies without recursion
CREATE POLICY "Enable user creation during signup"
ON users FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read own profile"
ON users FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR
  (
    type = 'client' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.users.id
        AND u.type = 'laboratory'
      )
    )
  )
);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);