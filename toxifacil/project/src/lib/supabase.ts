import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { isValid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
  }
  if (!hasUpperCase) {
    return { isValid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' };
  }
  if (!hasLowerCase) {
    return { isValid: false, message: 'A senha deve conter pelo menos uma letra minúscula' };
  }
  if (!hasNumber) {
    return { isValid: false, message: 'A senha deve conter pelo menos um número' };
  }
  if (!hasSpecialChar) {
    return { isValid: false, message: 'A senha deve conter pelo menos um caractere especial' };
  }

  return { isValid: true, message: '' };
};