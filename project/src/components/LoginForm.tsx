import React, { useState } from 'react';
import { User, KeyRound } from 'lucide-react';

interface LoginFormProps {
  type: 'client' | 'partner';
}

export function LoginForm({ type }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de autenticação
    console.log('Login:', { email, password, type });
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div className="flex flex-col items-center mb-6">
        {type === 'client' ? (
          <User className="w-12 h-12 text-teal-600 mb-2" />
        ) : (
          <KeyRound className="w-12 h-12 text-teal-600 mb-2" />
        )}
        <h2 className="text-2xl font-bold text-gray-800">
          {type === 'client' ? 'Área do Cliente' : 'Área do Parceiro'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Entrar
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        <a href="#" className="text-teal-600 hover:text-teal-700">
          Esqueceu sua senha?
        </a>
      </p>
    </div>
  );
}