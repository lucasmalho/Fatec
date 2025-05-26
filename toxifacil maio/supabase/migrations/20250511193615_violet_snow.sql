/*
  # Add exam documents table for storing user exam PDFs

  1. New Tables
    - `exam_documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `cpf` (text)
      - `pdf_url` (text)
      - `uploaded_by` (uuid, foreign key to profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on exam_documents table
    - Add policies for lab partners to manage documents
    - Add policies for users to view their own documents
*/

-- Create exam_documents table
CREATE TABLE IF NOT EXISTS exam_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  cpf text NOT NULL,
  pdf_url text NOT NULL,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on CPF for faster lookups
CREATE INDEX IF NOT EXISTS exam_documents_cpf_idx ON exam_documents(cpf);

-- Enable RLS
ALTER TABLE exam_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own documents"
  ON exam_documents
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    (auth.uid() = uploaded_by AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND type = 'partner'
    ))
  );

CREATE POLICY "Lab partners can upload documents"
  ON exam_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND type = 'partner'
    )
  );

-- Create trigger for updating updated_at
CREATE TRIGGER update_exam_documents_updated_at
  BEFORE UPDATE ON exam_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create storage bucket for PDFs if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam_documents', 'exam_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Lab partners can upload PDFs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'exam_documents' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND type = 'partner'
    )
  );

CREATE POLICY "Users can download own PDFs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'exam_documents' AND
    (
      EXISTS (
        SELECT 1 FROM exam_documents 
        WHERE pdf_url LIKE '%' || name AND user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM exam_documents 
        WHERE pdf_url LIKE '%' || name AND uploaded_by = auth.uid()
      )
    )
  );