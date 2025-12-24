import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
  isHoliday,
  formatDateID,
  calculateDuration,
  calculateWage,
  getRateDescription,
  formatCurrency
} from '../utils/helpers';
import { format } from 'date-fns';
import {
  Calendar,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  Save,
  CheckCircle
} from 'lucide-react';

export default function Absensi() {
  const { workers, projects, addAttendance } = useData();

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [workerId, setWorkerId] = useState('');
  const [sessions, setSessions] = useState([
    { id: 1, projectId: '', start: '08:00', end: '12:00' }
  ]);
  const [saved, setSaved] = useState(false);

  // Check if selected date is holiday
  const holidayInfo = useMemo(() => isHoliday(date), [date]);

  // Get selected worker
  const selectedWorker = useMemo(() =>
    workers.find(w => w.id === workerId),
    [workerId, workers]
  );

  // Calculate session durations and totals
  const calculations = useMemo(() => {
    const sessionsWithDuration = sessions.map(s => ({
      ...s,
      duration: calculateDuration(s.start, s.end)
    }));

    const totalHours = sessionsWithDuration.reduce((sum, s) => sum + s.duration, 0);

    let wage = 0;
    let rateInfo = null;

    if (selectedWorker && totalHours > 0) {
      wage = calculateWage(totalHours, selectedWorker, holidayInfo.isHoliday);
      rateInfo = getRateDescription(selectedWorker, holidayInfo.isHoliday, totalHours);
    }

    return { sessionsWithDuration, totalHours, wage, rateInfo };
  }, [sessions, selectedWorker, holidayInfo]);

  // Add new session
  const addSession = () => {
    const newId = Math.max(...sessions.map(s => s.id)) + 1;
    setSessions([...sessions, {
      id: newId,
      projectId: '',
      start: '13:00',
      end: '17:00'
    }]);
  };

  // Remove session
  const removeSession = (id) => {
    if (sessions.length > 1) {
      setSessions(sessions.filter(s => s.id !== id));
    }
  };

  // Update session field
  const updateSession = (id, field, value) => {
    setSessions(sessions.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  // Save attendance
  const handleSave = () => {
    if (!workerId || sessions.some(s => !s.projectId)) {
      alert('Lengkapi semua field!');
      return;
    }

    const record = {
      date,
      workerId,
      sessions: calculations.sessionsWithDuration.map(s => ({
        projectId: s.projectId,
        start: s.start,
        end: s.end,
        duration: s.duration
      })),
      totalHours: calculations.totalHours,
      isHoliday: holidayInfo.isHoliday,
      wage: calculations.wage
    };

    addAttendance(record);
    setSaved(true);

    // Reset after 2 seconds
    setTimeout(() => {
      setSaved(false);
      setWorkerId('');
      setSessions([{ id: 1, projectId: '', start: '08:00', end: '12:00' }]);
    }, 2000);
  };

  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Input Absensi</h1>
        <p className="page-subtitle">Pencatatan kehadiran harian tukang</p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {/* Date Selection */}
        <div className="card mb-4" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label">
              <Calendar size={16} style={{ display: 'inline', marginRight: 'var(--space-2)' }} />
              Tanggal
            </label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
              {formatDateID(date)}
            </p>
          </div>

          {/* Holiday Alert */}
          {holidayInfo.isHoliday && (
            <div className="alert alert-warning">
              <AlertCircle size={18} />
              <div>
                <strong>HARI LIBUR</strong> - {holidayInfo.reason}
                <p style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                  Semua jam akan dihitung dengan rate libur
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Worker Selection */}
        <div className="card mb-4" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Pilih Tukang</label>
            <select
              className="form-select"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
            >
              <option value="">-- Pilih Tukang --</option>
              {workers.map(worker => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} ({worker.skill})
                </option>
              ))}
            </select>
            {selectedWorker && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                Rate: Normal {formatCurrency(selectedWorker.rateNormal)}/jam |
                Lembur {formatCurrency(selectedWorker.rateOvertime)}/jam |
                Libur {formatCurrency(selectedWorker.rateHoliday)}/jam
              </p>
            )}
          </div>
        </div>

        {/* Work Sessions */}
        {sessions.map((session, index) => (
          <div key={session.id} className="session-card">
            <div className="session-header">
              <span className="session-title">
                SESSION {index + 1} {index === 0 ? '(Pagi)' : '(Pindah Proyek)'}
              </span>
              {sessions.length > 1 && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => removeSession(session.id)}
                  style={{ color: 'var(--danger-500)' }}
                >
                  <Trash2 size={16} />
                  Hapus
                </button>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Proyek</label>
              <select
                className="form-select"
                value={session.projectId}
                onChange={(e) => updateSession(session.id, 'projectId', e.target.value)}
              >
                <option value="">-- Pilih Proyek --</option>
                {activeProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="session-grid">
              <div className="form-group">
                <label className="form-label">Jam Masuk</label>
                <input
                  type="time"
                  className="form-input"
                  value={session.start}
                  onChange={(e) => updateSession(session.id, 'start', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Jam Keluar</label>
                <input
                  type="time"
                  className="form-input"
                  value={session.end}
                  onChange={(e) => updateSession(session.id, 'end', e.target.value)}
                />
              </div>
            </div>

            <div className="session-duration">
              <Clock size={14} style={{ display: 'inline', marginRight: 'var(--space-2)' }} />
              Durasi: <strong>{calculations.sessionsWithDuration.find(s => s.id === session.id)?.duration || 0} Jam</strong>
            </div>
          </div>
        ))}

        {/* Add Session Button */}
        <button
          className="btn btn-secondary btn-full mb-4"
          onClick={addSession}
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <Plus size={18} />
          TAMBAH SESI PROYEK LAIN
        </button>

        {/* Summary */}
        {selectedWorker && calculations.totalHours > 0 && (
          <div className="summary-card">
            <h4 className="summary-title">Ringkasan Hari Ini</h4>
            <div className="summary-grid">
              <div className="summary-row">
                <span className="summary-label">Total Jam</span>
                <span className="summary-value">{calculations.totalHours} Jam</span>
              </div>
              {calculations.rateInfo && (
                <div className="summary-row">
                  <span className="summary-label">{calculations.rateInfo.label}</span>
                  <span className="summary-value font-mono">
                    {typeof calculations.rateInfo.rate === 'number'
                      ? formatCurrency(calculations.rateInfo.rate)
                      : calculations.rateInfo.rate}
                  </span>
                </div>
              )}
              <div className="summary-row" style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-color)' }}>
                <span className="summary-label">Estimasi Gaji</span>
                <span className="summary-value highlight">{formatCurrency(calculations.wage)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          className={`btn ${saved ? 'btn-secondary' : 'btn-primary'} btn-lg btn-full mt-6`}
          onClick={handleSave}
          disabled={saved || !workerId || sessions.some(s => !s.projectId)}
          style={{ marginTop: 'var(--space-6)' }}
        >
          {saved ? (
            <>
              <CheckCircle size={20} />
              TERSIMPAN!
            </>
          ) : (
            <>
              <Save size={20} />
              SIMPAN ABSEN
            </>
          )}
        </button>
      </div>
    </div>
  );
}
