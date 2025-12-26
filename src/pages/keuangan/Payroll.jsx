import { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/helpers";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import {
  Wallet,
  Calculator,
  Printer,
  Download,
  Clock,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DateRangePicker from "../../components/DateRangePicker";

export default function Payroll() {
  const { workers, attendance } = useData();
  const toast = useToast();
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [selectedWorker, setSelectedWorker] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Parse selected dates
  const dateStart = parseISO(startDate);
  const dateEnd = parseISO(endDate);

  // Calculate payroll for each worker
  const payrollData = useMemo(() => {
    return workers.map((worker) => {
      // Filter attendance for this worker in selected month
      const workerAttendance = attendance.filter((a) => {
        const attDate = new Date(a.date);
        return (
          a.workerId === worker.id && attDate >= dateStart && attDate <= dateEnd
        );
      });

      // Calculate hours and wages
      let normalHours = 0;
      let overtimeHours = 0;
      let holidayHours = 0;
      let totalDays = workerAttendance.length;

      workerAttendance.forEach((att) => {
        const hours = att.totalHours || 0;
        if (att.isHoliday) {
          holidayHours += hours;
        } else {
          // First 8 hours are normal, rest is overtime
          const normal = Math.min(hours, 8);
          const overtime = Math.max(0, hours - 8);
          normalHours += normal;
          overtimeHours += overtime;
        }
      });

      // Calculate wages
      const normalWage = normalHours * worker.rateNormal;
      const overtimeWage = overtimeHours * worker.rateOvertime;
      const holidayWage = holidayHours * worker.rateHoliday;
      const totalWage = normalWage + overtimeWage + holidayWage;

      return {
        ...worker,
        totalDays,
        normalHours,
        overtimeHours,
        holidayHours,
        totalHours: normalHours + overtimeHours + holidayHours,
        normalWage,
        overtimeWage,
        holidayWage,
        totalWage,
      };
    });
  }, [workers, attendance, dateStart, dateEnd]);

  // Filter by selected worker
  const filteredPayroll =
    selectedWorker === "all"
      ? payrollData
      : payrollData.filter((p) => p.id === selectedWorker);

  // Summary totals
  const totalPayroll = filteredPayroll.reduce((sum, p) => sum + p.totalWage, 0);
  const totalNormal = filteredPayroll.reduce((sum, p) => sum + p.normalWage, 0);
  const totalOvertime = filteredPayroll.reduce(
    (sum, p) => sum + p.overtimeWage,
    0
  );
  const totalHoliday = filteredPayroll.reduce(
    (sum, p) => sum + p.holidayWage,
    0
  );

  // Print slip
  const handlePrintSlip = (worker) => {
    toast.info(`Cetak slip gaji untuk ${worker.name}`);
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
          <h1 className="page-title">Payroll / Penggajian</h1>
          <p className="page-subtitle">
            Generate gaji otomatis berdasarkan absensi
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button className="btn btn-secondary">
            <Download size={18} />
            Export Excel
          </button>
          <button className="btn btn-primary">
            <Printer size={18} />
            Cetak Semua Slip
          </button>
        </div>
      </div>

      {/* Summary Stats */}
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
            <div className="stat-label">Total Pekerja Aktif</div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "var(--space-2)",
              }}
            >
              <div className="stat-value">{workers.length}</div>
              <span
                className="badge badge-success"
                style={{ fontSize: "var(--text-xs)" }}
              >
                +2 Baru
              </span>
            </div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                marginTop: "var(--space-1)",
              }}
            >
              {workers.filter((w) => w.skill !== "Ahli").length} Tukang •{" "}
              {workers.filter((w) => w.skill === "Ahli").length} Mandor
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--success-500)" }}
        >
          <div className="stat-icon success">
            <Wallet size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Estimasi Total Gaji</div>
            <div className="stat-value" style={{ fontSize: "var(--text-xl)" }}>
              {formatCurrency(totalPayroll)}
            </div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                marginTop: "var(--space-1)",
              }}
            >
              65% dana tersedia di kas kecil
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--warning-500)" }}
        >
          <div className="stat-icon warning">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Status Pembayaran</div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "var(--space-2)",
              }}
            >
              <div className="stat-value">
                {filteredPayroll.filter((p) => p.totalWage > 0).length}
              </div>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-muted)",
                }}
              >
                Menunggu
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                marginTop: "var(--space-2)",
              }}
            >
              {/* Stacked Avatars */}
              <div style={{ display: "flex", marginLeft: "-4px" }}>
                {filteredPayroll.slice(0, 3).map((w, i) => (
                  <div
                    key={w.id}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "var(--radius-full)",
                      background: `linear-gradient(135deg, hsl(${
                        i * 60 + 200
                      }, 70%, 50%), hsl(${i * 60 + 200}, 70%, 40%))`,
                      border: "2px solid var(--bg-primary)",
                      marginLeft: i > 0 ? "-8px" : "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "600",
                    }}
                  >
                    {w.name.charAt(0)}
                  </div>
                ))}
              </div>
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--warning-400)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Perlu persetujuan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Stats */}
      <div
        className="grid gap-4 mb-6"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div
          style={{
            padding: "var(--space-4)",
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
            Gaji Normal
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: "600",
              color: "var(--success-400)",
            }}
          >
            {formatCurrency(totalNormal)}
          </div>
        </div>
        <div
          style={{
            padding: "var(--space-4)",
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
            Gaji Lembur
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: "600",
              color: "var(--warning-400)",
            }}
          >
            {formatCurrency(totalOvertime)}
          </div>
        </div>
        <div
          style={{
            padding: "var(--space-4)",
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
            Gaji Hari Libur
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: "600",
              color: "var(--accent-400)",
            }}
          >
            {formatCurrency(totalHoliday)}
          </div>
        </div>
        <div
          style={{
            padding: "var(--space-4)",
            background:
              "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
            borderRadius: "var(--radius-xl)",
          }}
        >
          <div
            style={{
              fontSize: "var(--text-xs)",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "var(--space-1)",
            }}
          >
            Grand Total
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: "700",
              color: "white",
            }}
          >
            {formatCurrency(totalPayroll)}
          </div>
        </div>
      </div>

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
            alignItems: "flex-end",
          }}
        >
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            label="Periode Gaji"
          />

          <div
            className="form-group"
            style={{ minWidth: "200px", marginBottom: 0 }}
          >
            <label className="form-label">Pegawai</label>
            <select
              className="form-select"
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
            >
              <option value="all">Semua Pegawai</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary">
            <Calculator size={18} />
            Hitung Gaji
          </button>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Daftar Gaji - {format(dateStart, "d MMM", { locale: id })} s/d{" "}
            {format(dateEnd, "d MMM yyyy", { locale: id })}
          </h3>
          <span className="badge badge-primary">
            <Users size={14} />
            {filteredPayroll.length} Pegawai
          </span>
        </div>

        <div className="table-container" style={{ border: "none" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Pegawai</th>
                <th style={{ textAlign: "center" }}>Hari Kerja</th>
                <th style={{ textAlign: "right" }}>Jam Normal</th>
                <th style={{ textAlign: "right" }}>Jam Lembur</th>
                <th style={{ textAlign: "right" }}>Jam Libur</th>
                <th style={{ textAlign: "right" }}>Gaji Normal</th>
                <th style={{ textAlign: "right" }}>Gaji Lembur</th>
                <th style={{ textAlign: "right" }}>Gaji Libur</th>
                <th style={{ textAlign: "right" }}>Total Gaji</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayroll
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((worker) => (
                  <tr key={worker.id}>
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
                            borderRadius: "var(--radius-full)",
                            background:
                              worker.skill === "Ahli"
                                ? "linear-gradient(135deg, var(--primary-500), var(--primary-700))"
                                : "var(--gray-600)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "var(--text-sm)",
                            fontWeight: "600",
                          }}
                        >
                          {worker.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: "500" }}>{worker.name}</div>
                          <div
                            style={{
                              fontSize: "var(--text-xs)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {worker.skill}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className="badge badge-primary">
                        {worker.totalDays} hari
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }} className="font-mono">
                      {worker.normalHours} jam
                    </td>
                    <td style={{ textAlign: "right" }} className="font-mono">
                      {worker.overtimeHours} jam
                    </td>
                    <td style={{ textAlign: "right" }} className="font-mono">
                      {worker.holidayHours} jam
                    </td>
                    <td style={{ textAlign: "right" }} className="font-mono">
                      {formatCurrency(worker.normalWage)}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        color:
                          worker.overtimeWage > 0
                            ? "var(--warning-400)"
                            : "inherit",
                      }}
                      className="font-mono"
                    >
                      {formatCurrency(worker.overtimeWage)}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        color:
                          worker.holidayWage > 0
                            ? "var(--accent-400)"
                            : "inherit",
                      }}
                      className="font-mono"
                    >
                      {formatCurrency(worker.holidayWage)}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: "700",
                        color: "var(--success-400)",
                      }}
                      className="font-mono"
                    >
                      {formatCurrency(worker.totalWage)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handlePrintSlip(worker)}
                        title="Cetak Slip"
                      >
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--bg-tertiary)" }}>
                <td colSpan="5" style={{ fontWeight: "600" }}>
                  TOTAL
                </td>
                <td
                  style={{ textAlign: "right", fontWeight: "600" }}
                  className="font-mono"
                >
                  {formatCurrency(totalNormal)}
                </td>
                <td
                  style={{ textAlign: "right", fontWeight: "600" }}
                  className="font-mono"
                >
                  {formatCurrency(totalOvertime)}
                </td>
                <td
                  style={{ textAlign: "right", fontWeight: "600" }}
                  className="font-mono"
                >
                  {formatCurrency(totalHoliday)}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: "700",
                    fontSize: "var(--text-base)",
                    color: "var(--success-400)",
                  }}
                  className="font-mono"
                >
                  {formatCurrency(totalPayroll)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        {filteredPayroll.length > 0 && (
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
                {Math.min(currentPage * itemsPerPage, filteredPayroll.length)}
              </strong>{" "}
              dari <strong>{filteredPayroll.length}</strong> pegawai
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
                Sebelumnya
              </button>

              {Array.from(
                {
                  length: Math.min(
                    Math.ceil(filteredPayroll.length / itemsPerPage),
                    3
                  ),
                },
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

              {Math.ceil(filteredPayroll.length / itemsPerPage) > 3 && (
                <span style={{ color: "var(--text-muted)" }}>...</span>
              )}

              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(
                      Math.ceil(filteredPayroll.length / itemsPerPage),
                      p + 1
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredPayroll.length / itemsPerPage)
                }
              >
                Selanjutnya
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {filteredPayroll.length === 0 && (
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
            <p>Tidak ada data gaji untuk periode ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
