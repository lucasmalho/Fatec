import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, KeyRound, LogIn, ArrowLeft, AlertCircle, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { resetPassword } from '../lib/supabase';

interface LocationState {
  returnTo?: string;
  labInfo?: {
    id: string;
    nome: string;
    endereco: string;
  };
  examType?: string;
  message?: string;
}

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const state = location.state as LocationState;
  const returnTo = state?.returnTo || '/';
  const labInfo = state?.labInfo;
  const examType = state?.examType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data: signInData, error: signInError } = await signIn(email, password);
      
      if (signInError) {
        throw signInError;
      }

      if (!signInData?.user) {
        throw new Error('Erro ao fazer login. Por favor, tente novamente.');
      }

      // Check user type and redirect accordingly
      const userType = signInData.user.user_metadata.type;
      if (userType === 'laboratory') {
        navigate('/laboratorio');
      } else if (returnTo === '/agendar' && (labInfo || examType)) {
        navigate(returnTo, { state: { labInfo, examType } });
      } else {
        navigate(returnTo);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { error } = await resetPassword(email);
      if (error) throw error;

      setSuccessMessage('Email de recuperação enviado. Por favor, verifique sua caixa de entrada.');
      setIsResettingPassword(false);
    } catch (err) {
      setError('Erro ao enviar email de recuperação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex flex-col items-center mb-8">
            <User className="w-12 h-12 text-teal-600 mb-2" />
            <h2 className="text-2xl font-bold text-gray-800">
              {isResettingPassword ? 'Recuperar Senha' : 'Entrar'}
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600">{successMessage}</p>
            </div>
          )}

          {isResettingPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    Enviando...
                  </div>
                ) : (
                  'Enviar Email de Recuperação'
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsResettingPassword(false)}
                className="w-full text-teal-600 hover:text-teal-700"
              >
                Voltar para Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    Entrando...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Entrar
                  </>
                )}
              </button>

              <div className="flex flex-col items-center space-y-4 text-sm">
                <button
                  type="button"
                  onClick={() => setIsResettingPassword(true)}
                  className="text-teal-600 hover:text-teal-700"
                >
                  Esqueceu sua senha?
                </button>
                <Link to="/cadastro" className="text-teal-600 hover:text-teal-700">
                  Ainda não tem conta? Cadastre-se
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}