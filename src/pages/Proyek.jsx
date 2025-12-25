import { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { formatCurrency } from "../utils/helpers";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Building2,
  TrendingUp,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  Home,
  Warehouse,
  Building,
  Landmark,
  X,
  Save,
  AlertTriangle,
} from "lucide-react";

export default function Proyek() {
  const {
    projects,
    purchases,
    getProjectCosts,
    addProject,
    updateProject,
    deleteProject,
    refreshData,
  } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    targetRAP: "",
  });

  // Modal states
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 5;

  // Get unique locations
  const locations = [...new Set(projects.map((p) => p.location))];

  // Get project icon based on name
  const getProjectIcon = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("rumah") || nameLower.includes("cluster"))
      return Home;
    if (nameLower.includes("ruko")) return Building2;
    if (nameLower.includes("gudang")) return Warehouse;
    if (nameLower.includes("jembatan")) return Landmark;
    return Building;
  };

  // Calculate progress
  const getProgress = (project) => {
    const costs = getProjectCosts(project.id);
    const spent = costs.material + costs.labor;
    const target = project.targetRAP || 1;
    return Math.min(Math.round((spent / target) * 100), 100);
  };

  // Filter projects
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    if (filterLocation !== "all") {
      filtered = filtered.filter((p) => p.location === filterLocation);
    }

    return filtered;
  }, [projects, searchQuery, filterStatus, filterLocation]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedData = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p) => p.status === "active" || p.status === "aktif"
  ).length;
  const totalRAP = projects.reduce((sum, p) => sum + (p.targetRAP || 0), 0);

  // Handle Add Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addProject({
        name: formData.name,
        location: formData.location,
        targetRAP: parseFloat(formData.targetRAP) || 0,
        status: "active",
      });
      setShowForm(false);
      setFormData({ name: "", location: "", targetRAP: "" });
      refreshData();
    } catch (err) {
      alert("Gagal menambah proyek: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle View
  const handleView = (project) => {
    setViewModal(project);
  };

  // Handle Edit
  const handleEdit = (project) => {
    setEditFormData({
      name: project.name,
      location: project.location,
      status: project.status,
      targetRAP: project.targetRAP || 0,
    });
    setEditModal(project);
  };

  const handleEditSubmit = async () => {
    setIsLoading(true);
    try {
      await updateProject(editModal.id, editFormData);
      setEditModal(null);
      refreshData();
    } catch (err) {
      alert("Gagal update proyek: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      await deleteProject(deleteConfirm.id);
      setDeleteConfirm(null);
      refreshData();
    } catch (err) {
      alert("Gagal hapus proyek: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Format to billions/millions
  const formatShort = (value) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)} M`;
    }
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(0)} Jt`;
    }
    return formatCurrency(value);
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
          <h1 className="page-title">Data Proyek</h1>
          <p className="page-subtitle">
            Kelola proyek aktif, lokasi, dan target RAP
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          Tambah Proyek Baru
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card mb-6" style={{ marginBottom: "var(--space-6)" }}>
          <div className="card-header">
            <h3 className="card-title">Tambah Proyek Baru</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
            >
              <div className="form-group">
                <label className="form-label">Nama Proyek</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Renovasi Rumah Sakit A"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Lokasi</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Jakarta Selatan"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target RAP</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Contoh: 2500000000"
                  value={formData.targetRAP}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      targetRAP: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                marginTop: "var(--space-4)",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                Simpan Proyek
              </button>
            </div>
          </form>
        </div>
      )}

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
            <Building2 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Proyek</div>
            <div className="stat-value">{totalProjects}</div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                marginTop: "var(--space-1)",
              }}
            >
              Semua proyek terdaftar
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--success-500)" }}
        >
          <div className="stat-icon success">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Proyek Aktif</div>
            <div className="stat-value">{activeProjects}</div>
            <div className="stat-change positive">
              <TrendingUp size={12} />
              +2 bulan ini
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--accent-500)" }}
        >
          <div className="stat-icon accent">
            <Wallet size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Target RAP</div>
            <div className="stat-value small">{formatShort(totalRAP)}</div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                marginTop: "var(--space-1)",
              }}
            >
              Estimasi total anggaran
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
            gap: "var(--space-4)",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Status Filter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <Filter size={16} style={{ color: "var(--text-muted)" }} />
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Location Filter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <MapPin size={16} style={{ color: "var(--text-muted)" }} />
            <select
              className="form-select"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              style={{ minWidth: "140px" }}
            >
              <option value="all">Semua Lokasi</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ position: "relative" }}>
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
                placeholder="Cari nama proyek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "40px" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container" style={{ border: "none" }}>
          <table className="table">
            <thead>
              <tr>
                <th>NAMA PROYEK</th>
                <th>LOKASI</th>
                <th>TARGET RAP</th>
                <th style={{ textAlign: "center" }}>PROGRESS</th>
                <th style={{ textAlign: "center" }}>STATUS</th>
                <th style={{ textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((project) => {
                const IconComponent = getProjectIcon(project.name);
                const progress = getProgress(project);

                return (
                  <tr key={project.id}>
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
                            borderRadius: "var(--radius-lg)",
                            background: "var(--bg-tertiary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--primary-400)",
                          }}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: "500" }}>
                            {project.name}
                          </div>
                          <div
                            style={{
                              fontSize: "var(--text-xs)",
                              color: "var(--text-muted)",
                            }}
                          >
                            ID: PRJ-2023-
                            {project.id.toString().padStart(3, "0")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-2)",
                        }}
                      >
                        <MapPin
                          size={14}
                          style={{ color: "var(--text-muted)" }}
                        />
                        {project.location}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div
                          className="font-mono"
                          style={{ fontWeight: "500" }}
                        >
                          {formatCurrency(project.targetRAP || 0)}
                        </div>
                        <div
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--text-muted)",
                          }}
                        >
                          Budget Awal
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-3)",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ fontWeight: "500", minWidth: "36px" }}>
                          {progress}%
                        </span>
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
                              width: `${progress}%`,
                              height: "100%",
                              background:
                                progress >= 100
                                  ? "var(--success-400)"
                                  : "var(--primary-400)",
                              borderRadius: "var(--radius-full)",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`badge ${
                          project.status === "selesai"
                            ? "badge-success"
                            : project.status === "aktif"
                            ? "badge-primary"
                            : "badge-warning"
                        }`}
                      >
                        {project.status === "selesai"
                          ? "Selesai"
                          : project.status === "aktif"
                          ? "Aktif"
                          : "Pending"}
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
                          onClick={() => handleView(project)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Edit"
                          style={{ color: "var(--warning-400)" }}
                          onClick={() => handleEdit(project)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Hapus"
                          style={{ color: "var(--danger-400)" }}
                          onClick={() => setDeleteConfirm(project)}
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
              {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredProjects.length)}
            </strong>{" "}
            dari <strong>{filteredProjects.length}</strong> proyek
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "var(--space-12)",
              color: "var(--text-muted)",
            }}
          >
            <Building2
              size={48}
              style={{ marginBottom: "var(--space-3)", opacity: 0.5 }}
            />
            <p>Tidak ada proyek ditemukan</p>
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
                Detail Proyek
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
                  ID
                </div>
                <div style={{ fontWeight: "500" }}>{viewModal.id}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Nama Proyek
                </div>
                <div style={{ fontWeight: "500" }}>{viewModal.name}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Lokasi
                </div>
                <div style={{ fontWeight: "500" }}>{viewModal.location}</div>
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
                    viewModal.status === "active"
                      ? "badge-primary"
                      : "badge-secondary"
                  }`}
                >
                  {viewModal.status}
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Target RAP
                </div>
                <div className="font-mono" style={{ fontWeight: "500" }}>
                  {formatCurrency(viewModal.targetRAP || 0)}
                </div>
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
                Edit Proyek
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
                <label className="form-label">Nama Proyek</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.name || ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Lokasi</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.location || ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={editFormData.status || "active"}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="non active">Non Active</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Target RAP</label>
                <input
                  type="number"
                  className="form-input"
                  value={editFormData.targetRAP || ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      targetRAP: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
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
              Hapus Proyek?
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: "var(--space-6)",
              }}
            >
              Anda yakin ingin menghapus proyek{" "}
              <strong>{deleteConfirm.name}</strong>? Tindakan ini tidak dapat
              dibatalkan.
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
