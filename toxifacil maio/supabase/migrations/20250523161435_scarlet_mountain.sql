-- Drop existing tables
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;

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

-- Create exams table
CREATE TABLE exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  laboratory_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_type text NOT NULL,
  date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL,
  result text,
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  laboratory_id text NOT NULL,
  laboratory_name text NOT NULL,
  laboratory_address text NOT NULL,
  exam_type text NOT NULL,
  appointment_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
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
    FROM auth.users au
    JOIN users u ON u.id = au.id
    WHERE au.id = auth.uid()
    AND u.type = 'laboratory'
    AND users.type = 'client'
  )
);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create RLS policies for exams table
CREATE POLICY "Clients can view own exams"
ON exams FOR SELECT
TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "Laboratories can manage exams"
ON exams FOR ALL
TO authenticated
USING (laboratory_id = auth.uid())
WITH CHECK (laboratory_id = auth.uid());

-- Create RLS policies for appointments table
CREATE POLICY "Clients can view own appointments"
ON appointments FOR SELECT
TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "Clients can create appointments"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (client_id = auth.uid());

CREATE POLICY "Laboratories can manage appointments"
ON appointments FOR ALL
TO authenticated
USING (laboratory_id::text = auth.uid()::text)
WITH CHECK (laboratory_id::text = auth.uid()::text);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Set up storage for exam documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam_documents', 'exam_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Laboratories can upload exam documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'exam_documents' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND type = 'laboratory'
  )
);

CREATE POLICY "Users can access own exam documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'exam_documents' AND
  EXISTS (
    SELECT 1 FROM exams
    WHERE exams.pdf_url LIKE '%' || name
    AND (exams.client_id = auth.uid() OR exams.laboratory_id = auth.uid())
  )
);