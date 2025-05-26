/*
  # Fix users table policies

  1. Changes
    - Remove recursive policy that was causing infinite loops
    - Simplify user read access policy
    - Add proper policy for laboratory access

  2. Security
    - Maintain RLS enabled
    - Ensure proper access control for both clients and laboratories
*/

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Enable user read access" ON public.users;

-- Create new, simplified read policy for users to access their own data
CREATE POLICY "Users can read own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create separate policy for laboratories to read client data
CREATE POLICY "Laboratories can read client data"
ON public.users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
    AND u.type = 'laboratory'
    AND users.type = 'client'
  )
);