import { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { formatCurrency } from "../../utils/helpers";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  X,
  Save,
} from "lucide-react";

export default function ArusKas() {
  const { cashBalance } = useData();
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("in"); // 'in' or 'out'
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    amount: "",
    category: "",
  });

  // Mock transactions (in real app, this would come from DataContext)
  const [transactions, setTransactions] = useState([
    {
      id: "trx-001",
      date: "2025-12-24",
      type: "in",
      description: "Modal Awal Bulan",
      category: "Modal",
      amount: 50000000,
    },
    {
      id: "trx-002",
      date: "2025-12-24",
      type: "out",
      description: "Pembayaran TB. Sinar Jaya",
      category: "Hutang Vendor",
      amount: 5000000,
    },
    {
      id: "trx-003",
      date: "2025-12-23",
      type: "out",
      description: "Gaji Mingguan Pegawai",
      category: "Payroll",
      amount: 3500000,
    },
    {
      id: "trx-004",
      date: "2025-12-22",
      type: "in",
      description: "Termin Proyek Ruko Blok A",
      category: "Pendapatan",
      amount: 25000000,
    },
    {
      id: "trx-005",
      date: "2025-12-22",
      type: "out",
      description: "Pembelian Material Tunai",
      category: "Material",
      amount: 2000000,
    },
  ]);

  // Parse selected month
  const monthDate = new Date(selectedMonth + "-01");

  // Filter transactions by month
  const filteredTransactions = useMemo(() => {
    const mStart = startOfMonth(new Date(selectedMonth + "-01"));
    const mEnd = endOfMonth(new Date(selectedMonth + "-01"));
    return transactions
      .filter((t) => {
        const tDate = parseISO(t.date);
        return tDate >= mStart && tDate <= mEnd;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, selectedMonth]);

  // Calculate totals
  const totalIn = filteredTransactions
    .filter((t) => t.type === "in")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOut = filteredTransactions
    .filter((t) => t.type === "out")
    .reduce((sum, t) => sum + t.amount, 0);
  const netFlow = totalIn - totalOut;

  // Categories
  const categoriesIn = [
    "Modal",
    "Pendapatan",
    "Termin Proyek",
    "Pinjaman",
    "Lainnya",
  ];
  const categoriesOut = [
    "Material",
    "Payroll",
    "Hutang Vendor",
    "Operasional",
    "Lainnya",
  ];

  // Handle form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTransaction = {
      id: `trx-${Date.now()}`,
      date: formData.date,
      type: formType,
      description: formData.description,
      category: formData.category,
      amount: parseFloat(formData.amount) || 0,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    setFormData({
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      amount: "",
      category: "",
    });
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      amount: "",
      category: "",
    });
    setShowForm(false);
  };

  const openForm = (type) => {
    setFormType(type);
    setShowForm(true);
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
          <h1 className="page-title">Arus Kas</h1>
          <p className="page-subtitle">Manajemen kas masuk dan keluar</p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button className="btn btn-success" onClick={() => openForm("in")}>
            <ArrowDownRight size={18} />
            Kas Masuk
          </button>
          <button className="btn btn-danger" onClick={() => openForm("out")}>
            <ArrowUpRight size={18} />
            Kas Keluar
          </button>
        </div>
      </div>

      {/* Input Form */}
      {showForm && (
        <div className="card mb-6" style={{ marginBottom: "var(--space-6)" }}>
          <div className="card-header">
            <h3 className="card-title">
              {formType === "in" ? "Input Kas Masuk" : "Input Kas Keluar"}
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
            >
              <div className="form-group">
                <label className="form-label">Tanggal</label>
                <input
                  type="date"
                  name="date"
                  className="form-input"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Pilih --</option>
                  {(formType === "in" ? categoriesIn : categoriesOut).map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Jumlah</label>
                <input
                  type="number"
                  name="amount"
                  className="form-input font-mono"
                  placeholder="0"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Keterangan</label>
                <input
                  type="text"
                  name="description"
                  className="form-input"
                  placeholder="Deskripsi transaksi..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                marginTop: "var(--space-5)",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Batal
              </button>
              <button
                type="submit"
                className={`btn ${
                  formType === "in" ? "btn-success" : "btn-danger"
                }`}
              >
                <Save size={16} />
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

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
            alignItems: "center",
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

          <div className="badge badge-primary">
            <Filter size={14} />
            {filteredTransactions.length} Transaksi
          </div>
        </div>
      </div>

      {/* Summary Cards */}
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
            <Wallet size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Saldo Kas</div>
            <div className="stat-value small">
              {formatCurrency(cashBalance)}
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--success-500)" }}
        >
          <div className="stat-icon success">
            <ArrowDownRight size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Kas Masuk</div>
            <div className="stat-value small">{formatCurrency(totalIn)}</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--danger-500)" }}
        >
          <div className="stat-icon danger">
            <ArrowUpRight size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Kas Keluar</div>
            <div className="stat-value small">{formatCurrency(totalOut)}</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            "--stat-accent":
              netFlow >= 0 ? "var(--success-500)" : "var(--danger-500)",
          }}
        >
          <div className={`stat-icon ${netFlow >= 0 ? "success" : "danger"}`}>
            {netFlow >= 0 ? (
              <TrendingUp size={24} />
            ) : (
              <TrendingDown size={24} />
            )}
          </div>
          <div className="stat-content">
            <div className="stat-label">Arus Bersih</div>
            <div className="stat-value small">
              {netFlow >= 0 ? "+" : ""}
              {formatCurrency(netFlow)}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Riwayat Transaksi - {format(monthDate, "MMMM yyyy", { locale: id })}
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {filteredTransactions.map((trx) => (
            <div
              key={trx.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--space-4)",
                background: "var(--bg-input)",
                borderRadius: "var(--radius-lg)",
                borderLeft: `3px solid ${
                  trx.type === "in" ? "var(--success-500)" : "var(--danger-500)"
                }`,
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
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-md)",
                    background:
                      trx.type === "in"
                        ? "rgba(34, 197, 94, 0.15)"
                        : "rgba(239, 68, 68, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color:
                      trx.type === "in"
                        ? "var(--success-400)"
                        : "var(--danger-400)",
                  }}
                >
                  {trx.type === "in" ? (
                    <ArrowDownRight size={20} />
                  ) : (
                    <ArrowUpRight size={20} />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: "500" }}>{trx.description}</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      fontSize: "var(--text-xs)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Calendar size={12} />
                      {format(parseISO(trx.date), "d MMM yyyy", { locale: id })}
                    </span>
                    <span className="badge badge-gray">{trx.category}</span>
                  </div>
                </div>
              </div>

              <div
                className="font-mono font-bold"
                style={{
                  fontSize: "var(--text-base)",
                  color:
                    trx.type === "in"
                      ? "var(--success-400)"
                      : "var(--danger-400)",
                }}
              >
                {trx.type === "in" ? "+" : "-"}
                {formatCurrency(trx.amount)}
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "var(--space-12)",
              color: "var(--text-muted)",
            }}
          >
            <Wallet
              size={48}
              style={{ marginBottom: "var(--space-3)", opacity: 0.5 }}
            />
            <p>Tidak ada transaksi untuk periode ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
