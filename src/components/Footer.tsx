import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Footer: React.FC = () => {
  const { theme } = useTheme();
  const year = new Date().getFullYear();
  
  return (
    <footer className={`py-4 px-6 ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
    }`}>
      <div className="container mx-auto flex justify-center items-center">
        <p className="text-sm">
          &copy; {year} Prediction System. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;