import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, MapPin, Activity } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 text-gray-800">Bem-vindo ao DisasterReport</h1>
        <p className="text-xl mb-8 text-gray-600">Ajude sua comunidade reportando desastres naturais e acompanhe as ações da Defesa Civil em tempo real.</p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
          <Link to="/report" className="btn btn-primary flex items-center justify-center">
            <AlertCircle className="mr-2" />
            Reportar um Desastre
          </Link>
          <Link to="/map" className="btn btn-secondary flex items-center justify-center">
            <MapPin className="mr-2" />
            Ver Mapa de Desastres
          </Link>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <FeatureCard
          icon={<AlertCircle className="w-12 h-12 text-indigo-600" />}
          title="Reporte Rápido"
          description="Envie relatórios de desastres de forma rápida e fácil, ajudando as autoridades a agir prontamente."
        />
        <FeatureCard
          icon={<MapPin className="w-12 h-12 text-indigo-600" />}
          title="Mapa Interativo"
          description="Visualize todos os desastres reportados em um mapa interativo e detalhado."
        />
        <FeatureCard
          icon={<Activity className="w-12 h-12 text-indigo-600" />}
          title="Atualizações em Tempo Real"
          description="Receba atualizações em tempo real sobre o status dos desastres e ações da Defesa Civil."
        />
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => {
  return (
    <div className="card text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Home;