import { useData } from "../context";
import { formatCurrency, getDueDateStatus } from "../utils/helpers";
import {
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
  Calendar,
  Shield,
  HardHat,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from "lucide-react";

// Mini Line Chart Component
function MiniChart({ data = [], color = "var(--primary-500)" }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const height = 60;
  const width = 200;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#chartGradient)" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Circular Progress Component
function CircularProgress({
  value = 0,
  size = 120,
  strokeWidth = 10,
  color = "var(--primary-500)",
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="progress-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="progress-circle-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="var(--bg-tertiary)"
          fill="none"
        />
        <circle
          className="progress-circle-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="progress-circle-text">
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "var(--text-primary)",
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Di Lokasi
        </div>
      </div>
    </div>
  );
}

// Progress Bar Component
function ProgressBar({ value = 0, color = "primary" }) {
  return (
    <div className="progress-bar">
      <div
        className={`progress-fill ${color}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export default function Dashboard() {
  const {
    projects,
    purchases,
    attendance,
    workers,
    loading,
    error,
    refreshData,
    isAPIConfigured,
  } = useData();

  const activeProjects = projects.filter((p) => p.status === "active");
  const today = new Date().toISOString().split("T")[0];
  const todayAttendance = attendance.filter((a) => a.date === today).length;

  // Mock data for chart
  const chartData = [30, 45, 35, 50, 55, 40, 60, 75, 65, 80, 70, 85];

  // Calculate totals
  const totalBudget = activeProjects.reduce(
    (sum, p) => sum + (parseFloat(p.budget) || 0),
    0
  );
  const totalSpent = purchases.reduce(
    (sum, p) => sum + (parseFloat(p.total) || 0),
    0
  );
  const budgetUsed =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Urgent debts
  const urgentDebts = purchases.filter((p) => {
    if (p.status !== "unpaid") return false;
    const dueDateStatus = getDueDateStatus(p.dueDate);
    return (
      dueDateStatus.status === "overdue" ||
      dueDateStatus.status === "today" ||
      dueDateStatus.status === "urgent"
    );
  });

  // Recent purchases for alerts
  const recentPurchases = purchases.slice(0, 3);

  // Stats configuration
  const stats = [
    {
      label: "Total Anggaran Terpakai",
      value: formatCurrency(totalSpent),
      subValue: `/ ${formatCurrency(totalBudget)}`,
      icon: TrendingUp,
      iconClass: "primary",
      change: budgetUsed > 80 ? -5 : 12,
      changeText: `${budgetUsed}% terpakai`,
    },
    {
      label: "Status Jadwal",
      value: activeProjects.length > 0 ? "On Track" : "-",
      subValue: "Sesuai jadwal proyek",
      icon: Calendar,
      iconClass: "success",
      badge: { text: "Aktif", badgeClass: "badge-success" },
    },
    {
      label: "Rekor Keselamatan",
      value: "45",
      subValue: "Hari tanpa insiden",
      icon: Shield,
      iconClass: "accent",
      badge: { text: "Stabil", badgeClass: "badge-primary" },
    },
    {
      label: "Tenaga Kerja Aktif",
      value: workers.length,
      subValue: "Pekerja",
      icon: HardHat,
      iconClass: "warning",
    },
  ];

  // Project phases for timeline
  const projectPhases = [
    {
      name: "Pondasi & Pekerjaan Situs",
      status: "completed",
      date: "1 Sep - 15 Okt",
    },
    {
      name: "Rangka Struktural",
      status: "active",
      date: "16 Okt - 30 Nov",
      delay: "12 Hari Lebih Cepat",
    },
    { name: "Listrik & Perpipaan", status: "pending", date: "1 Des - 15 Jan" },
    { name: "Finishing Interior", status: "pending", date: "16 Jan - 28 Feb" },
  ];

  // Worker allocation data
  const workerAllocation = [
    { label: "Tukang Kayu", value: 40, color: "var(--primary-400)" },
    { label: "Teknisi Listrik", value: 30, color: "var(--accent-400)" },
    { label: "Buruh Umum", value: 30, color: "var(--warning-400)" },
  ];

  // Budget categories
  const budgetCategories = [
    {
      name: "Material",
      actual: totalSpent * 0.4,
      budget: totalBudget * 0.35,
      percentage: 42,
      color: "var(--primary-500)",
    },
    {
      name: "Tenaga Kerja",
      actual: totalSpent * 0.35,
      budget: totalBudget * 0.4,
      percentage: 66,
      color: "var(--success-500)",
    },
    {
      name: "Peralatan",
      actual: totalSpent * 0.15,
      budget: totalBudget * 0.15,
      percentage: 70,
      color: "var(--warning-500)",
    },
    {
      name: "Subkontraktor",
      actual: totalSpent * 0.1,
      budget: totalBudget * 0.1,
      percentage: 45,
      color: "var(--accent-500)",
    },
  ];

  // Recent activities
  const activities = [
    {
      user: "A",
      name: "Admin",
      action: "menyetujui faktur #4093 senilai Rp 2.500.000",
      time: "2 jam lalu",
    },
    {
      user: "S",
      name: "Sistem",
      action: "memperbarui log kehadiran situs",
      time: "4 jam lalu",
    },
    {
      user: "M",
      name: "Manager",
      action: "menambahkan pembelian material baru",
      time: "1 hari lalu",
    },
  ];

  // Helper function to get stat accent color
  const getStatAccent = (iconClass) => {
    switch (iconClass) {
      case "primary":
        return "var(--primary-500)";
      case "success":
        return "var(--success-500)";
      case "warning":
        return "var(--warning-500)";
      default:
        return "var(--accent-500)";
    }
  };

  return (
    <div className="animate-in">
      {/* Header */}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              marginBottom: "var(--space-2)",
            }}
          >
            <h1 className="page-title" style={{ marginBottom: 0 }}>
              Ringkasan Proyek
            </h1>
            <span className="status-badge active">
              <span className="status-dot" />
              Aktif
            </span>
          </div>
          <p className="page-subtitle">
            Terakhir sinkronisasi: Baru saja •{" "}
            <span style={{ color: "var(--primary-400)" }}>
              {activeProjects[0]?.name || "Proyek Alpha"}
            </span>
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            alignItems: "center",
          }}
        >
          <span
            className={`badge ${
              isAPIConfigured ? "badge-success" : "badge-warning"
            }`}
          >
            {isAPIConfigured ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isAPIConfigured ? "Connected" : "Offline"}
          </span>
          <button
            className="btn btn-primary btn-sm"
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Ekspor Laporan
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger mb-6">
          <AlertTriangle size={18} />
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Stats Grid - 4 columns */}
      <div className="dashboard-grid stats mb-6 animate-stagger">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{ "--stat-accent": getStatAccent(stat.iconClass) }}
          >
            <div className={`stat-icon ${stat.iconClass}`}>
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div
                className="stat-value"
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "var(--space-2)",
                }}
              >
                {stat.value}
                {stat.subValue && (
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--text-muted)",
                      fontWeight: "normal",
                    }}
                  >
                    {stat.subValue}
                  </span>
                )}
              </div>
              {stat.change !== undefined && (
                <div
                  className={`stat-change ${
                    stat.change >= 0 ? "positive" : "negative"
                  }`}
                >
                  {stat.change >= 0 ? (
                    <ArrowUpRight size={12} />
                  ) : (
                    <ArrowDownRight size={12} />
                  )}
                  {stat.changeText || `${Math.abs(stat.change)}%`}
                </div>
              )}
              {stat.badge && (
                <span className={`badge ${stat.badge.badgeClass} mt-2`}>
                  {stat.badge.text}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid - Chart + Worker Allocation */}
      <div className="dashboard-grid main gap-6 mb-6">
        {/* Financial Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Tinjauan Keuangan</h3>
              <p className="chart-subtitle">Tren Pengeluaran</p>
            </div>
            <div className="badge badge-primary">6 Bulan Terakhir</div>
          </div>
          <div style={{ height: 180, display: "flex", alignItems: "flex-end" }}>
            <MiniChart data={chartData} color="var(--primary-400)" />
          </div>
          <div className="chart-legend mt-4">
            <div className="chart-legend-item">
              <span
                className="chart-legend-dot"
                style={{ background: "var(--primary-400)" }}
              />
              Pengeluaran
            </div>
            <div className="chart-legend-item">
              <span
                className="chart-legend-dot"
                style={{ background: "var(--success-400)" }}
              />
              Anggaran
            </div>
          </div>
        </div>

        {/* Worker Allocation */}
        <div className="allocation-card">
          <h3 className="chart-title mb-6">Alokasi Tenaga Kerja</h3>
          <div className="allocation-chart">
            <CircularProgress
              value={todayAttendance || workers.length}
              size={140}
              color="var(--primary-500)"
            />
          </div>
          <div className="allocation-legend">
            {workerAllocation.map((item, i) => (
              <div key={i} className="allocation-item">
                <div className="allocation-label">
                  <span
                    className="allocation-dot"
                    style={{ background: item.color }}
                  />
                  {item.label}
                </div>
                <div className="allocation-value">{item.value}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="dashboard-grid half gap-6 mb-6">
        {/* Budget vs Actual */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Anggaran vs. Aktual</h3>
              <p className="text-sm text-muted">Rincian biaya per kategori</p>
            </div>
          </div>
          <div className="grid grid-2 gap-4">
            {budgetCategories.map((cat, i) => (
              <div key={i} className="budget-card">
                <div className="budget-header">
                  <div className="budget-label">
                    <span
                      className="budget-indicator"
                      style={{ background: cat.color }}
                    />
                    {cat.name}
                  </div>
                  <span
                    className={`budget-percentage ${
                      cat.percentage > 80 ? "over" : "under"
                    }`}
                  >
                    {cat.percentage}%
                  </span>
                </div>
                <ProgressBar
                  value={cat.percentage}
                  color={cat.percentage > 80 ? "danger" : "primary"}
                />
                <div className="budget-values">
                  <div className="budget-actual">
                    Terpakai: <span>{formatCurrency(cat.actual)}</span>
                  </div>
                  <div className="budget-planned">
                    Anggaran: <span>{formatCurrency(cat.budget)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Material Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Peringatan Material</h3>
          </div>
          <div className="flex flex-col gap-3">
            {recentPurchases.length > 0 ? (
              recentPurchases.map((purchase, i) => (
                <div key={i} className="alert-card">
                  <div className="alert-card-content">
                    <div
                      className={`alert-card-icon ${
                        i === 0 ? "warning" : "danger"
                      }`}
                    >
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="alert-card-title">
                        {purchase.invoiceNo || `Item #${i + 1}`}
                      </div>
                      <div className="alert-card-subtitle">
                        {formatCurrency(purchase.total)}
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-danger btn-xs">Pesan</button>
                </div>
              ))
            ) : (
              <div className="text-center text-muted p-4">
                Tidak ada peringatan material
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid - Timeline + Activity */}
      <div className="dashboard-grid main gap-6">
        {/* Project Timeline */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Tahapan Proyek</h3>
            <a
              href="#gantt"
              className="text-sm"
              style={{ color: "var(--primary-400)" }}
            >
              Lihat Gantt
            </a>
          </div>
          <div className="timeline">
            {projectPhases.map((phase, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-marker">
                  <div className={`timeline-dot ${phase.status}`}>
                    {phase.status === "completed" && (
                      <CheckCircle2
                        size={12}
                        style={{ color: "white", position: "absolute" }}
                      />
                    )}
                  </div>
                  {i < projectPhases.length - 1 && (
                    <div className="timeline-line" />
                  )}
                </div>
                <div className="timeline-content">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <div className="timeline-title">{phase.name}</div>
                      <div className="timeline-meta">{phase.date}</div>
                    </div>
                    {phase.status === "completed" && (
                      <span className="badge badge-success">Selesai</span>
                    )}
                    {phase.status === "active" && (
                      <span className="badge badge-primary">
                        {phase.delay || "Sedang Berjalan"}
                      </span>
                    )}
                    {phase.status === "pending" && (
                      <span className="badge badge-gray">Menunggu</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Aktivitas Terbaru</h3>
          </div>
          <div className="activity-list">
            {activities.map((activity, i) => (
              <div key={i} className="activity-item">
                <div className="activity-avatar">{activity.user}</div>
                <div className="activity-content">
                  <div className="activity-text">
                    <strong>{activity.name}</strong> {activity.action}
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Urgent Debts Alert */}
          {urgentDebts.length > 0 && (
            <div className="alert alert-warning mt-4">
              <AlertTriangle size={18} />
              <div>
                <strong>Perhatian!</strong> Ada {urgentDebts.length} hutang
                jatuh tempo.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

