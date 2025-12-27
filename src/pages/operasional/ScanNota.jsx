import { useState, useRef } from "react";
import { useData } from "../../context";
import { useToast } from "../../context/ToastContext";
import Tesseract from "tesseract.js";
import {
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  Trash2,
  Eye,
  Send,
  ImagePlus,
  X,
  ZoomIn,
  Plus,
  Calculator,
  Scan,
  AlertTriangle,
  Edit3,
} from "lucide-react";

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

// Parse OCR text to extract items
const parseOcrText = (text) => {
  const lines = text.split("\n").filter((line) => line.trim());
  const items = [];
  let invoiceNo = "";
  let detectedDate = "";

  // Patterns for detecting numbers
  const datePattern = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/;
  const invoicePattern =
    /(?:inv|invoice|no\.?|faktur|nota)[\s:]*([A-Z0-9\-/]+)/i;

  // Try to find invoice number
  const invoiceMatch = text.match(invoicePattern);
  if (invoiceMatch) {
    invoiceNo = invoiceMatch[1];
  }

  // Try to find date
  const dateMatch = text.match(datePattern);
  if (dateMatch) {
    detectedDate = dateMatch[1];
  }

  // Parse each line for potential items
  lines.forEach((line, index) => {
    // Skip very short lines or lines that look like headers
    if (line.length < 3) return;
    if (/^(total|subtotal|ppn|tax|diskon|discount)/i.test(line.trim())) return;

    // Look for lines with numbers (potential items with prices)
    const numbers = line.match(/[\d.,]+/g);
    if (numbers && numbers.length >= 1) {
      // Try to extract item name (text before numbers)
      const namePart = line.replace(/[\d.,]+/g, "").trim();

      // Get the largest number as potential price/total
      const numericValues = numbers
        .map((n) => parseFloat(n.replace(/\./g, "").replace(",", ".")))
        .filter((n) => !isNaN(n) && n > 0);

      if (namePart.length > 2 && numericValues.length > 0) {
        const maxValue = Math.max(...numericValues);

        // Determine if it's a total or price based on value
        let qty = 1;
        let price = maxValue;
        let total = maxValue;

        // If there are multiple numbers, try to parse qty and price
        if (numericValues.length >= 2) {
          const smallerValues = numericValues.filter((v) => v < 1000);
          if (smallerValues.length > 0) {
            qty = smallerValues[0];
            price = Math.round(total / qty);
          }
        }

        items.push({
          id: index + 1,
          name: namePart.substring(0, 50), // Limit name length
          qty: qty.toString(),
          unit: "pcs",
          price: price.toString(),
          total: total.toString(),
        });
      }
    }
  });

  return { items, invoiceNo, date: detectedDate };
};

export default function ScanNota() {
  const { vendors, projects } = useData();
  const toast = useToast();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrText, setOcrText] = useState("");
  const [showRawText, setShowRawText] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: "",
    projectId: "",
    invoiceNo: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Items list
  const [items, setItems] = useState([]);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Run OCR on image
  const runOCR = async (imageData) => {
    setIsProcessing(true);
    setOcrProgress(0);
    setOcrText("");

    try {
      const result = await Tesseract.recognize(imageData, "ind+eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text;
      setOcrText(text);

      // Parse the OCR text
      const parsed = parseOcrText(text);

      if (parsed.items.length > 0) {
        setItems(parsed.items);
        toast.success(`Berhasil membaca ${parsed.items.length} item dari nota`);
      } else {
        // Add empty item for manual input
        setItems([
          { id: 1, name: "", qty: "", unit: "pcs", price: "", total: "" },
        ]);
        toast.warning(
          "Tidak dapat mendeteksi item. Silakan input manual atau perbaiki hasil."
        );
      }

      // Update form data if detected
      if (parsed.invoiceNo) {
        setFormData((prev) => ({ ...prev, invoiceNo: parsed.invoiceNo }));
      }
      if (parsed.date) {
        // Try to convert to ISO format
        try {
          const parts = parsed.date.split(/[-/]/);
          if (parts.length === 3) {
            const day = parts[0].padStart(2, "0");
            const month = parts[1].padStart(2, "0");
            const year = parts[2].length === 2 ? "20" + parts[2] : parts[2];
            setFormData((prev) => ({
              ...prev,
              date: `${year}-${month}-${day}`,
            }));
          }
        } catch {
          // Keep default date
        }
      }
    } catch (error) {
      console.error("OCR Error:", error);
      toast.error("Gagal memproses OCR: " + error.message);
      setItems([
        { id: 1, name: "", qty: "", unit: "pcs", price: "", total: "" },
      ]);
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file terlalu besar. Maksimal 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        // Automatically run OCR
        runOCR(reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  // Open camera
  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Open gallery
  const openGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  // Clear upload
  const clearUpload = () => {
    setUploadedImage(null);
    setOcrText("");
    setFormData({
      vendorId: "",
      projectId: "",
      invoiceNo: "",
      date: new Date().toISOString().split("T")[0],
    });
    setItems([]);
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle item change with auto-calculation
  const handleItemChange = (itemId, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== itemId) return item;

        const updatedItem = { ...item, [field]: value };

        const qty = parseFloat(field === "qty" ? value : item.qty) || 0;
        const price = parseFloat(field === "price" ? value : item.price) || 0;
        const total = parseFloat(field === "total" ? value : item.total) || 0;

        if (field === "qty" || field === "price") {
          if (qty > 0 && price > 0) {
            updatedItem.total = (qty * price).toString();
          }
        } else if (field === "total") {
          if (qty > 0 && total > 0) {
            updatedItem.price = Math.round(total / qty).toString();
          }
        }

        return updatedItem;
      })
    );
  };

  // Add new item
  const addItem = () => {
    const newId = Math.max(...items.map((i) => i.id), 0) + 1;
    setItems((prev) => [
      ...prev,
      { id: newId, name: "", qty: "", unit: "pcs", price: "", total: "" },
    ]);
  };

  // Remove item
  const removeItem = (itemId) => {
    if (items.length === 1) {
      toast.error("Minimal harus ada 1 item");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Calculate grand total
  const grandTotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.total) || 0),
    0
  );

  // Submit for verification
  const handleSubmit = () => {
    if (!uploadedImage) {
      toast.error("Upload foto nota terlebih dahulu");
      return;
    }
    if (!formData.vendorId) {
      toast.error("Pilih vendor");
      return;
    }
    if (!formData.projectId) {
      toast.error("Pilih proyek");
      return;
    }
    if (items.length === 0 || items.every((i) => !i.name)) {
      toast.error("Minimal isi 1 item");
      return;
    }

    toast.success("Nota berhasil dikirim untuk verifikasi!");
    clearUpload();
  };

  return (
    <div className="animate-in">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      {/* Full Image Preview Modal */}
      {showPreview && uploadedImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "var(--space-4)",
          }}
          onClick={() => setShowPreview(false)}
        >
          <button
            className="btn btn-ghost"
            style={{
              position: "absolute",
              top: "var(--space-4)",
              right: "var(--space-4)",
              color: "white",
            }}
          >
            <X size={24} />
          </button>
          <img
            src={uploadedImage}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: "var(--radius-lg)",
            }}
          />
        </div>
      )}

      {/* Raw OCR Text Modal */}
      {showRawText && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "var(--space-4)",
          }}
          onClick={() => setShowRawText(false)}
        >
          <div
            className="card"
            style={{ maxWidth: "600px", maxHeight: "80vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <h3 className="card-title">Hasil OCR (Raw Text)</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowRawText(false)}
              >
                <X size={18} />
              </button>
            </div>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: "var(--text-sm)",
                background: "var(--bg-tertiary)",
                padding: "var(--space-4)",
                borderRadius: "var(--radius-md)",
                maxHeight: "400px",
                overflow: "auto",
              }}
            >
              {ocrText || "Belum ada hasil OCR"}
            </pre>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Scan Nota / Invoice</h1>
        <p className="page-subtitle">
          Ambil foto nota untuk pembacaan otomatis (OCR)
        </p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1.5fr" }}>
        {/* Upload Area */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Foto Nota</h3>
          </div>

          {!uploadedImage ? (
            <>
              {/* Quick Action Buttons */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-3)",
                  marginBottom: "var(--space-4)",
                }}
              >
                <button
                  type="button"
                  onClick={openCamera}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "var(--space-6)",
                    background:
                      "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-xl)",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <Camera
                    size={36}
                    style={{ marginBottom: "var(--space-2)" }}
                  />
                  <span style={{ fontWeight: "600" }}>Buka Kamera</span>
                  <span style={{ fontSize: "var(--text-xs)", opacity: 0.8 }}>
                    Foto langsung
                  </span>
                </button>

                <button
                  type="button"
                  onClick={openGallery}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "var(--space-6)",
                    background:
                      "linear-gradient(135deg, var(--success-500), var(--success-600))",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-xl)",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(34, 197, 94, 0.3)",
                  }}
                >
                  <ImagePlus
                    size={36}
                    style={{ marginBottom: "var(--space-2)" }}
                  />
                  <span style={{ fontWeight: "600" }}>Pilih Galeri</span>
                  <span style={{ fontSize: "var(--text-xs)", opacity: 0.8 }}>
                    Dari file
                  </span>
                </button>
              </div>

              {/* Drag & Drop */}
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "var(--space-6)",
                  background: "var(--bg-tertiary)",
                  border: "2px dashed var(--border-color)",
                  borderRadius: "var(--radius-xl)",
                  cursor: "pointer",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file?.type.startsWith("image/")) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setUploadedImage(reader.result);
                      runOCR(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <Upload
                  size={32}
                  style={{
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-2)",
                  }}
                />
                <p style={{ fontWeight: "500", fontSize: "var(--text-sm)" }}>
                  Drag & drop foto
                </p>
              </label>

              <div
                className="alert alert-info"
                style={{
                  marginTop: "var(--space-4)",
                  fontSize: "var(--text-xs)",
                }}
              >
                <Scan size={16} />
                <span>
                  Foto akan di-scan otomatis dengan OCR untuk membaca isi nota
                </span>
              </div>
            </>
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
                    height: "250px",
                    objectFit: "cover",
                    filter: isProcessing ? "blur(2px)" : "none",
                  }}
                />
                {isProcessing && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0, 0, 0, 0.7)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <Loader2
                      size={40}
                      className="animate-spin"
                      style={{ marginBottom: "var(--space-2)" }}
                    />
                    <p style={{ fontWeight: "600" }}>Memproses OCR...</p>
                    <p style={{ fontSize: "var(--text-sm)" }}>{ocrProgress}%</p>
                    <div
                      style={{
                        width: "80%",
                        height: "6px",
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "3px",
                        marginTop: "var(--space-2)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${ocrProgress}%`,
                          height: "100%",
                          background: "var(--primary-400)",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>
                )}
                {!isProcessing && (
                  <button
                    className="btn btn-ghost"
                    onClick={() => setShowPreview(true)}
                    style={{
                      position: "absolute",
                      top: "var(--space-2)",
                      right: "var(--space-2)",
                      background: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      padding: "var(--space-2)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <ZoomIn size={20} />
                  </button>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-2)",
                  marginBottom: "var(--space-2)",
                }}
              >
                <button
                  className="btn btn-secondary btn-sm btn-full"
                  onClick={clearUpload}
                >
                  <Trash2 size={16} />
                  Hapus
                </button>
                <button
                  className="btn btn-ghost btn-sm btn-full"
                  onClick={() => runOCR(uploadedImage)}
                >
                  <Scan size={16} />
                  Scan Ulang
                </button>
              </div>

              {ocrText && (
                <button
                  className="btn btn-ghost btn-sm btn-full"
                  onClick={() => setShowRawText(true)}
                  style={{ fontSize: "var(--text-xs)" }}
                >
                  <FileText size={14} />
                  Lihat Hasil OCR Mentah
                </button>
              )}
            </div>
          )}
        </div>

        {/* Input Data */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              {isProcessing ? "Memproses..." : "Data Nota"}
            </h3>
            {grandTotal > 0 && (
              <span
                className="badge badge-success"
                style={{ fontSize: "var(--text-sm)" }}
              >
                Total: {formatCurrency(grandTotal)}
              </span>
            )}
          </div>

          {isProcessing ? (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-12)",
                color: "var(--text-muted)",
              }}
            >
              <Loader2
                size={48}
                className="animate-spin"
                style={{ marginBottom: "var(--space-3)" }}
              />
              <p>Sedang membaca nota dengan OCR...</p>
              <p style={{ fontSize: "var(--text-sm)" }}>
                Progress: {ocrProgress}%
              </p>
            </div>
          ) : items.length === 0 ? (
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
              <p>Upload foto nota untuk memulai scan</p>
            </div>
          ) : (
            <>
              {/* Alert for editing */}
              <div
                className="alert alert-warning"
                style={{
                  marginBottom: "var(--space-4)",
                  fontSize: "var(--text-xs)",
                }}
              >
                <Edit3 size={16} />
                <span>
                  Hasil OCR mungkin tidak sempurna. Silakan periksa dan perbaiki
                  jika perlu.
                </span>
              </div>

              {/* Form Header */}
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: "1fr 1fr",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">No. Invoice</label>
                  <input
                    type="text"
                    name="invoiceNo"
                    className="form-input"
                    placeholder="INV-2025-001"
                    value={formData.invoiceNo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tanggal</label>
                  <input
                    type="date"
                    name="date"
                    className="form-input"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Vendor *</label>
                  <select
                    name="vendorId"
                    className="form-select"
                    value={formData.vendorId}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Pilih Vendor --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Proyek *</label>
                  <select
                    name="projectId"
                    className="form-select"
                    value={formData.projectId}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Pilih Proyek --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items */}
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                  marginBottom: "var(--space-2)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  <Calculator
                    size={14}
                    style={{ marginRight: 4, verticalAlign: "middle" }}
                  />
                  Item ({items.length})
                </span>
                <span style={{ color: "var(--success-400)" }}>
                  Qty × Harga = Total
                </span>
              </div>

              <div
                style={{
                  background: "var(--bg-tertiary)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-3)",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 60px 70px 90px 90px 36px",
                    gap: "var(--space-2)",
                    marginBottom: "var(--space-2)",
                    fontSize: "var(--text-xs)",
                    fontWeight: "600",
                    color: "var(--text-muted)",
                  }}
                >
                  <span>Nama</span>
                  <span>Qty</span>
                  <span>Satuan</span>
                  <span>Harga</span>
                  <span>Total</span>
                  <span></span>
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 60px 70px 90px 90px 36px",
                      gap: "var(--space-2)",
                      marginBottom: "var(--space-2)",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nama"
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(item.id, "name", e.target.value)
                      }
                      style={{ fontSize: "var(--text-xs)" }}
                    />
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      min="0"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(item.id, "qty", e.target.value)
                      }
                      style={{ fontSize: "var(--text-xs)", textAlign: "right" }}
                    />
                    <select
                      className="form-select"
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(item.id, "unit", e.target.value)
                      }
                      style={{ fontSize: "var(--text-xs)" }}
                    >
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="m">m</option>
                      <option value="sak">sak</option>
                      <option value="btg">btg</option>
                      <option value="lbr">lbr</option>
                      <option value="truck">truck</option>
                    </select>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      min="0"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(item.id, "price", e.target.value)
                      }
                      style={{ fontSize: "var(--text-xs)", textAlign: "right" }}
                    />
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      min="0"
                      value={item.total}
                      onChange={(e) =>
                        handleItemChange(item.id, "total", e.target.value)
                      }
                      style={{
                        fontSize: "var(--text-xs)",
                        textAlign: "right",
                        fontWeight: item.total ? "600" : "normal",
                        color: item.total ? "var(--success-400)" : "inherit",
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeItem(item.id)}
                      style={{ color: "var(--danger-400)", padding: "2px" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={addItem}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    border: "1px dashed var(--border-color)",
                  }}
                >
                  <Plus size={14} />
                  Tambah Item
                </button>
              </div>

              {/* Grand Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "var(--space-4)",
                  background:
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05))",
                  borderRadius: "var(--radius-lg)",
                  marginBottom: "var(--space-4)",
                }}
              >
                <span style={{ fontWeight: "600", fontSize: "var(--text-lg)" }}>
                  Grand Total
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontWeight: "700",
                    fontSize: "var(--text-xl)",
                    color: "var(--success-400)",
                  }}
                >
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              <button
                className="btn btn-primary btn-full"
                onClick={handleSubmit}
                disabled={grandTotal === 0}
                style={{ opacity: grandTotal === 0 ? 0.5 : 1 }}
              >
                <Send size={18} />
                Kirim untuk Verifikasi
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
