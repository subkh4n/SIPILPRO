import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
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
} from "lucide-react";

export default function ScanAbsen() {
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [error, setError] = useState(null);
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

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = "qr-reader";

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleStartScan = async () => {
    setError(null);
    setIsInitializing(true);
    setLastScan(null);

    try {
      html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Success callback
          handleScanSuccess(decodedText);
        },
        () => {
          // Error callback (QR not found in frame) - silent
        }
      );

      setIsScanning(true);
      setIsInitializing(false);
    } catch (err) {
      setIsInitializing(false);
      setError(
        err.message.includes("Permission")
          ? "Izin kamera ditolak. Harap izinkan akses kamera."
          : "Gagal mengakses kamera. Pastikan perangkat memiliki kamera."
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

    // Parse QR data (expected format: "EMPLOYEE_ID:PROJECT_ID" or just employee name for demo)
    const names = ["Budi", "Agus", "Dedi", "Eko", "Faisal", "Gani", "Hadi"];
    const projects = ["Ruko Blok A", "Rumah Cluster B", "Gudang Industri"];

    // For demo, use scanned text as name or random if not recognized
    const employeeName = names.includes(decodedText)
      ? decodedText
      : names[Math.floor(Math.random() * names.length)];
    const projectName = projects[Math.floor(Math.random() * projects.length)];

    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const scan = {
      id: Date.now(),
      name: employeeName,
      time: timeStr,
      project: projectName,
      type: "masuk",
      success: true,
      rawData: decodedText,
    };

    setLastScan(scan);
    setScanHistory((prev) => [scan, ...prev.slice(0, 9)]);

    // Stop scanner after successful scan
    handleStopScan();
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
            inset: 15%;
            z-index: 2;
            pointer-events: none;
          }

          .scanner-corner {
            position: absolute;
            width: 30px;
            height: 30px;
            border: 3px solid var(--primary-400);
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
            left: 15%;
            right: 15%;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--primary-400), transparent);
            z-index: 3;
            animation: scanMove 2s ease-in-out infinite;
          }

          @keyframes scanMove {
            0%, 100% { top: 15%; }
            50% { top: 83%; }
          }

          .scanner-content {
            position: relative;
            z-index: 1;
            text-align: center;
            padding: var(--space-6);
          }

          #qr-reader {
            width: 100% !important;
            height: 100% !important;
            min-height: 300px !important;
            border: none !important;
            background: transparent !important;
            position: relative !important;
            z-index: 10 !important;
          }

          #qr-reader video {
            width: 100% !important;
            height: 100% !important;
            min-height: 300px !important;
            border-radius: var(--radius-xl) !important;
            object-fit: cover !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 5 !important;
          }

          #qr-reader__scan_region {
            background: transparent !important;
            min-height: 250px !important;
          }

          #qr-reader__scan_region img {
            display: none !important;
          }

          #qr-reader__dashboard {
            display: none !important;
          }

          #qr-reader__header_message {
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

          .scan-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 30px rgba(59, 130, 246, 0.5);
          }

          .scan-btn-primary:active {
            transform: translateY(0);
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

            {/* Scanner Container or Placeholder */}
            <div
              id={scannerContainerId}
              style={{
                width: "100%",
                height: "100%",
                minHeight: "300px",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 20,
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
                      Tekan tombol untuk mulai scan
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
                disabled={isInitializing}
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
                  Gagal Mengakses Kamera
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
          {lastScan && (
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
                    Berhasil!
                  </div>
                  <div
                    style={{
                      fontWeight: "600",
                      color: "var(--text-primary)",
                      marginTop: 2,
                    }}
                  >
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
              onClick={() => setScanHistory([])}
              style={{ padding: "var(--space-2)" }}
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            {scanHistory.length > 0 ? (
              scanHistory.map((scan, index) => (
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
                    <div className="avatar-gradient">{scan.name.charAt(0)}</div>
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
                      className={`badge ${
                        scan.type === "masuk"
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                      style={{ marginTop: 4 }}
                    >
                      {scan.type === "masuk" ? "Masuk" : "Keluar"}
                    </span>
                  </div>
                </div>
              ))
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
          Tips Cepat
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
                background: "rgba(59, 130, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "var(--primary-400)", fontWeight: "700" }}>
                1
              </span>
            </div>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--text-secondary)",
              }}
            >
              Tekan "Mulai Scan" untuk mengaktifkan kamera
            </p>
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
                background: "rgba(34, 197, 94, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "var(--success-400)", fontWeight: "700" }}>
                2
              </span>
            </div>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--text-secondary)",
              }}
            >
              Arahkan kamera ke QR Code pada kartu pegawai
            </p>
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
                background: "rgba(139, 92, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "var(--accent-400)", fontWeight: "700" }}>
                3
              </span>
            </div>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--text-secondary)",
              }}
            >
              Kehadiran otomatis tercatat setelah scan berhasil
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
