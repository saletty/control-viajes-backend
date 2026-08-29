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

  // ESTADOS PARA MODALES
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showTruckModal, setShowTruckModal] = useState(false);

  // FORMULARIO NUEVO CONDUCTOR
  const [newDriver, setNewDriver] = useState({ fullName: '', carnet: '' });
  const [loadingDriver, setLoadingDriver] = useState(false);

  // FORMULARIO NUEVO VEHÍCULO
  const [newTruck, setNewTruck] = useState({ placa: '', tipo: 'Tracto' });
  const [loadingTruck, setLoadingTruck] = useState(false);

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

  useEffect(() => {
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
    if (driver.inUse) return;
    setForm({ ...form, driverName: driver.name });
    setDriverSearch(driver.name);
    setShowDriverDropdown(false);
  };

  const filteredDrivers = drivers
    .filter(d => d.name.toLowerCase().includes(driverSearch.toLowerCase()))
    .sort((a, b) => {
      if (a.inUse && !b.inUse) return 1;
      if (!a.inUse && b.inUse) return -1;
      return a.name.localeCompare(b.name);
    });

  const ordenar = (arr) =>
    [...arr].sort((a, b) => {
      if (a.estado === 'Disponible' && b.estado === 'EnUso') return -1;
      if (a.estado === 'EnUso' && b.estado === 'Disponible') return 1;
      return a.placa.localeCompare(b.placa);
    });

  // CREAR CHOFER (API)
  const handleCreateDriver = async (e) => {
    e.preventDefault();
    try {
      setLoadingDriver(true);
      const res = await fetch(`${API_URL}/api/Auth/create-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDriver),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Error al crear conductor');
        return;
      }

      await fetchDrivers(); // Recargar lista
      setForm({ ...form, driverName: newDriver.fullName });
      setDriverSearch(newDriver.fullName);
      setNewDriver({ fullName: '', carnet: '' });
      setShowDriverModal(false);
      alert('Conductor creado y seleccionado automáticamente');
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setLoadingDriver(false);
    }
  };

  // CREAR PLACA (API)
  const handleCreateTruck = async (e) => {
    e.preventDefault();
    try {
      setLoadingTruck(true);
      const res = await fetch(`${API_URL}/api/Trucks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTruck),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Error al crear placa');
        return;
      }

      const createdTruck = await res.json();
      await fetchTrucks(); // Recargar lista

      if (createdTruck.tipo === 'Tracto') {
        setTractoId(createdTruck.id);
      } else {
        setSemiremolqueId(createdTruck.id);
      }

      setNewTruck({ placa: '', tipo: 'Tracto' });
      setShowTruckModal(false);
      alert('Placa registrada correctamente');
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setLoadingTruck(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
      <div className="bg-white rounded-2xl border p-8 w-full max-w-2xl shadow-sm">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Crear Nuevo Viaje</h1>
          <button
            type="button"
            onClick={() => setShowTruckModal(true)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg font-medium border"
          >
            + Registrar Placa
          </button>
        </div>

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

          {/* CONDUCTOR */}
          <div className="relative" ref={driverRef}>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm text-gray-600">Conductor</label>
              <button
                type="button"
                onClick={() => setShowDriverModal(true)}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                + Nuevo Conductor
              </button>
            </div>
            
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
                    disabled={d.inUse}
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

      {/* MODAL CREAR CHOFER */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">Registrar Nuevo Conductor</h2>
            <form onSubmit={handleCreateDriver} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Carlos Pérez"
                  value={newDriver.fullName}
                  onChange={(e) => setNewDriver({ ...newDriver, fullName: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Carnet de Identidad / CI (Contraseña)</label>
                <input
                  type="text"
                  placeholder="Ej: 8945123"
                  value={newDriver.carnet}
                  onChange={(e) => setNewDriver({ ...newDriver, carnet: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDriverModal(false)}
                  className="w-full border py-2.5 rounded-xl text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingDriver}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700"
                >
                  {loadingDriver ? 'Guardando...' : 'Guardar Conductor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR VEHÍCULO / PLACA */}
      {showTruckModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">Registrar Nueva Placa</h2>
            <form onSubmit={handleCreateTruck} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tipo de Unidad</label>
                <select
                  value={newTruck.tipo}
                  onChange={(e) => setNewTruck({ ...newTruck, tipo: e.target.value })}
                  className="input"
                >
                  <option value="Tracto">Tracto</option>
                  <option value="Semiremolque">Semiremolque</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Número de Placa</label>
                <input
                  type="text"
                  placeholder="Ej: 4059-XYZ"
                  value={newTruck.placa}
                  onChange={(e) => setNewTruck({ ...newTruck, placa: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTruckModal(false)}
                  className="w-full border py-2.5 rounded-xl text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingTruck}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700"
                >
                  {loadingTruck ? 'Guardando...' : 'Guardar Placa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}