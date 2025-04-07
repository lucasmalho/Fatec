export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
}

export interface ExamResult {
  id: string;
  userId: string;
  examType: string;
  date: string;
  status: 'pending' | 'completed';
  result?: 'negative' | 'positive';
  laboratory: string;
  pdfUrl?: string;
}

export const users: User[] = [
  {
    id: '1',
    username: 'tcc@malho.com.br',
    password: 'TCCFatec1*',
    name: 'Administrador'
  }
];

export const examResults: ExamResult[] = [
  {
    id: '1',
    userId: '1',
    examType: 'Toxicológico para CNH',
    date: '2024-03-15',
    status: 'completed',
    result: 'negative',
    laboratory: 'Laboratório Central',
    pdfUrl: '/results/exam-001.pdf'
  },
  {
    id: '2',
    userId: '1',
    examType: 'Toxicológico Ocupacional',
    date: '2024-03-20',
    status: 'pending',
    laboratory: 'Lab Express'
  },
  {
    id: '3',
    userId: '2',
    examType: 'Toxicológico para CNH',
    date: '2024-03-10',
    status: 'completed',
    result: 'negative',
    laboratory: 'ToxiLab Plus',
    pdfUrl: '/results/exam-002.pdf'
  },
  {
    id: '4',
    userId: '3',
    examType: 'Toxicológico Completo',
    date: '2024-03-18',
    status: 'completed',
    result: 'negative',
    laboratory: 'Laboratório Central',
    pdfUrl: '/results/exam-003.pdf'
  }
];