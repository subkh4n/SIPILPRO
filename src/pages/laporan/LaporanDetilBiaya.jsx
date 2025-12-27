import { useState, useMemo } from "react";
import { useData } from "../../context";
import { formatCurrency } from "../../utils/helpers";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import {
  Download,
  Calendar,
  Package,
  Users,
  Wallet,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Truck,
  Hammer,
  Zap,
  Droplet,
} from "lucide-react";

export default function LaporanDetilBiaya() {
  const { purchases, attendance } = useData();
  const [selectedProject] = useState("all");
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [activeTab, setActiveTab] = useState("material");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter purchases by date range and project
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const purchaseDate = parseISO(p.date);
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const dateMatch = purchaseDate >= start && purchaseDate <= end;
      const projectMatch =
        selectedProject === "all" ||
        p.items?.some((item) => item.projectId === selectedProject);
      return dateMatch && projectMatch;
    });
  }, [purchases, startDate, endDate, selectedProject]);

  // Calculate totals
  const totals = useMemo(() => {
    const materialTotal = filteredPurchases.reduce(
      (sum, p) => sum + (p.total || 0),
      0
    );

    const laborTotal = attendance
      .filter((a) => {
        try {
          const attDate = parseISO(a.date);
          const start = parseISO(startDate);
          const end = parseISO(endDate);
          return attDate >= start && attDate <= end;
        } catch {
          return false;
        }
      })
      .reduce((sum, a) => sum + (a.wage || 0), 0);

    return {
      material: materialTotal || 150000000,
      labor: laborTotal || 45000000,
      total: (materialTotal || 150000000) + (laborTotal || 45000000),
      budget: 225000000,
    };
  }, [filteredPurchases, attendance, startDate, endDate]);

  const remainingBudget = totals.budget - totals.total;
  const budgetPercentage = Math.round((remainingBudget / totals.budget) * 100);

  // Mock material items for display
  const materialItems = [
    {
      id: 1,
      name: "Semen Tiga Roda (50kg)",
      category: "Struktur",
      supplier: "TB. Maju Jaya",
      date: "2024-03-15",
      qty: 100,
      unit: "Sak",
      price: 65000,
      total: 6500000,
    },
    {
      id: 2,
      name: "Pasir Beton (Truk)",
      category: "Struktur",
      supplier: "CV. Alam Abadi",
      date: "2024-03-12",
      qty: 5,
      unit: "Truk",
      price: 1200000,
      total: 6000000,
    },
    {
      id: 3,
      name: "Cat Tembok Dulux (20kg)",
      category: "Finishing",
      supplier: "Mitra Bangunan",
      date: "2024-03-10",
      qty: 20,
      unit: "Pail",
      price: 1850000,
      total: 37000000,
    },
    {
      id: 4,
      name: "Kabel NYM 2x1.5 (Roll)",
      category: "Elektrikal",
      supplier: "Toko Listrik Terang",
      date: "2024-03-08",
      qty: 15,
      unit: "Roll",
      price: 550000,
      total: 8250000,
    },
    {
      id: 5,
      name: "Pipa PVC 4 inch",
      category: "Plumbing",
      supplier: "TB. Maju Jaya",
      date: "2024-03-05",
      qty: 50,
      unit: "Batang",
      price: 85000,
      total: 4250000,
    },
  ];

  // Mock labor recipients
  const laborRecipients = [
    {
      id: 1,
      name: "Budi Santoso",
      role: "Mandor Utama",
      hours: 45,
      wage: 3500000,
    },
    {
      id: 2,
      name: "Ahmad Hidayat",
      role: "Tukang Batu",
      hours: 40,
      wage: 2850000,
    },
    {
      id: 3,
      name: "Slamet Triyono",
      role: "Tukang Kayu",
      hours: 38,
      wage: 2100000,
    },
    { id: 4, name: "Dedi Kurniawan", role: "Kenek", hours: 42, wage: 1680000 },
    {
      id: 5,
      name: "Rudi Hartono",
      role: "Tukang Las",
      hours: 35,
      wage: 2450000,
    },
  ];

  // Pagination
  const paginatedMaterials = materialItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(materialItems.length / itemsPerPage);
  const totalMaterialPage = paginatedMaterials.reduce((s, i) => s + i.total, 0);

  // Category icons
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Struktur":
        return <Truck size={14} />;
      case "Finishing":
        return <Hammer size={14} />;
      case "Elektrikal":
        return <Zap size={14} />;
      case "Plumbing":
        return <Droplet size={14} />;
      default:
        return <Package size={14} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Struktur":
        return "var(--primary-400)";
      case "Finishing":
        return "var(--success-400)";
      case "Elektrikal":
        return "var(--warning-400)";
      case "Plumbing":
        return "var(--accent-400)";
      default:
        return "var(--text-muted)";
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
          <h1 className="page-title">Laporan Detil Biaya</h1>
          <p className="page-subtitle">
            Rincian pengeluaran material dan upah pekerja untuk periode
            terpilih. Analisa arus kas proyek secara mendalam.
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button className="btn btn-secondary">
            <Calendar size={18} />
            Pilih Periode
          </button>
          <button className="btn btn-primary">
            <Download size={18} />
            Ekspor PDF
          </button>
        </div>
      </div>

      {/* Period Range - Visual Timeline Slider */}
      <div
        className="card mb-6"
        style={{ marginBottom: "var(--space-6)", padding: "var(--space-5)" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-4)",
            marginBottom: "var(--space-4)",
          }}
        >
          <Calendar size={18} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontWeight: "500" }}>Rentang Periode Aktif</span>
        </div>

        {/* Visual Timeline Slider */}
        <div style={{ padding: "0 var(--space-4)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            {/* Start Date Label */}
            <div
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: "500",
                color: "var(--text-primary)",
              }}
            >
              {format(parseISO(startDate), "d MMM yyyy", { locale: id })}
            </div>

            {/* End Date Label */}
            <div
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: "500",
                color: "var(--text-primary)",
              }}
            >
              {format(parseISO(endDate), "d MMM yyyy", { locale: id })}
            </div>
          </div>

          {/* Slider Track */}
          <div
            style={{
              position: "relative",
              height: 20,
              marginTop: "var(--space-2)",
            }}
          >
            {/* Track Background */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 8,
                right: 8,
                height: 3,
                background: "var(--primary-500)",
                borderRadius: "var(--radius-full)",
                transform: "translateY(-50%)",
              }}
            />

            {/* Start Circle */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: 16,
                height: 16,
                borderRadius: "var(--radius-full)",
                background: "var(--bg-secondary)",
                border: "3px solid var(--primary-500)",
                cursor: "pointer",
              }}
            />

            {/* End Circle */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: 16,
                height: 16,
                borderRadius: "var(--radius-full)",
                background: "var(--bg-secondary)",
                border: "3px solid var(--primary-500)",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Hidden Date Inputs for actual functionality */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-4)",
              marginTop: "var(--space-4)",
            }}
          >
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className="grid gap-4 mb-6"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div
          style={{
            padding: "var(--space-5)",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
              marginBottom: "var(--space-1)",
            }}
          >
            TOTAL BIAYA PROYEK
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: "700",
              color: "var(--primary-400)",
            }}
          >
            {formatCurrency(totals.total)}
          </div>
          <div
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--success-400)",
              marginTop: "var(--space-1)",
            }}
          >
            +12% dari estimasi
          </div>
        </div>

        <div
          style={{
            padding: "var(--space-5)",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
              marginBottom: "var(--space-1)",
            }}
          >
            TOTAL MATERIAL
          </div>
          <div
            className="font-mono"
            style={{ fontSize: "var(--text-xl)", fontWeight: "700" }}
          >
            {formatCurrency(totals.material)}
          </div>
          <div
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--success-400)",
              marginTop: "var(--space-1)",
            }}
          >
            +8% bulan ini
          </div>
        </div>

        <div
          style={{
            padding: "var(--space-5)",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
              marginBottom: "var(--space-1)",
            }}
          >
            TOTAL UPAH
          </div>
          <div
            className="font-mono"
            style={{ fontSize: "var(--text-xl)", fontWeight: "700" }}
          >
            {formatCurrency(totals.labor)}
          </div>
          <div
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--success-400)",
              marginTop: "var(--space-1)",
            }}
          >
            +15% bulan ini
          </div>
        </div>

        <div
          style={{
            padding: "var(--space-5)",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
              marginBottom: "var(--space-1)",
            }}
          >
            SISA ANGGARAN
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: "700",
              color: "var(--warning-400)",
            }}
          >
            {formatCurrency(remainingBudget)}
          </div>
          <div
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--warning-400)",
              marginTop: "var(--space-1)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <AlertCircle size={12} />
            Hanya sisa {budgetPercentage}%
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          marginBottom: "var(--space-4)",
        }}
      >
        {[
          { id: "material", label: "Material & Logistik" },
          { id: "upah", label: "Upah Pekerja" },
          { id: "lainnya", label: "Biaya Lain-lain" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "var(--space-2) var(--space-4)",
              background:
                activeTab === tab.id ? "var(--primary-500)" : "transparent",
              border:
                activeTab === tab.id ? "none" : "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              color: activeTab === tab.id ? "white" : "var(--text-secondary)",
              fontSize: "var(--text-sm)",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Material Table */}
      {activeTab === "material" && (
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div
            className="card-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 className="card-title">Rincian Pembelian Material</h3>
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <select className="form-select" style={{ minWidth: "150px" }}>
                <option>Semua Kategori</option>
                <option>Struktur</option>
                <option>Finishing</option>
                <option>Elektrikal</option>
                <option>Plumbing</option>
              </select>
              <input
                type="text"
                className="form-input"
                placeholder="Cari item..."
                style={{ minWidth: "200px" }}
              />
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ITEM MATERIAL</th>
                  <th>KATEGORI</th>
                  <th>SUPPLIER</th>
                  <th>TANGGAL</th>
                  <th style={{ textAlign: "center" }}>QTY</th>
                  <th style={{ textAlign: "right" }}>HARGA SATUAN</th>
                  <th style={{ textAlign: "right" }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMaterials.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-2)",
                        }}
                      >
                        <Package
                          size={16}
                          style={{ color: "var(--text-muted)" }}
                        />
                        <span style={{ fontWeight: "500" }}>{item.name}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 10px",
                          background: `${getCategoryColor(item.category)}20`,
                          color: getCategoryColor(item.category),
                          borderRadius: "var(--radius-full)",
                          fontSize: "var(--text-xs)",
                          fontWeight: "500",
                        }}
                      >
                        {getCategoryIcon(item.category)}
                        {item.category}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {item.supplier}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {format(parseISO(item.date), "d MMM yyyy", {
                        locale: id,
                      })}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {item.qty} {item.unit}
                    </td>
                    <td className="font-mono" style={{ textAlign: "right" }}>
                      {formatCurrency(item.price)}
                    </td>
                    <td
                      className="font-mono"
                      style={{
                        textAlign: "right",
                        fontWeight: "600",
                        color: "var(--primary-400)",
                      }}
                    >
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "right", fontWeight: "600" }}
                  >
                    Total Halaman Ini
                  </td>
                  <td
                    className="font-mono"
                    style={{
                      textAlign: "right",
                      fontWeight: "700",
                      fontSize: "var(--text-lg)",
                    }}
                  >
                    {formatCurrency(totalMaterialPage)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pagination */}
          <div
            style={{
              padding: "var(--space-4)",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}
            >
              Menampilkan 1-{paginatedMaterials.length} dari{" "}
              {materialItems.length} item
            </span>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${
                    currentPage === i + 1 ? "btn-primary" : "btn-secondary"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Labor Summary */}
      {activeTab === "upah" && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ringkasan Upah Pekerja</h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "300px 1fr",
              gap: "var(--space-6)",
              padding: "var(--space-5)",
            }}
          >
            {/* Donut Chart */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  position: "relative",
                  width: "200px",
                  height: "200px",
                  margin: "0 auto",
                }}
              >
                <svg
                  viewBox="0 0 100 100"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="var(--bg-tertiary)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="var(--primary-500)"
                    strokeWidth="12"
                    strokeDasharray="125.6 251.2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="var(--warning-500)"
                    strokeWidth="12"
                    strokeDasharray="75.4 251.2"
                    strokeDashoffset="-125.6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="var(--success-500)"
                    strokeWidth="12"
                    strokeDasharray="50.2 251.2"
                    strokeDashoffset="-201"
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ fontSize: "var(--text-2xl)", fontWeight: "700" }}
                  >
                    45jt
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "var(--space-4)",
                  marginTop: "var(--space-4)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "var(--primary-500)",
                    }}
                  />
                  <span style={{ fontSize: "var(--text-xs)" }}>
                    Tukang (60%)
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "var(--warning-500)",
                    }}
                  />
                  <span style={{ fontSize: "var(--text-xs)" }}>
                    Kenek (30%)
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "var(--success-500)",
                    }}
                  />
                  <span style={{ fontSize: "var(--text-xs)" }}>
                    Mandor (10%)
                  </span>
                </div>
              </div>
            </div>

            {/* Top Recipients */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--space-4)",
                }}
              >
                <h4 style={{ fontWeight: "600" }}>
                  TOP PENERIMA UPAH (MINGGU INI)
                </h4>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--primary-400)" }}
                >
                  Lihat Detil Lengkap
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-3)",
                }}
              >
                {laborRecipients.map((worker, index) => (
                  <div
                    key={worker.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "var(--space-3)",
                      background: "var(--bg-tertiary)",
                      borderRadius: "var(--radius-lg)",
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
                          width: 36,
                          height: 36,
                          borderRadius: "var(--radius-full)",
                          background: `linear-gradient(135deg, hsl(${
                            index * 60 + 200
                          }, 70%, 50%), hsl(${index * 60 + 200}, 70%, 40%))`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "600",
                          fontSize: "var(--text-sm)",
                        }}
                      >
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: "500" }}>{worker.name}</div>
                        <div
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {worker.role} • {worker.hours} Jam
                        </div>
                      </div>
                    </div>
                    <div
                      className="font-mono"
                      style={{ fontWeight: "600", color: "var(--primary-400)" }}
                    >
                      {formatCurrency(worker.wage)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Costs */}
      {activeTab === "lainnya" && (
        <div
          className="card"
          style={{ padding: "var(--space-8)", textAlign: "center" }}
        >
          <div style={{ color: "var(--text-muted)" }}>
            <AlertCircle
              size={48}
              style={{ margin: "0 auto var(--space-4)" }}
            />
            <h3>Belum ada data biaya lain-lain</h3>
            <p style={{ marginTop: "var(--space-2)" }}>
              Data biaya operasional, perizinan, dan biaya lainnya akan tampil
              di sini
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

