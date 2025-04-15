import React from 'react';
import { FlaskConical, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  
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
          <Link 
            to="/login" 
            className="flex items-center space-x-1 bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-md transition-colors"
          >
            <LogIn size={18} />
            <span>Entrar</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}