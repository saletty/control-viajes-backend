import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import DriverDashboard from './components/DriverDashboard';
import OperationsDashboard from './components/OperationsDashboard';
import CameraUpload from './components/CameraUpload';
import NewTrip from './components/NewTrip';
import RegisterStart from "./components/RegisterStart";
import TripDetails from "./components/TripDetails";
import RegisterArrival from "./components/RegisterArrival";
import EventReport from "./components/EventReport";

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<LoginScreen />} />
        
        {/* DASHBOARD SEGÚN ROL */}
        <Route path="/dashboard" element={
          user?.role === 'Conductor' ? <Navigate to="/driver" /> : 
          (user?.role === 'Operaciones' || user?.role === 'Admin') ? <OperationsDashboard user={user} /> : 
          <Navigate to="/login" />
        } />

        <Route path="/driver" element={user?.role === 'Conductor' ? <DriverDashboard /> : <Navigate to="/login" />} />
        
        {/* RUTAS DE DETALLES (Asegúrate que los archivos existan en /components) */}
        <Route path="/trip-details/:id" element={<TripDetails />} />
        <Route path="/register-exit/:id" element={<RegisterStart />} />
        <Route path="/register-arrival/:id" element={<RegisterArrival />} />
        <Route path="/event-report/:id" element={<EventReport />} />

        {/* OTROS */}
        <Route path="/new-trip" element={<NewTrip />} />
        <Route path="/camera/:tripId/:type" element={<CameraUpload />} />
        
        
        {/* REDIRECCIÓN INICIAL */}
        <Route path="/" element={<Navigate to={user ? (user.role === 'Conductor' ? "/driver" : "/dashboard") : "/login"} />} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;