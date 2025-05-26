import React from 'react';
import { FlaskConical, LogIn, LogOut, User as UserIcon } from 'lucide-react'; // Renomear User para evitar conflito com tipo User do Supabase
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const location = useLocation();
  const { user, loading, signOut } = useAuth(); // <--- Pegar o estado 'loading'
  const navigate = useNavigate();

  // Se a autenticação ainda está carregando, renderize um estado de carregamento ou nada.
  // Isso evita que os componentes tentem acessar 'user' antes que ele seja populado.
  if (loading) {
    return (
      <header className="bg-teal-700 text-white">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <FlaskConical size={32} className="text-teal-300" />
            <h1 className="text-2xl font-bold">ToxiFácil</h1>
          </Link>
          <div className="text-gray-300">Carregando...</div> {/* Estado de carregamento */}
        </div>
      </header>
    );
  }

  return (
    <header className="bg-teal-700 text-white">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <FlaskConical size={32} className="text-teal-300" />
          <h1 className="text-2xl font-bold">ToxiFácil</h1>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-teal-300 transition-colors">Início</Link>
          <Link to="/sobre" className="hover:text-teal-300 transition-colors">Sobre</Link>
          <Link to="/servicos" className="hover:text-teal-300 transition-colors">Serviços</Link>
          <Link to="/contato" className="hover:text-teal-300 transition-colors">Contato</Link>
          {user ? (
            <div className="flex items-center space-x-6">
              <button
                // Adicionar verificações de nulidade para user_metadata e type
                onClick={() => navigate(user.user_metadata?.type === 'laboratory' ? '/laboratorio' : '/resultados')}
                className="flex items-center hover:text-teal-300 transition-colors"
              >
                <UserIcon size={18} className="mr-2" /> {/* Usar UserIcon */}
                {/* Adicionar verificações de nulidade para user_metadata e full_name */}
                <span>{user.user_metadata?.full_name || user.email || 'Usuário'}</span>
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-1 bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-md transition-colors"
              >
                <LogOut size={18} />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1 bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-md transition-colors"
            >
              <LogIn size={18} />
              <span>Entrar</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}