import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, KeyRound, LogIn, ArrowLeft, AlertCircle, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type LoginType = 'client' | 'partner' | 'register' | null;

export function Login() {
  const [selectedType, setSelectedType] = useState<LoginType>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [navigatePassword, setNavigatePassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const returnTo = location.state?.returnTo || '/resultados';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        throw signInError;
      }

      navigate(returnTo);
    } catch (err) {
      console.error('Login error:', err);
      setError('Email ou senha inválidos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
      {!selectedType ? (
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Área de Acesso</h2>
            <p className="mt-2 text-gray-600">Escolha como deseja acessar o sistema</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setSelectedType('client')}
              className="w-full flex items-center justify-between p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <User className="w-8 h-8 text-teal-600 mr-4" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">Área do Cliente</h3>
                  <p className="text-gray-600">Acesse seus resultados e agendamentos</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => setSelectedType('partner')}
              className="w-full flex items-center justify-between p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <KeyRound className="w-8 h-8 text-teal-600 mr-4" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">Área do Parceiro</h3>
                  <p className="text-gray-600">Portal para laboratórios credenciados</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>

            <Link
              to="/cadastro"
              className="w-full flex items-center justify-between p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <UserPlus className="w-8 h-8 text-teal-600 mr-4" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">Criar Conta</h3>
                  <p className="text-gray-600">Cadastre-se como cliente ou laboratório</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-md w-full">
          <button
            onClick={() => {
              setSelectedType(null);
              setError('');
            }}
            className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex flex-col items-center mb-8">
              {selectedType === 'client' ? (
                <User className="w-12 h-12 text-teal-600 mb-2" />
              ) : (
                <KeyRound className="w-12 h-12 text-teal-600 mb-2" />
              )}
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedType === 'client' ? 'Área do Cliente' : 'Área do Parceiro'}
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-600">{error}</p>
              </div>
            )}

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
                    type={navigatePassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setNavigatePassword(!navigatePassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                  >
                    {navigatePassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Entrar
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/cadastro" className="text-sm text-teal-600 hover:text-teal-700">
                Ainda não tem conta? Cadastre-se
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}