/*
  # Create appointments table for storing user exam appointments

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `exam_type` (text)
      - `laboratory_id` (text)
      - `laboratory_name` (text)
      - `laboratory_address` (text)
      - `appointment_date` (timestamptz)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `appointments` table
    - Add policies for authenticated users to:
      - Read their own appointments
      - Insert their own appointments
      - Update their own appointments
*/

-- Create appointments table if it doesn't exist
CREATE TABLE IF NOT EXISTS appointments (
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

-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_appointments_updated_at'
  ) THEN
    CREATE TRIGGER update_appointments_updated_at
      BEFORE UPDATE ON appointments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END
$$;

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'appointments' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can read own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;

-- Create policies
CREATE POLICY "Users can read own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);