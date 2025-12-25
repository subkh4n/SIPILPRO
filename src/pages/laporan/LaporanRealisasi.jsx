import { useData } from "../../context/DataContext";
import { formatCurrency } from "../../utils/helpers";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Building2,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

export default function LaporanRealisasi() {
  const { projects, getProjectCosts, purchases, attendance } = useData();

  // Calculate total costs per project with RAP comparison
  const projectRealisasi = projects.map((project) => {
    const costs = getProjectCosts(project.id);
    const rap = parseFloat(project.budget) || 0;
    const realisasi = costs.total;
    const percentage = rap > 0 ? Math.round((realisasi / rap) * 100) : 0;
    const variance = rap - realisasi;
    const status =
      percentage > 100 ? "over" : percentage > 80 ? "warning" : "safe";

    return {
      ...project,
      rap,
      realisasi,
      materialCost: costs.materialCost,
      laborCost: costs.laborCost,
      percentage,
      variance,
      status,
    };
  });

  // Summary stats
  const totalRAP = projectRealisasi.reduce((sum, p) => sum + p.rap, 0);
  const totalRealisasi = projectRealisasi.reduce(
    (sum, p) => sum + p.realisasi,
    0
  );
  const totalVariance = totalRAP - totalRealisasi;
  const overallPercentage =
    totalRAP > 0 ? Math.round((totalRealisasi / totalRAP) * 100) : 0;

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "over":
        return "var(--danger-400)";
      case "warning":
        return "var(--warning-400)";
      default:
        return "var(--success-400)";
    }
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case "over":
        return "badge-danger";
      case "warning":
        return "badge-warning";
      default:
        return "badge-success";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "over":
        return "Melebihi RAP";
      case "warning":
        return "Perhatian";
      default:
        return "Sesuai";
    }
  };

  return (
    <div className="animate-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Laporan Realisasi</h1>
        <p className="page-subtitle">
          Perbandingan Biaya Aktual vs. Rencana Anggaran Proyek (RAP)
        </p>
      </div>

      {/* Summary Stats */}
      <div
        className="grid gap-4 mb-6"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginBottom: "var(--space-6)",
        }}
      >
        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--primary-500)" }}
        >
          <div className="stat-icon primary">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total RAP</div>
            <div className="stat-value small">{formatCurrency(totalRAP)}</div>
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
            <div className="stat-label">Total Realisasi</div>
            <div className="stat-value small">
              {formatCurrency(totalRealisasi)}
            </div>
            <div
              className={`stat-change ${
                overallPercentage > 100 ? "negative" : "positive"
              }`}
            >
              {overallPercentage}% dari RAP
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            "--stat-accent":
              totalVariance >= 0 ? "var(--success-500)" : "var(--danger-500)",
          }}
        >
          <div
            className={`stat-icon ${totalVariance >= 0 ? "success" : "danger"}`}
          >
            {totalVariance >= 0 ? (
              <TrendingDown size={24} />
            ) : (
              <TrendingUp size={24} />
            )}
          </div>
          <div className="stat-content">
            <div className="stat-label">Selisih</div>
            <div className="stat-value small">
              {formatCurrency(Math.abs(totalVariance))}
            </div>
            <div
              className={`stat-change ${
                totalVariance >= 0 ? "positive" : "negative"
              }`}
            >
              {totalVariance >= 0 ? "Di bawah anggaran" : "Di atas anggaran"}
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--warning-500)" }}
        >
          <div className="stat-icon warning">
            <Building2 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Proyek Aktif</div>
            <div className="stat-value">
              {projects.filter((p) => p.status === "active").length}
            </div>
          </div>
        </div>
      </div>

      {/* Project Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Realisasi per Proyek</h3>
          <button className="btn btn-secondary btn-sm">
            <BarChart3 size={16} />
            Export Excel
          </button>
        </div>

        <div className="table-container" style={{ border: "none" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Proyek</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right" }}>RAP</th>
                <th style={{ textAlign: "right" }}>Material</th>
                <th style={{ textAlign: "right" }}>Tenaga Kerja</th>
                <th style={{ textAlign: "right" }}>Total Realisasi</th>
                <th style={{ textAlign: "center" }}>Progress</th>
                <th style={{ textAlign: "right" }}>Selisih</th>
              </tr>
            </thead>
            <tbody>
              {projectRealisasi.map((project) => (
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
                          width: 36,
                          height: 36,
                          borderRadius: "var(--radius-md)",
                          background:
                            project.status === "active"
                              ? "linear-gradient(135deg, var(--primary-500), var(--primary-700))"
                              : "var(--gray-600)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                      >
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: "500" }}>{project.name}</div>
                        <div
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {project.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`badge ${getStatusBadge(project.status)}`}>
                      {project.status === "over" ? (
                        <AlertTriangle size={12} />
                      ) : (
                        <CheckCircle2 size={12} />
                      )}
                      {getStatusText(project.status)}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }} className="font-mono">
                    {formatCurrency(project.rap)}
                  </td>
                  <td style={{ textAlign: "right" }} className="font-mono">
                    {formatCurrency(project.materialCost)}
                  </td>
                  <td style={{ textAlign: "right" }} className="font-mono">
                    {formatCurrency(project.laborCost)}
                  </td>
                  <td
                    style={{ textAlign: "right", fontWeight: "600" }}
                    className="font-mono"
                  >
                    {formatCurrency(project.realisasi)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: "8px",
                          background: "var(--bg-tertiary)",
                          borderRadius: "var(--radius-full)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(project.percentage, 100)}%`,
                            height: "100%",
                            background: getStatusColor(project.status),
                            borderRadius: "var(--radius-full)",
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: "600",
                          color: getStatusColor(project.status),
                          minWidth: "40px",
                        }}
                      >
                        {project.percentage}%
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      color:
                        project.variance >= 0
                          ? "var(--success-400)"
                          : "var(--danger-400)",
                      fontWeight: "600",
                    }}
                    className="font-mono"
                  >
                    {project.variance >= 0 ? "+" : "-"}
                    {formatCurrency(Math.abs(project.variance))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--bg-tertiary)" }}>
                <td colSpan="2" style={{ fontWeight: "600" }}>
                  TOTAL
                </td>
                <td
                  style={{ textAlign: "right", fontWeight: "600" }}
                  className="font-mono"
                >
                  {formatCurrency(totalRAP)}
                </td>
                <td style={{ textAlign: "right" }} className="font-mono">
                  {formatCurrency(
                    projectRealisasi.reduce((sum, p) => sum + p.materialCost, 0)
                  )}
                </td>
                <td style={{ textAlign: "right" }} className="font-mono">
                  {formatCurrency(
                    projectRealisasi.reduce((sum, p) => sum + p.laborCost, 0)
                  )}
                </td>
                <td
                  style={{ textAlign: "right", fontWeight: "600" }}
                  className="font-mono"
                >
                  {formatCurrency(totalRealisasi)}
                </td>
                <td style={{ textAlign: "center", fontWeight: "600" }}>
                  {overallPercentage}%
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: "700",
                    color:
                      totalVariance >= 0
                        ? "var(--success-400)"
                        : "var(--danger-400)",
                  }}
                  className="font-mono"
                >
                  {totalVariance >= 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(totalVariance))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
