import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, ArrowLeft, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validatePassword } from '../lib/supabase';

type RegisterType = 'client' | 'laboratory' | null;
// teste teste teste
interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  document: string;
  password: string;
  confirmPassword: string;
  // Campos específicos para laboratório
  companyName?: string;
  cnes?: string;
  address?: string;
  city?: string;
  state?: string;
}

export function Register() {
  const [registerType, setRegisterType] = useState<RegisterType>(null);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    document: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Mostrar requisitos de senha quando o usuário começa a digitar a senha
    if (name === 'password') {
      setShowPasswordRequirements(true);
    }
  };

  const formatDocument = (value: string) => {
    if (registerType === 'client') {
      // Formata CPF
      return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .slice(0, 14);
    } else {
      // Formata CNPJ
      return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    }
    return value.slice(0, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      // Validar senha
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        {
          full_name: formData.name,
          phone: formData.phone,
          type: registerType === 'client' ? 'client' : 'partner'
        }
      );

      if (signUpError) {
        throw signUpError;
      }

      // Redirecionar para a página de verificação de email
      navigate('/verificar-email');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao realizar cadastro');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!registerType) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Cadastro</h2>
            <p className="mt-2 text-gray-600">Escolha o tipo de cadastro</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setRegisterType('client')}
              className="w-full flex items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <User className="w-8 h-8 text-teal-600 mr-4" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-800">Cliente</h3>
                <p className="text-gray-600">Cadastro para acesso aos resultados de exames</p>
              </div>
            </button>

            <button
              onClick={() => setRegisterType('laboratory')}
              className="w-full flex items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <Building2 className="w-8 h-8 text-teal-600 mr-4" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-800">Laboratório</h3>
                <p className="text-gray-600">Cadastro para laboratórios parceiros</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => {
            setRegisterType(null);
            setError('');
          }}
          className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center mb-8">
            {registerType === 'client' ? (
              <User className="w-12 h-12 text-teal-600 mr-4" />
            ) : (
              <Building2 className="w-12 h-12 text-teal-600 mr-4" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {registerType === 'client' ? 'Cadastro de Cliente' : 'Cadastro de Laboratório'}
              </h2>
              <p className="text-gray-600">
                Preencha os dados abaixo para criar sua conta
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {registerType === 'laboratory' && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Laboratório
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {registerType === 'client' ? 'Nome Completo' : 'Nome do Responsável'}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setFormData(prev => ({ ...prev, phone: formatted }));
                }}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                {registerType === 'client' ? 'CPF' : 'CNPJ'}
              </label>
              <input
                type="text"
                id="document"
                name="document"
                value={formData.document}
                onChange={(e) => {
                  const formatted = formatDocument(e.target.value);
                  setFormData(prev => ({ ...prev, document: formatted }));
                }}
                placeholder={registerType === 'client' ? '000.000.000-00' : '00.000.000/0000-00'}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            {registerType === 'laboratory' && (
              <>
                <div>
                  <label htmlFor="cnes" className="block text-sm font-medium text-gray-700 mb-1">
                    CNES
                  </label>
                  <input
                    type="text"
                    id="cnes"
                    name="cnes"
                    value={formData.cnes || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <span className="text-xs text-gray-500">
                  É obrigatório conter, pelo menos, 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caracter especial
                </span>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}