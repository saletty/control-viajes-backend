import { useAuth } from '../context/AuthContext';
import RegistroViaje from '../RegistroViaje'; // Tu componente actual
// Importa aquí tus otros dashboards cuando los tengas listos
// import OperationsDashboard from '../OperationsDashboard'; 

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <div>Por favor, inicia sesión (Pantalla de Login)</div>;

  if (user.role === 'Conductor') {
    return <RegistroViaje />; 
  }

  if (user.role === 'Operaciones' || user.role === 'Admin') {
    return <div>Bienvenida, {user.name}. Aquí irá el Panel de Control.</div>;
  }

  return <div>Error: Rol no reconocido</div>;
};

export default DashboardRouter;