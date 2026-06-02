import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Camera, CheckCircle2, Loader2 } from "lucide-react";
import API_URL from "../api";

export default function RegisterStart() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados para manejar los datos
  const [trip, setTrip] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Carga inicial de datos (Viaje y Fotos)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // 1. Obtener datos del viaje
        const user = JSON.parse(sessionStorage.getItem("user"));

const resTrip = await fetch(
  `${API_URL}/api/Trips/driver/${encodeURIComponent(user.name)}`
);

if (!resTrip.ok) throw new Error("Error al obtener viajes");

const tripsData = await resTrip.json();

const selectedTrip = tripsData.find(t => t.id === parseInt(id));
        
        if (selectedTrip) {
          setTrip(selectedTrip);
        } else {
          setError("No se encontró el viaje especificado.");
        }

        // 2. Obtener fotos ya subidas para este viaje (tipo SALIDA)
        const resPhotos = await fetch(`${API_URL}/api/TripPhotos/${id}`);
        if (resPhotos.ok) {
          const photosData = await resPhotos.json();
          const salidaPhotos = photosData.filter(p => p.type === "SALIDA");
          setPhotos(salidaPhotos);
        }

      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("Error de conexión con el servidor de Terranera.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  // Función para confirmar la salida y cambiar estado a "En ruta"
  const handleConfirmarSalida = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/Trips/${id}/start`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        alert("Registro exitoso. El viaje ahora está EN RUTA.");
        navigate('/driver'); // Redirigir al dashboard del chofer
      } else {
        const errorMsg = await response.text();
        alert("Error del servidor: " + errorMsg);
      }
    } catch (err) {
      console.error("Error al confirmar:", err);
      alert("Hubo un problema al conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
        <p className="text-gray-500 font-medium tracking-wide">Sincronizando con Terranera...</p>
      </div>
    </div>
  );

  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      {/* Header Estilo App */}
      <header className="bg-white px-6 py-5 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Registrar Salida AGESA</h1>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6 mt-2">
        
        {/* Card: Información del Vehículo */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-7 shadow-sm">
          <h3 className="text-gray-400 text-[10px] mb-5 uppercase tracking-[0.15em] font-black">Información de Unidad</h3>
          
          <div className="grid grid-cols-2 gap-y-8">
            <div>
              <p className="text-gray-400 text-[11px] uppercase font-bold mb-1 text-opacity-70">Tracto</p>
              <p className="font-extrabold text-xl text-gray-900">{trip?.tracto?.placa || '---'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-[11px] uppercase font-bold mb-1 text-opacity-70">Semiremolque</p>
              <p className="font-extrabold text-xl text-gray-900">{trip?.semiremolque?.placa || '---'}</p>
            </div>
            <div className="col-span-2 border-t border-gray-50 pt-5">
              <p className="text-gray-400 text-[11px] uppercase font-bold mb-1 text-opacity-70">Ruta Asignada</p>
              <p className="font-bold text-gray-900 text-lg leading-tight">{trip?.origin} <span className="text-blue-500 mx-1">→</span> {trip?.destination}</p>
            </div>
          </div>
        </div>

        {/* Card: Captura de Evidencia (Fotos) - ESTILO GRILLA */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-7 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Fotos AGESA</h3>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-tighter ${
                photos.length >= 3 ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'
              }`}>
                {photos.length} / 3
              </span>
            </div>

            {/* Grilla de 3 espacios */}
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => {
                const photo = photos[index];
                return (
                  <div key={index} className="relative aspect-square">
                    {photo ? (
                      <div className="relative h-full w-full">
                        <img 
                          src={photo.url} 
                          alt={`Salida ${index + 1}`}
                          className="h-full w-full object-cover rounded-2xl border-2 border-gray-50" 
                        />
                        {/* Botón para repetir foto si se equivocan */}
                        <button 
                          onClick={() => navigate(`/camera/${id}/salida?photoId=${photo.id}`)}
                          className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 active:opacity-100 transition-opacity rounded-2xl"
                        >
                          <Camera className="text-white" size={20} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/camera/${id}/salida`)}
                        disabled={issubmitting}
                        className="h-full w-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 active:bg-blue-50 transition-colors"
                      >
                        <Camera className="text-gray-400 mb-1" size={24} />
                        <span className="text-[9px] font-black text-gray-400 uppercase">Foto {index + 1}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mensaje de ayuda */}
            <p className="text-[10px] text-gray-400 mt-4 text-center font-bold uppercase tracking-wider">
              {photos.length < 3 ? "Toca un recuadro para capturar" : "Fotos capturadas correctamente"}
            </p>
          </div>

        {/* Botón Final de Acción */}
        <div className="pt-4">
          <button 
            onClick={handleConfirmarSalida}
            disabled={photos.length < 3 || issubmitting}
            className={`w-full py-5 rounded-[1.2rem] font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
              photos.length >= 3 && !issubmitting
                ? "bg-[#05050a] text-white active:scale-[0.97] shadow-gray-300" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            {issubmitting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              "Confirmar Registro de Salida"
            )}
          </button>
          
          <p className="text-center text-[10px] text-gray-400 mt-4 font-medium uppercase tracking-widest leading-relaxed">
            Terranera SRL - Logística y Transporte Internacional
          </p>
        </div>
      </div>
    </div>
  );
}