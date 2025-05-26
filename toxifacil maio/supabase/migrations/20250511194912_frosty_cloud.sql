/*
  # Remove specific users from the system

  1. Changes
    - Remove specified users from auth.users and profiles tables
    - Cascade deletion will handle related records
*/

-- Remove users from auth.users (which will cascade to profiles due to foreign key)
DELETE FROM auth.users 
WHERE email IN (
  'caiomatheusrc@hotmail.com',
  'leonardo.silva420@fatec.sp.gov.br',
  'gustavo.ogpeixoto@gmail.com',
  'lucasmalho@gmail.com'
);

-- Double check profiles table to ensure removal
DELETE FROM profiles 
WHERE email IN (
  'caiomatheusrc@hotmail.com',
  'leonardo.silva420@fatec.sp.gov.br',
  'gustavo.ogpeixoto@gmail.com',
  'lucasmalho@gmail.com'
);