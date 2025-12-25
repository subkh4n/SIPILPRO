import { useState } from "react";
import { useData } from "../../context/DataContext";
import {
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Image,
  Trash2,
  Eye,
  Send,
} from "lucide-react";

export default function ScanNota() {
  const { vendors, projects } = useData();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [formData, setFormData] = useState({
    vendorId: "",
    projectId: "",
    invoiceNo: "",
    date: "",
    total: "",
  });

  // Simulate file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        simulateOCR();
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate OCR processing
  const simulateOCR = () => {
    setIsProcessing(true);
    setOcrResult(null);

    // Simulate processing delay
    setTimeout(() => {
      const mockResult = {
        invoiceNo: `INV-2025-${Math.floor(Math.random() * 1000)}`,
        date: "2025-12-25",
        vendor: "TB. Sinar Jaya",
        items: [
          {
            name: "Semen Gresik",
            qty: 50,
            unit: "Sak",
            price: 60000,
            total: 3000000,
          },
          {
            name: "Pasir",
            qty: 2,
            unit: "Truck",
            price: 750000,
            total: 1500000,
          },
          {
            name: "Batu Split",
            qty: 1,
            unit: "Truck",
            price: 1000000,
            total: 1000000,
          },
        ],
        total: 5500000,
        confidence: 0.92,
      };

      setOcrResult(mockResult);
      setFormData({
        vendorId: "vnd-001",
        projectId: "",
        invoiceNo: mockResult.invoiceNo,
        date: mockResult.date,
        total: mockResult.total.toString(),
      });
      setIsProcessing(false);
    }, 2000);
  };

  // Clear upload
  const clearUpload = () => {
    setUploadedImage(null);
    setOcrResult(null);
    setFormData({
      vendorId: "",
      projectId: "",
      invoiceNo: "",
      date: "",
      total: "",
    });
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit for verification
  const handleSubmit = () => {
    alert("Nota berhasil dikirim untuk verifikasi!");
    clearUpload();
  };

  return (
    <div className="animate-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Scan Nota / Invoice</h1>
        <p className="page-subtitle">
          Upload foto nota untuk pembacaan otomatis (OCR)
        </p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Upload Area */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Upload Foto Nota</h3>
          </div>

          {!uploadedImage ? (
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "var(--space-12)",
                background: "var(--bg-tertiary)",
                border: "2px dashed var(--border-color)",
                borderRadius: "var(--radius-xl)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <Upload
                size={48}
                style={{
                  color: "var(--text-muted)",
                  marginBottom: "var(--space-4)",
                }}
              />
              <p style={{ fontWeight: "500", marginBottom: "var(--space-2)" }}>
                Klik atau drag foto nota
              </p>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-muted)",
                }}
              >
                Format: JPG, PNG (Maks. 5MB)
              </p>
            </label>
          ) : (
            <div>
              {/* Image Preview */}
              <div
                style={{
                  position: "relative",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  marginBottom: "var(--space-4)",
                }}
              >
                <img
                  src={uploadedImage}
                  alt="Nota"
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                    filter: isProcessing ? "blur(2px)" : "none",
                  }}
                />
                {isProcessing && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0, 0, 0, 0.6)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <Loader2
                      size={48}
                      style={{ marginBottom: "var(--space-3)" }}
                      className="animate-spin"
                    />
                    <p>Memproses OCR...</p>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)" }}>
                <button
                  className="btn btn-secondary btn-full"
                  onClick={clearUpload}
                >
                  <Trash2 size={18} />
                  Hapus
                </button>
                <button className="btn btn-primary btn-full">
                  <Eye size={18} />
                  Lihat Full
                </button>
              </div>
            </div>
          )}

          {/* Camera Button for Mobile */}
          <div style={{ marginTop: "var(--space-4)" }}>
            <label
              className="btn btn-secondary btn-full"
              style={{ cursor: "pointer" }}
            >
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <Camera size={18} />
              Ambil Foto dari Kamera
            </label>
          </div>
        </div>

        {/* OCR Result */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Hasil Pembacaan</h3>
            {ocrResult && (
              <span className="badge badge-success">
                <CheckCircle2 size={12} />
                {Math.round(ocrResult.confidence * 100)}% Akurat
              </span>
            )}
          </div>

          {!ocrResult && !isProcessing && (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-12)",
                color: "var(--text-muted)",
              }}
            >
              <FileText
                size={48}
                style={{ marginBottom: "var(--space-3)", opacity: 0.5 }}
              />
              <p>Upload foto nota untuk memulai</p>
            </div>
          )}

          {isProcessing && (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-12)",
                color: "var(--text-muted)",
              }}
            >
              <Loader2
                size={48}
                style={{ marginBottom: "var(--space-3)" }}
                className="animate-spin"
              />
              <p>Sedang memproses...</p>
            </div>
          )}

          {ocrResult && (
            <div>
              {/* Detected Items */}
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "var(--space-2)",
                }}
              >
                Item Terdeteksi ({ocrResult.items.length})
              </div>

              <div
                className="table-container mb-4"
                style={{ marginBottom: "var(--space-4)" }}
              >
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style={{ textAlign: "right" }}>Qty</th>
                      <th style={{ textAlign: "right" }}>Harga</th>
                      <th style={{ textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ocrResult.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td style={{ textAlign: "right" }}>
                          {item.qty} {item.unit}
                        </td>
                        <td
                          style={{ textAlign: "right" }}
                          className="font-mono"
                        >
                          Rp {item.price.toLocaleString("id-ID")}
                        </td>
                        <td
                          style={{ textAlign: "right" }}
                          className="font-mono"
                        >
                          Rp {item.total.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "var(--bg-tertiary)" }}>
                      <td colSpan="3" style={{ fontWeight: "600" }}>
                        TOTAL
                      </td>
                      <td
                        style={{ textAlign: "right", fontWeight: "700" }}
                        className="font-mono"
                      >
                        Rp {ocrResult.total.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Form to verify/edit */}
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: "1fr 1fr",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div className="form-group">
                  <label className="form-label">No. Invoice</label>
                  <input
                    type="text"
                    name="invoiceNo"
                    className="form-input"
                    value={formData.invoiceNo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal</label>
                  <input
                    type="date"
                    name="date"
                    className="form-input"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Vendor</label>
                  <select
                    name="vendorId"
                    className="form-select"
                    value={formData.vendorId}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Pilih --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Alokasi Proyek</label>
                  <select
                    name="projectId"
                    className="form-select"
                    value={formData.projectId}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Pilih --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                className="btn btn-primary btn-full"
                onClick={handleSubmit}
              >
                <Send size={18} />
                Kirim untuk Verifikasi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
