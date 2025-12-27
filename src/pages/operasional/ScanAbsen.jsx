import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import {
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Building2,
  Zap,
  AlertCircle,
  CameraOff,
  LogIn,
  LogOut,
  Home,
  User,
} from "lucide-react";

export default function ScanAbsen() {
  const { workers, projects, attendance, addAttendance } = useData();
  const toast = useToast();

  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [todayScans, setTodayScans] = useState([]);

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = "qr-reader";

  // Get today's date string
  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Get current time string
  const getTimeString = () => {
    return new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Load today's scans from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("todayScans");
    const savedDate = localStorage.getItem("todayScansDate");
    const today = getTodayString();

    if (saved && savedDate === today) {
      setTodayScans(JSON.parse(saved));
    } else {
      // Clear old data if it's a new day
      localStorage.setItem("todayScans", JSON.stringify([]));
      localStorage.setItem("todayScansDate", today);
      setTodayScans([]);
    }
  }, []);

  // Save todayScans to localStorage whenever it changes
  useEffect(() => {
    if (todayScans.length > 0) {
      localStorage.setItem("todayScans", JSON.stringify(todayScans));
      localStorage.setItem("todayScansDate", getTodayString());
    }
  }, [todayScans]);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Get employee's attendance status for today
  const getEmployeeTodayStatus = (employeeId) => {
    const employeeScans = todayScans.filter((s) => s.employeeId === employeeId);
    if (employeeScans.length === 0) {
      return { status: "not_checked_in", lastScan: null, scans: [] };
    }

    const lastScan = employeeScans[employeeScans.length - 1];
    return {
      status: lastScan.type,
      lastScan,
      scans: employeeScans,
    };
  };

  // Determine next attendance type based on current status
  const getNextAttendanceType = (currentStatus, lastScan) => {
    switch (currentStatus) {
      case "not_checked_in":
        return "checkin";
      case "checkin":
        return "checkout";
      case "checkout":
        return "checkin"; // Can check in again to another project
      case "pulang":
        return "already_done"; // Already done for the day
      default:
        return "checkin";
    }
  };

  const handleStartScan = async () => {
    if (!selectedProject) {
      setError("Silakan pilih proyek terlebih dahulu");
      return;
    }

    setError(null);
    setIsInitializing(true);
    setLastScan(null);

    // Set scanning true first so container becomes visible
    setIsScanning(true);

    // Wait for DOM to update with visible container
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // Clear any existing scanner
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {
          // Ignore stop errors
        }
      }

      html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          console.log("QR Code detected:", decodedText);
          handleScanSuccess(decodedText);
        },
        () => {
          // Error callback (QR not found in frame) - silent
        }
      );

      setIsInitializing(false);
    } catch (err) {
      setIsInitializing(false);
      setIsScanning(false);
      setError(
        err.message?.includes("Permission")
          ? "Izin kamera ditolak. Harap izinkan akses kamera."
          : err.message?.includes("NotFound") ||
            err.message?.includes("no camera")
          ? "Kamera tidak ditemukan. Pastikan perangkat memiliki kamera."
          : `Gagal mengakses kamera: ${err.message || "Unknown error"}`
      );
      console.error("Camera error:", err);
    }
  };

  const handleStopScan = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      }
    } catch (err) {
      console.error("Stop error:", err);
    }
    setIsScanning(false);
    setIsInitializing(false);
  };

  const handleScanSuccess = (decodedText) => {
    // Vibrate on mobile if supported
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    // Try to parse QR data
    let qrData = null;
    try {
      qrData = JSON.parse(decodedText);
    } catch {
      // If not JSON, try to find employee by name
      const foundWorker = workers.find(
        (w) => w.name.toLowerCase() === decodedText.toLowerCase()
      );
      if (foundWorker) {
        qrData = {
          type: "ATTENDANCE",
          employeeId: foundWorker.id,
          nip: foundWorker.nip,
          name: foundWorker.name,
        };
      }
    }

    // Validate QR data
    if (!qrData || qrData.type !== "ATTENDANCE") {
      setError("QR Code tidak valid. Gunakan QR dari kartu pegawai.");
      setLastScan({ success: false, error: "QR tidak valid" });
      handleStopScan();
      return;
    }

    // Find employee in workers list
    let employee = workers.find((w) => w.id === qrData.employeeId);
    if (!employee) {
      // Try to find by NIP
      employee = workers.find((w) => w.nip === qrData.nip);
    }
    if (!employee) {
      // Try to find by name
      employee = workers.find(
        (w) => w.name.toLowerCase() === qrData.name.toLowerCase()
      );
    }

    if (!employee) {
      setError(`Pegawai "${qrData.name}" tidak ditemukan dalam database.`);
      setLastScan({ success: false, error: "Pegawai tidak ditemukan" });
      handleStopScan();
      return;
    }

    // Get selected project details
    const project = projects.find((p) => p.id === selectedProject);
    if (!project) {
      setError("Proyek tidak valid");
      handleStopScan();
      return;
    }

    // Check today's status for this employee
    const todayStatus = getEmployeeTodayStatus(employee.id);
    let attendanceType = getNextAttendanceType(
      todayStatus.status,
      todayStatus.lastScan
    );

    // If already done for the day
    if (attendanceType === "already_done") {
      setError(`${employee.name} sudah pulang hari ini.`);
      setLastScan({
        success: false,
        name: employee.name,
        error: "Sudah pulang",
      });
      handleStopScan();
      return;
    }

    // Check if this is a checkout and offer "pulang" option
    const isLastCheckout =
      todayStatus.scans.length >= 2 && attendanceType === "checkout";

    const now = new Date();
    const timeStr = getTimeString();

    const scan = {
      id: Date.now(),
      employeeId: employee.id,
      name: employee.name,
      nip: employee.nip || "-",
      time: timeStr,
      timestamp: now.toISOString(),
      date: getTodayString(),
      project: project.name,
      projectId: project.id,
      type: attendanceType,
      success: true,
    };

    // Add to today's scans
    setTodayScans((prev) => [...prev, scan]);
    setLastScan(scan);

    // Also add to global attendance if needed
    if (attendanceType === "checkin" || attendanceType === "checkout") {
      const attendanceRecord = {
        date: getTodayString(),
        workerId: employee.id,
        workerName: employee.name,
        projectId: project.id,
        projectName: project.name,
        type: attendanceType,
        time: timeStr,
        wage: employee.rateNormal || 0,
      };

      addAttendance(attendanceRecord);
    }

    // Show success toast
    const typeLabel =
      attendanceType === "checkin"
        ? "Check-in"
        : attendanceType === "checkout"
        ? "Check-out"
        : "Pulang";
    toast.success(`${typeLabel} berhasil untuk ${employee.name}!`);

    // Stop scanner after successful scan
    handleStopScan();
  };

  const handleMarkPulang = (employeeId, employeeName) => {
    const project = projects.find((p) => p.id === selectedProject);
    const timeStr = getTimeString();

    const scan = {
      id: Date.now(),
      employeeId,
      name: employeeName,
      time: timeStr,
      timestamp: new Date().toISOString(),
      date: getTodayString(),
      project: project?.name || "-",
      projectId: selectedProject,
      type: "pulang",
      success: true,
    };

    setTodayScans((prev) => [...prev, scan]);
    toast.success(`${employeeName} telah ditandai PULANG`);
  };

  // Get active projects only
  const activeProjects = projects.filter(
    (p) => p.status === "active" || p.status === "aktif" || !p.status
  );

  // Get type badge color
  const getTypeBadge = (type) => {
    switch (type) {
      case "checkin":
        return { class: "badge-success", label: "Check-in", icon: LogIn };
      case "checkout":
        return { class: "badge-warning", label: "Check-out", icon: LogOut };
      case "pulang":
        return { class: "badge-secondary", label: "Pulang", icon: Home };
      default:
        return { class: "badge-primary", label: type, icon: Clock };
    }
  };

  return (
    <div className="animate-in">
      {/* Mobile-optimized styles */}
      <style>
        {`
          .scan-page-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-6);
          }

          @media (max-width: 900px) {
            .scan-page-grid {
              grid-template-columns: 1fr;
            }
          }

          .scanner-frame {
            position: relative;
            aspect-ratio: 1;
            min-height: 300px;
            background: linear-gradient(135deg, var(--gray-900), var(--gray-800));
            border-radius: var(--radius-2xl);
            overflow: visible;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .scanner-frame::before {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
            z-index: 0;
          }

          .scanner-corners {
            position: absolute;
            inset: 10%;
            z-index: 30;
            pointer-events: none;
          }

          .scanner-corner {
            position: absolute;
            width: 40px;
            height: 40px;
            border: 4px solid var(--primary-400);
          }

          .scanner-corner.tl { top: 0; left: 0; border-right: none; border-bottom: none; border-radius: 8px 0 0 0; }
          .scanner-corner.tr { top: 0; right: 0; border-left: none; border-bottom: none; border-radius: 0 8px 0 0; }
          .scanner-corner.bl { bottom: 0; left: 0; border-right: none; border-top: none; border-radius: 0 0 0 8px; }
          .scanner-corner.br { bottom: 0; right: 0; border-left: none; border-top: none; border-radius: 0 0 8px 0; }

          @keyframes cornerPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }

          .scanning .scanner-corner {
            animation: cornerPulse 1.5s ease-in-out infinite;
            border-color: var(--success-400);
            box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
          }

          .scan-line {
            position: absolute;
            left: 10%;
            right: 10%;
            height: 3px;
            background: linear-gradient(90deg, transparent, #22c55e, #22c55e, transparent);
            z-index: 30;
            animation: scanMove 2s ease-in-out infinite;
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.5);
          }

          @keyframes scanMove {
            0%, 100% { top: 10%; }
            50% { top: 88%; }
          }

          .scanner-content {
            position: relative;
            z-index: 1;
            text-align: center;
            padding: var(--space-6);
          }

          #qr-reader {
            width: 100% !important;
            border: none !important;
            background: transparent !important;
          }

          #qr-reader video {
            border-radius: var(--radius-xl) !important;
            object-fit: cover !important;
          }

          #qr-reader__scan_region {
            background: transparent !important;
          }

          #qr-reader__scan_region img {
            display: none !important;
          }

          #qr-reader__dashboard {
            display: none !important;
          }
          
          .scan-btn {
            width: 100%;
            padding: var(--space-5) var(--space-6);
            font-size: var(--text-lg);
            font-weight: 600;
            border-radius: var(--radius-xl);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-3);
            transition: all 0.3s ease;
          }

          .scan-btn-primary {
            background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
            color: white;
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
          }

          .scan-btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 30px rgba(59, 130, 246, 0.5);
          }

          .scan-btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .scan-btn-danger {
            background: linear-gradient(135deg, var(--danger-500), var(--danger-600));
            color: white;
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
          }

          .success-card {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: var(--radius-xl);
            padding: var(--space-5);
            margin-top: var(--space-4);
            animation: successPop 0.4s ease-out;
          }

          @keyframes successPop {
            0% { opacity: 0; transform: scale(0.9); }
            50% { transform: scale(1.02); }
            100% { opacity: 1; transform: scale(1); }
          }

          .error-card {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: var(--radius-xl);
            padding: var(--space-4);
            margin-top: var(--space-4);
            display: flex;
            align-items: center;
            gap: var(--space-3);
          }

          .history-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--space-4);
            background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-input));
            border: 1px solid var(--border-color);
            border-radius: var(--radius-xl);
            transition: all 0.2s ease;
          }

          .history-item:hover {
            border-color: var(--primary-500);
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent);
          }

          .avatar-gradient {
            width: 48px;
            height: 48px;
            border-radius: var(--radius-full);
            background: linear-gradient(135deg, var(--primary-500), var(--accent-500));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: var(--text-lg);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid var(--border-color);
            border-top-color: var(--primary-400);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .premium-card {
            background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));
            border: 1px solid var(--border-color);
            border-radius: var(--radius-2xl);
            padding: var(--space-6);
            backdrop-filter: blur(20px);
          }

          @media (max-width: 768px) {
            .premium-card {
              padding: var(--space-4);
              border-radius: var(--radius-xl);
            }

            .scanner-frame {
              border-radius: var(--radius-xl);
            }

            .page-header {
              text-align: center;
            }
          }
        `}
      </style>

      {/* Page Header */}
      <div className="page-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--radius-xl)",
              background:
                "linear-gradient(135deg, var(--primary-500), var(--accent-500))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
            }}
          >
            <QrCode size={24} color="white" />
          </div>
        </div>
        <h1
          className="page-title"
          style={{ textAlign: "center", marginTop: "var(--space-3)" }}
        >
          Scan QR Absensi
        </h1>
        <p
          className="page-subtitle"
          style={{ textAlign: "center", marginTop: "var(--space-1)" }}
        >
          Absensi otomatis menggunakan QR Code
        </p>
      </div>

      <div className="scan-page-grid">
        {/* Scanner Area */}
        <div className="premium-card">
          <div
            className="card-header"
            style={{ border: "none", paddingBottom: "var(--space-3)" }}
          >
            <h3
              className="card-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <Camera size={20} style={{ color: "var(--primary-400)" }} />
              Scanner
            </h3>
            {isScanning && (
              <span
                className="badge badge-success"
                style={{ animation: "cornerPulse 1.5s ease-in-out infinite" }}
              >
                <Zap size={12} />
                Live
              </span>
            )}
          </div>

          {/* Project Selector */}
          <div
            className="form-group"
            style={{ marginBottom: "var(--space-4)" }}
          >
            <label className="form-label">
              <Building2
                size={16}
                style={{ marginRight: 6, verticalAlign: "middle" }}
              />
              Pilih Proyek
            </label>
            <select
              className="form-select"
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setError(null);
              }}
              disabled={isScanning}
            >
              <option value="">-- Pilih Proyek --</option>
              {activeProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Camera Preview */}
          <div className={`scanner-frame ${isScanning ? "scanning" : ""}`}>
            {/* Corner Decorations */}
            <div className="scanner-corners">
              <div className="scanner-corner tl"></div>
              <div className="scanner-corner tr"></div>
              <div className="scanner-corner bl"></div>
              <div className="scanner-corner br"></div>
            </div>

            {/* Scan Line Animation */}
            {isScanning && <div className="scan-line"></div>}

            {/* Scanner Container - Always rendered but visibility controlled */}
            <div
              id={scannerContainerId}
              style={{
                width: "100%",
                height: "100%",
                minHeight: "300px",
                position: "absolute",
                top: 0,
                left: 0,
                display: isScanning ? "block" : "none",
              }}
            />

            {!isScanning && (
              <div className="scanner-content">
                {isInitializing ? (
                  <>
                    <div
                      className="loading-spinner"
                      style={{ margin: "0 auto var(--space-4)" }}
                    ></div>
                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "var(--text-sm)",
                      }}
                    >
                      Mengaktifkan kamera...
                    </p>
                  </>
                ) : (
                  <>
                    <CameraOff
                      size={64}
                      style={{
                        color: "var(--text-muted)",
                        marginBottom: "var(--space-4)",
                        opacity: 0.5,
                      }}
                    />
                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "var(--text-sm)",
                      }}
                    >
                      {selectedProject
                        ? "Tekan tombol untuk mulai scan"
                        : "Pilih proyek terlebih dahulu"}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ marginTop: "var(--space-4)" }}>
            {!isScanning ? (
              <button
                className="scan-btn scan-btn-primary"
                onClick={handleStartScan}
                disabled={isInitializing || !selectedProject}
              >
                <Camera size={22} />
                {isInitializing ? "Memulai..." : "Mulai Scan"}
              </button>
            ) : (
              <button
                className="scan-btn scan-btn-danger"
                onClick={handleStopScan}
              >
                <XCircle size={22} />
                Berhenti Scan
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-card">
              <AlertCircle
                size={24}
                style={{ color: "var(--danger-400)", flexShrink: 0 }}
              />
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    color: "var(--danger-400)",
                    marginBottom: 4,
                  }}
                >
                  Error
                </div>
                <div
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {error}
                </div>
              </div>
            </div>
          )}

          {/* Last Scan Result */}
          {lastScan && lastScan.success && (
            <div className="success-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-4)",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "var(--radius-full)",
                    background:
                      "linear-gradient(135deg, var(--success-500), var(--success-600))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)",
                  }}
                >
                  <CheckCircle2 size={28} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "var(--text-lg)",
                      color: "var(--success-400)",
                    }}
                  >
                    {lastScan.type === "checkin"
                      ? "Check-in Berhasil!"
                      : lastScan.type === "checkout"
                      ? "Check-out Berhasil!"
                      : "Berhasil!"}
                  </div>
                  <div
                    style={{
                      fontWeight: "600",
                      color: "var(--text-primary)",
                      marginTop: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                    }}
                  >
                    <User size={16} />
                    {lastScan.name}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      marginTop: 4,
                    }}
                  >
                    <Building2 size={14} />
                    {lastScan.project}
                    <span style={{ margin: "0 var(--space-2)" }}>•</span>
                    <Clock size={14} />
                    {lastScan.time}
                  </div>
                  {lastScan.nip && lastScan.nip !== "-" && (
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--text-muted)",
                        marginTop: 4,
                      }}
                    >
                      NIP: {lastScan.nip}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scan History */}
        <div className="premium-card">
          <div
            className="card-header"
            style={{ border: "none", paddingBottom: "var(--space-3)" }}
          >
            <h3
              className="card-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <Clock size={20} style={{ color: "var(--primary-400)" }} />
              Riwayat Hari Ini
            </h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setTodayScans([]);
                localStorage.setItem("todayScans", JSON.stringify([]));
              }}
              style={{ padding: "var(--space-2)" }}
              title="Reset riwayat"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {todayScans.length > 0 ? (
              [...todayScans].reverse().map((scan, index) => {
                const typeBadge = getTypeBadge(scan.type);
                const TypeIcon = typeBadge.icon;
                return (
                  <div
                    key={scan.id}
                    className="history-item"
                    style={{
                      animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                      }}
                    >
                      <div className="avatar-gradient">
                        {scan.name.charAt(0)}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: "600",
                            color: "var(--text-primary)",
                          }}
                        >
                          {scan.name}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-2)",
                            fontSize: "var(--text-xs)",
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          <Building2 size={12} />
                          {scan.project}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-1)",
                          fontSize: "var(--text-sm)",
                          fontWeight: "600",
                          color: "var(--text-primary)",
                        }}
                      >
                        <Clock size={14} />
                        {scan.time}
                      </div>
                      <span
                        className={`badge ${typeBadge.class}`}
                        style={{
                          marginTop: 4,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <TypeIcon size={12} />
                        {typeBadge.label}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--space-8)",
                  color: "var(--text-muted)",
                }}
              >
                <QrCode
                  size={48}
                  style={{ marginBottom: "var(--space-3)", opacity: 0.3 }}
                />
                <p>Belum ada scan hari ini</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Tips - Mobile Friendly */}
      <div className="premium-card" style={{ marginTop: "var(--space-6)" }}>
        <h4
          style={{
            marginBottom: "var(--space-4)",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <Zap size={18} style={{ color: "var(--warning-400)" }} />
          Tips Penggunaan
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
              padding: "var(--space-3)",
              background: "var(--bg-tertiary)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-full)",
                background: "rgba(34, 197, 94, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <LogIn size={16} style={{ color: "var(--success-400)" }} />
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "var(--text-sm)" }}>
                Check-in
              </div>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                }}
              >
                Scan pertama saat tiba di proyek
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
              padding: "var(--space-3)",
              background: "var(--bg-tertiary)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-full)",
                background: "rgba(245, 158, 11, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <LogOut size={16} style={{ color: "var(--warning-400)" }} />
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "var(--text-sm)" }}>
                Check-out
              </div>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                }}
              >
                Scan kedua saat selesai dari proyek
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
              padding: "var(--space-3)",
              background: "var(--bg-tertiary)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-full)",
                background: "rgba(59, 130, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Building2 size={16} style={{ color: "var(--primary-400)" }} />
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "var(--text-sm)" }}>
                Pindah Proyek
              </div>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                }}
              >
                Checkout lalu pilih proyek baru, scan lagi
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
