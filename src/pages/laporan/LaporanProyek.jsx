import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Printer,
  Download,
  AlertTriangle,
  ExternalLink,
  FolderOpen,
} from "lucide-react";

export default function LaporanProyek() {
  const navigate = useNavigate();
  const data = useData() || {};

  // Safe destructuring with stable defaults
  const projects = useMemo(() => data.projects || [], [data.projects]);
  const purchases = useMemo(() => data.purchases || [], [data.purchases]);
  const attendance = useMemo(() => data.attendance || [], [data.attendance]);

  const [selectedProject, setSelectedProject] = useState("");

  // Get effective selected project (auto-select first if none selected)
  const effectiveSelectedProject =
    selectedProject || (projects.length > 0 ? projects[0].id : "");

  // Get selected project data
  const project = useMemo(() => {
    if (projects.length === 0 || !effectiveSelectedProject) return null;
    return (
      projects.find((p) => p.id === effectiveSelectedProject) || projects[0]
    );
  }, [projects, effectiveSelectedProject]);

  // Calculate project costs from purchases
  const projectCosts = useMemo(() => {
    if (!project)
      return { material: 2500000000, labor: 1200000000, total: 3700000000 };

    // Calculate material costs from purchases
    const materialCost = purchases
      .filter((p) => p.items?.some((item) => item.projectId === project.id))
      .reduce((sum, p) => {
        const projectItems =
          p.items?.filter((item) => item.projectId === project.id) || [];
        return sum + projectItems.reduce((s, item) => s + (item.total || 0), 0);
      }, 0);

    // Calculate labor costs from attendance
    const laborCost = attendance
      .filter((a) => a.sessions?.some((s) => s.projectId === project.id))
      .reduce((sum, a) => sum + (a.wage || 0), 0);

    return {
      material: materialCost || 2500000000,
      labor: laborCost || 1200000000,
      total: (materialCost || 2500000000) + (laborCost || 1200000000),
    };
  }, [project, purchases, attendance]);

  // Budget categories with RAP vs Realisasi
  const budgetCategories = useMemo(() => {
    const rap = project?.rap || 5000000000;
    return [
      {
        name: "Pekerjaan Persiapan",
        rap: rap * 0.1,
        actual: rap * 0.095,
        percentage: 95,
      },
      {
        name: "Struktur Bawah (Pondasi)",
        rap: rap * 0.25,
        actual: rap * 0.22,
        percentage: 88,
        status: "under",
      },
      {
        name: "Struktur Atas (Kolom & Balok)",
        rap: rap * 0.3,
        actual: rap * 0.315,
        percentage: 105,
        status: "over",
      },
      {
        name: "Arsitektur & MEP",
        rap: rap * 0.35,
        actual: rap * 0.07,
        percentage: 20,
      },
    ];
  }, [project]);

  // Show empty state if no projects
  if (projects.length === 0) {
    return (
      <div className="animate-in">
        <div className="page-header">
          <h1 className="page-title">Laporan Proyek</h1>
          <p className="page-subtitle">Ringkasan eksekutif proyek</p>
        </div>
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "var(--space-12)",
            color: "var(--text-muted)",
          }}
        >
          <FolderOpen
            size={48}
            style={{ marginBottom: "var(--space-3)", opacity: 0.5 }}
          />
          <p>Tidak ada proyek tersedia. Tambahkan proyek terlebih dahulu.</p>
        </div>
      </div>
    );
  }

  // Show loading while waiting for project selection
  if (!project) {
    return (
      <div className="animate-in">
        <div className="page-header">
          <h1 className="page-title">Laporan Proyek</h1>
          <p className="page-subtitle">Memuat data proyek...</p>
        </div>
      </div>
    );
  }

  const materialPercentage = Math.round(
    (projectCosts.material / projectCosts.total) * 100
  );
  const laborPercentage = 100 - materialPercentage;

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
          <h1 className="page-title">Ringkasan Eksekutif</h1>
          <p className="page-subtitle">
            Status per {format(new Date(), "d MMMM yyyy", { locale: id })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button className="btn btn-secondary">
            <Printer size={18} />
            Cetak
          </button>
          <button className="btn btn-primary">
            <Download size={18} />
            Unduh PDF
          </button>
        </div>
      </div>

      {/* Project Info Card */}
      <div
        className="card mb-6"
        style={{ marginBottom: "var(--space-6)", padding: "var(--space-5)" }}
      >
        <div
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "var(--space-3)",
          }}
        >
          INFORMASI PROYEK
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "250px repeat(4, 1fr)",
            gap: "var(--space-6)",
            alignItems: "start",
          }}
        >
          {/* Project Dropdown */}
          <div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--danger-400)",
                marginBottom: "var(--space-1)",
              }}
            >
              Nama Proyek
            </div>
            <div style={{ position: "relative" }}>
              <select
                className="form-select"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                style={{
                  fontSize: "var(--text-lg)",
                  fontWeight: "700",
                  padding: "var(--space-3) var(--space-4)",
                  border: "2px solid var(--danger-400)",
                  background: "transparent",
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
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
            <div style={{ fontWeight: "500" }}>
              {project.location || "Jakarta Selatan, DKI Jakarta"}
            </div>
          </div>

          {/* Contractor */}
          <div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                marginBottom: "var(--space-1)",
              }}
            >
              Pemilik
            </div>
            <div style={{ fontWeight: "500" }}>PT. Megah Karya</div>
          </div>

          {/* Start Date */}
          <div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                marginBottom: "var(--space-1)",
              }}
            >
              Tanggal Mulai
            </div>
            <div style={{ fontWeight: "500" }}>
              {project.startDate
                ? format(new Date(project.startDate), "d MMM yyyy", {
                    locale: id,
                  })
                : "1 Jan 2023"}
            </div>
          </div>

          {/* Target Date */}
          <div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                marginBottom: "var(--space-1)",
              }}
            >
              Target Selesai
            </div>
            <div style={{ fontWeight: "500" }}>
              {project.endDate
                ? format(new Date(project.endDate), "d MMM yyyy", {
                    locale: id,
                  })
                : "31 Des 2024"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "var(--space-6)",
          marginBottom: "var(--space-6)",
        }}
      >
        {/* Left: Cost Composition */}
        <div
          className="card"
          onClick={() => navigate("/laporan/detil-biaya")}
          style={{
            padding: "var(--space-5)",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary-400)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.transform = "";
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
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: "600" }}>
              Komposisi Biaya
            </h3>
            <ExternalLink size={16} style={{ color: "var(--text-muted)" }} />
          </div>

          {/* Donut Chart */}
          <div
            style={{
              position: "relative",
              width: "180px",
              height: "180px",
              margin: "0 auto var(--space-4)",
            }}
          >
            <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--bg-tertiary)"
                strokeWidth="15"
              />
              {/* Material segment */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--primary-500)"
                strokeWidth="15"
                strokeDasharray={`${materialPercentage * 2.51} 251`}
              />
              {/* Labor segment */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--warning-500)"
                strokeWidth="15"
                strokeDasharray={`${laborPercentage * 2.51} 251`}
                strokeDashoffset={`-${materialPercentage * 2.51}`}
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
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: "700" }}>
                100%
              </div>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                }}
              >
                Total
              </div>
            </div>
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "var(--space-6)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "var(--radius-full)",
                  background: "var(--primary-500)",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                  }}
                >
                  Material
                </div>
                <div style={{ fontWeight: "600" }}>{materialPercentage}%</div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "var(--radius-full)",
                  background: "var(--warning-500)",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                  }}
                >
                  Upah
                </div>
                <div style={{ fontWeight: "600" }}>{laborPercentage}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Budget vs Realisasi */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <div style={{ marginBottom: "var(--space-4)" }}>
            <h3
              style={{
                fontSize: "var(--text-base)",
                fontWeight: "600",
                marginBottom: "var(--space-1)",
              }}
            >
              Budget (RAP) vs Realisasi
            </h3>
            <div
              style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}
            >
              Satuan dalam Juta Rupiah (IDR)
            </div>
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-4)",
              marginBottom: "var(--space-4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: "var(--primary-500)",
                }}
              />
              <span style={{ fontSize: "var(--text-xs)" }}>RAP (Budget)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: "var(--success-500)",
                }}
              />
              <span style={{ fontSize: "var(--text-xs)" }}>
                Realisasi (Actual)
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: "var(--danger-500)",
                }}
              />
              <span style={{ fontSize: "var(--text-xs)" }}>Over Budget</span>
            </div>
          </div>

          {/* Progress Bars */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            {budgetCategories.map((cat, index) => (
              <div key={index}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  <span style={{ fontSize: "var(--text-sm)" }}>{cat.name}</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {cat.percentage}% Used
                    </span>
                    {cat.status === "over" && (
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--danger-400)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <AlertTriangle size={12} />
                        Over Budget ({cat.percentage}%)
                      </span>
                    )}
                    {cat.status === "under" && (
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--success-400)",
                        }}
                      >
                        Under Budget
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    height: 24,
                    background: "var(--bg-tertiary)",
                    borderRadius: "var(--radius-md)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* RAP Bar (background) */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: "100%",
                      background: "var(--primary-500)",
                      opacity: 0.3,
                    }}
                  />
                  {/* Actual Bar */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: `${Math.min(cat.percentage, 100)}%`,
                      background:
                        cat.status === "over"
                          ? "var(--danger-500)"
                          : "var(--primary-500)",
                      borderRadius: "var(--radius-md)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: "var(--space-2)",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "var(--text-xs)",
                      color: "var(--text-muted)",
                    }}
                  >
                    RAP: {(cat.rap / 1000000).toFixed(0)}jt
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* S-Curve Card */}
      <div className="card" style={{ padding: "var(--space-5)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-4)",
          }}
        >
          <div>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: "600" }}>
              Kurva-S (Arus Kas Kumulatif)
            </h3>
            <div
              style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}
            >
              Progress mingguan proyek (Rencana vs Realisasi)
            </div>
          </div>
          <div style={{ display: "flex", gap: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: 20,
                  height: 2,
                  background: "var(--text-muted)",
                  borderStyle: "dashed",
                }}
              />
              <span style={{ fontSize: "var(--text-xs)" }}>Rencana (Plan)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: 20,
                  height: 3,
                  background: "var(--primary-500)",
                  borderRadius: 2,
                }}
              />
              <span style={{ fontSize: "var(--text-xs)" }}>
                Realisasi (Actual)
              </span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div
          style={{
            height: 250,
            background: "var(--bg-tertiary)",
            borderRadius: "var(--radius-lg)",
            position: "relative",
            padding: "var(--space-4)",
          }}
        >
          {/* Y-axis labels */}
          <div
            style={{
              position: "absolute",
              left: "var(--space-2)",
              top: "var(--space-4)",
              bottom: "var(--space-8)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
            }}
          >
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          {/* Current Progress Indicator */}
          <div
            style={{
              position: "absolute",
              left: "60%",
              top: "28%",
              background: "var(--bg-secondary)",
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              fontWeight: "600",
              color: "var(--primary-400)",
              border: "1px solid var(--border-color)",
            }}
          >
            Saat ini: 72%
          </div>

          {/* Simplified curve representation */}
          <svg
            viewBox="0 0 400 150"
            style={{
              position: "absolute",
              left: 40,
              right: 20,
              top: 20,
              bottom: 40,
              width: "calc(100% - 60px)",
              height: "calc(100% - 60px)",
            }}
          >
            {/* Plan line (dashed) */}
            <path
              d="M 0 140 Q 50 130 100 110 T 200 50 T 300 15 T 400 0"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            {/* Actual line */}
            <path
              d="M 0 140 Q 50 132 100 115 T 200 55 T 250 42"
              fill="none"
              stroke="var(--primary-500)"
              strokeWidth="3"
            />
            {/* Current point */}
            <circle cx="250" cy="42" r="6" fill="var(--primary-500)" />
          </svg>

          {/* X-axis labels */}
          <div
            style={{
              position: "absolute",
              left: 40,
              right: 20,
              bottom: "var(--space-2)",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
            }}
          >
            <span>Mg 1</span>
            <span>Mg 5</span>
            <span>Mg 10</span>
            <span>Mg 15</span>
            <span>Mg 20</span>
            <span>Mg 25</span>
          </div>
        </div>
      </div>
    </div>
  );
}
