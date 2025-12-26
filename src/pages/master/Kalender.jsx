import { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  addMonths,
  subMonths,
} from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Star,
  Sun,
  X,
  Save,
  AlertTriangle,
} from "lucide-react";

// Initial holidays data (fallback)
const initialHolidays = [
  { id: 1, date: "2025-01-01", name: "Tahun Baru Masehi", type: "nasional" },
  { id: 2, date: "2025-01-29", name: "Tahun Baru Imlek", type: "nasional" },
  { id: 3, date: "2025-03-29", name: "Hari Raya Nyepi", type: "nasional" },
  { id: 4, date: "2025-03-31", name: "Idul Fitri", type: "nasional" },
  { id: 5, date: "2025-04-01", name: "Idul Fitri", type: "nasional" },
  { id: 6, date: "2025-04-18", name: "Wafat Isa Almasih", type: "nasional" },
  { id: 7, date: "2025-05-01", name: "Hari Buruh", type: "nasional" },
  { id: 8, date: "2025-05-12", name: "Hari Raya Waisak", type: "nasional" },
  { id: 9, date: "2025-05-29", name: "Kenaikan Isa Almasih", type: "nasional" },
  {
    id: 10,
    date: "2025-06-01",
    name: "Hari Lahir Pancasila",
    type: "nasional",
  },
  { id: 11, date: "2025-06-06", name: "Idul Adha", type: "nasional" },
  { id: 12, date: "2025-06-27", name: "Tahun Baru Islam", type: "nasional" },
  { id: 13, date: "2025-08-17", name: "Hari Kemerdekaan RI", type: "nasional" },
  {
    id: 14,
    date: "2025-09-05",
    name: "Maulid Nabi Muhammad",
    type: "nasional",
  },
  { id: 15, date: "2025-12-25", name: "Hari Raya Natal", type: "nasional" },
  { id: 16, date: "2025-12-26", name: "Cuti Bersama Natal", type: "cuti" },
];

export default function Kalender() {
  const {
    holidays: contextHolidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    refreshData,
  } = useData();
  const toast = useToast();

  // Use context holidays if available, otherwise use initial
  const holidays =
    contextHolidays.length > 0 ? contextHolidays : initialHolidays;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    name: "",
    type: "nasional",
  });

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding for first week
    const startPadding = monthStart.getDay();
    const paddedDays = [];

    for (let i = 0; i < startPadding; i++) {
      paddedDays.push(null);
    }

    return [...paddedDays, ...days];
  }, [currentMonth]);

  // Check if date is holiday
  const getHolidayInfo = (date) => {
    if (!date) return null;
    const dateStr = format(date, "yyyy-MM-dd");
    return holidays.find((h) => h.date === dateStr);
  };

  // Navigate months
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Handle form
  const openAddForm = () => {
    setEditingHoliday(null);
    setFormData({
      date: format(new Date(), "yyyy-MM-dd"),
      name: "",
      type: "nasional",
    });
    setShowForm(true);
  };

  const openEditForm = (holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      date: holiday.date,
      name: holiday.name,
      type: holiday.type,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHoliday) {
        await updateHoliday(editingHoliday.id, formData);
      } else {
        await addHoliday(formData);
      }
      setShowForm(false);
      setEditingHoliday(null);
      refreshData();
    } catch (err) {
      toast.error("Gagal menyimpan hari libur: " + err.message);
    }
  };

  const handleDelete = async (holidayId) => {
    if (window.confirm("Hapus hari libur ini?")) {
      try {
        await deleteHoliday(holidayId);
        refreshData();
      } catch (err) {
        toast.error("Gagal menghapus hari libur: " + err.message);
      }
    }
  };

  // Get holidays for current month
  const monthHolidays = holidays.filter((h) => {
    const holidayDate = parseISO(h.date);
    return (
      holidayDate.getMonth() === currentMonth.getMonth() &&
      holidayDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  // Stats
  const totalNasional = holidays.filter((h) => h.type === "nasional").length;
  const totalCuti = holidays.filter((h) => h.type === "cuti").length;
  const totalPerusahaan = holidays.filter(
    (h) => h.type === "perusahaan"
  ).length;

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
          <h1 className="page-title">Kalender Libur</h1>
          <p className="page-subtitle">
            Kelola hari libur nasional dan tarif spesial (Special Rate Day)
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          <Plus size={18} />
          Tambah Hari Libur
        </button>
      </div>

      {/* Alert */}
      <div
        className="alert alert-warning mb-6"
        style={{ marginBottom: "var(--space-6)" }}
      >
        <AlertTriangle size={20} />
        <div>
          Hari yang ditandai sebagai libur akan otomatis menggunakan{" "}
          <strong>Tarif Spesial (Holiday Rate)</strong> pada perhitungan Payroll
        </div>
      </div>

      {/* Stats */}
      <div
        className="grid gap-4 mb-6"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--danger-500)" }}
        >
          <div className="stat-icon danger">
            <Sun size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Libur Nasional</div>
            <div className="stat-value">{totalNasional}</div>
            <div
              style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}
            >
              Hari libur resmi pemerintah
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--warning-500)" }}
        >
          <div className="stat-icon warning">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Cuti Bersama</div>
            <div className="stat-value">{totalCuti}</div>
            <div
              style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}
            >
              Cuti bersama nasional
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--primary-500)" }}
        >
          <div className="stat-icon primary">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Libur Perusahaan</div>
            <div className="stat-value">{totalPerusahaan}</div>
            <div
              style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}
            >
              Hari libur internal
            </div>
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
              maxWidth: "450px",
              margin: "var(--space-4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <h3 className="card-title">
                {editingHoliday ? "Edit Hari Libur" : "Tambah Hari Libur"}
              </h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowForm(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tanggal</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nama Hari Libur</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Hari Raya Idul Fitri"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Jenis</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  <option value="nasional">Libur Nasional</option>
                  <option value="cuti">Cuti Bersama</option>
                  <option value="perusahaan">Libur Perusahaan</option>
                </select>
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

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 350px" }}>
        {/* Calendar */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Kalender</h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <button className="btn btn-ghost btn-sm" onClick={prevMonth}>
                <ChevronLeft size={18} />
              </button>
              <span
                style={{
                  minWidth: "160px",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                {format(currentMonth, "MMMM yyyy", { locale: id })}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={nextMonth}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "2px",
              marginBottom: "var(--space-2)",
            }}
          >
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day, i) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  fontSize: "var(--text-xs)",
                  fontWeight: "600",
                  color: i === 0 ? "var(--danger-400)" : "var(--text-muted)",
                  padding: "var(--space-2)",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "4px",
            }}
          >
            {calendarData.map((date, index) => {
              const holiday = date ? getHolidayInfo(date) : null;
              const isToday =
                date &&
                format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              const isSunday = date && date.getDay() === 0;

              return (
                <div
                  key={index}
                  style={{
                    aspectRatio: "1",
                    padding: "var(--space-2)",
                    background: holiday
                      ? holiday.type === "nasional"
                        ? "rgba(239, 68, 68, 0.15)"
                        : holiday.type === "cuti"
                        ? "rgba(245, 158, 11, 0.15)"
                        : "rgba(59, 130, 246, 0.15)"
                      : isToday
                      ? "rgba(59, 130, 246, 0.2)"
                      : date
                      ? "var(--bg-input)"
                      : "transparent",
                    borderRadius: "var(--radius-lg)",
                    border: isToday
                      ? "2px solid var(--primary-500)"
                      : holiday
                      ? `1px solid ${
                          holiday.type === "nasional"
                            ? "rgba(239, 68, 68, 0.3)"
                            : holiday.type === "cuti"
                            ? "rgba(245, 158, 11, 0.3)"
                            : "rgba(59, 130, 246, 0.3)"
                        }`
                      : "1px solid transparent",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: date ? "pointer" : "default",
                    position: "relative",
                  }}
                  onClick={() => {
                    if (date && !holiday) {
                      setFormData({
                        date: format(date, "yyyy-MM-dd"),
                        name: "",
                        type: "nasional",
                      });
                      setEditingHoliday(null);
                      setShowForm(true);
                    }
                  }}
                  title={holiday ? holiday.name : ""}
                >
                  {date && (
                    <>
                      <span
                        style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: isToday || holiday ? "600" : "400",
                          color: holiday
                            ? holiday.type === "nasional"
                              ? "var(--danger-400)"
                              : holiday.type === "cuti"
                              ? "var(--warning-400)"
                              : "var(--primary-400)"
                            : isSunday
                            ? "var(--danger-400)"
                            : "var(--text-primary)",
                        }}
                      >
                        {format(date, "d")}
                      </span>
                      {holiday && (
                        <Star
                          size={10}
                          style={{
                            color:
                              holiday.type === "nasional"
                                ? "var(--danger-400)"
                                : holiday.type === "cuti"
                                ? "var(--warning-400)"
                                : "var(--primary-400)",
                            marginTop: "2px",
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-4)",
              marginTop: "var(--space-4)",
              paddingTop: "var(--space-4)",
              borderTop: "1px solid var(--border-color)",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              />
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                }}
              >
                Libur Nasional
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(245, 158, 11, 0.15)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                }}
              />
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                }}
              >
                Cuti Bersama
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                }}
              />
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                }}
              >
                Libur Perusahaan
              </span>
            </div>
          </div>
        </div>

        {/* Holiday List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Daftar Libur {format(currentMonth, "MMMM", { locale: id })}
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {monthHolidays.length > 0 ? (
              monthHolidays.map((holiday) => (
                <div
                  key={holiday.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--space-3)",
                    background: "var(--bg-input)",
                    borderRadius: "var(--radius-lg)",
                    borderLeft: `3px solid ${
                      holiday.type === "nasional"
                        ? "var(--danger-500)"
                        : holiday.type === "cuti"
                        ? "var(--warning-500)"
                        : "var(--primary-500)"
                    }`,
                  }}
                >
                  <div>
                    <div
                      style={{ fontWeight: "500", fontSize: "var(--text-sm)" }}
                    >
                      {holiday.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                        fontSize: "var(--text-xs)",
                        color: "var(--text-muted)",
                        marginTop: "2px",
                      }}
                    >
                      <Calendar size={12} />
                      {format(parseISO(holiday.date), "d MMMM yyyy", {
                        locale: id,
                      })}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-1)" }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEditForm(holiday)}
                      style={{ color: "var(--warning-400)" }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDelete(holiday.id)}
                      style={{ color: "var(--danger-400)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--space-8)",
                  color: "var(--text-muted)",
                }}
              >
                <Calendar
                  size={32}
                  style={{ marginBottom: "var(--space-2)", opacity: 0.5 }}
                />
                <p style={{ fontSize: "var(--text-sm)" }}>
                  Tidak ada hari libur di bulan ini
                </p>
              </div>
            )}
          </div>

          {/* Quick Add Presets */}
          <div
            style={{
              marginTop: "var(--space-4)",
              paddingTop: "var(--space-4)",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                marginBottom: "var(--space-2)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Tarif yang Berlaku
            </div>
            <div
              style={{
                padding: "var(--space-3)",
                background: "var(--bg-tertiary)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-2)",
                }}
              >
                <span style={{ fontSize: "var(--text-sm)" }}>Tarif Normal</span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--text-primary)",
                  }}
                >
                  1.0x
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-2)",
                }}
              >
                <span style={{ fontSize: "var(--text-sm)" }}>Tarif Lembur</span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--warning-400)",
                  }}
                >
                  1.5x
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: "500" }}>
                  Tarif Hari Libur (Spesial)
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--danger-400)",
                    fontWeight: "600",
                  }}
                >
                  2.0x
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
