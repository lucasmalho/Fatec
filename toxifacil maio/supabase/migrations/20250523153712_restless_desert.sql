-- Drop existing tables and policies
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
  CONSTRAINT unique_laboratory_details CHECK (
    (type = 'laboratory' AND cnes IS NOT NULL AND company_name IS NOT NULL AND address IS NOT NULL AND city IS NOT NULL AND state IS NOT NULL) OR
    (type = 'client' AND cnes IS NULL AND company_name IS NULL)
  )
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies
CREATE POLICY "Enable user creation during signup"
ON users FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Laboratories can read client data"
ON users FOR SELECT
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