import React, { useState } from 'react';
import { MapPin, Search, Loader2, Phone, Clock, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { consultarCEP } from '../services/cep';
import { buscarLaboratorios } from '../services/laboratorios';

interface EnderecoState {
  bairro: string;
  cidade: string;
  uf: string;
}

interface Laboratorio {
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

export function LabSearch() {
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState<EnderecoState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [buscandoLabs, setBuscandoLabs] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const formatarCEP = (valor: string) => {
    const cepLimpo = valor.replace(/\D/g, '');
    if (cepLimpo.length <= 8) {
      return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return valor.slice(0, 9);
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = formatarCEP(e.target.value);
    setCep(valor);
    if (error) setError(null);
    if (endereco) {
      setEndereco(null);
      setLaboratorios([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEndereco(null);
    setLaboratorios([]);
    
    if (cep.length < 8) {
      setError('Digite um CEP válido');
      return;
    }

    setIsLoading(true);
    try {
      const data = await consultarCEP(cep);
      setEndereco({
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf
      });
      await buscarLaboratoriosProximos(data.localidade, data.uf);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao consultar CEP');
    } finally {
      setIsLoading(false);
    }
  };

  const buscarLaboratoriosProximos = async (cidade: string, uf: string) => {
    setBuscandoLabs(true);
    try {
      const labs = await buscarLaboratorios(uf, cidade);
      setLaboratorios(labs);
    } catch (err) {
      setError('Erro ao buscar laboratórios próximos');
    } finally {
      setBuscandoLabs(false);
    }
  };

  const handleLabSelection = (lab: Laboratorio) => {
    if (!user) {
      navigate('/login', { 
        state: { 
          returnTo: '/agendar',
          labInfo: {
            id: lab.id,
            nome: lab.nome,
            endereco: `${lab.endereco}, ${lab.bairro}, ${lab.cidade} - ${lab.uf}`
          }
        }
      });
    } else {
      navigate('/agendar', {
        state: {
          labInfo: {
            id: lab.id,
            nome: lab.nome,
            endereco: `${lab.endereco}, ${lab.bairro}, ${lab.cidade} - ${lab.uf}`
          }
        }
      });
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-center mb-6">
        <MapPin className="w-8 h-8 text-teal-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">
          Encontre um Laboratório Próximo
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
            Digite seu CEP
          </label>
          <input
            type="text"
            id="cep"
            value={cep}
            onChange={handleCEPChange}
            placeholder="00000-000"
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            required
            maxLength={9}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="self-end bg-teal-600 text-white h-[42px] px-6 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:bg-teal-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </form>

      {endereco && (
        <div className="mt-6">
          <div className="p-4 bg-teal-50 rounded-md mb-6">
            <h3 className="font-semibold text-teal-800 mb-2">Localização encontrada:</h3>
            <p className="text-teal-700">
              {endereco.bairro && `${endereco.bairro}, `}
              {endereco.cidade} - {endereco.uf}
            </p>
          </div>

          {buscandoLabs ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              <span className="ml-3 text-gray-600">Buscando laboratórios próximos...</span>
            </div>
          ) : laboratorios.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Laboratórios Encontrados
              </h3>
              {laboratorios.map((lab) => (
                <div key={lab.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{lab.nome}</h4>
                      <p className="text-gray-600">{lab.endereco}</p>
                      <p className="text-gray-600">{lab.bairro}, {lab.cidade} - {lab.uf}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-teal-600 mb-2">
                        <Navigation className="w-4 h-4 mr-1" />
                        <span>{lab.distancia.toFixed(1)} km</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{lab.telefone}</span>
                    <Clock className="w-4 h-4 ml-6 mr-2" />
                    <span>{lab.horario}</span>
                  </div>

                  <button
                    onClick={() => handleLabSelection(lab)}
                    className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    Agendar Exame
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}