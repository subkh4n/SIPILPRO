import { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import {
  isHoliday,
  formatCurrency,
  calculateDuration,
  calculateWage,
} from "../utils/helpers";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Copy, Plus, Trash2, ChevronDown } from "lucide-react";

export default function Absensi() {
  const { workers, projects, addAttendance } = useData();

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [globalProject, setGlobalProject] = useState("all");

  // Initialize rows with empty worker slots
  const [rows, setRows] = useState([
    {
      id: 1,
      workerId: "",
      projectId: "",
      start: "",
      end: "",
      breakTime: 0,
      rateType: "Normal",
    },
  ]);

  // Check if selected date is holiday
  const holidayInfo = useMemo(() => isHoliday(date), [date]);

  // Active projects
  const activeProjects = projects.filter((p) => p.status === "active");

  // Calculate row data
  const calculatedRows = useMemo(() => {
    return rows.map((row) => {
      const worker = workers.find((w) => w.id === row.workerId);
      const duration =
        calculateDuration(row.start, row.end) - row.breakTime / 60;
      const totalHours = Math.max(0, duration);

      let estWage = 0;
      if (worker && totalHours > 0) {
        estWage = calculateWage(totalHours, worker, row.rateType === "Lembur");
      }

      return {
        ...row,
        totalHours: totalHours > 0 ? totalHours.toFixed(1) : "0",
        estWage,
        worker,
      };
    });
  }, [rows, workers]);

  // Add new row
  const addRow = () => {
    const newId = Math.max(...rows.map((r) => r.id), 0) + 1;
    setRows([
      ...rows,
      {
        id: newId,
        workerId: "",
        projectId: globalProject !== "all" ? globalProject : "",
        start: "",
        end: "",
        breakTime: 0,
        rateType: "Normal",
      },
    ]);
  };

  // Remove row
  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows(rows.filter((r) => r.id !== id));
    }
  };

  // Update row field
  const updateRow = (id, field, value) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  // Apply global project filter
  const applyFilter = () => {
    if (globalProject !== "all") {
      setRows(rows.map((r) => ({ ...r, projectId: globalProject })));
    }
  };

  // Copy from yesterday
  const copyFromYesterday = () => {
    // Mock: add some sample data
    setRows([
      {
        id: 1,
        workerId: workers[0]?.id || "",
        projectId: activeProjects[0]?.id || "",
        start: "08:00",
        end: "17:00",
        breakTime: 60,
        rateType: "Normal",
      },
      {
        id: 2,
        workerId: workers[1]?.id || "",
        projectId: activeProjects[0]?.id || "",
        start: "08:00",
        end: "17:00",
        breakTime: 60,
        rateType: "Lembur",
      },
    ]);
  };

  // Save all attendance
  const handleSave = () => {
    const validRows = calculatedRows.filter(
      (r) => r.workerId && r.projectId && r.totalHours > 0
    );

    if (validRows.length === 0) {
      alert("Tidak ada data valid untuk disimpan!");
      return;
    }

    validRows.forEach((row) => {
      addAttendance({
        date,
        workerId: row.workerId,
        sessions: [
          {
            projectId: row.projectId,
            start: row.start,
            end: row.end,
            duration: parseFloat(row.totalHours),
          },
        ],
        totalHours: parseFloat(row.totalHours),
        isHoliday: holidayInfo.isHoliday,
        wage: row.estWage,
      });
    });

    alert(`${validRows.length} data absensi berhasil disimpan!`);
    setRows([
      {
        id: 1,
        workerId: "",
        projectId: "",
        start: "",
        end: "",
        breakTime: 0,
        rateType: "Normal",
      },
    ]);
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
          <h1 className="page-title">Input Absensi</h1>
          <p className="page-subtitle">
            Catat jam kerja untuk{" "}
            <strong>
              {format(new Date(date), "d MMMM yyyy", { locale: id })}
            </strong>
          </p>
        </div>
        <button className="btn btn-secondary" onClick={copyFromYesterday}>
          <Copy size={18} />
          Salin dari Kemarin
        </button>
      </div>

      {/* Filter Section */}
      <div
        className="card mb-6"
        style={{ marginBottom: "var(--space-6)", padding: "var(--space-5)" }}
      >
        <div
          style={{
            display: "flex",
            gap: "var(--space-6)",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div
            className="form-group"
            style={{ flex: 1, minWidth: "200px", marginBottom: 0 }}
          >
            <label
              className="form-label"
              style={{
                textTransform: "uppercase",
                fontSize: "var(--text-xs)",
                letterSpacing: "0.05em",
              }}
            >
              Pilih Tanggal
            </label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div
            className="form-group"
            style={{ flex: 2, minWidth: "250px", marginBottom: 0 }}
          >
            <label
              className="form-label"
              style={{
                textTransform: "uppercase",
                fontSize: "var(--text-xs)",
                letterSpacing: "0.05em",
              }}
            >
              Filter Proyek Global
            </label>
            <select
              className="form-select"
              value={globalProject}
              onChange={(e) => setGlobalProject(e.target.value)}
            >
              <option value="all">Semua Proyek</option>
              {activeProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary" onClick={applyFilter}>
            Terapkan
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "180px 140px 90px 90px 80px 60px 90px 100px 40px",
            gap: "var(--space-3)",
            padding: "var(--space-4)",
            borderBottom: "1px solid var(--border-color)",
            background: "var(--bg-tertiary)",
            borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          }}
        >
          <div
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            Pekerja
          </div>
          <div
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            Proyek
          </div>
          <div
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            Mulai
          </div>
          <div
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            Selesai
          </div>
          <div
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            Istirahat
          </div>
          <div
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            Total
          </div>
          <div
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            Tipe Tarif
          </div>
          <div
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              textAlign: "right",
            }}
          >
            Est. Gaji
          </div>
          <div></div>
        </div>

        {/* Table Rows */}
        {calculatedRows.map((row) => (
          <div
            key={row.id}
            style={{
              display: "grid",
              gridTemplateColumns:
                "180px 140px 90px 90px 80px 60px 90px 100px 40px",
              gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-4)",
              borderBottom: "1px solid var(--border-color)",
              alignItems: "center",
            }}
          >
            {/* Worker Select */}
            <div style={{ position: "relative" }}>
              <select
                className="form-select"
                value={row.workerId}
                onChange={(e) => updateRow(row.id, "workerId", e.target.value)}
                style={{ fontSize: "var(--text-sm)", paddingRight: "2rem" }}
              >
                <option value="">-- Pilih --</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} - {worker.skill?.substring(0, 4)}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Select */}
            <div>
              <select
                className="form-select"
                value={row.projectId}
                onChange={(e) => updateRow(row.id, "projectId", e.target.value)}
                style={{ fontSize: "var(--text-sm)" }}
              >
                <option value="">-- Pilih --</option>
                {activeProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <input
              type="time"
              className="form-input"
              value={row.start}
              onChange={(e) => updateRow(row.id, "start", e.target.value)}
              style={{ fontSize: "var(--text-sm)" }}
            />

            {/* End Time */}
            <input
              type="time"
              className="form-input"
              value={row.end}
              onChange={(e) => updateRow(row.id, "end", e.target.value)}
              style={{ fontSize: "var(--text-sm)" }}
            />

            {/* Break Time */}
            <div style={{ position: "relative" }}>
              <input
                type="number"
                className="form-input"
                value={row.breakTime}
                onChange={(e) =>
                  updateRow(row.id, "breakTime", parseInt(e.target.value) || 0)
                }
                min="0"
                step="15"
                style={{ fontSize: "var(--text-sm)", textAlign: "center" }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                }}
              >
                m
              </span>
            </div>

            {/* Total Hours */}
            <div
              style={{
                fontWeight: "600",
                fontSize: "var(--text-sm)",
                textAlign: "center",
              }}
            >
              {row.totalHours}j
            </div>

            {/* Rate Type Badge */}
            <div>
              <button
                onClick={() =>
                  updateRow(
                    row.id,
                    "rateType",
                    row.rateType === "Normal" ? "Lembur" : "Normal"
                  )
                }
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  border: "none",
                  fontSize: "var(--text-xs)",
                  fontWeight: "500",
                  cursor: "pointer",
                  background:
                    row.rateType === "Normal"
                      ? "rgba(34, 197, 94, 0.15)"
                      : "rgba(245, 158, 11, 0.15)",
                  color:
                    row.rateType === "Normal"
                      ? "var(--success-400)"
                      : "var(--warning-400)",
                }}
              >
                {row.rateType}
              </button>
            </div>

            {/* Estimated Wage */}
            <div
              className="font-mono"
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: "500",
                textAlign: "right",
                color: "var(--text-secondary)",
              }}
            >
              {formatCurrency(row.estWage)}
            </div>

            {/* Delete Button */}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => removeRow(row.id)}
              disabled={rows.length === 1}
              style={{ padding: "var(--space-1)", color: "var(--text-muted)" }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {/* Add Row Button */}
        <div style={{ padding: "var(--space-4)" }}>
          <button
            className="btn btn-ghost"
            onClick={addRow}
            style={{ color: "var(--primary-400)" }}
          >
            <Plus size={18} />
            Tambah Baris Pekerja
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: "var(--space-6)", textAlign: "right" }}>
        <button className="btn btn-primary btn-lg" onClick={handleSave}>
          Simpan Semua Absensi
        </button>
      </div>
    </div>
  );
}
