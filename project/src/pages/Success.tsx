import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home, AlertCircle } from 'lucide-react';

export function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDirectAccess = !location.state?.fromRegistration;

  useEffect(() => {
    // If accessed directly without registration state, show for 5 seconds then redirect
    if (isDirectAccess) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isDirectAccess, navigate]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {isDirectAccess ? (
            <>
              <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Confirmação de E-mail
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Se você chegou aqui através do link de confirmação de e-mail, seu cadastro foi confirmado com sucesso! Você pode utilizar o site a partir de agora.
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-teal-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Cadastro Realizado com Sucesso!
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Seu e-mail foi cadastrado com sucesso! Verifique sua caixa de entrada para confirmar o cadastro.
              </p>
            </>
          )}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <Home className="w-5 h-5 mr-2" />
            Voltar para Página Inicial
          </button>
        </div>
      </div>
    </div>
  );
}