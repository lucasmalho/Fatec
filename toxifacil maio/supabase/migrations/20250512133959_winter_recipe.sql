/*
  # Clean slate migration for ToxiFácil

  1. Tables
    - profiles (user profiles with type distinction)
    - partner_details (additional info for partner accounts)
    - exam_documents (exam results and PDFs)
    - appointments (scheduled exams)
    - exams (completed exams)

  2. Security
    - Enable RLS on all tables
    - Set up proper policies for clients and partners
    - Configure storage policies for exam documents
*/

-- Drop existing tables and policies
DROP TABLE IF EXISTS exam_documents CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS partner_details CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  type text NOT NULL CHECK (type IN ('client', 'partner')),
  cpf text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT profiles_client_cpf_check CHECK (
    (type = 'client' AND cpf IS NOT NULL) OR
    (type = 'partner' AND cpf IS NULL)
  )
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

-- Create exams table
CREATE TABLE exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exam_type text NOT NULL,
  date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL,
  result text,
  laboratory text NOT NULL,
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exam_type text NOT NULL,
  laboratory_id text NOT NULL,
  laboratory_name text NOT NULL,
  laboratory_address text NOT NULL,
  appointment_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create exam_documents table
CREATE TABLE exam_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  cpf text NOT NULL,
  pdf_url text NOT NULL,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX exam_documents_cpf_idx ON exam_documents(cpf);
CREATE UNIQUE INDEX profiles_client_cpf_key ON profiles (cpf) WHERE type = 'client';

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_documents ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Enable profile creation"
ON profiles FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR
  (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.type = 'partner'
    )
    AND type = 'client'
  )
);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Partner details policies
CREATE POLICY "Partners can manage own details"
ON partner_details
FOR ALL
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- Exam policies
CREATE POLICY "Users can read own exams"
ON exams FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exams"
ON exams FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exams"
ON exams FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Appointment policies
CREATE POLICY "Users can read own appointments"
ON appointments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
ON appointments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Exam documents policies
CREATE POLICY "Lab partners can upload documents"
ON exam_documents FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND type = 'partner'
  )
);

CREATE POLICY "Users can view own documents"
ON exam_documents FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  (
    auth.uid() = uploaded_by AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND type = 'partner'
    )
  )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_partner_details_updated_at
  BEFORE UPDATE ON partner_details
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

CREATE TRIGGER update_exam_documents_updated_at
  BEFORE UPDATE ON exam_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Set up storage for exam documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam_documents', 'exam_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Partners can upload exam documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'exam_documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND type = 'partner'
  )
);

CREATE POLICY "Users can access own exam documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'exam_documents' AND
  (
    EXISTS (
      SELECT 1 FROM exam_documents
      WHERE exam_documents.pdf_url LIKE '%' || name
      AND (
        exam_documents.user_id = auth.uid() OR
        exam_documents.uploaded_by = auth.uid()
      )
    )
  )
);