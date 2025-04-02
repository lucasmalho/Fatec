import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, LogOut, FileCheck, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Exam {
  id: string;
  exam_type: string;
  date: string;
  status: 'pending' | 'completed';
  result?: 'negative' | 'positive';
  laboratory: string;
  pdf_url?: string;
}

export function Results() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchExams() {
      try {
        const { data, error } = await supabase
          .from('exams')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        setExams(data || []);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Erro ao carregar exames');
      } finally {
        setLoading(false);
      }
    }

    fetchExams();
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Resultados</h1>
            <p className="text-gray-600 mt-2">
              Bem-vindo(a), {user.user_metadata?.full_name || 'Usuário'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Você não possui exames
              </h2>
              <p className="text-gray-600 mb-6">
                Clique no botão abaixo para agendar seu primeiro exame toxicológico.
              </p>
              <button
                onClick={() => navigate('/agendar')}
                className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Exame
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {exam.exam_type}
                    </h3>
                    <p className="text-gray-600">
                      Laboratório: {exam.laboratory}
                    </p>
                    <p className="text-gray-600">
                      Data: {new Date(exam.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {exam.status === 'completed' ? (
                      <span className="flex items-center text-green-600">
                        <FileCheck className="w-5 h-5 mr-1" />
                        Concluído
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600">
                        <Clock className="w-5 h-5 mr-1" />
                        Em andamento
                      </span>
                    )}
                  </div>
                </div>
                {exam.status === 'completed' && exam.pdf_url && (
                  <div className="mt-4">
                    <a
                      href={exam.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-teal-600 hover:text-teal-700"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Visualizar Resultado
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}