import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from "../api";

export default function NewTrip() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nro: '',
    origin: '',
    destination: '',
    driverName: '',
    startDate: '',
  });

  const [tractos, setTractos] = useState([]);
  const [semis, setSemis] = useState([]);
  const [tractoId, setTractoId] = useState('');
  const [semiremolqueId, setSemiremolqueId] = useState('');
  const [loading, setLoading] = useState(false);

  const [drivers, setDrivers] = useState([]);
  const [driverSearch, setDriverSearch] = useState('');
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const driverRef = useRef(null);

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/Trucks`);
        if (!res.ok) return;
        const data = await res.json();
        setTractos(data.filter(t => t.tipo === 'Tracto'));
        setSemis(data.filter(t => t.tipo === 'Semiremolque'));
      } catch (error) {
        console.error(error);
      }
    };

    const fetchDrivers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/Auth/conductors`);
        if (!res.ok) return;
        setDrivers(await res.json());
      } catch (error) {
        console.error(error);
      }
    };

    fetchTrucks();
    fetchDrivers();
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (driverRef.current && !driverRef.current.contains(e.target)) {
        setShowDriverDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectDriver = (driver) => {
    setForm({ ...form, driverName: driver.name });
    setDriverSearch(driver.name);
    setShowDriverDropdown(false);
  };

  // Filtrar por búsqueda, disponibles primero (alfabético), en viaje al final
  const filteredDrivers = drivers
    .filter(d => d.name.toLowerCase().includes(driverSearch.toLowerCase()))
    .sort((a, b) => {
      if (a.inUse && !b.inUse) return 1;
      if (!a.inUse && b.inUse) return -1;
      return a.name.localeCompare(b.name);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tractoId || !semiremolqueId) {
      alert('Debes seleccionar tracto y semiremolque');
      return;
    }
    if (!form.driverName) {
      alert('Debes seleccionar un conductor');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/Trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nro: form.nro,
          origin: form.origin,
          destination: form.destination,
          driverName: form.driverName,
          startDate: form.startDate,
          tractoId: Number(tractoId),
          semiremolqueId: Number(semiremolqueId),
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("ERROR BACKEND:", errorText);
        alert(errorText);
        return;
      }

      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const ordenar = (arr) =>
    [...arr].sort((a, b) => (a.estado === 'Disponible' ? -1 : 1));

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10">
      <div className="bg-white rounded-2xl border p-8 w-full max-w-2xl">

        <h1 className="text-xl font-semibold mb-6">Crear Nuevo Viaje</h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NRO */}
          <input
            name="nro"
            placeholder="Número de Factura"
            value={form.nro}
            onChange={handleChange}
            className="input"
            required
          />

          {/* CONDUCTOR — dropdown buscable */}
          <div className="relative" ref={driverRef}>
            <label className="block text-sm text-gray-600 mb-1">Conductor</label>
            <input
              type="text"
              placeholder="Buscar conductor..."
              value={driverSearch}
              onChange={(e) => {
                setDriverSearch(e.target.value);
                setForm({ ...form, driverName: '' });
                setShowDriverDropdown(true);
              }}
              onFocus={() => setShowDriverDropdown(true)}
              className="input"
              autoComplete="off"
              required={!form.driverName}
            />

            {showDriverDropdown && filteredDrivers.length > 0 && (
              <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-52 overflow-y-auto">
                {filteredDrivers.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onMouseDown={() => selectDriver(d)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex justify-between items-center hover:bg-gray-50 transition-colors ${
                      d.inUse ? 'text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    <span>{d.name}</span>
                    {d.inUse && (
                      <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                        En viaje
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {showDriverDropdown && driverSearch && filteredDrivers.length === 0 && (
              <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 px-4 py-3 text-sm text-gray-400">
                No se encontró ningún conductor
              </div>
            )}
          </div>

          {/* TRACTO + SEMI */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm text-gray-600 mb-1">Placa del Tracto</label>
              <select
                value={tractoId}
                onChange={(e) => setTractoId(e.target.value)}
                className="input"
                required
              >
                <option value="">Seleccionar...</option>
                {ordenar(tractos).map(t => (
                  <option key={t.id} value={t.id} disabled={t.estado === 'EnUso'}>
                    {t.placa} {t.estado === 'EnUso' ? '• En uso' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Placa del Semiremolque</label>
              <select
                value={semiremolqueId}
                onChange={(e) => setSemiremolqueId(e.target.value)}
                className="input"
                required
              >
                <option value="">Seleccionar...</option>
                {ordenar(semis).map(t => (
                  <option key={t.id} value={t.id} disabled={t.estado === 'EnUso'}>
                    {t.placa} {t.estado === 'EnUso' ? '• En uso' : ''}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* ORIGEN + DESTINO */}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="origin"
              placeholder="Origen"
              value={form.origin}
              onChange={handleChange}
              className="input"
              required
            />
            <input
              name="destination"
              placeholder="Destino"
              value={form.destination}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* FECHA */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Fecha de Partida</label>
            <input
              type="datetime-local"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* BOTONES */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full border rounded-xl py-3 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-900"
            >
              {loading ? 'Guardando...' : 'Guardar Viaje'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
