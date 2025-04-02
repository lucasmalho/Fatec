import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, MapPin, Clock, Search, Loader2 } from 'lucide-react';
import { consultarCEP } from '../services/cep';
import { buscarLaboratorios } from '../services/laboratorios';
import { useAuth } from '../contexts/AuthContext';

interface Laboratory {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  telefone: string;
  horario: string;
  distancia: number;
}

export function Schedule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cep, setCep] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/agendar' } });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30'
  ];

  const handleCEPSearch = async () => {
    setError('');
    setLoading(true);
    try {
      const cepData = await consultarCEP(cep);
      const labs = await buscarLaboratorios(cepData.uf, cepData.localidade);
      setLaboratories(labs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar laboratórios');
      setLaboratories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLab || !selectedDate || !selectedTime) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    // TODO: Implementar integração com backend para salvar agendamento
    console.log('Agendamento:', { selectedLab, selectedDate, selectedTime });
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  const formatDateToBrazilian = (date: string) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Agendar Exame</h1>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Busca de CEP */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Encontre um laboratório próximo
            </h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                  Digite seu CEP
                </label>
                <input
                  type="text"
                  id="cep"
                  value={cep}
                  onChange={(e) => setCep(formatCEP(e.target.value))}
                  placeholder="00000-000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleCEPSearch}
                disabled={loading || cep.length < 8}
                className="self-end bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Buscar
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          )}

          {/* Lista de Laboratórios */}
          {laboratories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Laboratórios Encontrados
              </h2>
              <div className="space-y-4">
                {laboratories.map((lab) => (
                  <div
                    key={lab.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedLab?.id === lab.id
                        ? 'border-teal-600 bg-teal-50'
                        : 'hover:border-teal-300'
                    }`}
                    onClick={() => setSelectedLab(lab)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{lab.nome}</h3>
                        <p className="text-gray-600">{lab.endereco}</p>
                        <p className="text-gray-600">
                          {lab.bairro}, {lab.cidade} - {lab.uf}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-teal-600 font-medium">
                          {lab.distancia.toFixed(1)} km
                        </p>
                        <p className="text-sm text-gray-500">{lab.horario}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seleção de Data e Hora */}
          {selectedLab && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  <CalendarIcon className="w-4 h-4 inline mr-2" />
                  Selecione a Data
                </label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Selecione o Horário
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 text-center rounded-md border ${
                        selectedTime === time
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'border-gray-300 hover:border-teal-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resumo do Agendamento */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Resumo do Agendamento
                </h3>
                <div className="space-y-2">
                  <p className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {selectedLab.nome}
                  </p>
                  {selectedDate && (
                    <p className="flex items-center text-gray-600">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formatDateToBrazilian(selectedDate)}
                    </p>
                  )}
                  {selectedTime && (
                    <p className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {selectedTime}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Confirmar Agendamento
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}