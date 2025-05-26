/*
  # Fix user registration schema

  1. Changes
    - Drop existing tables with proper CASCADE to handle dependencies
    - Recreate profiles table with proper constraints and defaults
    - Recreate partner_details table with proper foreign key relationship
    - Add proper RLS policies for authentication
    - Ensure proper foreign key relationship with auth.users

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read their own profile
      - Update their own profile
      - Add policy for new user registration
*/

-- Drop existing tables with CASCADE to handle dependencies
DROP TABLE IF EXISTS partner_details CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Recreate profiles table with proper structure
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  type text NOT NULL CHECK (type IN ('client', 'partner')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recreate partner_details table
CREATE TABLE partner_details (
  profile_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  cnes text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on partner_details
ALTER TABLE partner_details ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
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

-- Modified policy to allow profile creation during registration
CREATE POLICY "Allow profile creation during registration"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id OR EXISTS (
    SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id
  ));

-- Create policies for partner_details
CREATE POLICY "Partners can read own details"
  ON partner_details
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Partners can update own details"
  ON partner_details
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for both tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_partner_details_updated_at
  BEFORE UPDATE ON partner_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create unique index on email
CREATE UNIQUE INDEX profiles_email_key ON profiles (email);