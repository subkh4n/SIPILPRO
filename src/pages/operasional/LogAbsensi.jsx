import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useData } from "../../context";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/helpers";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import {
  Search,
  Filter,
  Users,
  Clock,
  Wallet,
  Download,
  Plus,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  TrendingUp,
  MapPin,
  X,
  Save,
  AlertTriangle,
} from "lucide-react";

export default function LogAbsensi() {
  const {
    workers,
    projects,
    attendance,
    updateAttendance,
    deleteAttendance,
    refreshData,
  } = useData();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState(format(new Date(), "yyyy-MM"));
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 4;

  // Build attendance log data
  const attendanceLog = useMemo(() => {
    return attendance.map((att, index) => {
      const worker = workers.find((w) => w.id === att.workerId) || {
        name: "Unknown",
        skill: "Tukang",
      };
      const project = projects.find((p) => p.id === att.projectId) || {
        name: "Cluster A",
      };

      // Generate random activities for demo
      const activities = [
        { project: project.name, timeStart: "08:00", timeEnd: "12:00" },
      ];
      if (att.totalHours > 4) {
        activities.push({
          project: projects[(index + 1) % projects.length]?.name || "Ruko B",
          timeStart: "13:00",
          timeEnd: "18:00",
        });
      }

      const regularHours = Math.min(att.totalHours || 8, 8);
      const overtimeHours = Math.max((att.totalHours || 8) - 8, 0);
      const isDoubleRate = att.isHoliday;

      const regularWage = regularHours * (worker.rateNormal || 25000);
      const overtimeWage = overtimeHours * (worker.rateOvertime || 35000);
      const totalWage = isDoubleRate
        ? (regularWage + overtimeWage) * 2
        : regularWage + overtimeWage;

      return {
        id: att.id || index,
        date: att.date,
        worker: {
          ...worker,
          workerId: `WK-${String(worker.id || index).padStart(3, "0")}`,
        },
        activities,
        regularHours,
        overtimeHours,
        totalHours: att.totalHours || 8,
        isDoubleRate,
        totalWage,
        rateInfo: isDoubleRate
          ? `Rate: ${formatCurrency((worker.rateNormal || 25000) * 2)} x 2`
          : `Rate: ${formatCurrency(worker.rateNormal || 25000)}`,
        status: index % 4 === 0 ? "pending" : "verified",
      };
    });
  }, [attendance, workers, projects]);

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = [...attendanceLog];

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.worker.workerId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Month filter - handle various date formats
    if (filterMonth && filtered.length > 0) {
      filtered = filtered.filter((a) => {
        if (!a.date) return true; // Show if no date
        // Try to match yyyy-MM format or check if month/year is present
        const dateStr = String(a.date);
        return dateStr.startsWith(filterMonth) || dateStr.includes(filterMonth);
      });
    }

    // Project filter
    if (filterProject !== "all") {
      filtered = filtered.filter((a) =>
        a.activities.some((act) => act.project === filterProject)
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    return filtered;
  }, [attendanceLog, searchQuery, filterMonth, filterProject, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalActiveWorkers = new Set(attendanceLog.map((a) => a.worker.id))
    .size;
  const totalHours = attendanceLog.reduce((sum, a) => sum + a.totalHours, 0);
  const totalPendingWage = attendanceLog
    .filter((a) => a.status === "pending")
    .reduce((sum, a) => sum + a.totalWage, 0);

  // Handle View
  const handleView = (record) => {
    setViewModal(record);
  };

  // Handle Edit
  const handleEdit = (record) => {
    setEditFormData({
      date: record.date,
      totalHours: record.totalHours,
      status: record.status,
    });
    setEditModal(record);
  };

  const handleEditSubmit = async () => {
    setIsLoading(true);
    try {
      await updateAttendance(editModal.id, editFormData);
      setEditModal(null);
      refreshData();
    } catch (err) {
      toast.error("Gagal update absensi: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      await deleteAttendance(deleteConfirm.id);
      setDeleteConfirm(null);
      refreshData();
    } catch (err) {
      toast.error("Gagal hapus absensi: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get avatar color
  const getAvatarColor = (name) => {
    const colors = [
      "linear-gradient(135deg, #667eea, #764ba2)",
      "linear-gradient(135deg, #f093fb, #f5576c)",
      "linear-gradient(135deg, #4facfe, #00f2fe)",
      "linear-gradient(135deg, #43e97b, #38f9d7)",
      "linear-gradient(135deg, #fa709a, #fee140)",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  // Get month name
  const getMonthName = () => {
    if (filterMonth) {
      const date = parseISO(filterMonth + "-01");
      return format(date, "MMMM", { locale: id });
    }
    return "Bulan Ini";
  };

  return (
    <div className="animate-in">
      {/* Breadcrumb */}
      <div
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)",
          marginBottom: "var(--space-2)",
        }}
      >
        <span style={{ color: "var(--primary-400)" }}>Absensi</span>
        <span style={{ margin: "0 8px" }}>/</span>
        <span>Riwayat</span>
      </div>

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
          <h1 className="page-title">Daftar Transaksi Absensi</h1>
          <p className="page-subtitle">
            Kelola data kehadiran pekerja, validasi jam lembur, dan pantau
            pengeluaran upah harian per proyek.
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button className="btn btn-secondary">
            <Download size={18} />
            Export Excel
          </button>
          <Link to="/operasional/input-absensi" className="btn btn-primary">
            <Plus size={18} />
            Input Absensi Baru
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className="grid gap-4 mb-6"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--primary-500)" }}
        >
          <div className="stat-icon primary">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Pekerja Aktif</div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "var(--space-2)",
              }}
            >
              <div className="stat-value">{totalActiveWorkers}</div>
              <span className="stat-change positive">
                <TrendingUp size={12} />
                +2 hari ini
              </span>
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--success-500)" }}
        >
          <div className="stat-icon success">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Jam Kerja ({getMonthName()})</div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "var(--space-2)",
              }}
            >
              <div className="stat-value">{totalHours.toLocaleString()}</div>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-muted)",
                }}
              >
                Jam
              </span>
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--warning-500)" }}
        >
          <div className="stat-icon warning">
            <Wallet size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Estimasi Upah (Pending)</div>
            <div className="stat-value" style={{ fontSize: "var(--text-xl)" }}>
              {formatCurrency(totalPendingWage)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="card mb-6"
        style={{ marginBottom: "var(--space-6)", padding: "var(--space-4)" }}
      >
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Cari nama pekerja atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "40px" }}
            />
          </div>

          {/* Month Filter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <Calendar size={16} style={{ color: "var(--text-muted)" }} />
            <input
              type="month"
              className="form-input"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{ minWidth: "160px" }}
            />
          </div>

          {/* Project Filter */}
          <select
            className="form-select"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            style={{ minWidth: "150px" }}
          >
            <option value="all">Semua Proyek</option>
            {projects.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ minWidth: "130px" }}
          >
            <option value="all">Semua Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>

          {/* Filter Button */}
          <button
            className="btn btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container" style={{ border: "none" }}>
          <table className="table">
            <thead>
              <tr>
                <th>TANGGAL</th>
                <th>PEKERJA</th>
                <th>PROYEK & AKTIVITAS</th>
                <th style={{ textAlign: "center" }}>JAM KERJA</th>
                <th style={{ textAlign: "right" }}>TOTAL UPAH</th>
                <th style={{ textAlign: "center" }}>STATUS</th>
                <th style={{ textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((log) => {
                let dateObj;
                try {
                  dateObj = parseISO(log.date);
                } catch {
                  dateObj = new Date();
                }
                const dayName = format(dateObj, "EEEE", { locale: id });
                const dateStr = format(dateObj, "dd MMM yyyy", { locale: id });

                return (
                  <tr key={log.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: "500" }}>{dateStr}</div>
                        <div
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {dayName}
                        </div>
                      </div>
                    </td>
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
                            width: 40,
                            height: 40,
                            borderRadius: "var(--radius-full)",
                            background: getAvatarColor(log.worker.name),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "var(--text-sm)",
                            fontWeight: "600",
                          }}
                        >
                          {log.worker.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: "500" }}>
                            {log.worker.name}
                          </div>
                          <div
                            style={{
                              fontSize: "var(--text-xs)",
                              color: "var(--primary-400)",
                            }}
                          >
                            {log.worker.skill} • {log.worker.workerId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        {log.activities.map((act, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--space-2)",
                              fontSize: "var(--text-sm)",
                            }}
                          >
                            <MapPin
                              size={12}
                              style={{
                                color:
                                  i === 0
                                    ? "var(--success-400)"
                                    : "var(--warning-400)",
                              }}
                            />
                            <span style={{ fontWeight: "500" }}>
                              {act.project}
                            </span>
                            <span
                              style={{
                                color: "var(--text-muted)",
                                fontSize: "var(--text-xs)",
                              }}
                            >
                              ({act.timeStart} - {act.timeEnd})
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "var(--text-lg)",
                          }}
                        >
                          {log.totalHours} Jam
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            justifyContent: "center",
                            marginTop: "4px",
                          }}
                        >
                          <span
                            style={{
                              padding: "2px 8px",
                              background: "var(--bg-tertiary)",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "var(--text-xs)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {log.regularHours} Reg
                          </span>
                          {log.overtimeHours > 0 && (
                            <span
                              style={{
                                padding: "2px 8px",
                                background: "rgba(245, 158, 11, 0.2)",
                                borderRadius: "var(--radius-sm)",
                                fontSize: "var(--text-xs)",
                                color: "var(--warning-400)",
                              }}
                            >
                              {log.overtimeHours} Lembur
                            </span>
                          )}
                          {log.isDoubleRate && (
                            <span
                              style={{
                                padding: "2px 8px",
                                background: "rgba(239, 68, 68, 0.2)",
                                borderRadius: "var(--radius-sm)",
                                fontSize: "var(--text-xs)",
                                color: "var(--danger-400)",
                                fontWeight: "600",
                              }}
                            >
                              DOUBLE RATE
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div>
                        <div
                          className="font-mono"
                          style={{
                            fontWeight: "600",
                            color: "var(--success-400)",
                          }}
                        >
                          {formatCurrency(log.totalWage)}
                        </div>
                        <div
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {log.rateInfo}
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {log.status === "verified" ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 12px",
                            background: "rgba(34, 197, 94, 0.15)",
                            border: "1px solid rgba(34, 197, 94, 0.3)",
                            borderRadius: "var(--radius-full)",
                            color: "var(--success-400)",
                            fontSize: "var(--text-xs)",
                            fontWeight: "500",
                          }}
                        >
                          <CheckCircle size={12} />
                          Verified
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 12px",
                            background: "rgba(245, 158, 11, 0.15)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            borderRadius: "var(--radius-full)",
                            color: "var(--warning-400)",
                            fontSize: "var(--text-xs)",
                            fontWeight: "500",
                          }}
                        >
                          <AlertCircle size={12} />
                          Pending
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "var(--space-1)",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Lihat"
                          style={{ color: "var(--primary-400)" }}
                          onClick={() => handleView(log)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Edit"
                          style={{ color: "var(--warning-400)" }}
                          onClick={() => handleEdit(log)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Hapus"
                          style={{ color: "var(--danger-400)" }}
                          onClick={() => setDeleteConfirm(log)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--space-4)",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}
          >
            Menampilkan{" "}
            <strong>
              {(currentPage - 1) * itemsPerPage + 1} sampai{" "}
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </strong>{" "}
            dari <strong>{filteredData.length}</strong> transaksi
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from(
              { length: Math.min(totalPages, 3) },
              (_, i) => i + 1
            ).map((page) => (
              <button
                key={page}
                className={`btn btn-sm ${
                  currentPage === page ? "btn-primary" : "btn-ghost"
                }`}
                onClick={() => setCurrentPage(page)}
                style={{ minWidth: "36px" }}
              >
                {page}
              </button>
            ))}

            {totalPages > 3 && (
              <>
                <span style={{ color: "var(--text-muted)" }}>...</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setCurrentPage(totalPages)}
                  style={{ minWidth: "36px" }}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div
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
            <p>Tidak ada data absensi ditemukan</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-6)",
              width: "100%",
              maxWidth: "500px",
              border: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-4)",
              }}
            >
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "600" }}>
                Detail Absensi
              </h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setViewModal(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Nama Pekerja
                </div>
                <div style={{ fontWeight: "500" }}>
                  {viewModal.worker?.name}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Tanggal
                </div>
                <div style={{ fontWeight: "500" }}>{viewModal.date}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Total Jam
                </div>
                <div style={{ fontWeight: "500" }}>
                  {viewModal.totalHours} jam
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Total Upah
                </div>
                <div
                  className="font-mono"
                  style={{ fontWeight: "500", color: "var(--success-400)" }}
                >
                  {formatCurrency(viewModal.totalWage)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Status
                </div>
                <span
                  className={`badge ${
                    viewModal.status === "verified"
                      ? "badge-success"
                      : "badge-warning"
                  }`}
                >
                  {viewModal.status}
                </span>
              </div>
            </div>
            <div
              style={{
                marginTop: "var(--space-6)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setViewModal(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-6)",
              width: "100%",
              maxWidth: "500px",
              border: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-4)",
              }}
            >
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "600" }}>
                Edit Absensi
              </h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setEditModal(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
              }}
            >
              <div className="form-group">
                <label className="form-label">Tanggal</label>
                <input
                  type="date"
                  className="form-input"
                  value={editFormData.date || ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Total Jam</label>
                <input
                  type="number"
                  className="form-input"
                  value={editFormData.totalHours || ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      totalHours: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={editFormData.status || "pending"}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                </select>
              </div>
            </div>
            <div
              style={{
                marginTop: "var(--space-6)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "var(--space-3)",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setEditModal(null)}
              >
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={handleEditSubmit}
                disabled={isLoading}
              >
                <Save size={16} />
                {isLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-6)",
              width: "100%",
              maxWidth: "400px",
              border: "1px solid var(--border-color)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-4)",
              }}
            >
              <AlertTriangle size={30} style={{ color: "var(--danger-400)" }} />
            </div>
            <h3
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "600",
                marginBottom: "var(--space-2)",
              }}
            >
              Hapus Absensi?
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: "var(--space-6)",
              }}
            >
              Anda yakin ingin menghapus data absensi{" "}
              <strong>{deleteConfirm.worker?.name}</strong>? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                justifyContent: "center",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Batal
              </button>
              <button
                className="btn"
                style={{ background: "var(--danger-500)", color: "white" }}
                onClick={handleDeleteConfirm}
                disabled={isLoading}
              >
                <Trash2 size={16} />
                {isLoading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

