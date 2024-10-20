import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Send } from 'lucide-react';
import { collection, addDoc, increment, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  disasterType: string;
  location: string;
  description: string;
  lat: number;
  lng: number;
}

const ReportForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    disasterType: '',
    location: '',
    description: '',
    lat: -14.235,
    lng: -51.925,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([-14.235, -51.925], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      const icon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      markerRef.current = L.marker([-14.235, -51.925], { icon }).addTo(mapRef.current);

      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setFormData(prev => ({ ...prev, lat, lng }));
        markerRef.current?.setLatLng(e.latlng);
      });
    }

    // Tenta obter a localização do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
          mapRef.current?.setView([latitude, longitude], 13);
          markerRef.current?.setLatLng([latitude, longitude]);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
        }
      );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photo || !currentUser) return null;
    const storageRef = ref(storage, `disaster_photos/${Date.now()}_${photo.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, photo);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      throw new Error('Falha ao fazer upload da foto. Por favor, tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (!currentUser) {
      setError('Você precisa estar logado para enviar um relatório.');
      setIsSubmitting(false);
      return;
    }

    try {
      let photoURL = '';
      if (photo) {
        photoURL = await handlePhotoUpload() || '';
      }

      const docRef = await addDoc(collection(db, 'disasters'), {
        ...formData,
        photoURL,
        status: 'pendente',
        createdAt: new Date().toISOString(),
        userId: currentUser.uid,
        votes: 1,
      });

      // Atualiza o ranking da área
      const areaKey = `${Math.floor(formData.lat)},${Math.floor(formData.lng)}`;
      await setDoc(doc(db, 'areas', areaKey), {
        reportCount: increment(1),
        lastReportAt: new Date().toISOString(),
      }, { merge: true });

      console.log("Documento escrito com ID: ", docRef.id);
      setSuccess('Relatório enviado com sucesso!');
      
      // Limpa o formulário
      setFormData({
        disasterType: '',
        location: '',
        description: '',
        lat: -14.235,
        lng: -51.925,
      });
      setPhoto(null);
      
      // Redireciona para o mapa após 2 segundos
      setTimeout(() => {
        navigate('/map');
      }, 2000);
    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
      setError('Falha ao enviar relatório. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Reportar um Desastre</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="disasterType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Desastre</label>
          <select
            id="disasterType"
            name="disasterType"
            value={formData.disasterType}
            onChange={handleInputChange}
            required
            className="select"
          >
            <option value="">Selecione um tipo de desastre</option>
            <option value="Inundação">Inundação</option>
            <option value="Terremoto">Terremoto</option>
            <option value="Incêndio Florestal">Incêndio Florestal</option>
            <option value="Furacão">Furacão</option>
            <option value="Deslizamento de Terra">Deslizamento de Terra</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="input"
            placeholder="Digite a descrição da localização"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            className="input"
            rows={4}
            placeholder="Descreva a situação do desastre"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecione a Localização no Mapa</label>
          <div id="map" className="h-[300px] w-full rounded-lg shadow-md mb-2"></div>
          <p className="text-sm text-gray-600">
            Latitude: {formData.lat.toFixed(6)}, Longitude: {formData.lng.toFixed(6)}
          </p>
        </div>
        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">Foto do Desastre</label>
          <input
            type="file"
            id="photo"
            accept="image/*"
            onChange={handlePhotoChange}
            className="input"
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary w-full flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>Enviando...</span>
          ) : (
            <>
              <Send className="mr-2" size={20} />
              Enviar Relatório
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;