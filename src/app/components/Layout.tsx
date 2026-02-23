import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet, Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, LogOut } from 'lucide-react';

interface LayoutProps {
  citizen?: boolean;
}

export function Layout({ citizen }: LayoutProps) {
  const { user, logout } = useAuth();

  if (citizen) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header ciudadano */}
        <header className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-border flex items-center px-6 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground leading-tight">Vita360</div>
              <div className="text-[11px] text-muted-foreground">Portal Ciudadano</div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[13px] text-muted-foreground">
              👤 <span className="font-medium text-foreground">{user?.name}</span>
            </span>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </header>
        <main className="mt-[60px] p-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="ml-[220px] mt-[60px] p-6">
        <Outlet />
      </main>
    </div>
  );
}
