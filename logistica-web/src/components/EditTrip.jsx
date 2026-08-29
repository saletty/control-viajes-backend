import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import API_URL from '../api';

export default function EditTrip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tractos, setTractos] = useState([]);
  const [semis, setSemis] = useState([]);

  const [formData, setFormData] = useState({
    nro: '',
    driverName: '',
    origin: '',
    destination: '',
    tractoId: '',
    semiremolqueId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar camiones para los desplegables
        const [tractosRes, semisRes, tripRes] = await Promise.all([
          fetch(`${API_URL}/api/trucks?tipo=Tracto`),
          fetch(`${API_URL}/api/trucks?tipo=Semiremolque`),
          fetch(`${API_URL}/api/trips/${id}`)
        ]);

        if (tractosRes.ok) setTractos(await tractosRes.json());
        if (semisRes.ok) setSemis(await semisRes.json());
        
        if (tripRes.ok) {
          const trip = await tripRes.json();
          setFormData({
            nro: trip.nro || '',
            driverName: trip.driverName || '',
            origin: trip.origin || '',
            destination: trip.destination || '',
            tractoId: trip.tractoId || trip.tracto?.id || '',
            semiremolqueId: trip.semiremolqueId || trip.semiremolque?.id || '',
          });
        }
      } catch (err) {
        console.error("Error al cargar datos del viaje:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tractoId: parseInt(formData.tractoId),
          semiremolqueId: parseInt(formData.semiremolqueId),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Viaje actualizado correctamente");
      navigate('/operations');
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Cargando datos del viaje...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border shadow-sm p-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Editar Viaje N° {formData.nro}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
              N° Factura
            </label>
            <input
              type="text"
              required
              value={formData.nro}
              onChange={(e) => setFormData({ ...formData, nro: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
              Chofer
            </label>
            <input
              type="text"
              required
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Origen
              </label>
              <input
                type="text"
                required
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Destino
              </label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Tracto
              </label>
              <select
                value={formData.tractoId}
                onChange={(e) => setFormData({ ...formData, tractoId: e.target.value })}
                className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar Tracto</option>
                {tractos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.placa} ({t.modelo || 'Tracto'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Semiremolque
              </label>
              <select
                value={formData.semiremolqueId}
                onChange={(e) => setFormData({ ...formData, semiremolqueId: e.target.value })}
                className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar Semiremolque</option>
                {semis.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.placa} ({s.modelo || 'Semiremolque'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              <Save size={16} />
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}