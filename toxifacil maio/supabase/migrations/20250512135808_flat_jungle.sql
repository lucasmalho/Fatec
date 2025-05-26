/*
  # Restructure database to separate laboratory and client functionality

  1. Changes
    - Drop existing tables
    - Create separate tables for laboratories and clients
    - Set up proper relationships and constraints
    - Update RLS policies to enforce separation

  2. Tables
    - clients
      - id (uuid, primary key)
      - email (text, unique)
      - full_name (text)
      - cpf (text, unique)
      - phone (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - laboratories
      - id (uuid, primary key)
      - email (text, unique)
      - company_name (text)
      - cnes (text, unique)
      - address (text)
      - city (text)
      - state (text)
      - phone (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - exams
      - id (uuid, primary key)
      - client_id (uuid, references clients)
      - laboratory_id (uuid, references laboratories)
      - exam_type (text)
      - date (timestamptz)
      - status (text)
      - result (text)
      - pdf_url (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - appointments
      - id (uuid, primary key)
      - client_id (uuid, references clients)
      - laboratory_id (uuid, references laboratories)
      - exam_type (text)
      - appointment_date (timestamptz)
      - status (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  3. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Drop existing tables
DROP TABLE IF EXISTS exam_documents CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS partner_details CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create clients table
CREATE TABLE clients (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  cpf text UNIQUE NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create laboratories table
CREATE TABLE laboratories (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  company_name text NOT NULL,
  cnes text UNIQUE NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create exams table
CREATE TABLE exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  laboratory_id uuid NOT NULL REFERENCES laboratories(id) ON DELETE CASCADE,
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
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  laboratory_id uuid NOT NULL REFERENCES laboratories(id) ON DELETE CASCADE,
  exam_type text NOT NULL,
  appointment_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Client Policies
CREATE POLICY "Clients can read own profile"
ON clients FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM laboratories WHERE laboratories.id = auth.uid()
  )
);

CREATE POLICY "Clients can update own profile"
ON clients FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable client registration"
ON clients FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

-- Laboratory Policies
CREATE POLICY "Laboratories can read own profile"
ON laboratories FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Laboratories can update own profile"
ON laboratories FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable laboratory registration"
ON laboratories FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

-- Exam Policies
CREATE POLICY "Clients can view own exams"
ON exams FOR SELECT
TO authenticated
USING (
  client_id = auth.uid() OR
  laboratory_id = auth.uid()
);

CREATE POLICY "Laboratories can manage exams"
ON exams FOR ALL
TO authenticated
USING (laboratory_id = auth.uid())
WITH CHECK (laboratory_id = auth.uid());

-- Appointment Policies
CREATE POLICY "Clients can view own appointments"
ON appointments FOR SELECT
TO authenticated
USING (
  client_id = auth.uid() OR
  laboratory_id = auth.uid()
);

CREATE POLICY "Clients can create appointments"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (client_id = auth.uid());

CREATE POLICY "Laboratories can manage appointments"
ON appointments FOR ALL
TO authenticated
USING (laboratory_id = auth.uid())
WITH CHECK (laboratory_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_laboratories_updated_at
  BEFORE UPDATE ON laboratories
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

-- Storage policies
CREATE POLICY "Laboratories can upload exam documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'exam_documents' AND
  EXISTS (
    SELECT 1 FROM laboratories WHERE laboratories.id = auth.uid()
  )
);

CREATE POLICY "Users can access own exam documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'exam_documents' AND
  (
    EXISTS (
      SELECT 1 FROM exams
      WHERE exams.pdf_url LIKE '%' || name
      AND (exams.client_id = auth.uid() OR exams.laboratory_id = auth.uid())
    )
  )
);