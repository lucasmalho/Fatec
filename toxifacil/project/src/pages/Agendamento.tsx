import React, { useState } from 'react';
import { Calendar, Clock, CreditCard, User, Mail, Phone as PhoneIcon, MapPin, FileCheck } from 'lucide-react';

interface AgendamentoProps {
  laboratorioId: string;
  laboratorio: {
    nome: string;
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
}

interface ExameTipo {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  duracao: string;
}

const exameTipos: ExameTipo[] = [
  {
    id: 'cnh',
    titulo: 'Toxicológico para CNH',
    descricao: 'Exame completo para renovação ou obtenção da CNH',
    preco: 195.00,
    duracao: '30 minutos'
  },
  {
    id: 'ocupacional',
    titulo: 'Toxicológico Ocupacional',
    descricao: 'Exame para empresas e processos seletivos',
    preco: 220.00,
    duracao: '45 minutos'
  },
  {
    id: 'completo',
    titulo: 'Toxicológico Completo',
    descricao: 'Análise expandida para acompanhamento médico',
    preco: 350.00,
    duracao: '1 hora'
  }
];

const horarios = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30'
];

export function Agendamento({ laboratorioId, laboratorio }: AgendamentoProps) {
  const [step, setStep] = useState(1);
  const [exameId, setExameId] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatarPreco = (preco: number) => {
    return preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatarCPF = (valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  };

  const formatarTelefone = (valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const formatarData = (data: string) => {
    if (!data) return '';
    const [year, month, day] = data.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar integração com backend
    console.log('Agendamento:', {
      laboratorioId,
      exameId,
      data,
      horario,
      ...formData
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Agendar Exame</h1>
        
        {/* Informações do Laboratório */}
        <div className="bg-teal-50 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-teal-600 mt-1 mr-2" />
            <div>
              <h2 className="font-semibold text-teal-800">{laboratorio.nome}</h2>
              <p className="text-teal-600">
                {laboratorio.endereco}, {laboratorio.bairro}
              </p>
              <p className="text-teal-600">
                {laboratorio.cidade} - {laboratorio.uf}
              </p>
            </div>
          </div>
        </div>

        {/* Progresso */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full mx-1 ${
                s <= step ? 'bg-teal-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Seleção do Exame */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Selecione o tipo de exame
              </h2>
              {exameTipos.map((tipo) => (
                <div
                  key={tipo.id}
                  className={`border rounded-lg p-6 cursor-pointer transition-all ${
                    exameId === tipo.id
                      ? 'border-teal-600 bg-teal-50'
                      : 'hover:border-teal-300'
                  }`}
                  onClick={() => setExameId(tipo.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {tipo.titulo}
                      </h3>
                      <p className="text-gray-600">{tipo.descricao}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-teal-600">
                        {formatarPreco(tipo.preco)}
                      </p>
                      <p className="text-sm text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {tipo.duracao}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                disabled={!exameId}
                onClick={() => setStep(2)}
                className="w-full mt-6 bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Step 2: Data e Hora */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Escolha a data e horário
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Data
                </label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Horário
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {horarios.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHorario(h)}
                      className={`p-2 text-center rounded-md border ${
                        horario === h
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'border-gray-300 hover:border-teal-300'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={!data || !horario}
                  onClick={() => setStep(3)}
                  className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Dados Pessoais */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Seus dados
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-2" />
                    Nome completo
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-2" />
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                    <PhoneIcon className="w-4 h-4 inline mr-2" />
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={(e) => {
                      const formatted = formatarTelefone(e.target.value);
                      setFormData(prev => ({ ...prev, telefone: formatted }));
                    }}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                    <FileCheck className="w-4 h-4 inline mr-2" />
                    CPF
                  </label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={(e) => {
                      const formatted = formatarCPF(e.target.value);
                      setFormData(prev => ({ ...prev, cpf: formatted }));
                    }}
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Resumo do Agendamento
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-medium">Exame:</span>{' '}
                    {exameTipos.find(e => e.id === exameId)?.titulo}
                  </p>
                  <p>
                    <span className="font-medium">Data:</span>{' '}
                    {formatarData(data)}
                  </p>
                  <p>
                    <span className="font-medium">Horário:</span> {horario}
                  </p>
                  <p>
                    <span className="font-medium">Valor:</span>{' '}
                    {formatarPreco(exameTipos.find(e => e.id === exameId)?.preco || 0)}
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Ir para Pagamento
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}