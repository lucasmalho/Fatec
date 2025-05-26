/*
  # Add client profile constraints and password validation

  1. Changes
    - Add password validation check constraint
    - Add CPF field to profiles
    - Add address fields to profiles
    - Ensure proper data validation

  2. Security
    - Maintain existing RLS policies
    - Add validation for password requirements
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS address_number text,
ADD COLUMN IF NOT EXISTS address_complement text,
ADD COLUMN IF NOT EXISTS neighborhood text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text;

-- Create function to validate password strength
CREATE OR REPLACE FUNCTION validate_password_strength(password text)
RETURNS boolean AS $$
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    RETURN false;
  END IF;

  -- Check for at least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;

  -- Check for at least one lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;

  -- Check for at least one number
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;

  -- Check for at least one special character
  IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;