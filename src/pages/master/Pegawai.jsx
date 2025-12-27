import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/helpers";
import { QRCodeSVG } from "qrcode.react";
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
  Printer,
} from "lucide-react";

export default function Pegawai() {
  const navigate = useNavigate();
  const toast = useToast();
  const { workers, deleteWorker, refreshData } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [viewModal, setViewModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [printModal, setPrintModal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const printRef = useRef(null);

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
      toast.error("Gagal hapus pegawai: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Print ID Card
  const handlePrint = (employee) => {
    setPrintModal(employee);
  };

  // Print the ID card
  const handlePrintCard = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ID Card - ${printModal.name}</title>
        <style>
          @page {
            size: 85.6mm 53.98mm;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .card-container {
            display: flex;
            gap: 20px;
            padding: 20px;
          }
          .id-card {
            width: 85.6mm;
            height: 53.98mm;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          /* Front Card */
          .card-front {
            background: linear-gradient(135deg, #0d3b66 0%, #1a5f9e 50%, #0d3b66 100%);
            color: white;
            position: relative;
            padding: 12px;
            display: flex;
            flex-direction: column;
          }
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          .company-logo {
            font-size: 14px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .company-logo span {
            color: #4ecdc4;
          }
          .card-body {
            display: flex;
            gap: 12px;
            flex: 1;
          }
          .photo-container {
            width: 70px;
            height: 85px;
            border-radius: 6px;
            overflow: hidden;
            border: 2px solid rgba(255,255,255,0.3);
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .photo-initial {
            font-size: 28px;
            font-weight: bold;
            color: white;
          }
          .info-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
          }
          .employee-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 3px;
            color: white;
          }
          .employee-position {
            font-size: 11px;
            color: #4ecdc4;
            margin-bottom: 8px;
          }
          .employee-detail {
            font-size: 9px;
            color: rgba(255,255,255,0.8);
            margin-bottom: 2px;
          }
          .card-footer {
            font-size: 8px;
            color: rgba(255,255,255,0.6);
            text-align: center;
            margin-top: auto;
          }
          /* Back Card */
          .card-back {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            color: #333;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 15px;
          }
          .qr-container {
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .qr-label {
            font-size: 10px;
            color: #666;
            margin-top: 8px;
            text-align: center;
          }
          .scan-instruction {
            font-size: 12px;
            font-weight: 600;
            color: #0d3b66;
            margin-bottom: 10px;
          }
          .card-back-footer {
            font-size: 8px;
            color: #999;
            margin-top: 10px;
          }
          @media print {
            .card-container {
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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

  // Convert Drive URL to displayable format
  // Using drive.google.com/thumbnail format which is more stable and less rate-limited
  const getFotoUrl = (url, size = 200) => {
    if (!url) return null;

    // If it's already a base64 data URL, return as-is
    if (url.startsWith("data:")) return url;

    // Extract file ID from various formats
    let fileId = null;

    // Match: lh3.googleusercontent.com/d/FILE_ID
    const lh3Match = url.match(
      /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/
    );
    if (lh3Match) fileId = lh3Match[1];

    // Match: drive.google.com/uc?id=FILE_ID or ?id=FILE_ID
    if (!fileId) {
      const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (ucMatch) fileId = ucMatch[1];
    }

    // Match: drive.google.com/file/d/FILE_ID/view
    if (!fileId) {
      const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileMatch) fileId = fileMatch[1];
    }

    // Match: /d/FILE_ID format
    if (!fileId) {
      const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (dMatch) fileId = dMatch[1];
    }

    // If we found a file ID, use the thumbnail format
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
    }

    return url;
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
          {/* Filter Bar - Single Row */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              padding: "var(--space-4)",
              borderBottom: "1px solid var(--border-color)",
              alignItems: "center",
            }}
          >
            {/* Search */}
            <div style={{ flex: 1, position: "relative" }}>
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
              style={{ width: "140px", flexShrink: 0 }}
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
              style={{ width: "140px", flexShrink: 0 }}
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
                {paginatedData.map((employee) => {
                  return (
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
                              flexShrink: 0,
                            }}
                          >
                            {employee.foto ? (
                              <img
                                src={getFotoUrl(employee.foto)}
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
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: "500",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
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
                            title="Print Kartu ID"
                            style={{ color: "var(--success-400)" }}
                            onClick={() => handlePrint(employee)}
                          >
                            <Printer size={16} />
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
                {Math.min(
                  (currentPage - 1) * itemsPerPage + 1,
                  filteredEmployees.length
                )}
                -
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
                    src={getFotoUrl(viewModal.foto, 160)}
                    alt={viewModal.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.style.background = getAvatarColor(
                        viewModal.name
                      );
                      e.target.parentElement.innerHTML = viewModal.name
                        .charAt(0)
                        .toUpperCase();
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
                  {viewModal.status === "active" || viewModal.status === "aktif"
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

      {/* Print ID Card Modal */}
      {printModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
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
              maxWidth: "750px",
              border: "1px solid var(--border-color)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-5)",
              }}
            >
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "600" }}>
                Preview Kartu ID - {printModal.name}
              </h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPrintModal(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* ID Card Preview */}
            <div ref={printRef}>
              <div
                className="card-container"
                style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {/* Front Card */}
                <div
                  className="id-card card-front"
                  style={{
                    width: "323px",
                    height: "204px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #0d3b66 0%, #1a5f9e 50%, #0d3b66 100%)",
                    color: "white",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Decorative circles */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-30px",
                      right: "-30px",
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-40px",
                      left: "-40px",
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  />

                  {/* Header */}
                  <div
                    className="card-header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      className="company-logo"
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span style={{ color: "#4ecdc4" }}>SUN</span>SALSIPIL
                    </div>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontWeight: "600",
                      }}
                    >
                      KARTU PEGAWAI
                    </div>
                  </div>

                  {/* Body */}
                  <div
                    className="card-body"
                    style={{
                      display: "flex",
                      gap: "14px",
                      flex: 1,
                    }}
                  >
                    {/* Photo */}
                    <div
                      className="photo-container"
                      style={{
                        width: "80px",
                        height: "100px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "3px solid rgba(255,255,255,0.3)",
                        background: printModal.foto
                          ? "transparent"
                          : "linear-gradient(135deg, #667eea, #764ba2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {printModal.foto ? (
                        <img
                          src={getFotoUrl(printModal.foto, 200)}
                          alt={printModal.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span
                          className="photo-initial"
                          style={{
                            fontSize: "32px",
                            fontWeight: "bold",
                            color: "white",
                          }}
                        >
                          {printModal.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div
                      className="info-container"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        flex: 1,
                      }}
                    >
                      <div
                        className="employee-name"
                        style={{
                          fontSize: "16px",
                          fontWeight: "bold",
                          marginBottom: "4px",
                          color: "white",
                        }}
                      >
                        {printModal.name}
                      </div>
                      <div
                        className="employee-position"
                        style={{
                          fontSize: "12px",
                          color: "#4ecdc4",
                          marginBottom: "10px",
                          fontWeight: "500",
                        }}
                      >
                        {printModal.jabatan || "Staff"}
                      </div>
                      <div
                        className="employee-detail"
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.8)",
                          marginBottom: "3px",
                        }}
                      >
                        NIP: {printModal.nip || "-"}
                      </div>
                      <div
                        className="employee-detail"
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.8)",
                          marginBottom: "3px",
                        }}
                      >
                        Tipe: {printModal.tipe || "Harian"}
                      </div>
                      <div
                        className="employee-detail"
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.8)",
                        }}
                      >
                        Skill: {printModal.skill || "-"}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    className="card-footer"
                    style={{
                      fontSize: "8px",
                      color: "rgba(255,255,255,0.5)",
                      textAlign: "center",
                      marginTop: "auto",
                      paddingTop: "8px",
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    PT. SUNS ALSIPIL INDONESIA • Kartu ini adalah milik
                    perusahaan
                  </div>
                </div>

                {/* Back Card - QR Code */}
                <div
                  className="id-card card-back"
                  style={{
                    width: "323px",
                    height: "204px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    color: "#333",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "16px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    position: "relative",
                  }}
                >
                  {/* Company branding on back */}
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "#0d3b66",
                    }}
                  >
                    <span style={{ color: "#1a5f9e" }}>SUN</span>SALSIPIL
                  </div>

                  <div
                    className="scan-instruction"
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#0d3b66",
                      marginBottom: "12px",
                    }}
                  >
                    📱 Scan untuk Absensi
                  </div>
                  <div
                    className="qr-container"
                    style={{
                      background: "white",
                      padding: "12px",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    <QRCodeSVG
                      value={JSON.stringify({
                        type: "ATTENDANCE",
                        employeeId: printModal.id,
                        nip: printModal.nip,
                        name: printModal.name,
                      })}
                      size={100}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div
                    className="qr-label"
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      marginTop: "10px",
                      textAlign: "center",
                    }}
                  >
                    ID: {printModal.id}
                  </div>
                  <div
                    className="card-back-footer"
                    style={{
                      fontSize: "8px",
                      color: "#999",
                      marginTop: "8px",
                      textAlign: "center",
                    }}
                  >
                    Jika menemukan kartu ini, harap kembalikan ke PT. Suns
                    Alsipil
                  </div>
                </div>
              </div>
            </div>

            {/* Print Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "var(--space-3)",
                marginTop: "var(--space-5)",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setPrintModal(null)}
              >
                Tutup
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePrintCard}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Printer size={18} />
                Cetak Kartu ID
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

