import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, LogOut, Eye, Check, X } from 'lucide-react';
import { logout } from "../utils/auth"; 
import { useAuth } from '../context/AuthContext';
import API_URL from "../api";


export default function OperationsDashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [filters, setFilters] = useState({
    driver: '',
    tracto: '',
    semiremolque: '',
    nro: '',
    status: 'all',
  });

  const statusStyles = {
    Pendiente: "bg-gray-200 text-gray-700",
    EnRuta: "bg-blue-100 text-blue-700",
    Revision: "bg-yellow-100 text-yellow-700",
    Aprobado: "bg-green-100 text-green-700",
    Rechazado: "bg-red-100 text-red-700",
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.driver) params.append("driver", filters.driver);
      if (filters.nro) params.append("nro", filters.nro);
      if (filters.tracto) params.append("tracto", filters.tracto);
      if (filters.semiremolque) params.append("semiremolque", filters.semiremolque);
      if (filters.status !== "all") params.append("status", filters.status);

      const res = await fetch(`${API_URL}/api/trips?${params}`);
      if (!res.ok) throw new Error("Error en backend");

      const data = await res.json();
      const sorted = Array.isArray(data) ? [...data].sort((a, b) => b.id - a.id) : [];
      setTrips(sorted);
    } catch (error) {
      console.error("ERROR:", error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [filters]);

  const approveTrip = async (id) => {
  try {
    // Cambiamos /finish por /approve (o el nombre que use tu backend para aprobar)
    const res = await fetch(`${API_URL}/api/trips/${id}/approve`, { 
      method: 'PUT' 
    });
    
    if (!res.ok) throw new Error(await res.text());
    
    fetchTrips(); // Recargar la tabla para ver el cambio de color
  } catch (error) {
    alert("Error al aprobar: " + error.message);
  }
};

  const rejectTrip = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/trips/${id}/reject`, { method: 'PUT' });
      if (!res.ok) throw new Error(await res.text());
      fetchTrips();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">

              <img 
                src="/logo.png" 
                alt="Terranera"
                className="h-10 w-auto object-contain"
              />

              <div>
                <h1 className="font-bold text-lg text-gray-900 leading-tight">
                  Terranera SRL
                </h1>

                <p className="text-xs text-gray-400 tracking-wide">
                  {isAdmin ? "Panel de Administración" : "Panel de Operaciones"}
                </p>
              </div>

          </div>

          <div className="flex gap-3 items-center">
              {!isAdmin && (
                <button
                  onClick={() => navigate('/new-trip')}
                  className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
                >
                  + Nuevo Viaje
                </button>
              )}
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* FILTROS */}
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <h2 className="font-semibold mb-4 text-gray-400 text-xs uppercase tracking-widest">Filtrar viajes</h2>
          <div className={`grid grid-cols-1 md:grid-cols-3 ${isAdmin ? "lg:grid-cols-5" : "lg:grid-cols-6"} gap-4`}>
            <input
              placeholder="Chofer..."
              className="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilters({ ...filters, driver: e.target.value })}
            />
            <input
              placeholder="Tracto..."
              className="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilters({ ...filters, tracto: e.target.value })}
            />
            <input
              placeholder="Semiremolque..."
              className="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilters({ ...filters, semiremolque: e.target.value })}
            />
            <input
              placeholder="N° Factura..."
              className="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilters({ ...filters, nro: e.target.value })}
            />
            <select
              className="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">Todos los Estados</option>
              {Object.keys(statusStyles).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest text-center">Factura</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Chofer / Unidad</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Ruta Comercial</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest text-center">Evento</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest text-center">Detalle</th>
                {!isAdmin && (
                <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest text-center">
                  Acciones
                </th>
)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-20 animate-pulse text-gray-400">Cargando datos...</td></tr>
              ) : trips.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-20 text-gray-400 italic">No se encontraron viajes.</td></tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-6 font-bold text-blue-600 text-center">{trip.nro || 'S/N'}</td>
                    <td className="px-6 py-6">
                      <div className="font-bold text-gray-900">{trip.driverName || 'No asignado'}</div>
                      <div className="text-xs flex gap-2 mt-1">
                        <span className="bg-gray-100 px-3 py-1 rounded font-mono font-semibold">
                          T: {trip.tracto?.placa || '-'}
                        </span>
                        <span className="bg-gray-100 px-3 py-1 rounded font-mono font-semibold">
                          S: {trip.semiremolque?.placa || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-medium">
                      {trip.origin} <span className="text-gray-300">→</span> {trip.destination}
                      <div className="text-[10px] text-gray-400 font-normal mt-1">
                        {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'Sin fecha'}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusStyles[trip.status] || 'bg-gray-100'}`}>
                        {trip.status}
                      </span>
                    </td>

                    <td className="px-6 py-6 text-center">
                      {trip.hasEvents && (
                        <div className="flex justify-center">
                          <div
                            title="Este viaje tiene eventos registrados"
                            className="w-3 h-3 rounded-full bg-red-500"
                          />
                        </div>
                      )}
                    </td>
                    
                    {/* El OJO ahora manda al mismo detalle que el conductor */}
                    <td className="px-6 py-6 text-center">
                      <button 
                        onClick={() => navigate(`/trip-details/${trip.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                      >
                        <Eye size={20} />
                      </button>
                    </td>

                      <td className="px-6 py-6">
                          <div className="flex justify-center gap-3">
                            {!isAdmin && (
                              <>
                                {trip.status !== 'Aprobado' && (
                                  <button 
                                    onClick={() => approveTrip(trip.id)} // Llama a la función de aprobar
                                    className="p-2 text-gray-300 hover:text-green-500 hover:bg-green-50 rounded-full transition-all"
                                    title="Aprobar Viaje"
                                  >
                                    <Check size={20} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => rejectTrip(trip.id)}
                                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                  <X size={20} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}