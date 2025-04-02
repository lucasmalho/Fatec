/*
  # Reset Database Schema

  1. Changes
    - Drop existing tables
    - Recreate tables with proper configurations
    - Set up RLS policies
    - Add proper constraints and relationships

  2. Tables
    - profiles
      - id (uuid, primary key)
      - email (text, unique)
      - full_name (text)
      - phone (text, nullable)
      - type (text, check constraint for 'client' or 'partner')
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - partner_details
      - profile_id (uuid, primary key, references profiles)
      - company_name (text)
      - cnes (text)
      - address (text)
      - city (text)
      - state (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS partner_details CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  type text NOT NULL CHECK (type IN ('client', 'partner')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create partner_details table
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
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

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_partner_details_updated_at
  BEFORE UPDATE ON partner_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();