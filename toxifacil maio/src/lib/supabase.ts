// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificação para garantir que as variáveis de ambiente estão carregadas
if (!supabaseUrl || !supabaseAnonKey) {
  // Este erro indica que o arquivo .env não está configurado ou não está sendo lido
  throw new Error('Missing Supabase environment variables. Please check your .env file and Bolt.new environment settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, // Tenta renovar o token automaticamente
    persistSession: true,   // Persiste a sessão entre recargas de página
    detectSessionInUrl: true, // Detecta a sessão na URL (útil para OAuth redirects)
    storage: sessionStorage   // CRÍTICO: Usa sessionStorage para ambientes como Bolt.new onde localStorage pode ser volátil
  }
});

// --- Funções auxiliares

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  return { error };
}

interface PasswordValidation {
  isValid: boolean;
  message: string;
}

export function validatePassword(password: string): PasswordValidation {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'A senha deve ter pelo menos 8 caracteres'
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos uma letra maiúscula'
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos uma letra minúscula'
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos um número'
    };
  }
 
  return {
    isValid: true,
    message: ''
  };
}