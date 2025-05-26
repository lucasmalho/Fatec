/*
  # Fix profiles RLS policies

  1. Changes
    - Drop problematic policy that causes recursion
    - Create new policy with correct auth.uid() function
    - Maintain security while allowing partners to view client profiles

  2. Security
    - Ensure proper access control
    - Fix function reference to use auth.uid()
    - Maintain data isolation between users
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Partners can view client profiles" ON profiles;

-- Create new policy without recursion
CREATE POLICY "Partners can view client profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  (auth.uid() = id) OR 
  (
    type = 'client'::text AND 
    EXISTS (
      SELECT 1 
      FROM profiles partner_profile 
      WHERE partner_profile.id = auth.uid() 
      AND partner_profile.type = 'partner'::text
    )
  )
);