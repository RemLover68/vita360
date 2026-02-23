import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from './components/Layout';
import { LayoutOperador } from './components/LayoutOperador';
import LoginPage from './pages/LoginPage';
import CiudadanoPage from './pages/CiudadanoPage';
import OperadorPage from './pages/OperadorPage';
import Dashboard from './pages/Dashboard';
import CasosPage from './pages/CasosPage';
import CaseDetail from './pages/CaseDetail';
import MapaUrbano from './pages/MapaUrbano';
import OrdenesTrabajoPage from './pages/OrdenesTrabajoPage';
import SLAPage from './pages/SLAPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ConocimientoPage from './pages/ConocimientoPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import { useAuth } from '../context/AuthContext';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-[13px]">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRouter() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-[13px]">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ciudadano') return <Navigate to="/ciudadano" replace />;
  if (user.role === 'operador') return <Navigate to="/operador" replace />;
  return <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/ciudadano",
    element: <RequireAuth><Layout citizen /></RequireAuth>,
    children: [
      { index: true, Component: CiudadanoPage },
    ],
  },
  {
    path: "/operador",
    element: <RequireAuth><LayoutOperador /></RequireAuth>,
    children: [
      { index: true, Component: OperadorPage },
      { path: "dashboard", Component: Dashboard },
      { path: "casos", Component: CasosPage },
      { path: "casos/:id", Component: CaseDetail },
      { path: "mapa", Component: MapaUrbano },
      { path: "ordenes", Component: OrdenesTrabajoPage },
      { path: "sla", Component: SLAPage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "conocimiento", Component: ConocimientoPage },
      { path: "configuracion", Component: ConfiguracionPage },
    ],
  },
  {
    path: "/",
    Component: RoleRouter,
  },
]);
