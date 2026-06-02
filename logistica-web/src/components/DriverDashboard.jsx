import { useState, useEffect } from 'react';
import { Truck, LogOut, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from "../api";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriverTrips = async () => {
  try {
    const user = JSON.parse(sessionStorage.getItem("user"));

    const res = await fetch(
      `${API_URL}/api/Trips/driver/${encodeURIComponent(user.name)}`
    );

    const data = await res.json();

    console.log("TRIPS BACKEND:", data);

    // 🔥 IMPORTANTE: ya vienen filtrados desde backend
    setTrips(data);

  } catch (error) {
    console.error("Error al cargar viajes", error);
  } finally {
    setLoading(false);
  }
};

    if (user?.name) fetchDriverTrips();
  }, [user]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        Cargando Portal del Conductor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white px-8 py-6 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-3">

          <img 
            src="/logo.png" 
            alt="Terranera"
            className="h-10 w-auto object-contain"
          />

          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Portal del Conductor
            </h1>

            <p className="text-sm text-gray-400 font-medium">
              {user?.name}
            </p>
          </div>

        </div>

        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-5xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Mis Viajes</h2>
          <p className="text-gray-500">{trips.length} viajes asignados</p>
        </div>

        <div className="grid gap-6">

          {trips.map((trip) => (

            <div key={trip.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 relative">

              {/* ESTADO */}
              <div className="absolute top-8 right-8">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  trip.status === 'Pendiente'
                    ? 'bg-gray-500 text-white'
                    : trip.status === 'EnRuta'
                    ? 'bg-blue-500 text-white'
                    : trip.status === 'Revision'
                    ? 'bg-orange-500 text-white'
                    : trip.status === 'Aprobado'
                    ? 'bg-green-500 text-white'
                    : trip.status === 'Rechazado'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-400 text-white'
                     }`}>
                  {trip.status}
                </span>
              </div>

              {/* VEHÍCULO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Tracto</p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {trip.tracto?.placa || '---'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Semiremolque</p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {trip.semiremolque?.placa || '---'}
                  </p>
                </div>
              </div>

              {/* RUTA */}
              <div className="mb-10">
                <div className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-2">
                  <span>{trip.origin}</span>
                  <span className="text-gray-300">→</span>
                  <span>{trip.destination}</span>
                </div>

                <p className="text-gray-400 font-medium">
                  {trip.startDate
                    ? new Date(trip.startDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'Sin fecha'}
                </p>
                </div>

                   {/* BOTONES DINÁMICOS */}
                  <div className="space-y-3">

                    {/* REGISTRAR SALIDA: Solo si está Pendiente */}
                    {trip.status === "Pendiente" && (
                      <button 
                        onClick={() => navigate(`/register-exit/${trip.id}`)}
                        className="w-full bg-[#05050a] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-transform text-lg"
                      >
                        <Camera size={22} />
                        Registrar Salida AGESA
                      </button>
                    )}

                    {/* REGISTRAR LLEGADA o RE-SUBIR POR RECHAZO */}
                    {(trip.status === "EnRuta" || trip.status === "Rechazado") && (
                      <button 
                        onClick={() => navigate(`/register-arrival/${trip.id}`)}
                        className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-transform text-lg text-white ${
                          trip.status === "Rechazado" ? "bg-red-600 animate-pulse" : "bg-blue-600"
                        }`}
                      >
                        <Camera size={22} />
                        {trip.status === "Rechazado" ? "Corregir Evidencia (Rechazado)" : "Registrar Llegada NOVELIS"}
                      </button>
                    )}

                    <button
                      onClick={() =>
                        navigate(`/event-report/${trip.id}`)
                      }
                      className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold"
                      >
                       Reportar Evento Ejemplo: SI SE ROMPE UN PRECINTO
                    </button>

                    {/* VER DETALLES: Siempre disponible */}
                    <button 
                      onClick={() => navigate(`/trip-details/${trip.id}`)}
                      className="w-full bg-white border border-gray-100 py-4 rounded-2xl font-bold text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      Ver Detalles
                    </button>
                </div>
            </div>

          ))}

        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;