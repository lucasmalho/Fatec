import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, FileText, MapPin } from 'lucide-react';

interface LocationState {
  appointmentDetails?: {
    laboratory: string;
    date: string;
    time: string;
    examType: string;
    address: string;
  };
}

export function ExamScheduled() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentDetails } = (location.state as LocationState) || {};

  useEffect(() => {
    if (!appointmentDetails) {
      navigate('/agendar');
    }
  }, [appointmentDetails, navigate]);

  if (!appointmentDetails) {
    return null;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Exame Agendado com Sucesso!
            </h1>
            <p className="text-xl text-gray-600">
              Seu agendamento foi confirmado
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Detalhes do Agendamento
            </h2>
            <div className="space-y-3 text-left">
              <p className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                <span className="font-medium">Data:</span>
                <span className="ml-2">{formatDate(appointmentDetails.date)} às {appointmentDetails.time}</span>
              </p>
              <p className="flex items-start text-gray-700">
                <FileText className="w-5 h-5 mr-2 text-teal-600 mt-1" />
                <span className="font-medium">Exame:</span>
                <span className="ml-2">{appointmentDetails.examType}</span>
              </p>
              <p className="flex items-start text-gray-700">
                <MapPin className="w-5 h-5 mr-2 text-teal-600 mt-1" />
                <span className="font-medium">Local:</span>
                <span className="ml-2">{appointmentDetails.laboratory}</span>
              </p>
              <p className="flex items-start text-gray-700 ml-7">
                <span className="font-medium">Endereço:</span>
                <span className="ml-2">{appointmentDetails.address}</span>
              </p>
            </div>
          </div>

          <div className="space-x-4">
            <button
              onClick={() => navigate('/resultados')}
              className="bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700 transition-colors"
            >
              Ver Meus Agendamentos
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-teal-600 hover:text-teal-700 px-6 py-3"
            >
              Voltar para Início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}