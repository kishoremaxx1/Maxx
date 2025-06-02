import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Activity } from 'lucide-react';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className={`py-4 px-6 shadow-md ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-blue-500" />
          <h1 className="text-xl font-bold">Prediction System</h1>
        </div>
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full ${
            theme === 'dark' 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-gray-100 hover:bg-gray-200'
          } transition-colors duration-200`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;