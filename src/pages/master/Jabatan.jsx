import { useState } from "react";
import { useData } from "../../context";
import { useToast } from "../../context/ToastContext";
import {
  UserCog,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Users,
  AlertTriangle,
  GripVertical,
} from "lucide-react";

// Initial positions (fallback)
const initialPositions = [
  {
    id: "pos-001",
    name: "Mandor",
    code: "MANDOR",
    description: "Kepala tukang / pengawas lapangan",
    level: 1,
    isActive: true,
  },
  {
    id: "pos-002",
    name: "Tukang Ahli",
    code: "AHLI",
    description: "Tukang dengan keahlian khusus",
    level: 2,
    isActive: true,
  },
  {
    id: "pos-003",
    name: "Tukang Pembantu",
    code: "PEMBANTU",
    description: "Tukang pembantu / asisten",
    level: 3,
    isActive: true,
  },
  {
    id: "pos-004",
    name: "Buruh",
    code: "BURUH",
    description: "Tenaga kerja umum",
    level: 4,
    isActive: true,
  },
];

// Level colors
const LEVEL_COLORS = [
  "var(--primary-500)",
  "var(--success-500)",
  "var(--warning-500)",
  "var(--accent-500)",
  "var(--danger-500)",
];

export default function Jabatan() {
  const {
    positions: contextPositions,
    addPosition,
    updatePosition,
    deletePosition,
  } = useData();
  const toast = useToast();

  // Use context data if available, otherwise use initial
  const positions =
    contextPositions && contextPositions.length > 0
      ? contextPositions
      : initialPositions;

  const [showForm, setShowForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    level: 1,
    isActive: true,
  });

  // Stats
  const totalPositions = positions.length;
  const activePositions = positions.filter((p) => p.isActive).length;

  // Sort positions by level
  const sortedPositions = [...positions].sort((a, b) => a.level - b.level);

  // Handle form
  const openAddForm = () => {
    setEditingPosition(null);
    const nextLevel = Math.max(...positions.map((p) => p.level || 0), 0) + 1;
    setFormData({
      name: "",
      code: "",
      description: "",
      level: nextLevel,
      isActive: true,
    });
    setShowForm(true);
  };

  const openEditForm = (position) => {
    setEditingPosition(position);
    setFormData({
      name: position.name,
      code: position.code,
      description: position.description || "",
      level: position.level || 1,
      isActive: position.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPosition) {
        if (updatePosition) {
          await updatePosition(editingPosition.id, formData);
        }
        toast.success("Jabatan berhasil diperbarui");
      } else {
        if (addPosition) {
          await addPosition(formData);
        }
        toast.success("Jabatan berhasil ditambahkan");
      }
      setShowForm(false);
      setEditingPosition(null);
    } catch (err) {
      toast.error("Gagal menyimpan: " + err.message);
    }
  };

  const handleDelete = async (positionId) => {
    if (
      window.confirm(
        "Hapus jabatan ini? Ini akan mempengaruhi data golongan gaji."
      )
    ) {
      try {
        if (deletePosition) {
          await deletePosition(positionId);
        }
        toast.success("Jabatan berhasil dihapus");
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
          <h1 className="page-title">Master Jabatan</h1>
          <p className="page-subtitle">Kelola daftar jabatan/posisi pekerja</p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          <Plus size={18} />
          Tambah Jabatan
        </button>
      </div>

      {/* Alert */}
      <div
        className="alert alert-info mb-6"
        style={{ marginBottom: "var(--space-6)" }}
      >
        <AlertTriangle size={20} />
        <div>
          Jabatan digunakan untuk menentukan{" "}
          <strong>tarif gaji per golongan</strong>. Urutan level menentukan
          hierarki jabatan (1 = tertinggi).
        </div>
      </div>

      {/* Stats */}
      <div
        className="grid gap-4 mb-6"
        style={{
          gridTemplateColumns: "repeat(2, 1fr)",
          marginBottom: "var(--space-6)",
          maxWidth: "400px",
        }}
      >
        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--primary-500)" }}
        >
          <div className="stat-icon primary">
            <UserCog size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Jabatan</div>
            <div className="stat-value">{totalPositions}</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--success-500)" }}
        >
          <div className="stat-icon success">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Aktif</div>
            <div className="stat-value">{activePositions}</div>
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
                {editingPosition ? "Edit Jabatan" : "Tambah Jabatan"}
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
                  gridTemplateColumns: "2fr 1fr",
                  gap: "var(--space-4)",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Nama Jabatan</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Mandor"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="99"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        level: parseInt(e.target.value) || 1,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Kode</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="MANDOR"
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
                  marginTop: "var(--space-4)",
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

      {/* Position List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Daftar Jabatan</h3>
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
            }}
          >
            Diurutkan berdasarkan level (1 = tertinggi)
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>Level</th>
                <th>Nama Jabatan</th>
                <th>Kode</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th style={{ width: "100px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedPositions.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "var(--space-8)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Belum ada jabatan. Klik "Tambah Jabatan" untuk memulai.
                  </td>
                </tr>
              ) : (
                sortedPositions.map((position, index) => {
                  const color = LEVEL_COLORS[index % LEVEL_COLORS.length];
                  return (
                    <tr
                      key={position.id}
                      style={{ opacity: position.isActive ? 1 : 0.5 }}
                    >
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-2)",
                          }}
                        >
                          <GripVertical
                            size={14}
                            style={{ color: "var(--text-muted)" }}
                          />
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "var(--radius-md)",
                              background: color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: "700",
                              fontSize: "var(--text-sm)",
                            }}
                          >
                            {position.level}
                          </span>
                        </div>
                      </td>
                      <td>
                        <strong>{position.name}</strong>
                      </td>
                      <td>
                        <span
                          className="font-mono"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {position.code}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>
                        {position.description || "-"}
                      </td>
                      <td>
                        {position.isActive ? (
                          <span className="badge badge-success">Aktif</span>
                        ) : (
                          <span className="badge badge-gray">Non-aktif</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "var(--space-1)" }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEditForm(position)}
                            style={{ color: "var(--warning-400)" }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDelete(position.id)}
                            style={{ color: "var(--danger-400)" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
