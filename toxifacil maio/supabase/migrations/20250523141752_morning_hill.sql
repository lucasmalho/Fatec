/*
  # Consolidate tables into a single users table

  1. Changes
    - Create new users table that combines profiles, clients, and laboratories
    - Migrate existing data to new table
    - Update foreign key relationships
    - Drop old tables

  2. Security
    - Enable RLS on users table
    - Add policies for proper access control
    - Maintain data isolation between user types
*/

-- Create new users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
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
    (type = 'laboratory')
  ),
  CONSTRAINT unique_laboratory_cnes CHECK (
    (type = 'laboratory' AND cnes IS NOT NULL) OR
    (type = 'client')
  )
);

-- Migrate data from existing tables
INSERT INTO users (id, email, full_name, phone, type, cpf, company_name, cnes, address, city, state, created_at, updated_at)
SELECT
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.type,
    c.cpf,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    p.created_at,
    p.updated_at
FROM
    profiles p
    INNER JOIN clients c ON p.id = c.id
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE id = p.id
)
UNION ALL
SELECT
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.type,
    NULL,
    l.company_name,
    l.cnes,
    l.address,
    l.city,
    l.state,
    p.created_at,
    p.updated_at
FROM
    profiles p
    INNER JOIN laboratories l ON p.id = l.id
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE id = p.id
);

-- Update foreign keys in exams table
ALTER TABLE exams
DROP CONSTRAINT IF EXISTS exams_client_id_fkey,
DROP CONSTRAINT IF EXISTS exams_laboratory_id_fkey;

ALTER TABLE exams
ADD CONSTRAINT exams_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT exams_laboratory_id_fkey
    FOREIGN KEY (laboratory_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update foreign keys in appointments table
ALTER TABLE appointments
DROP CONSTRAINT IF EXISTS appointments_client_id_fkey;

ALTER TABLE appointments
ADD CONSTRAINT appointments_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE;

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
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.type = 'laboratory'
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

-- Drop old tables
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS laboratories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;