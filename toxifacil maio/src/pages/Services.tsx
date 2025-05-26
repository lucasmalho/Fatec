import React from 'react';
import { FileCheck, Clock, Shield, Truck, Award, Users } from 'lucide-react';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  price: number;
  duration: string;
}

function ServiceCard({ icon, title, description, features, price, duration }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      <div className="bg-teal-600 p-6">
        <div className="flex items-center space-x-4">
          {icon}
          <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-gray-600 mb-6">{description}</p>
        <ul className="space-y-3 mb-6 flex-grow">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Shield className="w-5 h-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center text-gray-700">
              <Clock className="w-5 h-5 mr-2 text-teal-600" />
              <span>{duration}</span>
            </div>
            <div className="text-2xl font-bold text-teal-600">
              R$ {price.toFixed(2)}
            </div>
          </div>
          <button className="w-full bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
            Agendar Exame
          </button>
        </div>
      </div>
    </div>
  );
}

export function Services() {
  const services = [
    {
      icon: <FileCheck className="w-8 h-8 text-white" />,
      title: 'Toxicológico para CNH',
      description: 'Exame completo e preciso para renovação ou obtenção da CNH, atendendo todas as exigências do CONTRAN.',
      features: [
        'Detecta uso de substâncias nos últimos 90 dias',
        'Laudo reconhecido em todo território nacional',
        'Coleta indolor de amostras de cabelo ou pelo',
        'Certificado digital incluso'
      ],
      price: 195.00,
      duration: 'Resultado em até 48h'
    },
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: 'Toxicológico Ocupacional',
      description: 'Análise completa para empresas e processos seletivos, garantindo segurança e conformidade com as normas trabalhistas.',
      features: [
        'Atende requisitos da NR-7',
        'Ideal para admissão e demissão',
        'Análise de múltiplas substâncias',
        'Relatório detalhado para empresa'
      ],
      price: 220.00,
      duration: 'Resultado em até 72h'
    },
    {
      icon: <Award className="w-8 h-8 text-white" />,
      title: 'Toxicológico Completo',
      description: 'Análise expandida e detalhada que detecta uma ampla gama de substâncias, ideal para acompanhamento médico.',
      features: [
        'Painel completo de substâncias',
        'Histórico detalhado de exposição',
        'Consultoria médica especializada',
        'Confidencialidade garantida'
      ],
      price: 350.00,
      duration: 'Resultado em até 5 dias úteis'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Nossos Serviços</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Oferecemos uma gama completa de exames toxicológicos, atendendo diferentes 
          necessidades com precisão e confiabilidade.
        </p>
      </div>

      {/* Diferenciais */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <Shield className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Certificação ABNT</h3>
          <p className="text-gray-600">
            Laboratórios certificados seguindo as mais rigorosas normas de qualidade
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <Truck className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ampla Cobertura</h3>
          <p className="text-gray-600">
            Rede de laboratórios parceiros em todo o território nacional
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <Clock className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Agilidade</h3>
          <p className="text-gray-600">
            Resultados rápidos e precisos com a maior tecnologia do mercado
          </p>
        </div>
      </div>

      {/* Lista de Serviços */}
      <div className="grid md:grid-cols-3 gap-8">
        {services.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>

      {/* Informações Adicionais */}
      <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Informações Importantes
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Documentos Necessários
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Documento de identidade com foto (RG ou CNH)</li>
              <li>• CPF</li>
              <li>• Comprovante de residência</li>
              <li>• Requisição médica (quando aplicável)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Preparação para o Exame
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Não é necessário jejum</li>
              <li>• Cabelos/pelos devem ter no mínimo 3cm de comprimento</li>
              <li>• Não é necessário interromper medicamentos</li>
              <li>• Procedimento rápido e indolor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}