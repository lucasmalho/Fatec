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

// Simulação de API - Em produção, isso seria substituído por chamadas reais ao backend
export async function buscarLaboratorios(uf: string, cidade: string): Promise<Laboratorio[]> {
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Dados mockados para demonstração
  return [
    {
      id: '1',
      nome: 'Laboratório Central',
      endereco: 'Av. Principal, 123',
      bairro: 'Centro',
      cidade,
      uf,
      telefone: '(11) 3333-4444',
      horario: 'Seg-Sex: 7h às 17h',
      distancia: 1.2
    },
    {
      id: '2',
      nome: 'Lab Express',
      endereco: 'Rua das Flores, 456',
      bairro: 'Jardim Europa',
      cidade,
      uf,
      telefone: '(11) 4444-5555',
      horario: 'Seg-Sab: 6h às 18h',
      distancia: 2.5
    },
    {
      id: '3',
      nome: 'ToxiLab Plus',
      endereco: 'Rua do Comércio, 789',
      bairro: 'Vila Nova',
      cidade,
      uf,
      telefone: '(11) 5555-6666',
      horario: 'Seg-Sex: 6h às 20h',
      distancia: 3.8
    }
  ];
}