/*
  # Add CPF field and update profile types

  1. Changes
    - Add CPF field to profiles table
    - Update RLS policies for different profile types
    - Add constraints for profile types

  2. Security
    - Maintain existing RLS policies
    - Add type-specific access controls
*/

-- Add CPF field to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'cpf'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cpf text;
  END IF;
END $$;

-- Create unique index on CPF (only for client profiles)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_client_cpf_key 
ON profiles (cpf) 
WHERE type = 'client';

-- Update RLS policies for different profile types
CREATE POLICY "Partners can view client profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = id) OR  -- Users can view their own profile
    (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND type = 'partner'
      ) AND
      type = 'client'  -- Partners can view client profiles
    )
  );

-- Add check constraint to ensure CPF is not null for clients
ALTER TABLE profiles
ADD CONSTRAINT profiles_client_cpf_check
CHECK (
  (type = 'client' AND cpf IS NOT NULL) OR
  (type = 'partner' AND cpf IS NULL)
);