import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { AlertCircle, CheckCircle, XCircle, MapPin, Calendar, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Disaster {
  id: string;
  type: string;
  location: string;
  description: string;
  status: 'pendente' | 'em-progresso' | 'resolvido';
  createdAt: string;
  lat: number;
  lng: number;
  photoURL?: string;
  votes: number;
}

const Dashboard: React.FC = () => {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [filter, setFilter] = useState<'all' | 'pendente' | 'em-progresso' | 'resolvido'>('all');
  const { isAdmin } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'disasters'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const disasterList: Disaster[] = [];
      querySnapshot.forEach((doc) => {
        disasterList.push({ id: doc.id, ...doc.data() } as Disaster);
      });
      setDisasters(disasterList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, newStatus: 'pendente' | 'em-progresso' | 'resolvido') => {
    await updateDoc(doc(db, 'disasters', id), { status: newStatus });
  };

  const updateVotes = async (id: string, incrementValue: number) => {
    await updateDoc(doc(db, 'disasters', id), { votes: increment(incrementValue) });
  };

  const filteredDisasters = disasters.filter(disaster => 
    filter === 'all' ? true : disaster.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'em-progresso': return 'bg-blue-100 text-blue-800';
      case 'resolvido': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Painel de Controle</h2>
      <div className="mb-6">
        <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por status:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="select"
        >
          <option value="all">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="em-progresso">Em Progresso</option>
          <option value="resolvido">Resolvido</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDisasters.map((disaster) => (
          <div key={disaster.id} className="card hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{disaster.type}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(disaster.status)}`}>
                {disaster.status}
              </span>
            </div>
            <p className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin size={14} className="mr-1" />
              {disaster.location}
            </p>
            <p className="flex items-center text-sm text-gray-500 mb-3">
              <Calendar size={14} className="mr-1" />
              {new Date(disaster.createdAt).toLocaleDateString()}
              <Clock size={14} className="ml-2 mr-1" />
              {new Date(disaster.createdAt).toLocaleTimeString()}
            </p>
            <p className="text-sm text-gray-700 mb-4 line-clamp-2">{disaster.description}</p>
            {disaster.photoURL && (
              <div className="mb-4">
                <img src={disaster.photoURL} alt="Desastre" className="w-full h-40 object-cover rounded-lg" />
              </div>
            )}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <button onClick={() => updateVotes(disaster.id, 1)} className="mr-2 text-green-500 hover:text-green-600 transition duration-300">
                  <ThumbsUp size={18} />
                </button>
                <span className="font-bold">{disaster.votes}</span>
                <button onClick={() => updateVotes(disaster.id, -1)} className="ml-2 text-red-500 hover:text-red-600 transition duration-300">
                  <ThumbsDown size={18} />
                </button>
              </div>
            </div>
            {isAdmin && (
              <div className="flex justify-between text-xs">
                <button
                  onClick={() => updateStatus(disaster.id, 'pendente')}
                  className="flex-1 mr-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-2 rounded transition duration-300"
                >
                  <AlertCircle size={12} className="inline mr-1" /> Pendente
                </button>
                <button
                  onClick={() => updateStatus(disaster.id, 'em-progresso')}
                  className="flex-1 mx-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-2 rounded transition duration-300"
                >
                  <CheckCircle size={12} className="inline mr-1" /> Em Progresso
                </button>
                <button
                  onClick={() => updateStatus(disaster.id, 'resolvido')}
                  className="flex-1 ml-1 bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-2 rounded transition duration-300"
                >
                  <XCircle size={12} className="inline mr-1" /> Resolvido
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;