import { useData } from '../context/DataContext';
import { formatCurrency, getDueDateStatus } from '../utils/helpers';
import {
  Users,
  CreditCard,
  Building2,
  TrendingUp,
  AlertTriangle,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const {
    projects,
    purchases,
    cashBalance,
    getTotalDebt,
    attendance,
    loading,
    error,
    refreshData,
    isAPIConfigured
  } = useData();

  const activeProjects = projects.filter(p => p.status === 'active');
  const totalDebt = getTotalDebt();
  const todayAttendance = attendance.filter(a =>
    a.date === new Date().toISOString().split('T')[0]
  ).length;

  // Hutang yang jatuh tempo dalam 3 hari
  const urgentDebts = purchases.filter(p => {
    if (p.status !== 'unpaid') return false;
    const status = getDueDateStatus(p.dueDate);
    return status.status === 'overdue' || status.status === 'today' || status.status === 'urgent';
  });

  const stats = [
    {
      label: 'Proyek Aktif',
      value: activeProjects.length,
      icon: Building2,
      color: 'var(--primary-500)',
      bg: 'rgba(59, 130, 246, 0.15)',
    },
    {
      label: 'Absensi Hari Ini',
      value: todayAttendance,
      icon: Users,
      color: 'var(--success-500)',
      bg: 'rgba(34, 197, 94, 0.15)',
    },
    {
      label: 'Total Hutang',
      value: formatCurrency(totalDebt),
      icon: CreditCard,
      color: 'var(--warning-500)',
      bg: 'rgba(245, 158, 11, 0.15)',
    },
    {
      label: 'Saldo Kas',
      value: formatCurrency(cashBalance),
      icon: TrendingUp,
      color: 'var(--primary-400)',
      bg: 'rgba(96, 165, 250, 0.15)',
    },
  ];

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Selamat datang di SIPILPRO - Sistem Manajemen Proyek Konstruksi</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          {/* API Status Badge */}
          <span className={`badge ${isAPIConfigured ? 'badge-success' : 'badge-warning'}`}>
            {isAPIConfigured ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isAPIConfigured ? 'Connected' : 'Offline Mode'}
          </span>

          {/* Refresh Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-pulse" /> : <RefreshCw size={16} />}
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>
          <AlertTriangle size={18} />
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Offline Mode Warning */}
      {!isAPIConfigured && (
        <div className="alert alert-info" style={{ marginBottom: 'var(--space-4)' }}>
          <WifiOff size={18} />
          <div>
            <strong>Mode Offline</strong> - Menggunakan data demo. Configure Google Sheets API untuk sync data.
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-2 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {stats.map((stat, index) => (
          <div key={index} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              background: stat.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: stat.color
            }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Urgent Debts Alert */}
      {urgentDebts.length > 0 && (
        <div className="alert alert-warning mb-6" style={{ marginBottom: 'var(--space-6)' }}>
          <AlertTriangle size={20} />
          <div>
            <strong>Perhatian!</strong> Ada {urgentDebts.length} hutang yang segera jatuh tempo.
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

        {/* Active Projects */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Proyek Aktif</h3>
            <span className="badge badge-primary">{activeProjects.length} proyek</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {activeProjects.map(project => (
              <div
                key={project.id}
                style={{
                  padding: 'var(--space-3)',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <p style={{ fontWeight: '600', marginBottom: 'var(--space-1)' }}>{project.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{project.location}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity / Pending Debts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Hutang Jatuh Tempo</h3>
            <Clock size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {purchases.filter(p => p.status === 'unpaid').slice(0, 5).map(purchase => {
              const status = getDueDateStatus(purchase.dueDate);
              return (
                <div
                  key={purchase.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-3)',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <p style={{ fontWeight: '500', fontSize: '0.875rem' }}>{purchase.invoiceNo}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {formatCurrency(purchase.total)}
                    </p>
                  </div>
                  <span className={`badge ${status.className}`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
