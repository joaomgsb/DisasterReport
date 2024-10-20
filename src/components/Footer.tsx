import React from 'react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <p>&copy; 2024 Disaster Report. All rights reserved.</p>
        <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-gray-300">
          <Github size={20} className="mr-2" />
          View on GitHub
        </a>
      </div>
    </footer>
  );
};

export default Footer;