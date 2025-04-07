import { User as SupabaseUser } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  type: 'client' | 'partner';
}

export interface AuthState {
  user: SupabaseUser | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
}