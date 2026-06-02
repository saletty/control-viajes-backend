import { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from "../api";

const LoginScreen = () => {
  const [userType, setUserType] = useState(null); // 'driver' o 'operations'
  const [carnet, setCarnet] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Pantalla de selección de tipo de usuario
  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-lg w-full max-w-lg">
          
          <div className="flex items-center gap-4 mb-12">
            <img src="/logo.png" alt="Terranera" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 leading-tight">Terranera SRL</h1>
              <p className="text-xs text-gray-400 tracking-wide">Logística y Transporte</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Selecciona tu tipo de acceso</h2>

          <div className="space-y-4">
            <button
              onClick={() => setUserType('operations')}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-green-700 active:scale-95 transition-all shadow-md"
            >
              Acceso Administrativo
            </button>

            <button
              onClick={() => setUserType('driver')}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md"
            >
              Acceso Choferes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login para Conductores (solo carnet)
  if (userType === 'driver') {
    const handleDriverLogin = async (e) => {
      e.preventDefault();
      setError('');

      if (!carnet) {
        setError('Por favor ingresa tu carnet');
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/Auth/login-driver`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ carnet }),
        });

        const text = await response.text();

        if (!response.ok) {
          throw new Error('Carnet incorrecto');
        }

        let data = JSON.parse(text);
        login({
          name: data.name,
          role: 'Conductor',
          token: data.token,
        });

        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data));

        navigate("/driver");

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-lg w-full max-w-lg">
          
          <div className="flex items-center gap-4 mb-8">
            <img src="/logo.png" alt="Terranera" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 leading-tight">Terranera SRL</h1>
              <p className="text-xs text-gray-400 tracking-wide">Logística y Transporte</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Choferes</h2>
          <p className="text-gray-500 text-sm mb-6">Ingresa tu número de carnet</p>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-6 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleDriverLogin} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Carnet</label>
              <input
                type="text"
                placeholder="Ej: 12345678"
                value={carnet}
                onChange={(e) => setCarnet(e.target.value)}
                className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <div className="flex items-start gap-2 px-1">
                <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-gray-500 leading-tight">
                  Ingresa tu número de carnet de conductor
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-400 shadow-md"
            >
              {loading ? "Verificando..." : "Ingresar"}
            </button>

          </form>

          <button
            onClick={() => {
              setUserType(null);
              setCarnet('');
              setError('');
            }}
            className="w-full mt-4 text-gray-600 py-2 rounded-2xl font-semibold hover:text-gray-900 transition-colors"
          >
            ← Volver atrás
          </button>
        </div>
      </div>
    );
  }

  // Login para Operaciones (usuario y contraseña - igual al actual)
  if (userType === 'operations') {
    const handleOperationsLogin = async (e) => {
      e.preventDefault();
      setError('');

      if (!username || !password) {
        setError('Por favor complete todos los campos');
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/Auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const text = await response.text();

        if (!response.ok) {
          throw new Error('Usuario o contraseña incorrectos');
        }

        let data = JSON.parse(text);
        login({
          name: data.name,
          role: data.role,
          token: data.token,
        });

        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data));

        if (data.role === "Operaciones" || data.role === "Admin") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-lg w-full max-w-lg">
          
          <div className="flex items-center gap-4 mb-8">
            <img src="/logo.png" alt="Terranera" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 leading-tight">Terranera SRL</h1>
              <p className="text-xs text-gray-400 tracking-wide">Logística y Transporte</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Administrativo</h2>
          <p className="text-gray-500 text-sm mb-6">Ingresa tus credenciales</p>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-6 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleOperationsLogin} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Usuario</label>
              <input
                type="text"
                placeholder="Ej: Terranera"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
              <div className="flex items-start gap-2 px-1">
                <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-gray-500 leading-tight">
                  Usa la <span className="font-bold text-gray-700">primera letra Mayúscula</span> y <span className="font-bold text-gray-700">no pongas espacios</span> al final.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 active:scale-95 transition-all disabled:bg-gray-400 shadow-md"
            >
              {loading ? "Verificando..." : "Iniciar Sesión"}
            </button>

          </form>

          <button
            onClick={() => {
              setUserType(null);
              setUsername('');
              setPassword('');
              setError('');
            }}
            className="w-full mt-4 text-gray-600 py-2 rounded-2xl font-semibold hover:text-gray-900 transition-colors"
          >
            ← Volver atrás
          </button>
        </div>
      </div>
    );
  }
};

export default LoginScreen;