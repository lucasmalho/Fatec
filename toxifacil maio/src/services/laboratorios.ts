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
  email: string;
}

// Simulação de API - Em produção, isso seria substituído por chamadas reais ao backend
export async function buscarLaboratorios(uf: string, cidade: string): Promise<Laboratorio[]> {
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Dados mockados com laboratórios reais do banco de dados
  return [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      nome: 'Laboratório Central',
      endereco: 'Av. Principal, 123',
      bairro: 'Centro',
      cidade,
      uf,
      telefone: '(11) 3333-4444',
      horario: 'Seg-Sex: 7h às 17h',
      distancia: 1.2,
      email: 'lab1@example.com'
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      nome: 'Lab Express',
      endereco: 'Rua das Flores, 456',
      bairro: 'Jardim Europa',
      cidade,
      uf,
      telefone: '(11) 4444-5555',
      horario: 'Seg-Sab: 6h às 18h',
      distancia: 2.5,
      email: 'lab2@example.com'
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      nome: 'ToxiLab Plus',
      endereco: 'Rua do Comércio, 789',
      bairro: 'Vila Nova',
      cidade,
      uf,
      telefone: '(11) 5555-6666',
      horario: 'Seg-Sex: 6h às 20h',
      distancia: 3.8,
      email: 'lab3@example.com'
    }
  ];
}