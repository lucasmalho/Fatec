/*
  # Autenticação e Esquema de Users

  1. Novas tabelas
    - `profiles`
      - `id` (uuid, primary key) - References auth.users
      - `email` (text, unique)
      - `full_name` (text)
      - `phone` (text)
      - `type` (text) - 'client' or 'partner'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `partner_details` (laboratórios)
      - `profile_id` (uuid, primary key) - References profiles
      - `company_name` (text)
      - `cnes` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Criar planilha de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  type text NOT NULL CHECK (type IN ('client', 'partner')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar planilha laboratórios
CREATE TABLE IF NOT EXISTS partner_details (
  profile_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  cnes text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ativando RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_details ENABLE ROW LEVEL SECURITY;

-- Criando políticas
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Partners can view own details"
  ON partner_details
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Partners can update own details"
  ON partner_details
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_partner_details_updated_at
  BEFORE UPDATE ON partner_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();