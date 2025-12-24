import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  CreditCard,
  Building2,
  Settings,
  HardHat
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Absensi', href: '/absensi', icon: Users },
  { name: 'Belanja', href: '/belanja', icon: ShoppingCart },
  { name: 'Hutang', href: '/hutang', icon: CreditCard },
  { name: 'Proyek', href: '/proyek', icon: Building2 },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <HardHat size={24} />
          </div>
          <span className="sidebar-logo-text">SIPILPRO</span>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
          <NavLink to="/settings" className="nav-link">
            <Settings size={20} />
            <span>Pengaturan</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          {navigation.slice(0, 5).map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `bottom-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
