/*
  # Update appointments table structure

  1. Changes
    - Drop existing policies
    - Modify laboratory_id column type
    - Add NOT NULL constraints
    - Recreate policies with proper permissions

  2. Security
    - Maintain RLS policies
    - Ensure proper access control
*/

-- Drop all policies that reference laboratory_id
DROP POLICY IF EXISTS "Clients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Laboratories can manage appointments" ON appointments;
DROP POLICY IF EXISTS "Clients can create appointments" ON appointments;

-- Drop the foreign key constraint
ALTER TABLE appointments
DROP CONSTRAINT IF EXISTS appointments_laboratory_id_fkey;

-- Change laboratory_id type to text
ALTER TABLE appointments
ALTER COLUMN laboratory_id TYPE text;

-- Ensure required columns have NOT NULL constraint
ALTER TABLE appointments
ALTER COLUMN laboratory_name SET NOT NULL,
ALTER COLUMN laboratory_address SET NOT NULL;

-- Recreate the policies
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