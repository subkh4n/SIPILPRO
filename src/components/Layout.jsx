import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Store,
  QrCode,
  ClipboardList,
  FileText,
  Receipt,
  CalendarClock,
  Wallet,
  CreditCard,
  HandCoins,
  BarChart3,
  FileBarChart,
  ShoppingBag,
  Settings,
  HardHat,
  ChevronDown,
  ChevronRight,
  Database,
  Briefcase,
  DollarSign,
  PieChart,
  ScanLine,
  Camera,
  User,
  LogOut,
} from "lucide-react";

// Menu structure
const menuStructure = [
  {
    id: "dashboard",
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    type: "link",
  },
  {
    id: "master",
    name: "Master Data",
    icon: Database,
    type: "group",
    children: [
      { name: "Data Pegawai", href: "/master/pegawai", icon: Users },
      { name: "Data Proyek", href: "/master/proyek", icon: Building2 },
      { name: "Data Vendor", href: "/master/vendor", icon: Store },
      { name: "Kalender Libur", href: "/master/kalender", icon: CalendarClock },
    ],
  },
  {
    id: "operasional",
    name: "Operasional",
    icon: Briefcase,
    type: "group",
    children: [
      { name: "Scan QR Absen", href: "/operasional/scan-absen", icon: QrCode },
      {
        name: "Input Absensi",
        href: "/operasional/absensi",
        icon: ClipboardList,
      },
      {
        name: "Log Kehadiran",
        href: "/operasional/log-absensi",
        icon: FileText,
      },
      { name: "Scan Nota", href: "/operasional/scan-nota", icon: Camera },
      { name: "Input Belanja", href: "/operasional/belanja", icon: Receipt },
      {
        name: "Verifikasi Nota",
        href: "/operasional/verifikasi",
        icon: FileBarChart,
      },
      {
        name: "Jatuh Tempo",
        href: "/operasional/jatuh-tempo",
        icon: CalendarClock,
      },
    ],
  },
  {
    id: "keuangan",
    name: "Keuangan",
    icon: DollarSign,
    type: "group",
    children: [
      { name: "Payroll", href: "/keuangan/payroll", icon: Wallet },
      { name: "Arus Kas", href: "/keuangan/kas", icon: CreditCard },
      { name: "Hutang Vendor", href: "/keuangan/hutang", icon: HandCoins },
      { name: "Piutang", href: "/keuangan/piutang", icon: ShoppingBag },
    ],
  },
  {
    id: "laporan",
    name: "Laporan",
    icon: PieChart,
    type: "group",
    children: [
      { name: "Realisasi vs RAP", href: "/laporan/realisasi", icon: BarChart3 },
      { name: "Rekap Absensi", href: "/laporan/absensi", icon: FileText },
      { name: "Biaya Vendor", href: "/laporan/vendor", icon: FileBarChart },
      { name: "Laporan Payroll", href: "/laporan/payroll", icon: Wallet },
      { name: "Laporan Proyek", href: "/laporan/proyek", icon: Building2 },
      { name: "Detil Biaya", href: "/laporan/detil-biaya", icon: Receipt },
    ],
  },
];

// Collapsible Menu Group Component
function MenuGroup({ group, isOpen, onToggle, location }) {
  const isChildActive = group.children?.some(
    (child) => location.pathname === child.href
  );

  return (
    <div className="nav-group">
      <button
        className={`nav-group-header ${
          isOpen || isChildActive ? "active" : ""
        }`}
        onClick={onToggle}
      >
        <div className="nav-group-left">
          <group.icon size={20} />
          <span>{group.name}</span>
        </div>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {(isOpen || isChildActive) && (
        <div className="nav-group-items">
          {group.children.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `nav-link nav-link-child ${isActive ? "active" : ""}`
              }
            >
              <item.icon size={16} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState(["operasional"]); // Default open

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

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
          {menuStructure.map((item) => {
            if (item.type === "link") {
              return (
                <NavLink
                  key={item.id}
                  to={item.href}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              );
            } else {
              return (
                <MenuGroup
                  key={item.id}
                  group={item}
                  isOpen={openMenus.includes(item.id)}
                  onToggle={() => toggleMenu(item.id)}
                  location={location}
                />
              );
            }
          })}
        </nav>

        <div
          style={{
            marginTop: "auto",
            paddingTop: "var(--space-4)",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <NavLink to="/settings" className="nav-link">
            <Settings size={20} />
            <span>Pengaturan</span>
          </NavLink>

          {/* User Profile */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-4)",
              marginTop: "var(--space-3)",
              background: "var(--bg-tertiary)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-full)",
                background:
                  "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <User size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "600", fontSize: "var(--text-sm)" }}>
                Admin
              </div>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                }}
              >
                Administrator
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            className="nav-link"
            onClick={() => alert("Logout clicked")}
            style={{
              width: "100%",
              marginTop: "var(--space-2)",
              cursor: "pointer",
              background: "transparent",
              border: "none",
              color: "var(--danger-400)",
            }}
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">{children}</main>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `bottom-nav-link ${isActive ? "active" : ""}`
            }
          >
            <LayoutDashboard size={20} />
            <span>Home</span>
          </NavLink>
          <NavLink
            to="/operasional/absensi"
            className={({ isActive }) =>
              `bottom-nav-link ${isActive ? "active" : ""}`
            }
          >
            <ClipboardList size={20} />
            <span>Absensi</span>
          </NavLink>
          <NavLink
            to="/operasional/belanja"
            className={({ isActive }) =>
              `bottom-nav-link ${isActive ? "active" : ""}`
            }
          >
            <Receipt size={20} />
            <span>Belanja</span>
          </NavLink>
          <NavLink
            to="/keuangan/hutang"
            className={({ isActive }) =>
              `bottom-nav-link ${isActive ? "active" : ""}`
            }
          >
            <HandCoins size={20} />
            <span>Hutang</span>
          </NavLink>
          <NavLink
            to="/laporan/realisasi"
            className={({ isActive }) =>
              `bottom-nav-link ${isActive ? "active" : ""}`
            }
          >
            <BarChart3 size={20} />
            <span>Laporan</span>
          </NavLink>
        </div>
      </nav>

      {/* Mobile FAB - Quick Actions */}
      <div className="fab-container">
        <button className="fab" title="Scan QR / Nota">
          <ScanLine size={24} />
        </button>
      </div>
    </div>
  );
}
