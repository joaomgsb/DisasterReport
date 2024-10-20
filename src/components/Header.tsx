import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, LogIn, UserPlus, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <AlertTriangle size={28} className="text-indigo-600" />
            <span className="text-2xl font-bold text-gray-800">DisasterReport</span>
          </Link>
          <nav className="hidden md:flex space-x-6 items-center">
            <NavLinks currentUser={currentUser} isAdmin={isAdmin} logout={logout} />
          </nav>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-gray-800">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white py-2">
          <nav className="flex flex-col space-y-2 px-4">
            <NavLinks currentUser={currentUser} isAdmin={isAdmin} logout={logout} isMobile />
          </nav>
        </div>
      )}
    </header>
  );
};

const NavLinks: React.FC<{ currentUser: any; isAdmin: boolean; logout: () => void; isMobile?: boolean }> = ({ currentUser, isAdmin, logout, isMobile }) => {
  const linkClass = isMobile ? "block py-2" : "";
  const buttonClass = isMobile ? "w-full text-left" : "";

  return (
    <>
      <Link to="/" className={`${linkClass} hover:text-indigo-600 transition duration-300`}>Início</Link>
      <Link to="/report" className={`${linkClass} hover:text-indigo-600 transition duration-300`}>Reportar Desastre</Link>
      <Link to="/map" className={`${linkClass} hover:text-indigo-600 transition duration-300`}>Mapa de Desastres</Link>
      {currentUser ? (
        <>
          <Link to="/dashboard" className={`${linkClass} hover:text-indigo-600 transition duration-300`}>Painel</Link>
          {isAdmin && <Link to="/admin" className={`${linkClass} hover:text-indigo-600 transition duration-300`}>Admin</Link>}
          <button onClick={logout} className={`${buttonClass} btn btn-secondary`}>Sair</button>
        </>
      ) : (
        <>
          <Link to="/login" className={`${linkClass} btn btn-secondary flex items-center ${buttonClass}`}>
            <LogIn size={18} className="mr-2" />
            Entrar
          </Link>
          <Link to="/register" className={`${linkClass} btn btn-primary flex items-center ${buttonClass}`}>
            <UserPlus size={18} className="mr-2" />
            Registrar
          </Link>
        </>
      )}
    </>
  );
};

export default Header;