import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Disaster {
  id: string;
  type: string;
  location: string;
  description: string;
  status: 'pendente' | 'em-progresso' | 'resolvido';
  lat: number;
  lng: number;
  photoURL?: string;
  createdAt: string;
  votes: number;
}

const Map: React.FC = () => {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);
  const [filter, setFilter] = useState<'all' | 'pendente' | 'em-progresso' | 'resolvido'>('all');
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    const q = query(collection(db, 'disasters'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const disasterList: Disaster[] = [];
      querySnapshot.forEach((doc) => {
        disasterList.push({ id: doc.id, ...doc.data() } as Disaster);
      });
      setDisasters(disasterList);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([-14.235, -51.925], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    // Limpar marcadores existentes
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Adicionar novos marcadores
    disasters.forEach(disaster => {
      if (filter === 'all' || disaster.status === filter) {
        const marker = L.marker([disaster.lat, disaster.lng], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${getStatusColor(disaster.status)};" class="marker-pin"></div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42]
          })
        })
          .addTo(mapRef.current!)
          .on('click', () => setSelectedDisaster(disaster));

        markersRef.current[disaster.id] = marker;
      }
    });

    // Adicionar estilos CSS para os marcadores
    const style = document.createElement('style');
    style.textContent = `
      .custom-div-icon .marker-pin {
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        background: #c30b82;
        position: absolute;
        transform: rotate(-45deg);
        left: 50%;
        top: 50%;
        margin: -15px 0 0 -15px;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      document.head.removeChild(style);
    };
  }, [disasters, filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return '#FCD34D';
      case 'em-progresso': return '#60A5FA';
      case 'resolvido': return '#34D399';
      default: return '#9CA3AF';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <AlertCircle size={18} className="text-yellow-500" />;
      case 'em-progresso': return <CheckCircle size={18} className="text-blue-500" />;
      case 'resolvido': return <XCircle size={18} className="text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Mapa de Desastres</h2>
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="lg:w-3/4">
          <div className="mb-4">
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
          <div id="map" className="h-[600px] w-full rounded-lg shadow-lg"></div>
        </div>
        <div className="lg:w-1/4">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Detalhes do Desastre</h3>
          {selectedDisaster ? (
            <div className="card">
              <h4 className="text-lg font-semibold mb-2 text-gray-800">{selectedDisaster.type}</h4>
              <p className="text-sm text-gray-600 mb-2">{selectedDisaster.location}</p>
              <p className="text-sm mb-2">{selectedDisaster.description}</p>
              <div className="flex items-center mb-2">
                {getStatusIcon(selectedDisaster.status)}
                <span className="ml-2 text-sm capitalize">{selectedDisaster.status}</span>
              </div>
              <p className="text-sm mb-2">Criado em: {new Date(selectedDisaster.createdAt).toLocaleString()}</p>
              <div className="flex items-center mb-2">
                <ThumbsUp size={18} className="text-green-500 mr-1" />
                <span className="mr-2">{selectedDisaster.votes}</span>
                <ThumbsDown size={18} className="text-red-500 mr-1" />
              </div>
              {selectedDisaster.photoURL && (
                <img src={selectedDisaster.photoURL} alt="Desastre" className="w-full h-40 object-cover rounded-lg" />
              )}
            </div>
          ) : (
            <p className="text-gray-600">Selecione um marcador no mapa para ver os detalhes.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;