import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { ExamCard } from './components/ExamCard';
import { LabSearch } from './components/LabSearch';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Contact } from './pages/Contact';
import { Results } from './pages/Results';
import { Schedule } from './pages/Schedule';
import { Success } from './pages/Success';
import { VerifyEmail } from './pages/VerifyEmail';

function HomePage() {
  const exams = [
    {
      title: 'Toxicológico para CNH',
      description: 'Exame completo para renovação ou obtenção da CNH. Detecta uso de substâncias nos últimos 90 dias.',
      price: 195.00,
      duration: 'Resultado em até 48h',
    },
    {
      title: 'Toxicológico Ocupacional',
      description: 'Exame para empresas e processos seletivos. Análise abrangente com laudo detalhado.',
      price: 220.00,
      duration: 'Resultado em até 72h',
    },
    {
      title: 'Toxicológico Completo',
      description: 'Análise expandida que detecta uma ampla gama de substâncias. Ideal para acompanhamento médico.',
      price: 350.00,
      duration: 'Resultado em até 5 dias úteis',
    },
  ];

  return (
    <main className="container mx-auto px-4">
      <div className="py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo ao ToxiFácil
          </h1>
          <p className="text-xl text-gray-600">
            Resultados de exames toxicológicos com rapidez e segurança
          </p>
        </div>

        <div className="mb-16">
          <LabSearch />
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Nossos Exames
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {exams.map((exam) => (
              <ExamCard key={exam.title} {...exam} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow">
        {children}
      </div>
      <footer className="bg-gray-800 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>&copy; 2024 ToxiFácil - Todos os direitos reservados</p>
            <p className="mt-2 text-gray-400">
              Excelência em exames toxicológicos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/resultados" element={<Results />} />
          <Route path="/agendar" element={<Schedule />} />
          <Route path="/sucesso" element={<Success />} />
          <Route path="/verificar-email" element={<VerifyEmail />} />
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App