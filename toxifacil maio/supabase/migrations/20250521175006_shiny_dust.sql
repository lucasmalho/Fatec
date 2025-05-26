/*
  # Add laboratory_address column to appointments table

  1. Changes
    - Add laboratory_name and laboratory_address columns to appointments table
    - Update existing RLS policies

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'laboratory_name'
  ) THEN
    ALTER TABLE appointments ADD COLUMN laboratory_name text NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'laboratory_address'
  ) THEN
    ALTER TABLE appointments ADD COLUMN laboratory_address text NOT NULL;
  END IF;
END $$;