import React from 'react';
import { FileCheck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Supondo que a prop exam pode ser mais complexa
interface ExamCardProps {
  title: string;
  description: string;
  price: number;
  duration: string;
  // Se você tiver uma prop 'examData' que contém mais detalhes do banco de dados:
  // examData?: {
  //   date: string; // Exemplo de campo problemático
  //   status: string;
  //   // ... outros campos
  // }
}

export function ExamCard({ title, description, price, duration }: ExamCardProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // Pegar o estado 'loading' também

  // Se a autenticação ainda está carregando, podemos querer desabilitar o botão ou mostrar um estado de carregamento
  // Ou, se o problema estiver na forma como os dados de exame são passados, a lógica deve estar no componente pai.

  const handleSchedule = () => {
    if (loading) { // Evitar ação se ainda estiver carregando a sessão
        console.warn("Autenticação ainda carregando, agendamento adiado.");
        return;
    }
    if (!user) {
      navigate('/login', { state: { returnTo: '/agendar' } });
    } else {
      navigate('/agendar', { state: { examType: title } });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-[1.02] flex flex-col h-full">
      <div className="bg-teal-600 p-4">
        <FileCheck className="w-8 h-8 text-white mb-2" />
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-gray-600 mb-4 flex-1">{description}</p>
        <div className="flex items-center text-gray-700 mb-4">
          <Clock className="w-5 h-5 mr-2 text-teal-600" />
          <span>{duration}</span>
        </div>
        <div className="mt-auto">
          <div className="text-2xl font-bold text-teal-600 mb-4">
            R$ {price.toFixed(2)}
          </div>
          <button
            onClick={handleSchedule}
            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            disabled={loading} // Desabilita o botão enquanto a autenticação carrega
          >
            Agendar Exame
          </button>
        </div>
      </div>
    </div>
  );
}