import React from 'react';
import { X } from 'lucide-react';

interface PrivacyPolicyPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyPopup({ isOpen, onClose }: PrivacyPolicyPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Política de Privacidade e Cookies</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-4">1. Introdução</h3>
            <p className="mb-4">
              Esta Política de Privacidade e Cookies descreve como o site ToxiFácil 
              coleta, usa e protege as informações que você fornece ao utilizar nosso site.
            </p>

            <h3 className="text-xl font-semibold mb-4">2. Informações que Coletamos</h3>
            <p className="mb-2">Podemos coletar os seguintes tipos de informações:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Informações pessoais (nome, e-mail, telefone)</li>
              <li>Dados de agendamento de exames</li>
              <li>Informações de navegação e uso do site</li>
              <li>Cookies e tecnologias similares</li>
            </ul>

            <h3 className="text-xl font-semibold mb-4">3. Uso de Cookies</h3>
            <p className="mb-2">Utilizamos cookies para:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Manter você conectado durante sua sessão</li>
              <li>Lembrar suas preferências</li>
              <li>Melhorar a performance do site</li>
              <li>Analisar como o site é utilizado</li>
            </ul>

            <h3 className="text-xl font-semibold mb-4">4. Como Usamos suas Informações</h3>
            <p className="mb-2">Suas informações são utilizadas para:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Processar agendamentos de exames</li>
              <li>Enviar confirmações e lembretes</li>
              <li>Melhorar nossos serviços</li>
              <li>Comunicar atualizações importantes</li>
            </ul>

            <h3 className="text-xl font-semibold mb-4">5. Proteção de Dados</h3>
            <p className="mb-4">
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas 
              informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>

            <h3 className="text-xl font-semibold mb-4">6. Seus Direitos</h3>
            <p className="mb-2">Você tem o direito de:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incorretos</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Retirar seu consentimento a qualquer momento</li>
            </ul>

            <h3 className="text-xl font-semibold mb-4">7. Contato</h3>
            <p className="mb-4">
              Para questões sobre esta política ou sobre seus dados pessoais, entre em contato 
              através do e-mail: privacidade@toxifacil.com.br
            </p>

            <h3 className="text-xl font-semibold mb-4">8. Atualizações da Política</h3>
            <p className="mb-4">
              Esta política pode ser atualizada periodicamente. Recomendamos que você revise 
              esta página regularmente para se manter informado sobre quaisquer mudanças.
            </p>
          </div>
        </div>

        <div className="border-t p-6 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}