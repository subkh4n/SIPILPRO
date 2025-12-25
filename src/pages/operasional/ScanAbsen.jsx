import { useState } from "react";
import {
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  RefreshCw,
  User,
  Clock,
  Building2,
} from "lucide-react";

export default function ScanAbsen() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [scanHistory, setScanHistory] = useState([
    {
      id: 1,
      name: "Budi",
      time: "08:05",
      project: "Ruko Blok A",
      type: "masuk",
    },
    {
      id: 2,
      name: "Agus",
      time: "08:12",
      project: "Rumah Cluster B",
      type: "masuk",
    },
    {
      id: 3,
      name: "Dedi",
      time: "08:15",
      project: "Ruko Blok A",
      type: "masuk",
    },
  ]);

  // Simulate QR scan
  const handleStartScan = () => {
    setIsScanning(true);
    setLastScan(null);
  };

  const handleStopScan = () => {
    setIsScanning(false);
  };

  // Simulate successful scan
  const simulateScan = () => {
    const names = ["Budi", "Agus", "Dedi", "Eko", "Faisal"];
    const projects = ["Ruko Blok A", "Rumah Cluster B", "Gudang Industri"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomProject = projects[Math.floor(Math.random() * projects.length)];
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const scan = {
      id: Date.now(),
      name: randomName,
      time: timeStr,
      project: randomProject,
      type: "masuk",
      success: true,
    };

    setLastScan(scan);
    setScanHistory((prev) => [scan, ...prev]);
    setIsScanning(false);
  };

  return (
    <div className="animate-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Scan QR Absensi</h1>
        <p className="page-subtitle">Absensi otomatis menggunakan QR Code</p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Scanner Area */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Scanner</h3>
          </div>

          {/* Camera Preview */}
          <div
            style={{
              aspectRatio: "4/3",
              background: isScanning
                ? "linear-gradient(135deg, var(--gray-900), var(--gray-800))"
                : "var(--bg-tertiary)",
              borderRadius: "var(--radius-xl)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              marginBottom: "var(--space-4)",
            }}
          >
            {isScanning ? (
              <>
                {/* Scanning Animation */}
                <div
                  style={{
                    position: "absolute",
                    inset: "20%",
                    border: "2px solid var(--primary-500)",
                    borderRadius: "var(--radius-lg)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "20%",
                    left: "20%",
                    right: "20%",
                    height: "2px",
                    background:
                      "linear-gradient(90deg, transparent, var(--primary-400), transparent)",
                    animation: "scan 2s ease-in-out infinite",
                  }}
                />
                <style>
                  {`
                    @keyframes scan {
                      0%, 100% { top: 20%; }
                      50% { top: 78%; }
                    }
                  `}
                </style>
                <QrCode
                  size={80}
                  style={{ color: "var(--primary-400)", opacity: 0.3 }}
                />
                <p
                  style={{
                    marginTop: "var(--space-4)",
                    color: "var(--text-muted)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Arahkan QR Code ke kamera...
                </p>
              </>
            ) : (
              <>
                <Camera
                  size={64}
                  style={{
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-4)",
                  }}
                />
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Kamera tidak aktif
                </p>
              </>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            {!isScanning ? (
              <button
                className="btn btn-primary btn-full"
                onClick={handleStartScan}
              >
                <Camera size={18} />
                Mulai Scan
              </button>
            ) : (
              <>
                <button
                  className="btn btn-secondary btn-full"
                  onClick={handleStopScan}
                >
                  <XCircle size={18} />
                  Berhenti
                </button>
                <button
                  className="btn btn-success btn-full"
                  onClick={simulateScan}
                >
                  <CheckCircle2 size={18} />
                  Simulasi Scan
                </button>
              </>
            )}
          </div>

          {/* Last Scan Result */}
          {lastScan && (
            <div
              style={{
                marginTop: "var(--space-4)",
                padding: "var(--space-4)",
                background: lastScan.success
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
                border: `1px solid ${
                  lastScan.success
                    ? "rgba(34, 197, 94, 0.25)"
                    : "rgba(239, 68, 68, 0.25)"
                }`,
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
                {lastScan.success ? (
                  <CheckCircle2
                    size={24}
                    style={{ color: "var(--success-400)" }}
                  />
                ) : (
                  <XCircle size={24} style={{ color: "var(--danger-400)" }} />
                )}
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      color: lastScan.success
                        ? "var(--success-400)"
                        : "var(--danger-400)",
                    }}
                  >
                    {lastScan.success ? "Berhasil!" : "Gagal"}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {lastScan.name} - {lastScan.project}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scan History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Riwayat Scan Hari Ini</h3>
            <button className="btn btn-ghost btn-sm">
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {scanHistory.map((scan) => (
              <div
                key={scan.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--space-3)",
                  background: "var(--bg-input)",
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
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-full)",
                      background:
                        "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "600",
                    }}
                  >
                    {scan.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: "500" }}>{scan.name}</div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                        fontSize: "var(--text-xs)",
                        color: "var(--text-muted)",
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
                      fontWeight: "500",
                    }}
                  >
                    <Clock size={14} />
                    {scan.time}
                  </div>
                  <span
                    className="badge badge-success"
                    style={{ marginTop: "4px" }}
                  >
                    {scan.type === "masuk" ? "Masuk" : "Keluar"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {scanHistory.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-8)",
                color: "var(--text-muted)",
              }}
            >
              <QrCode
                size={48}
                style={{ marginBottom: "var(--space-3)", opacity: 0.5 }}
              />
              <p>Belum ada scan hari ini</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div
        className="card mt-6"
        style={{ marginTop: "var(--space-6)", padding: "var(--space-4)" }}
      >
        <h4 style={{ marginBottom: "var(--space-3)", fontWeight: "600" }}>
          Cara Penggunaan:
        </h4>
        <ol
          style={{
            paddingLeft: "var(--space-5)",
            color: "var(--text-secondary)",
            fontSize: "var(--text-sm)",
            lineHeight: 1.8,
          }}
        >
          <li>Tekan tombol "Mulai Scan" untuk mengaktifkan kamera</li>
          <li>Arahkan kamera ke QR Code pada kartu pegawai</li>
          <li>Sistem akan otomatis mendeteksi dan mencatat kehadiran</li>
          <li>Hasil scan akan muncul di panel kanan</li>
        </ol>
      </div>
    </div>
  );
}
