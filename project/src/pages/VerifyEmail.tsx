import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Home, ArrowLeft } from 'lucide-react';

export function VerifyEmail() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Mail className="w-16 h-16 text-teal-600 mx-auto mb-6 animate-bounce" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Verifique seu E-mail
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Enviamos um link de confirmação para o seu e-mail.
          </p>
          <p className="text-gray-600 mb-8">
            Por favor, acesse sua caixa de entrada e clique no link para ativar sua conta.
            Caso não encontre o e-mail, verifique também sua pasta de spam.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <Home className="w-5 h-5 mr-2" />
              Voltar para Página Inicial
            </button>
            
            <div>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-6 py-3 text-teal-600 hover:text-teal-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Ir para Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}