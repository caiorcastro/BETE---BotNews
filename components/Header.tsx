
import React from 'react';

interface HeaderProps {
  onLogout: () => void;
}


const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header className="bg-[#1a1a1a] shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <span className="material-icons text-primary text-3xl">newspaper</span>
            <h1 className="text-xl font-display font-bold text-white tracking-wider">
              BETE <span className="hidden sm:inline">- A Caçadora de Notícias</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-sm text-gray-400 font-semibold">
                Artplan
             </div>
            <button 
              onClick={onLogout}
              className="bg-primary text-black font-bold py-2 px-4 rounded-full text-sm hover:opacity-90 transition-opacity"
            >
              SAIR
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
