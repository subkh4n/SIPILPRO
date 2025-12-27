import { useState, useMemo } from "react";
import { useData } from "../../context";
import { useToast } from "../../context/ToastContext";
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  DollarSign,
  Users,
  AlertTriangle,
  Link2,
} from "lucide-react";

// Helper to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Initial positions (fallback)
const initialPositions = [
  { id: "pos-001", name: "Mandor", code: "MANDOR", level: 1, isActive: true },
  {
    id: "pos-002",
    name: "Tukang Ahli",
    code: "AHLI",
    level: 2,
    isActive: true,
  },
  {
    id: "pos-003",
    name: "Tukang Pembantu",
    code: "PEMBANTU",
    level: 3,
    isActive: true,
  },
  { id: "pos-004", name: "Buruh", code: "BURUH", level: 4, isActive: true },
];

// Initial salary grades (fallback)
const initialSalaryGrades = [
  {
    id: "grade-001",
    name: "Golongan I",
    code: "GOL-1",
    description: "Golongan pemula / entry level",
    salaryRates: {
      "pos-001": { dailyRate: 180000, hourlyRate: 22500 },
      "pos-002": { dailyRate: 150000, hourlyRate: 18750 },
      "pos-003": { dailyRate: 120000, hourlyRate: 15000 },
      "pos-004": { dailyRate: 80000, hourlyRate: 10000 },
    },
    isActive: true,
  },
  {
    id: "grade-002",
    name: "Golongan II",
    code: "GOL-2",
    description: "Golongan menengah / intermediate",
    salaryRates: {
      "pos-001": { dailyRate: 220000, hourlyRate: 27500 },
      "pos-002": { dailyRate: 180000, hourlyRate: 22500 },
      "pos-003": { dailyRate: 140000, hourlyRate: 17500 },
      "pos-004": { dailyRate: 100000, hourlyRate: 12500 },
    },
    isActive: true,
  },
  {
    id: "grade-003",
    name: "Golongan III",
    code: "GOL-3",
    description: "Golongan senior / experienced",
    salaryRates: {
      "pos-001": { dailyRate: 280000, hourlyRate: 35000 },
      "pos-002": { dailyRate: 220000, hourlyRate: 27500 },
      "pos-003": { dailyRate: 170000, hourlyRate: 21250 },
      "pos-004": { dailyRate: 120000, hourlyRate: 15000 },
    },
    isActive: true,
  },
  {
    id: "grade-004",
    name: "Golongan IV",
    code: "GOL-4",
    description: "Golongan ahli / expert",
    salaryRates: {
      "pos-001": { dailyRate: 350000, hourlyRate: 43750 },
      "pos-002": { dailyRate: 280000, hourlyRate: 35000 },
      "pos-003": { dailyRate: 200000, hourlyRate: 25000 },
      "pos-004": { dailyRate: 150000, hourlyRate: 18750 },
    },
    isActive: true,
  },
];

// Grade colors
const GRADE_COLORS = [
  "var(--primary-500)",
  "var(--success-500)",
  "var(--warning-500)",
  "var(--accent-500)",
  "var(--danger-500)",
];

export default function GolonganGaji() {
  const {
    salaryGrades: contextGrades,
    positions: contextPositions,
    addSalaryGrade,
    updateSalaryGrade,
    deleteSalaryGrade,
  } = useData();
  const toast = useToast();

  // Use context data if available, otherwise use initial
  const salaryGrades =
    contextGrades && contextGrades.length > 0
      ? contextGrades
      : initialSalaryGrades;

  const positions = useMemo(() => {
    const pos =
      contextPositions && contextPositions.length > 0
        ? contextPositions
        : initialPositions;
    // Sort by level
    return [...pos].filter((p) => p.isActive).sort((a, b) => a.level - b.level);
  }, [contextPositions]);

  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);

  // Build initial salary rates based on positions
  const buildDefaultSalaryRates = () => {
    const rates = {};
    positions.forEach((pos, index) => {
      const baseRate = 200000 - index * 40000;
      rates[pos.id] = {
        dailyRate: Math.max(baseRate, 80000),
        hourlyRate: Math.round(Math.max(baseRate, 80000) / 8),
      };
    });
    return rates;
  };

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    salaryRates: buildDefaultSalaryRates(),
    isActive: true,
  });

  // Stats
  const totalGrades = salaryGrades.length;
  const activeGrades = salaryGrades.filter((g) => g.isActive).length;

  // Handle form
  const openAddForm = () => {
    setEditingGrade(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      salaryRates: buildDefaultSalaryRates(),
      isActive: true,
    });
    setShowForm(true);
  };

  const openEditForm = (grade) => {
    setEditingGrade(grade);
    // Ensure all current positions have rates
    const rates = { ...grade.salaryRates };
    positions.forEach((pos) => {
      if (!rates[pos.id]) {
        rates[pos.id] = { dailyRate: 100000, hourlyRate: 12500 };
      }
    });
    setFormData({
      name: grade.name,
      code: grade.code,
      description: grade.description || "",
      salaryRates: rates,
      isActive: grade.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGrade) {
        if (updateSalaryGrade) {
          await updateSalaryGrade(editingGrade.id, formData);
        }
        toast.success("Golongan gaji berhasil diperbarui");
      } else {
        if (addSalaryGrade) {
          await addSalaryGrade(formData);
        }
        toast.success("Golongan gaji berhasil ditambahkan");
      }
      setShowForm(false);
      setEditingGrade(null);
    } catch (err) {
      toast.error("Gagal menyimpan: " + err.message);
    }
  };

  const handleDelete = async (gradeId) => {
    if (window.confirm("Hapus golongan gaji ini?")) {
      try {
        if (deleteSalaryGrade) {
          await deleteSalaryGrade(gradeId);
        }
        toast.success("Golongan gaji berhasil dihapus");
      } catch (err) {
        toast.error("Gagal menghapus: " + err.message);
      }
    }
  };

  const handleRateChange = (positionId, field, value) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      salaryRates: {
        ...prev.salaryRates,
        [positionId]: {
          ...prev.salaryRates[positionId],
          [field]: numValue,
          // Auto calculate hourly rate if daily rate changes (8 hours/day)
          ...(field === "dailyRate"
            ? { hourlyRate: Math.round(numValue / 8) }
            : {}),
        },
      },
    }));
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
          <h1 className="page-title">Golongan Gaji</h1>
          <p className="page-subtitle">
            Kelola tingkat golongan gaji berdasarkan jabatan
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          <Plus size={18} />
          Tambah Golongan
        </button>
      </div>

      {/* Alert */}
      <div
        className="alert alert-info mb-6"
        style={{ marginBottom: "var(--space-6)" }}
      >
        <AlertTriangle size={20} />
        <div>
          Golongan gaji menentukan <strong>tarif upah per jabatan</strong>.
          Kelola jabatan di menu <strong>Master Jabatan</strong> terlebih
          dahulu.
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
            <Award size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Golongan</div>
            <div className="stat-value">{totalGrades}</div>
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
            <div className="stat-label">Golongan Aktif</div>
            <div className="stat-value">{activeGrades}</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--warning-500)" }}
        >
          <div className="stat-icon warning">
            <Link2 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Jabatan Terdaftar</div>
            <div className="stat-value">{positions.length}</div>
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
              maxWidth: "700px",
              margin: "var(--space-4)",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <h3 className="card-title">
                {editingGrade ? "Edit Golongan Gaji" : "Tambah Golongan Gaji"}
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
                  <label className="form-label">Nama Golongan</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Golongan I"
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
                    placeholder="GOL-1"
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
                  placeholder="Keterangan golongan"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Salary Rates per Position */}
              <div
                style={{
                  marginTop: "var(--space-4)",
                  padding: "var(--space-4)",
                  background: "var(--bg-tertiary)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  <DollarSign
                    size={18}
                    style={{ color: "var(--success-400)" }}
                  />
                  <span style={{ fontWeight: "600" }}>
                    Tarif Gaji per Jabatan
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-muted)",
                      marginLeft: "auto",
                    }}
                  >
                    {positions.length} jabatan
                  </span>
                </div>

                {positions.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "var(--space-6)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <p>
                      Belum ada jabatan. Tambahkan jabatan di menu Master
                      Jabatan.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{ width: "100%", fontSize: "var(--text-sm)" }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          <th
                            style={{
                              textAlign: "left",
                              padding: "var(--space-2)",
                            }}
                          >
                            Jabatan
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "var(--space-2)",
                            }}
                          >
                            Gaji/Hari (Rp)
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "var(--space-2)",
                            }}
                          >
                            Gaji/Jam (Rp)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((pos) => (
                          <tr key={pos.id}>
                            <td
                              style={{
                                padding: "var(--space-2)",
                                fontWeight: "500",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "var(--space-2)",
                                }}
                              >
                                <span
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: "4px",
                                    background:
                                      GRADE_COLORS[
                                        (pos.level - 1) % GRADE_COLORS.length
                                      ],
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontSize: "10px",
                                    fontWeight: "700",
                                  }}
                                >
                                  {pos.level}
                                </span>
                                {pos.name}
                              </div>
                            </td>
                            <td style={{ padding: "var(--space-2)" }}>
                              <input
                                type="text"
                                className="form-input"
                                style={{ textAlign: "right" }}
                                value={(
                                  formData.salaryRates[pos.id]?.dailyRate || 0
                                ).toLocaleString("id-ID")}
                                onChange={(e) => {
                                  const numValue =
                                    parseInt(
                                      e.target.value.replace(/\./g, "")
                                    ) || 0;
                                  handleRateChange(
                                    pos.id,
                                    "dailyRate",
                                    numValue
                                  );
                                  // Auto-calculate hourly rate (daily / 8 hours)
                                  handleRateChange(
                                    pos.id,
                                    "hourlyRate",
                                    Math.round(numValue / 8)
                                  );
                                }}
                              />
                            </td>
                            <td style={{ padding: "var(--space-2)" }}>
                              <input
                                type="text"
                                className="form-input"
                                style={{
                                  textAlign: "right",
                                  background: "var(--bg-tertiary)",
                                  color: "var(--text-muted)",
                                }}
                                value={Math.round(
                                  (formData.salaryRates[pos.id]?.dailyRate ||
                                    0) / 8
                                ).toLocaleString("id-ID")}
                                readOnly
                                disabled
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginTop: "var(--space-2)",
                  }}
                >
                  * Gaji/jam otomatis dihitung dari gaji/hari ÷ 8 jam
                </p>
              </div>

              <div
                className="form-group"
                style={{ marginTop: "var(--space-4)" }}
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

      {/* Grade Cards */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}
      >
        {salaryGrades.map((grade, gradeIndex) => {
          const color = GRADE_COLORS[gradeIndex % GRADE_COLORS.length];

          return (
            <div
              key={grade.id}
              className="card"
              style={{
                borderLeft: `4px solid ${color}`,
                opacity: grade.isActive ? 1 : 0.6,
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
                      fontWeight: "700",
                      fontSize: "var(--text-lg)",
                    }}
                  >
                    {grade.code?.split("-")[1] || gradeIndex + 1}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: "600",
                        fontSize: "var(--text-base)",
                      }}
                    >
                      {grade.name}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--text-muted)",
                      }}
                    >
                      <span className="font-mono">{grade.code}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--space-1)" }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => openEditForm(grade)}
                    style={{ color: "var(--warning-400)" }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(grade.id)}
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
                {grade.description || "-"}
              </p>

              {/* Salary Table */}
              <div
                style={{
                  background: "var(--bg-tertiary)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    padding: "var(--space-2) var(--space-3)",
                    background: "rgba(0,0,0,0.2)",
                    fontSize: "var(--text-xs)",
                    fontWeight: "600",
                    color: "var(--text-muted)",
                  }}
                >
                  <span>Jabatan</span>
                  <span style={{ textAlign: "right" }}>Harian</span>
                  <span style={{ textAlign: "right" }}>Per Jam</span>
                </div>
                {positions.map((pos) => {
                  const rates = grade.salaryRates?.[pos.id] || {
                    dailyRate: 0,
                    hourlyRate: 0,
                  };
                  return (
                    <div
                      key={pos.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        padding: "var(--space-2) var(--space-3)",
                        borderTop: "1px solid var(--border-color)",
                        fontSize: "var(--text-xs)",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>{pos.name}</span>
                      <span
                        className="font-mono"
                        style={{
                          textAlign: "right",
                          color: "var(--success-400)",
                        }}
                      >
                        {formatCurrency(rates.dailyRate)}
                      </span>
                      <span
                        className="font-mono"
                        style={{
                          textAlign: "right",
                          color: "var(--text-muted)",
                        }}
                      >
                        {formatCurrency(rates.hourlyRate)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {salaryGrades.length === 0 && (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "var(--space-12)",
            color: "var(--text-muted)",
          }}
        >
          <Award
            size={48}
            style={{ marginBottom: "var(--space-3)", opacity: 0.5 }}
          />
          <p>Belum ada golongan gaji. Klik "Tambah Golongan" untuk memulai.</p>
        </div>
      )}
    </div>
  );
}
