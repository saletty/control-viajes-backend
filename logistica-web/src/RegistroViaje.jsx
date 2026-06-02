import { useState } from 'react';
import axios from 'axios';

function RegistroViaje() {
  const [driverName, setDriverName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const enviarViaje = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('driverName', driverName);
    formData.append('origin', origin);
    formData.append('destination', destination);
    formData.append('status', 'Pendiente');
    if (foto) formData.append('archivo', foto);

    try {
      await axios.post('https://localhost:7070/api/trips', formData);
      alert('✅ ¡Viaje y Foto registrados correctamente!');
      // Limpiar formulario
      setDriverName(''); setOrigin(''); setDestination(''); setFoto(null);
    } catch (error) {
      alert('❌ Error al enviar. Revisa la conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>PORTAL CONDUCTORES</h2>
          <p style={styles.subtitle}>Terranera - Cobramet</p>
        </div>

        <form onSubmit={enviarViaje} style={styles.form}>
          <label style={styles.label}>Nombre del Conductor</label>
          <input 
            type="text" 
            placeholder="Ej: Salet..." 
            style={styles.input}
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            required
          />

          <div style={styles.row}>
            <div style={{flex: 1}}>
              <label style={styles.label}>Origen</label>
              <input 
                type="text" 
                placeholder="SCZ" 
                style={styles.input}
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              />
            </div>
            <div style={{flex: 1, marginLeft: '10px'}}>
              <label style={styles.label}>Destino</label>
              <input 
                type="text" 
                placeholder="LPZ" 
                style={styles.input}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
          </div>

          <label style={styles.label}>Evidencia (Foto de carga/guía)</label>
          <div style={styles.fileContainer}>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" // Esto abre la cámara directamente en celulares
              onChange={(e) => setFoto(e.target.files[0])}
              style={styles.fileInput}
              id="foto-input"
            />
            <label htmlFor="foto-input" style={styles.fileButton}>
              {foto ? '📸 Foto seleccionada' : '📷 Tomar Foto / Subir'}
            </label>
          </div>

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? 'Enviando...' : 'REGISTRAR SALIDA'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    backgroundColor: '#1E1E1E',
    width: '100%',
    maxWidth: '450px',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    border: '1px solid #333',
  },
  header: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  title: {
    color: '#FFFFFF',
    fontSize: '1.5rem',
    letterSpacing: '2px',
    margin: 0,
  },
  subtitle: {
    color: '#4dabf7',
    fontSize: '0.9rem',
    margin: '5px 0 0 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    color: '#888',
    fontSize: '0.8rem',
    marginBottom: '5px',
    marginTop: '15px',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#2A2A2A',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '12px',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  fileContainer: {
    marginTop: '10px',
  },
  fileInput: {
    display: 'none',
  },
  fileButton: {
    display: 'block',
    textAlign: 'center',
    padding: '15px',
    backgroundColor: '#333',
    borderRadius: '8px',
    border: '2px dashed #555',
    color: '#bbb',
    cursor: 'pointer',
  },
  submitButton: {
    marginTop: '30px',
    padding: '15px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4dabf7',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s',
  }
};

export default RegistroViaje;