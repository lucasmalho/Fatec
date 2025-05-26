/*
  # Fix database schema to match requirements

  1. Changes
    - Drop existing users table and recreate with proper structure
    - Add proper constraints for CPF and CNES
    - Update RLS policies for proper access control

  2. Security
    - Enable RLS
    - Add policies for proper data access
    - Ensure data integrity with constraints
*/

-- Drop existing table and policies
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with proper structure
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  type text NOT NULL CHECK (type IN ('client', 'laboratory')),
  cpf text UNIQUE,
  company_name text,
  cnes text UNIQUE,
  address text,
  city text,
  state text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_client_cpf CHECK (
    (type = 'client' AND cpf IS NOT NULL) OR
    (type = 'laboratory' AND cpf IS NULL)
  ),
  CONSTRAINT unique_laboratory_cnes CHECK (
    (type = 'laboratory' AND cnes IS NOT NULL AND company_name IS NOT NULL AND address IS NOT NULL AND city IS NOT NULL AND state IS NOT NULL) OR
    (type = 'client' AND cnes IS NULL AND company_name IS NULL)
  )
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create updated_at trigger
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();