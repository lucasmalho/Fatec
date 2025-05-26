/*
  # Create exams table for storing user exam results

  1. New Tables
    - `exams`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `exam_type` (text)
      - `date` (timestamptz)
      - `status` (text)
      - `result` (text)
      - `laboratory` (text)
      - `pdf_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `exams` table
    - Add policies for authenticated users to:
      - Read their own exams
      - Insert their own exams
      - Update their own exams
*/

CREATE TABLE IF NOT EXISTS exams (
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

-- Add trigger for updating the updated_at timestamp
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own exams"
  ON exams
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exams"
  ON exams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exams"
  ON exams
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);