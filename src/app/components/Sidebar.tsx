import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Clock,
  BarChart3,
  BookOpen,
  Building2
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/casos', label: 'Casos', icon: FolderOpen },
  { path: '/tramites', label: 'Trámites', icon: FileText },
  { path: '/sla', label: 'SLA', icon: Clock },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/conocimiento', label: 'Base de Conocimiento', icon: BookOpen }
];

const NavItem = ({ icon: Icon, label, isActive }: { icon: any; label: string; isActive: boolean }) => (
  <div 
    className={`flex items-center gap-3 h-[52px] px-4 cursor-pointer transition-colors relative ${
      isActive 
        ? 'bg-[#E7E9EE] text-[#306CBB]' 
        : 'text-[#6F7F8F] hover:bg-[#E7E9EE]/50'
    }`}
  >
    {isActive && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#306CBB]" />}
    <Icon size={20} />
    <span className="text-[14px] font-medium">{label}</span>
  </div>
);

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#F4F5F7] border-r border-[#E6EAF0] flex flex-col z-50">
      {/* Logo */}
      <div className="h-[72px] flex items-center px-6 border-b border-[#E6EAF0] gap-2">
        <div className="w-10 h-10 bg-[#306CBB] rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 size={24} className="text-white" />
        </div>
        <div>
          <div className="text-[20px] font-semibold">
            <span className="text-[#2F3A46]">Atención</span>
            <span className="text-[#306CBB]"> 360</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="no-underline"
            >
              <NavItem icon={item.icon} label={item.label} isActive={isActive} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
