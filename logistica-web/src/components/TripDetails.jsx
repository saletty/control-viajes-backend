import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, X, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from "../api";

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDriver = user?.role === 'Conductor';

  const [trip, setTrip] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const tripRes = await fetch(`${API_URL}/api/Trips/${id}`);

      if (tripRes.ok) {
        setTrip(await tripRes.json());
      } else {
        const allRes = await fetch(`${API_URL}/api/Trips`);
        const allTrips = await allRes.json();
        setTrip(allTrips.find(t => t.id === parseInt(id)));
      }

      const [photoRes, eventRes] = await Promise.all([
        fetch(`${API_URL}/api/TripPhotos/${id}`),
        fetch(`${API_URL}/api/TripEvents/${id}`)
      ]);

      setPhotos(await photoRes.json());
      setEvents(await eventRes.json());
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const salidaPhotos = photos.filter(p => p.type === "SALIDA");
  const llegadaPhotos = photos.filter(p => p.type === "LLEGADA");

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (!trip) return <div className="p-10 text-center">No se encontró el viaje.</div>;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white px-6 py-4 flex items-center gap-4 border-b">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Detalles de Viaje</h1>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">

        {/* INFO */}
        <div className="bg-white rounded-2xl p-6 shadow space-y-1">
          {!isDriver && (
            <p><b>N° Factura:</b> {trip.nro || 'S/N'}</p>
          )}
          <p><b>Chofer:</b> {trip.driverName}</p>
          <p><b>Tracto:</b> {trip.tracto?.placa}</p>
          <p><b>Semiremolque:</b> {trip.semiremolque?.placa}</p>
          <p><b>Ruta:</b> {trip.origin} → {trip.destination}</p>
        </div>

        {/* FOTOS SALIDA */}
        <PhotoSection
          title="Fotos de Salida AGESA"
          photos={salidaPhotos}
          onClick={(index) => setModal({ photos: salidaPhotos, index })}
          showUpload={!isDriver}
          onUpload={() => navigate(`/camera/${id}/SALIDA`)}
        />

        {/* FOTOS LLEGADA */}
        <PhotoSection
          title="Fotos de Llegada NOVELIS"
          photos={llegadaPhotos}
          onClick={(index) => setModal({ photos: llegadaPhotos, index })}
          showUpload={!isDriver}
          onUpload={() => navigate(`/camera/${id}/LLEGADA`)}
        />

        {/* EVENTOS */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="font-bold mb-4">
            Eventos del viaje ({events.length})
          </h3>

          {events.length === 0 ? (
            <p className="text-gray-400">Sin eventos</p>
          ) : (
            events.map((e) => (
              <div key={e.id} className="mb-6 border rounded-xl p-4 bg-gray-50">

                {e.reason && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500">Motivo</p>
                    <p className="font-semibold">{e.reason}</p>
                  </div>
                )}

                {e.observation && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Observación</p>
                    <p>{e.observation}</p>
                  </div>
                )}

                {e.photoUrl && (
                  <div className="space-y-2">
                    <img
                      src={e.photoUrl}
                      alt="Evento"
                      onClick={() => setModal({ photos: [{ url: e.photoUrl }], index: 0 })}
                      className="w-full h-56 object-cover rounded-xl cursor-pointer hover:scale-105 transition"
                    />
                    {e.latitude && e.longitude && (
                      <>
                        <p className="text-xs text-gray-500 text-center">
                          {e.latitude.toFixed(6)}, {e.longitude.toFixed(6)}
                        </p>
                        <button
                          onClick={() => window.open(`https://www.google.com/maps?q=${e.latitude},${e.longitude}`, "_blank")}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold"
                        >
                          📍 Abrir ubicación del evento
                        </button>
                      </>
                    )}
                  </div>
                )}

                {e.audioUrl && (
                  <audio controls className="w-full">
                    <source src={e.audioUrl} type="audio/webm" />
                    Tu navegador no soporta audio
                  </audio>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(e.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

      </div>

      {modal && <ImageModal modal={modal} setModal={setModal} />}
    </div>
  );
};

/* GALERÍA */
const PhotoSection = ({ title, photos, onClick, showUpload, onUpload }) => {
  // Una sola ubicación: la primera foto que tenga coordenadas
  const locationPhoto = photos.find(p => p.latitude && p.longitude);

  return (
    <div className="bg-white rounded-2xl p-6 shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">{title} ({photos.length})</h3>
        {showUpload && (
          <button
            onClick={onUpload}
            className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-black transition-all active:scale-95"
          >
            <Camera size={16} />
            Subir foto
          </button>
        )}
      </div>

      {photos.length === 0 ? (
        <p className="text-gray-400">Sin fotos</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <img
              key={photo.id}
              src={photo.url}
              onClick={() => onClick(index)}
              className="h-40 w-full object-cover rounded-xl cursor-pointer hover:scale-105 transition"
            />
          ))}
        </div>
      )}

      {/* Una sola ubicación por sección */}
      {locationPhoto && (
        <div className="mt-4 space-y-1">
          <p className="text-xs text-gray-500 text-center">
            {locationPhoto.latitude.toFixed(6)}, {locationPhoto.longitude.toFixed(6)}
          </p>
          <button
            onClick={() => window.open(`https://www.google.com/maps?q=${locationPhoto.latitude},${locationPhoto.longitude}`, "_blank")}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold"
          >
            📍 Abrir ubicación en Google Maps
          </button>
        </div>
      )}
    </div>
  );
};

/* MODAL */
const ImageModal = ({ modal, setModal }) => {
  const { photos, index } = modal;
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <button onClick={() => setModal(null)} className="absolute top-5 right-5 text-white">
        <X size={32} />
      </button>
      <img
        src={photos[index].url}
        className="max-h-[90%] max-w-[90%] object-contain"
      />
    </div>
  );
};

export default TripDetails;
