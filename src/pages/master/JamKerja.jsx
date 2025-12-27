import { useState } from "react";
import { useData } from "../../context";
import { useToast } from "../../context/ToastContext";
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Calendar,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  AlertTriangle,
} from "lucide-react";

// Initial work schedules (fallback)
const initialWorkSchedules = [
  {
    id: "schedule-001",
    name: "Reguler 5 Hari",
    code: "REG5",
    type: "reguler",
    description: "5 hari kerja, 9 jam/hari (Senin-Jumat)",
    workDays: 5,
    hoursPerDay: 9,
    weeklyHours: 45,
    startTime: "08:00",
    endTime: "17:00",
    breakDuration: 60,
    overtimeMultiplier: 1.5,
    holidayMultiplier: 2.0,
    isActive: true,
  },
  {
    id: "schedule-002",
    name: "Reguler 6 Hari",
    code: "REG6",
    type: "reguler",
    description: "6 hari kerja, 8 jam/hari (Senin-Sabtu)",
    workDays: 6,
    hoursPerDay: 8,
    weeklyHours: 48,
    startTime: "08:00",
    endTime: "16:00",
    breakDuration: 60,
    overtimeMultiplier: 1.5,
    holidayMultiplier: 2.0,
    isActive: true,
  },
  {
    id: "schedule-003",
    name: "Shift Pagi",
    code: "PAGI",
    type: "shift",
    description: "Shift pagi jam 06:00-14:00",
    workDays: 6,
    hoursPerDay: 8,
    weeklyHours: 48,
    startTime: "06:00",
    endTime: "14:00",
    breakDuration: 30,
    overtimeMultiplier: 1.5,
    holidayMultiplier: 2.0,
    isActive: true,
  },
  {
    id: "schedule-004",
    name: "Shift Siang",
    code: "SIANG",
    type: "shift",
    description: "Shift siang jam 14:00-22:00",
    workDays: 6,
    hoursPerDay: 8,
    weeklyHours: 48,
    startTime: "14:00",
    endTime: "22:00",
    breakDuration: 30,
    overtimeMultiplier: 1.5,
    holidayMultiplier: 2.0,
    isActive: true,
  },
  {
    id: "schedule-005",
    name: "Shift Malam",
    code: "MALAM",
    type: "shift",
    description: "Shift malam jam 22:00-06:00",
    workDays: 6,
    hoursPerDay: 8,
    weeklyHours: 48,
    startTime: "22:00",
    endTime: "06:00",
    breakDuration: 30,
    overtimeMultiplier: 2.0,
    holidayMultiplier: 2.5,
    isActive: true,
  },
];

export default function JamKerja() {
  const {
    workSchedules: contextSchedules,
    addWorkSchedule,
    updateWorkSchedule,
    deleteWorkSchedule,
  } = useData();
  const toast = useToast();

  // Use context data if available, otherwise use initial
  const workSchedules =
    contextSchedules && contextSchedules.length > 0
      ? contextSchedules
      : initialWorkSchedules;

  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "reguler",
    description: "",
    workDays: 5,
    hoursPerDay: 8,
    startTime: "08:00",
    endTime: "17:00",
    breakDuration: 60,
    overtimeMultiplier: 1.5,
    holidayMultiplier: 2.0,
    isActive: true,
  });

  // Stats
  const totalSchedules = workSchedules.length;
  const regulerCount = workSchedules.filter((s) => s.type === "reguler").length;
  const shiftCount = workSchedules.filter((s) => s.type === "shift").length;

  // Get icon for schedule type
  const getScheduleIcon = (schedule) => {
    if (schedule.type === "shift") {
      if (schedule.code === "PAGI") return Sunrise;
      if (schedule.code === "SIANG") return Sun;
      if (schedule.code === "MALAM") return Moon;
      return Sunset;
    }
    return Calendar;
  };

  // Get color for schedule type
  const getScheduleColor = (schedule) => {
    if (schedule.type === "shift") {
      if (schedule.code === "PAGI") return "var(--warning-500)";
      if (schedule.code === "SIANG") return "var(--accent-500)";
      if (schedule.code === "MALAM") return "var(--primary-700)";
      return "var(--primary-500)";
    }
    return "var(--success-500)";
  };

  // Handle form
  const openAddForm = () => {
    setEditingSchedule(null);
    setFormData({
      name: "",
      code: "",
      type: "reguler",
      description: "",
      workDays: 5,
      hoursPerDay: 8,
      startTime: "08:00",
      endTime: "17:00",
      breakDuration: 60,
      overtimeMultiplier: 1.5,
      holidayMultiplier: 2.0,
      isActive: true,
    });
    setShowForm(true);
  };

  const openEditForm = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      code: schedule.code,
      type: schedule.type,
      description: schedule.description,
      workDays: schedule.workDays,
      hoursPerDay: schedule.hoursPerDay,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      breakDuration: schedule.breakDuration,
      overtimeMultiplier: schedule.overtimeMultiplier,
      holidayMultiplier: schedule.holidayMultiplier,
      isActive: schedule.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const weeklyHours = formData.workDays * formData.hoursPerDay;
      const dataToSave = { ...formData, weeklyHours };

      if (editingSchedule) {
        if (updateWorkSchedule) {
          await updateWorkSchedule(editingSchedule.id, dataToSave);
        }
        toast.success("Jam kerja berhasil diperbarui");
      } else {
        if (addWorkSchedule) {
          await addWorkSchedule(dataToSave);
        }
        toast.success("Jam kerja berhasil ditambahkan");
      }
      setShowForm(false);
      setEditingSchedule(null);
    } catch (err) {
      toast.error("Gagal menyimpan: " + err.message);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm("Hapus jam kerja ini?")) {
      try {
        if (deleteWorkSchedule) {
          await deleteWorkSchedule(scheduleId);
        }
        toast.success("Jam kerja berhasil dihapus");
      } catch (err) {
        toast.error("Gagal menghapus: " + err.message);
      }
    }
  };

  return (
    <div className="animate-in">
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <h1 className="page-title">Jam Kerja</h1>
          <p className="page-subtitle">
            Kelola jadwal dan jam kerja (reguler & shift)
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          <Plus size={18} />
          Tambah Jadwal
        </button>
      </div>

      {/* Alert */}
      <div
        className="alert alert-info mb-6"
        style={{ marginBottom: "var(--space-6)" }}
      >
        <AlertTriangle size={20} />
        <div>
          Jam kerja menentukan{" "}
          <strong>jadwal masuk/pulang dan perhitungan lembur</strong> yang akan
          diterapkan ke setiap pegawai
        </div>
      </div>

      {/* Stats */}
      <div
        className="grid gap-4 mb-6"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",
          marginBottom: "var(--space-6)",
          maxWidth: "600px",
        }}
      >
        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--primary-500)" }}
        >
          <div className="stat-icon primary">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Jadwal</div>
            <div className="stat-value">{totalSchedules}</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--success-500)" }}
        >
          <div className="stat-icon success">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Reguler</div>
            <div className="stat-value">{regulerCount}</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--warning-500)" }}
        >
          <div className="stat-icon warning">
            <Sun size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Shift</div>
            <div className="stat-value">{shiftCount}</div>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "550px",
              margin: "var(--space-4)",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <h3 className="card-title">
                {editingSchedule ? "Edit Jam Kerja" : "Tambah Jam Kerja"}
              </h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowForm(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-4)",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Nama Jadwal</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Shift Pagi"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kode</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="PAGI"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Keterangan singkat"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tipe</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  <option value="reguler">Reguler</option>
                  <option value="shift">Shift</option>
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-4)",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Hari Kerja/Minggu</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="7"
                    value={formData.workDays}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        workDays: parseInt(e.target.value) || 5,
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Kerja/Hari</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="24"
                    value={formData.hoursPerDay}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hoursPerDay: parseInt(e.target.value) || 8,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-4)",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Jam Masuk</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Pulang</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "var(--space-4)",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Istirahat (menit)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    value={formData.breakDuration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        breakDuration: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Multiplier Lembur</label>
                  <input
                    type="number"
                    className="form-input"
                    step="0.1"
                    min="1"
                    value={formData.overtimeMultiplier}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        overtimeMultiplier: parseFloat(e.target.value) || 1.5,
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Multiplier Libur</label>
                  <input
                    type="number"
                    className="form-input"
                    step="0.1"
                    min="1"
                    value={formData.holidayMultiplier}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        holidayMultiplier: parseFloat(e.target.value) || 2.0,
                      }))
                    }
                  />
                </div>
              </div>

              <div
                className="form-group"
                style={{ marginTop: "var(--space-2)" }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  <span>Aktif</span>
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-3)",
                  marginTop: "var(--space-5)",
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={() => setShowForm(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-full">
                  <Save size={16} />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Cards */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
      >
        {workSchedules.map((schedule) => {
          const Icon = getScheduleIcon(schedule);
          const color = getScheduleColor(schedule);

          return (
            <div
              key={schedule.id}
              className="card"
              style={{
                borderLeft: `4px solid ${color}`,
                opacity: schedule.isActive ? 1 : 0.6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "var(--space-3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "var(--radius-lg)",
                      background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: "600",
                        fontSize: "var(--text-base)",
                      }}
                    >
                      {schedule.name}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                      }}
                    >
                      <span
                        className="badge"
                        style={{
                          background:
                            schedule.type === "reguler"
                              ? "rgba(34, 197, 94, 0.15)"
                              : "rgba(245, 158, 11, 0.15)",
                          color:
                            schedule.type === "reguler"
                              ? "var(--success-400)"
                              : "var(--warning-400)",
                          padding: "2px 8px",
                          fontSize: "10px",
                        }}
                      >
                        {(schedule.type || "reguler").toUpperCase()}
                      </span>
                      <span className="font-mono">{schedule.code}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--space-1)" }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => openEditForm(schedule)}
                    style={{ color: "var(--warning-400)" }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(schedule.id)}
                    style={{ color: "var(--danger-400)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-muted)",
                  marginBottom: "var(--space-3)",
                }}
              >
                {schedule.description}
              </p>

              {/* Work Hours Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "var(--space-2)",
                  padding: "var(--space-3)",
                  background: "var(--bg-tertiary)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "var(--text-lg)",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                    }}
                  >
                    {schedule.workDays}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Hari/Minggu
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "var(--text-lg)",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                    }}
                  >
                    {schedule.hoursPerDay}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Jam/Hari
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "var(--text-lg)",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                    }}
                  >
                    {schedule.weeklyHours ||
                      schedule.workDays * schedule.hoursPerDay}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Jam/Minggu
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "var(--space-3)",
                  paddingTop: "var(--space-3)",
                  borderTop: "1px solid var(--border-color)",
                  fontSize: "var(--text-xs)",
                }}
              >
                <div>
                  <Clock
                    size={12}
                    style={{ marginRight: 4, verticalAlign: "middle" }}
                  />
                  {schedule.startTime} - {schedule.endTime}
                </div>
                <div style={{ display: "flex", gap: "var(--space-3)" }}>
                  <span style={{ color: "var(--warning-400)" }}>
                    Lembur: {schedule.overtimeMultiplier}x
                  </span>
                  <span style={{ color: "var(--danger-400)" }}>
                    Libur: {schedule.holidayMultiplier}x
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {workSchedules.length === 0 && (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "var(--space-12)",
            color: "var(--text-muted)",
          }}
        >
          <Clock
            size={48}
            style={{ marginBottom: "var(--space-3)", opacity: 0.5 }}
          />
          <p>Belum ada jam kerja. Klik "Tambah Jadwal" untuk memulai.</p>
        </div>
      )}
    </div>
  );
}
