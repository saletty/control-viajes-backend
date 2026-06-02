// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  // 1. Si está cargando el usuario desde el localStorage, no mostrar nada aún
  if (loading) return <div>Cargando...</div>;

  // 2. Si no hay usuario, al login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 3. Si el rol no coincide (ej: un conductor queriendo entrar a admin)
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'Conductor' ? "/driver" : "/dashboard"} />;
  }

  return children;
};

export default ProtectedRoute;