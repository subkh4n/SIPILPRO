import { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { formatCurrency } from "../../utils/helpers";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import {
  Wallet,
  Users,
  Clock,
  AlertTriangle,
  Download,
  Plus,
  Filter,
  CheckCircle,
  FileText,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default function LaporanPayroll() {
  const { workers, attendance } = useData();
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Build payroll data
  const payrollData = useMemo(() => {
    const mStart = startOfMonth(new Date(selectedMonth + "-01"));
    const mEnd = endOfMonth(new Date(selectedMonth + "-01"));

    return workers.map((worker, index) => {
      const workerAttendance = attendance.filter((a) => {
        try {
          const attDate = parseISO(a.date);
          return (
            a.workerId === worker.id && attDate >= mStart && attDate <= mEnd
          );
        } catch {
          return false;
        }
      });

      const totalDays = workerAttendance.length;
      let normalHours = 0;
      let overtimeHours = 0;
      let holidayHours = 0;

      workerAttendance.forEach((att) => {
        const hours = att.totalHours || 8;
        if (att.isHoliday) {
          holidayHours += hours;
        } else {
          normalHours += Math.min(hours, 8);
          overtimeHours += Math.max(0, hours - 8);
        }
      });

      const normalWage = normalHours * (worker.rateNormal || 25000);
      const overtimeWage = overtimeHours * (worker.rateOvertime || 35000);
      const holidayWage = holidayHours * (worker.rateHoliday || 50000);
      const totalWage = normalWage + overtimeWage + holidayWage;

      // Random status for demo
      const statuses = ["paid", "pending", "approved", "rejected"];
      const status = statuses[index % statuses.length];

      return {
        id: worker.id,
        name: worker.name,
        skill: worker.skill,
        payrollId: `PAY-${selectedMonth.replace("-", "")}-${String(
          worker.id
        ).padStart(3, "0")}`,
        period: selectedMonth,
        totalDays,
        normalHours,
        overtimeHours,
        holidayHours,
        totalHours: normalHours + overtimeHours + holidayHours,
        normalWage,
        overtimeWage,
        holidayWage,
        totalWage,
        status,
        paidDate: status === "paid" ? format(new Date(), "yyyy-MM-dd") : null,
      };
    });
  }, [workers, attendance, selectedMonth]);

  // Filter by tab
  const filteredByTab = useMemo(() => {
    if (activeTab === "all") return payrollData;
    return payrollData.filter((p) => p.status === activeTab);
  }, [payrollData, activeTab]);

  // Sort
  const sortedData = useMemo(() => {
    const sorted = [...filteredByTab];
    switch (sortBy) {
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "amount_high":
        sorted.sort((a, b) => b.totalWage - a.totalWage);
        break;
      case "amount_low":
        sorted.sort((a, b) => a.totalWage - b.totalWage);
        break;
      case "status":
        sorted.sort((a, b) => a.status.localeCompare(b.status));
        break;
      default:
        break;
    }
    return sorted;
  }, [filteredByTab, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalOutstanding = payrollData.reduce((sum, p) => sum + p.totalWage, 0);
  const pendingCount = payrollData.filter((p) => p.status === "pending").length;
  const pendingAmount = payrollData
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.totalWage, 0);
  const paidAmount = payrollData
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.totalWage, 0);
  const approvalCount = payrollData.filter(
    (p) => p.status === "approved"
  ).length;

  // Get avatar color
  const getAvatarColor = (name) => {
    const colors = [
      "linear-gradient(135deg, #667eea, #764ba2)",
      "linear-gradient(135deg, #f093fb, #f5576c)",
      "linear-gradient(135deg, #4facfe, #00f2fe)",
      "linear-gradient(135deg, #43e97b, #38f9d7)",
      "linear-gradient(135deg, #fa709a, #fee140)",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  // Status config
  const statusConfig = {
    paid: {
      label: "Paid",
      color: "var(--success-400)",
      bg: "rgba(34, 197, 94, 0.15)",
    },
    pending: {
      label: "Pending",
      color: "var(--warning-400)",
      bg: "rgba(245, 158, 11, 0.15)",
    },
    approved: {
      label: "Approved",
      color: "var(--primary-400)",
      bg: "rgba(59, 130, 246, 0.15)",
    },
    rejected: {
      label: "Rejected",
      color: "var(--danger-400)",
      bg: "rgba(239, 68, 68, 0.15)",
    },
  };

  // Tabs
  const tabs = [
    { id: "all", label: "Semua", count: payrollData.length },
    {
      id: "pending",
      label: "Menunggu",
      count: payrollData.filter((p) => p.status === "pending").length,
    },
    {
      id: "approved",
      label: "Disetujui",
      count: payrollData.filter((p) => p.status === "approved").length,
    },
    {
      id: "paid",
      label: "Dibayar",
      count: payrollData.filter((p) => p.status === "paid").length,
    },
  ];

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
          <h1 className="page-title">Laporan Penggajian</h1>
          <p className="page-subtitle">
            Kelola laporan gaji pekerja dan jadwal pembayaran.
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button className="btn btn-secondary">
            <Download size={18} />
            Export Report
          </button>
          <button className="btn btn-primary">
            <Plus size={18} />
            Proses Gaji
          </button>
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "var(--space-3)",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              TOTAL GAJI BULAN INI
            </span>
            <Wallet size={18} style={{ color: "var(--primary-400)" }} />
          </div>
          <div
            className="font-mono"
            style={{ fontSize: "var(--text-2xl)", fontWeight: "700" }}
          >
            {formatCurrency(totalOutstanding)}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginTop: "var(--space-2)",
              fontSize: "var(--text-xs)",
              color: "var(--success-400)",
            }}
          >
            <TrendingUp size={12} />
            2.4% vs bulan lalu
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "var(--space-3)",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              MENUNGGU PEMBAYARAN
            </span>
            <AlertTriangle size={18} style={{ color: "var(--warning-400)" }} />
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: "700",
              color: "var(--warning-400)",
            }}
          >
            {formatCurrency(pendingAmount)}
          </div>
          <div
            style={{
              marginTop: "var(--space-2)",
              fontSize: "var(--text-xs)",
              color: "var(--danger-400)",
            }}
          >
            {pendingCount} Slip Gaji
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "var(--space-3)",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              SUDAH DIBAYAR
            </span>
            <CheckCircle size={18} style={{ color: "var(--success-400)" }} />
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: "700",
              color: "var(--success-400)",
            }}
          >
            {formatCurrency(paidAmount)}
          </div>
          <div
            style={{
              marginTop: "var(--space-2)",
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
            }}
          >
            {payrollData.filter((p) => p.status === "paid").length} Pekerja
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "var(--space-3)",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              MENUNGGU PERSETUJUAN
            </span>
            <Clock size={18} style={{ color: "var(--primary-400)" }} />
          </div>
          <div style={{ fontSize: "var(--text-2xl)", fontWeight: "700" }}>
            {approvalCount}
          </div>
          <div
            style={{
              marginTop: "var(--space-2)",
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
            }}
          >
            Perlu direview
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: "var(--space-4)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--space-4)",
            borderBottom: "1px solid var(--border-color)",
            flexWrap: "wrap",
            gap: "var(--space-3)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <button className="btn btn-secondary btn-sm">
              <Filter size={14} />
              Filter
            </button>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                background: "var(--bg-tertiary)",
                borderRadius: "var(--radius-lg)",
                padding: "4px",
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "var(--space-2) var(--space-3)",
                    background:
                      activeTab === tab.id
                        ? "var(--bg-secondary)"
                        : "transparent",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    fontSize: "var(--text-sm)",
                    fontWeight: activeTab === tab.id ? "500" : "400",
                    color:
                      activeTab === tab.id
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            {/* Period Filter */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <Calendar size={16} style={{ color: "var(--text-muted)" }} />
              <input
                type="month"
                className="form-input"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ minWidth: "140px", fontSize: "var(--text-sm)" }}
              />
            </div>

            {/* Sort */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-muted)",
                }}
              >
                SORT BY:
              </span>
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ minWidth: "140px", fontSize: "var(--text-sm)" }}
              >
                <option value="name">Nama (A-Z)</option>
                <option value="amount_high">Gaji Tertinggi</option>
                <option value="amount_low">Gaji Terendah</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container" style={{ border: "none" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input type="checkbox" />
                </th>
                <th>PEKERJA</th>
                <th>NO. SLIP</th>
                <th>PERIODE</th>
                <th style={{ textAlign: "right" }}>TOTAL GAJI</th>
                <th style={{ textAlign: "center" }}>STATUS</th>
                <th style={{ textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((payroll) => (
                <tr key={payroll.id}>
                  <td>
                    <input type="checkbox" />
                  </td>
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
                          background: getAvatarColor(payroll.name),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "var(--text-sm)",
                          fontWeight: "600",
                        }}
                      >
                        {payroll.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: "500" }}>{payroll.name}</div>
                        <div
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {payroll.skill}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: "monospace",
                        color: "var(--primary-400)",
                      }}
                    >
                      #{payroll.payrollId}
                    </span>
                  </td>
                  <td>
                    {format(new Date(payroll.period + "-01"), "MMMM yyyy", {
                      locale: id,
                    })}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span
                      className="font-mono"
                      style={{ fontWeight: "600", color: "var(--success-400)" }}
                    >
                      {formatCurrency(payroll.totalWage)}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 12px",
                        background: statusConfig[payroll.status].bg,
                        borderRadius: "var(--radius-full)",
                        color: statusConfig[payroll.status].color,
                        fontSize: "var(--text-xs)",
                        fontWeight: "500",
                      }}
                    >
                      {statusConfig[payroll.status].label}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {payroll.status === "pending" && (
                      <button className="btn btn-primary btn-sm">Bayar</button>
                    )}
                    {payroll.status === "approved" && (
                      <button className="btn btn-ghost btn-sm">Proses</button>
                    )}
                    {payroll.status === "paid" && (
                      <button className="btn btn-ghost btn-sm">
                        <FileText size={14} />
                        Slip
                      </button>
                    )}
                    {payroll.status === "rejected" && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--warning-400)" }}
                      >
                        Review
                      </button>
                    )}
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
              {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, sortedData.length)}
            </strong>{" "}
            dari <strong>{sortedData.length}</strong> data
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
              Previous
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
              Next
            </button>
          </div>
        </div>

        {/* Empty State */}
        {sortedData.length === 0 && (
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
            <p>Tidak ada data penggajian ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
