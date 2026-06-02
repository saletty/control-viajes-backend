import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from "../api";

export default function NewTrip() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nro: '',
    origin: '',
    destination: '',
    driverName: '',
    startDate: '', // 🔥 agregado
  });

  const [tractos, setTractos] = useState([]);
  const [semis, setSemis] = useState([]);

  const [tractoId, setTractoId] = useState('');
  const [semiremolqueId, setSemiremolqueId] = useState('');

  const [loading, setLoading] = useState(false);

  // 🔌 Cargar camiones
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

    fetchTrucks();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tractoId || !semiremolqueId) {
      alert('Debes seleccionar tracto y semiremolque');
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
          startDate: form.startDate, // 🔥 enviado al backend
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

        <h1 className="text-xl font-semibold mb-6">
          Crear Nuevo Viaje
        </h1>

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

          {/* CHOFER */}
          <input
            name="driverName"
            placeholder="Chofer"
            value={form.driverName}
            onChange={handleChange}
            className="input"
            required
          />

          {/* TRACTO + SEMI */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Placa del Tracto
              </label>

              <select
                value={tractoId}
                onChange={(e) => setTractoId(e.target.value)}
                className="input"
                required
              >
                <option value="">Seleccionar...</option>

                {ordenar(tractos).map(t => (
                  <option
                    key={t.id}
                    value={t.id}
                    disabled={t.estado === 'EnUso'}
                  >
                    {t.placa} {t.estado === 'EnUso' ? '• En uso' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Placa del Semiremolque
              </label>

              <select
                value={semiremolqueId}
                onChange={(e) => setSemiremolqueId(e.target.value)}
                className="input"
                required
              >
                <option value="">Seleccionar...</option>

                {ordenar(semis).map(t => (
                  <option
                    key={t.id}
                    value={t.id}
                    disabled={t.estado === 'EnUso'}
                  >
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

          {/* 📅 FECHA DE PARTIDA */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Fecha de Partida
            </label>

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