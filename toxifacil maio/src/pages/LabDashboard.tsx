import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Upload, FileText, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Client {
  id: string;
  full_name: string;
  cpf: string;
  email: string;
}

export function LabDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'cpf'>('name');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Verify if the user is a laboratory
    const checkUserType = async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('type')
        .eq('id', user.id)
        .single();

      if (error || profile?.type !== 'laboratory') {
        navigate('/');
      }
    };

    checkUserType();
  }, [user, navigate]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.length >= 1) {
        setLoading(true);
        setError(null);

        try {
          let query = supabase.from('users');

          if (searchType === 'cpf') {
            // Busca por CPF, remove caracteres não numéricos
            const cleanSearchTerm = searchTerm.replace(/\D/g, '');
            const { data, error: searchError } = await query
              .select('id, full_name, cpf, email')
              .ilike('cpf', `%${cleanSearchTerm}%`);

            if (searchError) throw searchError;

            setClients(data || []);
            if (!data || data.length === 0) {
              setError('Nenhum cliente encontrado');
            }
          } else {
            // Pesquisa por nome usando correspondência parcial, "case-insensitive"
            const { data, error: searchError } = await query
              .select('id, full_name, cpf, email')
              .ilike('full_name', `%${searchTerm}%`);

            if (searchError) throw searchError;

            setClients(data || []);
            if (!data || data.length === 0) {
              setError('Nenhum cliente encontrado');
            }
          }
        } catch (err) {
          console.error('Error searching clients:', err);
          setError('Erro ao buscar clientes');
          setClients([]);
        } finally {
          setLoading(false);
        }
      } else {
        setClients([]);
        setError(null);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Por favor, selecione um arquivo PDF válido');
      setFile(null);
    }
  };

  const uploadPDF = async () => {
    if (!file || !selectedClient) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Upload file to storage
      const fileExt = 'pdf';
      const fileName = `${Date.now()}_${selectedClient.id}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('exam_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('exam_documents')
        .getPublicUrl(filePath);

      // Create exam record
      const { error: insertError } = await supabase
        .from('exams')
        .insert({
          client_id: selectedClient.id,
          laboratory_id: user?.id,
          exam_type: 'Toxicológico',
          status: 'completed',
          pdf_url: publicUrl
        });

      if (insertError) throw insertError;

      setSuccess('Documento enviado com sucesso!');
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Painel do Laboratório
        </h1>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Buscar Cliente
          </h2>
          <div className="flex gap-4 mb-4">
            <select
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value as 'name' | 'cpf');
                setSearchTerm('');
                setClients([]);
                setError(null);
                setSelectedClient(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="name">Nome</option>
              <option value="cpf">CPF</option>
            </select>
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchType === 'cpf' ? 'Digite o CPF' : 'Digite o nome'}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-start mb-4">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-green-600">{success}</p>
            </div>
          )}

          {/* Search Results */}
          {clients.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Resultados da Busca
              </h3>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedClient?.id === client.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'hover:border-teal-300'
                    }`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {client.full_name}
                        </h4>
                        <p className="text-gray-600">CPF: {formatCPF(client.cpf)}</p>
                        <p className="text-gray-600">Email: {client.email}</p>
                      </div>
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload Section */}
        {selectedClient && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Enviar Documento
            </h2>
            <div className="bg-teal-50 rounded-lg p-4 mb-6">
              <p className="font-medium text-teal-800">
                Cliente selecionado: {selectedClient.full_name}
              </p>
              <p className="text-teal-600">CPF: {formatCPF(selectedClient.cpf)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="pdf-upload"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Selecionar arquivo PDF
                </label>
                <input
                  type="file"
                  id="pdf-upload"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-teal-50 file:text-teal-700
                    hover:file:bg-teal-100
                    cursor-pointer"
                />
              </div>

              <button
                onClick={uploadPDF}
                disabled={!file || uploading}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Enviar Documento
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}