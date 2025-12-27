import { useState, useMemo } from "react";
import { useData } from "../../context";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/helpers";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Check,
  Sun,
  Moon,
  Search,
  Save,
  History,
  Zap,
} from "lucide-react";

export default function InputAbsensi() {
  const { workers, projects } = useData();
  const toast = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isHoliday, setIsHoliday] = useState(false);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [workerSearch, setWorkerSearch] = useState("");
  const [sessions, setSessions] = useState([
    {
      id: 1,
      project: projects[0]?.name || "Cluster A",
      timeIn: "08:00",
      timeOut: "12:00",
    },
    {
      id: 2,
      project: projects[1]?.name || "Ruko B",
      timeIn: "13:00",
      timeOut: "18:00",
    },
  ]);
  const [confirmed, setConfirmed] = useState(false);

  // Calendar data
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPadding = monthStart.getDay();
    const paddedDays = [];
    for (let i = 0; i < startPadding; i++) {
      paddedDays.push(null);
    }
    return [...paddedDays, ...days];
  }, [currentMonth]);

  // Filter workers
  const filteredWorkers = workers.filter((w) =>
    w.name.toLowerCase().includes(workerSearch.toLowerCase())
  );

  // Toggle worker selection
  const toggleWorker = (worker) => {
    setSelectedWorkers((prev) =>
      prev.find((w) => w.id === worker.id)
        ? prev.filter((w) => w.id !== worker.id)
        : [...prev, worker]
    );
  };

  // Add session
  const addSession = () => {
    setSessions((prev) => [
      ...prev,
      {
        id: Date.now(),
        project: projects[0]?.name || "Cluster A",
        timeIn: "08:00",
        timeOut: "12:00",
      },
    ]);
  };

  // Remove session
  const removeSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // Update session
  const updateSession = (id, field, value) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Calculate hours for a session
  const getSessionHours = (timeIn, timeOut) => {
    const [inH, inM] = timeIn.split(":").map(Number);
    const [outH, outM] = timeOut.split(":").map(Number);
    const inMinutes = inH * 60 + inM;
    const outMinutes = outH * 60 + outM;
    return Math.max(0, (outMinutes - inMinutes) / 60);
  };

  // Calculate totals
  const calculations = useMemo(() => {
    const totalHours = sessions.reduce(
      (sum, s) => sum + getSessionHours(s.timeIn, s.timeOut),
      0
    );
    const normalHours = Math.min(totalHours, 8);
    const overtimeHours = Math.max(0, totalHours - 8);

    const baseRate = 75000; // Per day base
    const normalRate = baseRate / 8;
    const overtimeRate = normalRate * 1.5;
    const holidayMultiplier = isHoliday ? 2 : 1;

    const normalWage = normalHours * normalRate * holidayMultiplier;
    const overtimeWage = overtimeHours * overtimeRate * holidayMultiplier;
    const totalWage = normalWage + overtimeWage;

    // Group by project
    const projectBreakdown = {};
    sessions.forEach((s) => {
      const hours = getSessionHours(s.timeIn, s.timeOut);
      if (!projectBreakdown[s.project]) {
        projectBreakdown[s.project] = { hours: 0, wage: 0 };
      }
      projectBreakdown[s.project].hours += hours;
      projectBreakdown[s.project].wage +=
        hours * normalRate * holidayMultiplier;
    });

    return {
      totalHours,
      normalHours,
      overtimeHours,
      totalWage,
      normalRate,
      projectBreakdown,
    };
  }, [sessions, isHoliday]);

  // Get avatar color
  const getAvatarColor = (name) => {
    const colors = [
      "linear-gradient(135deg, #667eea, #764ba2)",
      "linear-gradient(135deg, #f093fb, #f5576c)",
      "linear-gradient(135deg, #4facfe, #00f2fe)",
      "linear-gradient(135deg, #43e97b, #38f9d7)",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  // Handle save
  const handleSave = () => {
    if (selectedWorkers.length === 0) {
      toast.warning("Pilih minimal 1 pekerja!");
      return;
    }
    if (!confirmed) {
      toast.warning("Centang konfirmasi terlebih dahulu!");
      return;
    }
    toast.success(
      `Absensi berhasil disimpan untuk ${selectedWorkers.length} pekerja!`
    );
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
          <h1 className="page-title">Input Absensi Harian</h1>
          <p className="page-subtitle">
            Formulir pencatatan kehadiran multi-site dengan kalkulasi lembur
            otomatis.
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button className="btn btn-secondary">
            <History size={18} />
            Riwayat Input
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={18} />
            Simpan Data
          </button>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 360px" }}>
        {/* Left Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-6)",
          }}
        >
          {/* Section 1: Konteks Waktu */}
          <div className="card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                marginBottom: "var(--space-4)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-full)",
                  background: "var(--primary-500)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "var(--text-sm)",
                  fontWeight: "600",
                }}
              >
                1
              </div>
              <h3 style={{ fontWeight: "600", flex: 1 }}>Konteks Waktu</h3>
              <span className="badge badge-success">
                <Check size={12} />
                Status Aktif
              </span>
            </div>

            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: "1fr 1fr" }}
            >
              {/* Calendar */}
              <div>
                <label className="form-label">Pilih Tanggal</label>
                <div
                  style={{
                    background: "var(--bg-tertiary)",
                    borderRadius: "var(--radius-xl)",
                    padding: "var(--space-3)",
                  }}
                >
                  {/* Month Nav */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "var(--space-2)",
                    }}
                  >
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        setCurrentMonth(subMonths(currentMonth, 1))
                      }
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span
                      style={{ fontWeight: "600", fontSize: "var(--text-sm)" }}
                    >
                      {format(currentMonth, "MMMM yyyy", { locale: id })}
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        setCurrentMonth(addMonths(currentMonth, 1))
                      }
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Day Headers */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: "2px",
                      marginBottom: "4px",
                    }}
                  >
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                      <div
                        key={i}
                        style={{
                          textAlign: "center",
                          fontSize: "10px",
                          fontWeight: "600",
                          color:
                            i === 0 ? "var(--danger-400)" : "var(--text-muted)",
                          padding: "4px",
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
                      gap: "2px",
                    }}
                  >
                    {calendarDays.map((date, index) => {
                      const isSelected =
                        date &&
                        format(date, "yyyy-MM-dd") ===
                          format(selectedDate, "yyyy-MM-dd");
                      const isToday =
                        date &&
                        format(date, "yyyy-MM-dd") ===
                          format(new Date(), "yyyy-MM-dd");

                      return (
                        <button
                          key={index}
                          disabled={!date}
                          onClick={() => date && setSelectedDate(date)}
                          style={{
                            aspectRatio: "1",
                            padding: "2px",
                            background: isSelected
                              ? "var(--primary-500)"
                              : isToday
                              ? "rgba(59, 130, 246, 0.2)"
                              : "transparent",
                            border:
                              isToday && !isSelected
                                ? "1px solid var(--primary-500)"
                                : "1px solid transparent",
                            borderRadius: "var(--radius-md)",
                            cursor: date ? "pointer" : "default",
                            fontSize: "11px",
                            fontWeight: isSelected ? "600" : "400",
                            color: isSelected
                              ? "white"
                              : date
                              ? "var(--text-primary)"
                              : "transparent",
                          }}
                        >
                          {date ? format(date, "d") : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Status Hari */}
              <div>
                <label className="form-label">Status Hari</label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-3)",
                  }}
                >
                  <button
                    onClick={() => setIsHoliday(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      padding: "var(--space-3)",
                      background: !isHoliday
                        ? "rgba(59, 130, 246, 0.15)"
                        : "var(--bg-tertiary)",
                      border: !isHoliday
                        ? "1px solid var(--primary-500)"
                        : "1px solid var(--border-color)",
                      borderRadius: "var(--radius-lg)",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius-lg)",
                        background: "var(--success-500)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <Sun size={18} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "500",
                          fontSize: "var(--text-sm)",
                        }}
                      >
                        Hari Kerja Biasa
                      </div>
                      <div
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--text-muted)",
                        }}
                      >
                        Tarif Normal, terhitung = 8 jam
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsHoliday(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      padding: "var(--space-3)",
                      background: isHoliday
                        ? "rgba(245, 158, 11, 0.15)"
                        : "var(--bg-tertiary)",
                      border: isHoliday
                        ? "1px solid var(--warning-500)"
                        : "1px solid var(--border-color)",
                      borderRadius: "var(--radius-lg)",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius-lg)",
                        background: "var(--warning-500)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <Moon size={18} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "500",
                          fontSize: "var(--text-sm)",
                        }}
                      >
                        Hari Libur / Minggu
                      </div>
                      <div
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--text-muted)",
                        }}
                      >
                        Tarif 2x Lipat, Jam Pengali Khusus
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Identitas Pekerja */}
          <div className="card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                marginBottom: "var(--space-4)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-full)",
                  background: "var(--primary-500)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "var(--text-sm)",
                  fontWeight: "600",
                }}
              >
                2
              </div>
              <h3 style={{ fontWeight: "600", flex: 1 }}>Identitas Pekerja</h3>
              <div style={{ position: "relative", minWidth: "180px" }}>
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Cari nama..."
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                  style={{ paddingLeft: "32px", fontSize: "var(--text-sm)" }}
                />
              </div>
            </div>

            {/* Selected Workers */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-3)",
                marginBottom: "var(--space-4)",
              }}
            >
              {selectedWorkers.map((worker) => (
                <div
                  key={worker.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-2) var(--space-3)",
                    background: "var(--bg-tertiary)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--primary-500)",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius-full)",
                      background: getAvatarColor(worker.name),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "600",
                    }}
                  >
                    {worker.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)}
                  </div>
                  <div>
                    <div
                      style={{ fontSize: "var(--text-sm)", fontWeight: "500" }}
                    >
                      {worker.name}
                    </div>
                    <div
                      style={{ fontSize: "10px", color: "var(--primary-400)" }}
                    >
                      {worker.skill} • ID: WK-
                      {String(worker.id).padStart(3, "0")}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleWorker(worker)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--danger-400)",
                      padding: "2px",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Worker List */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-2)",
              }}
            >
              {filteredWorkers
                .filter((w) => !selectedWorkers.find((sw) => sw.id === w.id))
                .slice(0, 6)
                .map((worker) => (
                  <button
                    key={worker.id}
                    onClick={() => toggleWorker(worker)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      padding: "var(--space-2)",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-lg)",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "var(--radius-full)",
                        background: getAvatarColor(worker.name),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "9px",
                        fontWeight: "600",
                      }}
                    >
                      {worker.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    <span style={{ fontSize: "var(--text-xs)" }}>
                      {worker.name}
                    </span>
                  </button>
                ))}
            </div>

            <button
              style={{
                marginTop: "var(--space-3)",
                background: "none",
                border: "none",
                color: "var(--primary-400)",
                fontSize: "var(--text-sm)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-1)",
              }}
            >
              <Plus size={14} />
              Muat lebih banyak pekerja
            </button>
          </div>

          {/* Section 3: Logika Waktu & Lokasi */}
          <div className="card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                marginBottom: "var(--space-4)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-full)",
                  background: "var(--primary-500)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "var(--text-sm)",
                  fontWeight: "600",
                }}
              >
                3
              </div>
              <h3 style={{ fontWeight: "600", flex: 1 }}>
                Logika Waktu & Lokasi
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={addSession}>
                <Plus size={14} />
                Tambah Sesi
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
              }}
            >
              {sessions.map((session, index) => {
                const hours = getSessionHours(session.timeIn, session.timeOut);
                const sessionLabel =
                  index === 0
                    ? "SESI PAGI"
                    : index === 1
                    ? "SESI SIANG"
                    : `SESI ${index + 1}`;
                const sessionColor =
                  index === 0 ? "var(--success-500)" : "var(--warning-500)";

                return (
                  <div
                    key={session.id}
                    style={{
                      padding: "var(--space-4)",
                      background: "var(--bg-tertiary)",
                      borderRadius: "var(--radius-xl)",
                      borderLeft: `3px solid ${sessionColor}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "var(--space-3)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: "600",
                          color: sessionColor,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {sessionLabel}
                      </span>
                      <button
                        onClick={() => removeSession(session.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--danger-400)",
                          padding: "4px",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div
                      className="grid gap-4"
                      style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}
                    >
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label
                          className="form-label"
                          style={{ fontSize: "var(--text-xs)" }}
                        >
                          Proyek
                        </label>
                        <select
                          className="form-select"
                          value={session.project}
                          onChange={(e) =>
                            updateSession(session.id, "project", e.target.value)
                          }
                          style={{ fontSize: "var(--text-sm)" }}
                        >
                          {projects.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label
                          className="form-label"
                          style={{ fontSize: "var(--text-xs)" }}
                        >
                          MASUK
                        </label>
                        <input
                          type="time"
                          className="form-input"
                          value={session.timeIn}
                          onChange={(e) =>
                            updateSession(session.id, "timeIn", e.target.value)
                          }
                          style={{ fontSize: "var(--text-sm)" }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label
                          className="form-label"
                          style={{ fontSize: "var(--text-xs)" }}
                        >
                          KELUAR
                        </label>
                        <input
                          type="time"
                          className="form-input"
                          value={session.timeOut}
                          onChange={(e) =>
                            updateSession(session.id, "timeOut", e.target.value)
                          }
                          style={{ fontSize: "var(--text-sm)" }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          paddingBottom: "var(--space-2)",
                        }}
                      >
                        <span
                          style={{
                            padding: "var(--space-2) var(--space-3)",
                            background: sessionColor,
                            borderRadius: "var(--radius-full)",
                            color: "white",
                            fontSize: "var(--text-sm)",
                            fontWeight: "600",
                          }}
                        >
                          {hours} Jam
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Kalkulasi Otomatis */}
        <div>
          <div
            className="card"
            style={{
              position: "sticky",
              top: "var(--space-4)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--space-4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                }}
              >
                <Zap size={18} style={{ color: "var(--warning-400)" }} />
                <h3 style={{ fontWeight: "600" }}>Kalkulasi Otomatis</h3>
              </div>
              <span
                style={{
                  padding: "4px 10px",
                  background: "var(--primary-500)",
                  borderRadius: "var(--radius-full)",
                  color: "white",
                  fontSize: "var(--text-xs)",
                  fontWeight: "500",
                }}
              >
                Live Preview
              </span>
            </div>

            {/* Total Durasi */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "var(--space-3)",
                background: "var(--bg-tertiary)",
                borderRadius: "var(--radius-lg)",
                marginBottom: "var(--space-4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                }}
              >
                <Clock size={16} style={{ color: "var(--text-muted)" }} />
                <span>Total Durasi Kerja</span>
              </div>
              <span style={{ fontWeight: "700", fontSize: "var(--text-lg)" }}>
                {calculations.totalHours} Jam
              </span>
            </div>

            {/* Breakdown */}
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: "1fr 1fr",
                marginBottom: "var(--space-4)",
              }}
            >
              <div
                style={{
                  padding: "var(--space-3)",
                  background: "rgba(34, 197, 94, 0.1)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--success-400)",
                    marginBottom: "4px",
                  }}
                >
                  JAM NORMAL
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "var(--text-xl)",
                    color: "var(--success-400)",
                  }}
                >
                  {calculations.normalHours} Jam
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  Rate x 1.0
                </div>
              </div>
              <div
                style={{
                  padding: "var(--space-3)",
                  background: "rgba(245, 158, 11, 0.1)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--warning-400)",
                    marginBottom: "4px",
                  }}
                >
                  + LEMBUR
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "var(--text-xl)",
                    color: "var(--warning-400)",
                  }}
                >
                  {calculations.overtimeHours} Jam
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  Rate x 1.5
                </div>
              </div>
            </div>

            {/* Estimasi Upah */}
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-4)",
                background:
                  "linear-gradient(135deg, var(--gray-800), var(--gray-900))",
                borderRadius: "var(--radius-xl)",
                marginBottom: "var(--space-4)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                  marginBottom: "4px",
                }}
              >
                Estimasi Upah Harian
              </div>
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "var(--text-2xl)",
                  color: "white",
                }}
              >
                {formatCurrency(calculations.totalWage)}
              </div>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                }}
              >
                Based on Rate: {formatCurrency(calculations.normalRate * 8)}
              </div>
            </div>

            {/* Project Breakdown */}
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "var(--space-2)",
              }}
            >
              ALOKASI BIAYA PROYEK
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-2)",
                marginBottom: "var(--space-4)",
              }}
            >
              {Object.entries(calculations.projectBreakdown).map(
                ([project, data]) => (
                  <span
                    key={project}
                    style={{
                      padding: "var(--space-2) var(--space-3)",
                      background: "var(--bg-tertiary)",
                      borderRadius: "var(--radius-full)",
                      fontSize: "var(--text-xs)",
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                    }}
                  >
                    <MapPin size={12} style={{ color: "var(--primary-400)" }} />
                    {project}
                    <span
                      style={{ color: "var(--success-400)", fontWeight: "500" }}
                    >
                      {formatCurrency(data.wage)}
                    </span>
                  </span>
                )
              )}
            </div>

            {/* Confirmation */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-3)",
                padding: "var(--space-3)",
                background: "var(--bg-tertiary)",
                borderRadius: "var(--radius-lg)",
                cursor: "pointer",
                marginBottom: "var(--space-4)",
              }}
            >
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                style={{ marginTop: "2px" }}
              />
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-muted)",
                }}
              >
                Pastikan anda sudah selesai melakukan entry proyek
              </span>
            </label>

            {/* Submit Button */}
            <button
              className="btn btn-primary btn-full"
              onClick={handleSave}
              disabled={!confirmed || selectedWorkers.length === 0}
              style={{
                padding: "var(--space-4)",
                fontSize: "var(--text-base)",
                fontWeight: "600",
              }}
            >
              <Check size={18} />
              Konfirmasi & Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

