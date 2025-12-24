import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/helpers';
import {
  Building2,
  MapPin,
  TrendingUp,
  Users,
  Package
} from 'lucide-react';

export default function Proyek() {
  const { projects, getProjectCosts } = useData();

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Daftar Proyek</h1>
        <p className="page-subtitle">Monitoring biaya realisasi per proyek</p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {projects.map(project => {
          const costs = getProjectCosts(project.id);

          return (
            <div key={project.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: project.status === 'active'
                      ? 'linear-gradient(135deg, var(--primary-500), var(--primary-700))'
                      : 'var(--gray-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: '600', marginBottom: '2px' }}>{project.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} />
                      {project.location}
                    </p>
                  </div>
                </div>
                <span className={`badge ${project.status === 'active' ? 'badge-success' : 'badge-primary'}`}>
                  {project.status === 'active' ? 'Aktif' : 'Selesai'}
                </span>
              </div>

              {/* Cost Breakdown */}
              <div style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Biaya Realisasi
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <Package size={14} />
                      Material
                    </span>
                    <span className="font-mono">{formatCurrency(costs.materialCost)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <Users size={14} />
                      Tenaga Kerja
                    </span>
                    <span className="font-mono">{formatCurrency(costs.laborCost)}</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 'var(--space-3)',
                    marginTop: 'var(--space-2)',
                    borderTop: '1px solid var(--border-color)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem', fontWeight: '600' }}>
                      <TrendingUp size={14} />
                      Total
                    </span>
                    <span className="font-mono font-bold" style={{ color: 'var(--primary-400)', fontSize: '1.125rem' }}>
                      {formatCurrency(costs.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
