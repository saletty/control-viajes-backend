import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import API_URL from "../api";

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  /* =======================
      DATA FETCHING
  ======================= */
const fetchData = async () => {
  try {
    setLoading(true);

    // 1. Intentar obtener el viaje individual directamente por ID
    // Si tu API no tiene un endpoint /api/Trips/:id, usaremos el general
    const tripRes = await fetch(`${API_URL}/api/Trips/${id}`);
    
    if (tripRes.ok) {
      const tripData = await tripRes.json();
      setTrip(tripData);
    } else {
      // Fallback: Si el endpoint anterior no existe, traer todos y buscar
      // (Menos eficiente, pero funciona si no tienes el endpoint individual)
      const allRes = await fetch(`${API_URL}/api/Trips`);
      const allTrips = await allRes.json();
      const found = allTrips.find(t => t.id === parseInt(id));
      setTrip(found);
    }

    // 2. Cargar Fotos y Eventos (esto ya estaba bien)
    const [photoRes, eventRes] = await Promise.all([
      fetch(`${API_URL}/api/TripPhotos/${id}`),
      fetch(`${API_URL}/api/TripEvents/${id}`)
    ]);

    setPhotos(await photoRes.json());
    setEvents(await eventRes.json());

    setLoading(false);
  } catch (err) {
    console.error("Error cargando datos:", err);
    setLoading(false);
  }
};
  useEffect(() => {
    fetchData();
  }, [id]);

  const salidaPhotos = photos.filter(p => p.type === "SALIDA");
  const llegadaPhotos = photos.filter(p => p.type === "LLEGADA");

  
  /* =======================
     LOADING
  ======================= */
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
      <div className="bg-white rounded-2xl p-6 shadow">
        <p><b>Chofer:</b> {trip.driverName}</p>
        <p><b>Tracto:</b> {trip.tracto?.placa}</p>
        <p><b>Semiremolque:</b> {trip.semiremolque?.placa}</p>
        <p><b>Ruta:</b> {trip.origin} → {trip.destination}</p>
      </div>

      {/* FOTOS SALIDA */}
      <PhotoSection
        title="Fotos de Salida AGESA"
        photos={salidaPhotos}
        onClick={(index) =>
          setModal({
            photos: salidaPhotos,
            index
          })
        }
      />

      {/* FOTOS LLEGADA */}
      <PhotoSection
        title="Fotos de Llegada NOVELIS"
        photos={llegadaPhotos}
        onClick={(index) =>
          setModal({
            photos: llegadaPhotos,
            index
          })
        }
      />

      {/* EVENTOS */}
      <div className="bg-white rounded-2xl p-6 shadow">
        <h3 className="font-bold mb-4">
          Eventos del viaje ({events.length})
        </h3>

        {events.length === 0 ? (
          <p className="text-gray-400">
            Sin eventos
          </p>
        ) : (
          events.map((e) => (
            <div
              key={e.id}
              className="mb-6 border rounded-xl p-4 bg-gray-50"
            >
              {/* MOTIVO */}
              {e.reason && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500">
                    Motivo
                  </p>

                  <p className="font-semibold">
                    {e.reason}
                  </p>
                </div>
              )}

              {/* OBSERVACIÓN */}
              {e.observation && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500">
                    Observación
                  </p>

                  <p>
                    {e.observation}
                  </p>
                </div>
              )}

              {/* FOTO */}
                {e.photoUrl && (
                  <div className="space-y-2">

                    <img
                      src={e.photoUrl}
                      alt="Evento"
                      onClick={() =>
                        setModal({
                          photos: [{ url: e.photoUrl }],
                          index: 0
                        })
                      }
                      className="w-full h-56 object-cover rounded-xl cursor-pointer hover:scale-105 transition"
                    />

                    {e.latitude && e.longitude && (
                      <>
                        <p className="text-xs text-gray-500 text-center">
                          {e.latitude.toFixed(6)}, {e.longitude.toFixed(6)}
                        </p>

                        <button
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps?q=${e.latitude},${e.longitude}`,
                              "_blank"
                            )
                          }
                          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold"
                        >
                          📍 Abrir ubicación del evento
                        </button>
                      </>
                    )}

                  </div>
              )}

              {/* AUDIO */}
              {e.audioUrl && (
                <audio controls className="w-full">
                  <source
                    src={e.audioUrl}
                    type="audio/webm"
                  />
                  Tu navegador no soporta audio
                </audio>
              )}

              {/* FECHA */}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(e.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

    </div>

    {/* MODAL */}
    {modal && (
      <ImageModal
        modal={modal}
        setModal={setModal}
      />
    )}

  </div>
);
};

/* GALERÍA*/
const PhotoSection = ({ title, photos, onClick }) => (
  <div className="bg-white rounded-2xl p-6 shadow">
    <h3 className="font-bold mb-4">{title} ({photos.length})</h3>

    {photos.length === 0 ? (
      <p className="text-gray-400">Sin fotos</p>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={photo.id} className="space-y-2">
            
            <img
              src={photo.url}
              onClick={() => onClick(index)}
              className="h-40 w-full object-cover rounded-xl cursor-pointer hover:scale-105 transition"
            />

            {photo.latitude && photo.longitude && (
              <div className="space-y-2">

                <p className="text-xs text-gray-500 text-center">
                  {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                </p>

                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps?q=${photo.latitude},${photo.longitude}`,
                      "_blank"
                    )
                  }
                  className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold"
                >
                  📍 Abrir en Google Maps
                </button>

              </div>
            )}

          </div>
        ))}
      </div>
    )}
  </div>
);

/*MODAL */
const ImageModal = ({ modal, setModal }) => {
  const { photos, index } = modal;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">

      <button
        onClick={() => setModal(null)}
        className="absolute top-5 right-5 text-white"
      >
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