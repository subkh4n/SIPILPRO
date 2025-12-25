import { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { formatCurrency } from "../../utils/helpers";
import {
  format,
  startOfMonth,
  endOfMonth,
  parseISO,
  eachDayOfInterval,
  isWeekend,
} from "date-fns";
import { id } from "date-fns/locale";
import {
  FileText,
  Download,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Filter,
} from "lucide-react";

export default function RekapAbsensi() {
  const { workers, attendance, projects } = useData();
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [selectedProject, setSelectedProject] = useState("all");

  // Parse selected month
  const monthDate = new Date(selectedMonth + "-01");
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  // Get all days in month
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const totalWorkDays = daysInMonth.filter((d) => !isWeekend(d)).length;

  // Calculate attendance stats per worker
  const attendanceData = useMemo(() => {
    return workers.map((worker) => {
      // Filter attendance for this worker in selected month
      let workerAttendance = attendance.filter((a) => {
        const attDate = parseISO(a.date);
        const inMonth = attDate >= monthStart && attDate <= monthEnd;
        if (!inMonth || a.workerId !== worker.id) return false;

        // Filter by project if selected
        if (selectedProject !== "all") {
          return a.sessions?.some((s) => s.projectId === selectedProject);
        }
        return true;
      });

      // Calculate stats
      const presentDays = workerAttendance.length;
      const absentDays = totalWorkDays - presentDays;
      const totalHours = workerAttendance.reduce(
        (sum, a) => sum + (a.totalHours || 0),
        0
      );
      const overtimeHours = workerAttendance.reduce(
        (sum, a) => sum + (a.overtime || 0),
        0
      );
      const attendanceRate =
        totalWorkDays > 0 ? Math.round((presentDays / totalWorkDays) * 100) : 0;

      // Get attendance by date
      const attendanceByDate = {};
      workerAttendance.forEach((a) => {
        attendanceByDate[a.date] = a;
      });

      return {
        ...worker,
        presentDays,
        absentDays,
        totalHours,
        overtimeHours,
        attendanceRate,
        attendanceByDate,
      };
    });
  }, [
    workers,
    attendance,
    monthStart,
    monthEnd,
    selectedProject,
    totalWorkDays,
  ]);

  // Summary totals
  const totalPresent = attendanceData.reduce(
    (sum, w) => sum + w.presentDays,
    0
  );
  const avgAttendance =
    attendanceData.length > 0
      ? Math.round(
          attendanceData.reduce((sum, w) => sum + w.attendanceRate, 0) /
            attendanceData.length
        )
      : 0;
  const totalHours = attendanceData.reduce((sum, w) => sum + w.totalHours, 0);

  // Get project name
  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || "Unknown";
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
          <h1 className="page-title">Rekap Absensi</h1>
          <p className="page-subtitle">Rekap kehadiran bulanan per pegawai</p>
        </div>
        <button className="btn btn-secondary">
          <Download size={18} />
          Export Excel
        </button>
      </div>

      {/* Filter */}
      <div
        className="card mb-6"
        style={{ marginBottom: "var(--space-6)", padding: "var(--space-4)" }}
      >
        <div
          style={{
            display: "flex",
            gap: "var(--space-4)",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div
            className="form-group"
            style={{ minWidth: "180px", marginBottom: 0 }}
          >
            <label className="form-label">Periode</label>
            <input
              type="month"
              className="form-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>

          <div
            className="form-group"
            style={{ minWidth: "200px", marginBottom: 0 }}
          >
            <label className="form-label">Proyek</label>
            <select
              className="form-select"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="all">Semua Proyek</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="badge badge-primary">
            <Filter size={14} />
            {attendanceData.length} Pegawai
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div
        className="grid gap-4 mb-6"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          marginBottom: "var(--space-6)",
        }}
      >
        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--primary-500)" }}
        >
          <div className="stat-icon primary">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Hari Kerja</div>
            <div className="stat-value">{totalWorkDays}</div>
            <div className="text-xs text-muted">di bulan ini</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--success-500)" }}
        >
          <div className="stat-icon success">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Kehadiran</div>
            <div className="stat-value">{totalPresent}</div>
            <div className="text-xs text-muted">hari x pegawai</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--accent-500)" }}
        >
          <div className="stat-icon accent">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Rata-rata Kehadiran</div>
            <div className="stat-value">{avgAttendance}%</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--warning-500)" }}
        >
          <div className="stat-icon warning">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Jam Kerja</div>
            <div className="stat-value">{totalHours}</div>
            <div className="text-xs text-muted">jam</div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Rekap {format(monthDate, "MMMM yyyy", { locale: id })}
          </h3>
        </div>

        <div className="table-container" style={{ border: "none" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Pegawai</th>
                <th style={{ textAlign: "center" }}>Hadir</th>
                <th style={{ textAlign: "center" }}>Tidak Hadir</th>
                <th style={{ textAlign: "right" }}>Total Jam</th>
                <th style={{ textAlign: "right" }}>Lembur</th>
                <th style={{ textAlign: "center" }}>Tingkat Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((worker) => (
                <tr key={worker.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "var(--radius-full)",
                          background:
                            worker.skill === "Ahli"
                              ? "linear-gradient(135deg, var(--primary-500), var(--primary-700))"
                              : "var(--gray-600)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "var(--text-sm)",
                          fontWeight: "600",
                        }}
                      >
                        {worker.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: "500" }}>{worker.name}</div>
                        <div
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {worker.skill}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} />
                      {worker.presentDays} hari
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {worker.absentDays > 0 ? (
                      <span className="badge badge-danger">
                        <XCircle size={12} />
                        {worker.absentDays} hari
                      </span>
                    ) : (
                      <span className="badge badge-gray">-</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }} className="font-mono">
                    {worker.totalHours} jam
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      color:
                        worker.overtimeHours > 0
                          ? "var(--warning-400)"
                          : "inherit",
                    }}
                    className="font-mono"
                  >
                    {worker.overtimeHours > 0
                      ? `+${worker.overtimeHours} jam`
                      : "-"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "80px",
                          height: "8px",
                          background: "var(--bg-tertiary)",
                          borderRadius: "var(--radius-full)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${worker.attendanceRate}%`,
                            height: "100%",
                            background:
                              worker.attendanceRate >= 90
                                ? "var(--success-400)"
                                : worker.attendanceRate >= 70
                                ? "var(--warning-400)"
                                : "var(--danger-400)",
                            borderRadius: "var(--radius-full)",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: "600",
                          color:
                            worker.attendanceRate >= 90
                              ? "var(--success-400)"
                              : worker.attendanceRate >= 70
                              ? "var(--warning-400)"
                              : "var(--danger-400)",
                          minWidth: "36px",
                        }}
                      >
                        {worker.attendanceRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {attendanceData.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "var(--space-12)",
              color: "var(--text-muted)",
            }}
          >
            <Users
              size={48}
              style={{ marginBottom: "var(--space-3)", opacity: 0.5 }}
            />
            <p>Tidak ada data absensi untuk periode ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
