import React from 'react';
import { GraduationCap, Code, Heart } from 'lucide-react';

export function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <GraduationCap className="w-16 h-16 text-teal-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sobre o ToxiFácil</h1>
          <div className="h-1 w-20 bg-teal-600 mx-auto"></div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <Code className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Trabalho de Conclusão de Curso
              </h2>
              <p className="text-gray-600">
                Essa página foi criada com o objetivo de ser o TCC de ADS - Fatec, 
                representando a culminação do aprendizado e dedicação ao longo do curso 
                de Análise e Desenvolvimento de Sistemas.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Heart className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Nossa Missão
              </h2>
              <p className="text-gray-600">
                O ToxiFácil nasceu da necessidade de simplificar e agilizar o processo 
                de realização de exames toxicológicos, conectando pacientes a laboratórios 
                de forma eficiente e segura. Nossa plataforma representa a união entre 
                tecnologia e saúde, visando proporcionar uma experiência mais prática e 
                acessível para todos os usuários.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-600">
          <p className="italic">
            "A tecnologia a serviço da saúde e bem-estar da sociedade."
          </p>
        </div>
      </div>
    </div>
  );
}