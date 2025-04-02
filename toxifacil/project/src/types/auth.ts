export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'partner';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}