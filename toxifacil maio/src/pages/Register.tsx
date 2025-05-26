import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, ArrowLeft, AlertCircle, Info, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validatePassword } from '../lib/supabase';

type RegisterType = 'client' | 'laboratory' | null;

interface RegisterFormData {
  name: string; // Este é o nome do input do formulário, que pode ser full_name ou responsible_name no DB
  email: string;
  phone: string;
  document: string; // Este será CPF ou CNES
  password: string;
  confirmPassword: string;
  // Campos específicos de laboratório - Adicione TODOS os campos do seu DB que são NOT NULL para laboratórios.
  companyName?: string; 
  address?: string;
  city?: string;
  state?: string;
  cnpj?: string; 
}

export default function Register() {
  const [registerType, setRegisterType] = useState<RegisterType>(null);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    document: '',
    password: '',
    confirmPassword: '',
    companyName: '', 
    address: '', 
    city: '', 
    state: '',
    cnpj: '', 
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false); 
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newFormData = { 
        ...prev,
        [name]: value
      };

      if (name === 'password' || name === 'confirmPassword') {
        const passwordValue = (name === 'password' ? value : newFormData.password);
        const confirmPasswordValue = (name === 'confirmPassword' ? value : newFormData.confirmPassword);
        
        setPasswordsMatch(
          passwordValue === confirmPasswordValue || 
          passwordValue === '' || 
          confirmPasswordValue === ''
        );
      }

      if (name === 'password') {
        setShowPasswordRequirements(true);
      }

      return newFormData; 
    });
  };

  const formatDocument = (value: string) => {
    if (registerType === 'client') {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .slice(0, 14);
    } else { 
      return value.replace(/\D/g, '').slice(0, 7); 
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

      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      // --- SEÇÃO CRÍTICA: CONSTRUÇÃO DO userData PARA ENVIAR PARA O SUPABASE ---
      // O erro 'full_name cannot be null' ou outros NOT NULL acontece aqui.
      const userData: any = {
        email: formData.email, 
        phone: formData.phone,
        type: registerType, 
        
        // CORREÇÃO: Garanta que full_name ou responsible_name NUNCA sejam NULL/UNDEFINED se são NOT NULL no DB.
        // Se `formData.name` pode estar vazio (por exemplo, se o campo não é preenchido), use uma string vazia '' em vez de null.
        // O DB aceita string vazia, mas não NULL se o campo for NOT NULL.
        full_name: registerType === 'client' ? (formData.name || '') : null, 
        responsible_name: registerType === 'laboratory' ? (formData.name || '') : null, 
        
        cpf: registerType === 'client' ? (formData.document || null) : null, 
        cnes: registerType === 'laboratory' ? (formData.document || null) : null, 

        ...(registerType === 'laboratory' && {
          company_name: formData.companyName || null, 
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          cnpj: (formData.cnpj && formData.cnpj.replace(/\D/g, '').length === 14) ? formData.cnpj.replace(/\D/g, '') : null, 
        })
      };

      // --- VALIDAÇÕES ADICIONAIS NO FRONTEND ANTES DE ENVIAR (CRÍTICO) ---
      // Adicione console.log(userData) aqui para ver o objeto ANTES de enviar.
      console.log('Dados do usuário a serem enviados para o signUp:', userData); 

      // Validações básicas (comuns a todos os tipos de usuário)
      if (!userData.email) throw new Error('E-mail é obrigatório.');
      if (!userData.phone) throw new Error('Telefone é obrigatório.');
      if (!userData.type) throw new Error('Tipo de cadastro é obrigatório.');
      // Ajuste aqui: Valide formData.name diretamente, pois ele é a origem
      if (!formData.name) throw new Error('Nome/Responsável é obrigatório.'); 

      if (registerType === 'client') {
          // A validação !userData.full_name aqui pode ser redundante se você já garantiu (formData.name || '')
          if (!userData.full_name) throw new Error('Nome completo é obrigatório para clientes.'); 
          if (!userData.cpf) throw new Error('CPF é obrigatório para clientes.');
          if (userData.cpf && userData.cpf.replace(/\D/g, '').length !== 11) { throw new Error('CPF inválido (11 dígitos).'); }
      } 
      else if (registerType === 'laboratory') {
          // A validação !userData.responsible_name pode ser redundante
          if (!userData.responsible_name) throw new Error('Nome do responsável é obrigatório para laboratórios.'); 
          if (!userData.cnes) throw new Error('CNES é obrigatório para laboratórios.');
          if (userData.cnes && userData.cnes.replace(/\D/g, '').length !== 7) { throw new Error('CNES inválido (7 dígitos).'); }
          if (!userData.company_name) throw new Error('Nome do laboratório é obrigatório.');
          if (!userData.address) throw new Error('Endereço é obrigatório.');
          if (!userData.city) throw new Error('Cidade é obrigatória.');
          if (!userData.state) throw new Error('Estado é obrigatório.');
          if (!userData.cnpj) throw new Error('CNPJ é obrigatório para laboratórios.');
          if (userData.cnpj && userData.cnpj.replace(/\D/g, '').length !== 14) { throw new Error('CNPJ inválido (14 dígitos).'); }
      }


      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        userData 
      );

      if (signUpError) {
        throw signUpError;
      }

      navigate('/verificar-email', { state: { fromRegistration: true } });
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Erro ao realizar cadastro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {!registerType ? ( 
        <div className="flex flex-col items-center justify-center min-h-[500px]"> 
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
      ) : ( 
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => {
              setRegisterType(null);
              setError('');
              setFormData({
                name: '', email: '', phone: '', document: '', password: '', confirmPassword: '',
                companyName: '', address: '', city: '', state: '', cnpj: '' 
              });
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
              {/* Nome do Laboratório */}
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
                    required={registerType === 'laboratory'} 
                  />
                </div>
              )}

              {/* Nome Completo / Nome do Responsável */}
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

              {/* Email */}
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

              {/* Telefone */}
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

              {/* CPF / CNES */}
              <div>
                <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                  {registerType === 'client' ? 'CPF' : 'CNES'}
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
                  placeholder={registerType === 'client' ? '000.000.000-00' : '0000000'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Campos adicionais para Laboratório */}
              {registerType === 'laboratory' && (
                <>
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
                      required={registerType === 'laboratory'} 
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
                        required={registerType === 'laboratory'} 
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
                        required={registerType === 'laboratory'} 
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      id="cnpj"
                      name="cnpj"
                      value={formData.cnpj || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required={registerType === 'laboratory'} 
                    />
                  </div>
                </>
              )}

              {/* Seções de Senha e Confirmar Senha */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <span className="text-xs text-gray-500">
                    É obrigatório conter, pelo menos, 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caracter especial
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                  >
                    {showPassword ? ( <EyeOff className="h-5 w-5" /> ) : ( <Eye className="h-5 w-5" /> )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10 ${
                      !passwordsMatch && formData.confirmPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                  >
                    {showConfirmPassword ? ( <EyeOff className="h-5 w-5" /> ) : ( <Eye className="h-5 w-5" /> )}
                  </button>
                </div>
                {!passwordsMatch && formData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    As senhas não coincidem
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !passwordsMatch}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}