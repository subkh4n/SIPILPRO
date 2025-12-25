import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { formatCurrency } from "../../utils/helpers";
import {
  Plus,
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
  Eye,
  Edit2,
  Trash2,
  FileText,
  CreditCard,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  AlertTriangle,
} from "lucide-react";

export default function Pegawai() {
  const navigate = useNavigate();
  const { workers, deleteWorker, refreshData } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [viewModal, setViewModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 5;

  // Map workers with additional display data
  const employeeData = useMemo(() => {
    return workers.map((worker, index) => ({
      ...worker,
      nip: worker.nip || `NIP: 202300${index + 1}`,
      jabatan:
        worker.jabatan ||
        (worker.skill === "Ahli"
          ? "Mandor Lapangan"
          : worker.skill === "Terampil"
          ? "Tukang Batu"
          : "Helper"),
      tipe: worker.tipe || ["Tetap", "Kontrak", "Harian"][index % 3],
    }));
  }, [workers]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    let filtered = [...employeeData];

    if (searchQuery) {
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (e.nip && e.nip.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (e.jabatan &&
            e.jabatan.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((e) => e.tipe === filterType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((e) => e.status === filterStatus);
    }

    return filtered;
  }, [employeeData, searchQuery, filterType, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedData = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalEmployees = employeeData.length;
  const activeEmployees = employeeData.filter(
    (e) => e.status === "active" || e.status === "aktif"
  ).length;
  const inactiveEmployees = totalEmployees - activeEmployees;
  const attendanceRate =
    totalEmployees > 0
      ? Math.round((activeEmployees / totalEmployees) * 100)
      : 0;

  // Handle View
  const handleView = (employee) => {
    setViewModal(employee);
  };

  // Handle Edit - Navigate to edit page
  const handleEdit = (employee) => {
    navigate(`/master/pegawai/edit/${employee.id}`);
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      await deleteWorker(deleteConfirm.id);
      setDeleteConfirm(null);
      refreshData();
    } catch (err) {
      alert("Gagal hapus pegawai: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      "linear-gradient(135deg, #667eea, #764ba2)",
      "linear-gradient(135deg, #f093fb, #f5576c)",
      "linear-gradient(135deg, #4facfe, #00f2fe)",
      "linear-gradient(135deg, #43e97b, #38f9d7)",
      "linear-gradient(135deg, #fa709a, #fee140)",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
          <h1 className="page-title">Data Pegawai</h1>
          <p className="page-subtitle">
            Kelola data karyawan, tarif upah, dan cetak kartu identitas
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/master/pegawai/tambah")}
        >
          <Plus size={18} />
          Tambah Pegawai
        </button>
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
            <div className="stat-label">Total Pegawai</div>
            <div className="stat-value">{totalEmployees}</div>
            <div className="stat-change positive">
              <TrendingUp size={12} />
              +4 bulan ini
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--success-500)" }}
        >
          <div className="stat-icon success">
            <UserCheck size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Pegawai Aktif</div>
            <div className="stat-value">{activeEmployees}</div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                marginTop: "var(--space-1)",
              }}
            >
              {attendanceRate}% Kehadiran
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--warning-500)" }}
        >
          <div className="stat-icon warning">
            <UserX size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Cuti / Non-Aktif</div>
            <div className="stat-value">{inactiveEmployees}</div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--warning-400)",
                marginTop: "var(--space-1)",
              }}
            >
              Perlu review
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 280px" }}>
        {/* Table Section */}
        <div className="card">
          {/* Filter Bar */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-3)",
              padding: "var(--space-4)",
              borderBottom: "1px solid var(--border-color)",
              flexWrap: "wrap",
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
                placeholder="Cari nama, NIP, atau jabatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "40px" }}
              />
            </div>

            {/* Type Filter */}
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="all">Semua Tipe</option>
              <option value="Tetap">Tetap</option>
              <option value="Kontrak">Kontrak</option>
              <option value="Harian">Harian</option>
            </select>

            {/* Status Filter */}
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Non-Aktif</option>
              <option value="cuti">Cuti</option>
            </select>
          </div>

          {/* Table */}
          <div className="table-container" style={{ border: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>PEGAWAI</th>
                  <th>JABATAN</th>
                  <th style={{ textAlign: "center" }}>TIPE</th>
                  <th style={{ textAlign: "center" }}>STATUS</th>
                  <th style={{ textAlign: "center" }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-3)",
                        }}
                      >
                        {/* Avatar with foto or initials */}
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "var(--radius-full)",
                            background: employee.foto
                              ? "transparent"
                              : getAvatarColor(employee.name),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "var(--text-sm)",
                            fontWeight: "600",
                            overflow: "hidden",
                          }}
                        >
                          {employee.foto ? (
                            <img
                              src={employee.foto}
                              alt={employee.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.style.background =
                                  getAvatarColor(employee.name);
                                e.target.parentElement.innerHTML =
                                  employee.name.charAt(0).toUpperCase();
                              }}
                            />
                          ) : (
                            employee.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: "500" }}>
                            {employee.name}
                          </div>
                          <div
                            style={{
                              fontSize: "var(--text-xs)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {employee.nip}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{employee.jabatan}</td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`badge ${
                          employee.tipe === "Tetap"
                            ? "badge-primary"
                            : employee.tipe === "Kontrak"
                            ? "badge-warning"
                            : "badge-secondary"
                        }`}
                      >
                        {employee.tipe}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "var(--text-sm)",
                          color:
                            employee.status === "active" ||
                            employee.status === "aktif"
                              ? "var(--success-400)"
                              : employee.status === "cuti"
                              ? "var(--warning-400)"
                              : "var(--text-muted)",
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background:
                              employee.status === "active" ||
                              employee.status === "aktif"
                                ? "var(--success-400)"
                                : employee.status === "cuti"
                                ? "var(--warning-400)"
                                : "var(--text-muted)",
                          }}
                        />
                        {employee.status === "active" ||
                        employee.status === "aktif"
                          ? "Aktif"
                          : employee.status === "cuti"
                          ? "Cuti"
                          : "Non-Aktif"}
                      </span>
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
                          onClick={() => handleView(employee)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Edit"
                          style={{ color: "var(--warning-400)" }}
                          onClick={() => handleEdit(employee)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Hapus"
                          style={{ color: "var(--danger-400)" }}
                          onClick={() => setDeleteConfirm(employee)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                {Math.min((currentPage - 1) * itemsPerPage + 1, filteredEmployees.length)}-
                {Math.min(currentPage * itemsPerPage, filteredEmployees.length)}
              </strong>{" "}
              dari <strong>{filteredEmployees.length}</strong> data
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
                <ChevronLeft size={16} />
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
                <span style={{ color: "var(--text-muted)" }}>...</span>
              )}

              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Empty State */}
          {filteredEmployees.length === 0 && (
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
              <p>Tidak ada pegawai ditemukan</p>
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          {/* Cetak Dokumen */}
          <button
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-4)",
              cursor: "pointer",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              textAlign: "left",
              transition: "all var(--transition-fast)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-lg)",
                background: "var(--primary-500)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                Cetak Dokumen
              </div>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                }}
              >
                Laporan & Identitas
              </div>
            </div>
          </button>

          {/* Cetak ID Card */}
          <button
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-4)",
              cursor: "pointer",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              textAlign: "left",
              transition: "all var(--transition-fast)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-lg)",
                background: "var(--success-500)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <CreditCard size={22} />
            </div>
            <div>
              <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                Cetak ID Card
              </div>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                }}
              >
                PDF Format
              </div>
            </div>
          </button>

          {/* Rekap Data Pegawai */}
          <button
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-4)",
              cursor: "pointer",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              textAlign: "left",
              transition: "all var(--transition-fast)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-lg)",
                background: "var(--warning-500)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <Download size={22} />
            </div>
            <div>
              <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                Rekap Data Pegawai
              </div>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                }}
              >
                Excel / CSV
              </div>
            </div>
          </button>
        </div>
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
                Detail Pegawai
              </h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setViewModal(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Photo and Name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-4)",
                marginBottom: "var(--space-5)",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "var(--radius-lg)",
                  background: viewModal.foto
                    ? "transparent"
                    : getAvatarColor(viewModal.name),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "var(--text-2xl)",
                  fontWeight: "600",
                  overflow: "hidden",
                }}
              >
                {viewModal.foto ? (
                  <img
                    src={viewModal.foto}
                    alt={viewModal.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  viewModal.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--text-lg)",
                    fontWeight: "600",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  {viewModal.name}
                </div>
                <div style={{ color: "var(--text-muted)" }}>
                  {viewModal.jabatan}
                </div>
                <span
                  className={`badge ${
                    viewModal.tipe === "Tetap"
                      ? "badge-primary"
                      : viewModal.tipe === "Kontrak"
                      ? "badge-warning"
                      : "badge-secondary"
                  }`}
                  style={{ marginTop: "var(--space-2)" }}
                >
                  {viewModal.tipe}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-3)",
              }}
            >
              <div>
                <div className="form-label" style={{ marginBottom: "2px" }}>
                  NIP
                </div>
                <div style={{ fontWeight: "500" }}>{viewModal.nip || "-"}</div>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: "2px" }}>
                  Status
                </div>
                <span
                  style={{
                    color:
                      viewModal.status === "active" ||
                      viewModal.status === "aktif"
                        ? "var(--success-400)"
                        : "var(--warning-400)",
                  }}
                >
                  {viewModal.status === "active" ||
                  viewModal.status === "aktif"
                    ? "Aktif"
                    : viewModal.status === "cuti"
                    ? "Cuti"
                    : "Non-Aktif"}
                </span>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: "2px" }}>
                  Keahlian
                </div>
                <div style={{ fontWeight: "500" }}>
                  {viewModal.skill || "-"}
                </div>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: "2px" }}>
                  No. Telepon
                </div>
                <div style={{ fontWeight: "500" }}>
                  {viewModal.phone || "-"}
                </div>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: "2px" }}>
                  Upah Normal
                </div>
                <div className="font-mono" style={{ fontWeight: "500" }}>
                  {formatCurrency(viewModal.rateNormal || 0)}
                </div>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: "2px" }}>
                  Tanggal Masuk
                </div>
                <div style={{ fontWeight: "500" }}>
                  {formatDate(viewModal.tanggalMasuk)}
                </div>
              </div>
            </div>

            {viewModal.alamat && (
              <div style={{ marginTop: "var(--space-3)" }}>
                <div className="form-label" style={{ marginBottom: "2px" }}>
                  Alamat
                </div>
                <div style={{ fontWeight: "500" }}>{viewModal.alamat}</div>
              </div>
            )}

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
                onClick={() => setViewModal(null)}
              >
                Tutup
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setViewModal(null);
                  handleEdit(viewModal);
                }}
              >
                <Edit2 size={16} />
                Edit
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
              Hapus Pegawai?
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: "var(--space-6)",
              }}
            >
              Anda yakin ingin menghapus <strong>{deleteConfirm.name}</strong>?
              Tindakan ini tidak dapat dibatalkan.
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
