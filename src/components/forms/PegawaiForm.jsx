import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/helpers";
import {
  User,
  Camera,
  Save,
  X,
  ArrowLeft,
  Upload,
  Loader,
} from "lucide-react";

/**
 * PegawaiForm - Reusable form component for Add/Edit Employee
 *
 * @param {Object} props
 * @param {Object} props.initialData - Initial form data (for edit mode)
 * @param {Function} props.onSubmit - Submit handler
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.mode - "add" or "edit"
 */
export default function PegawaiForm({
  initialData = {},
  onSubmit,
  isLoading = false,
  mode = "add",
}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nip: "",
    name: "",
    jabatan: "",
    skill: "Pemula",
    tipe: "Harian",
    phone: "",
    alamat: "",
    rateNormal: "",
    rateOvertime: "",
    rateHoliday: "",
    status: "active",
    tanggalMasuk: new Date().toISOString().split("T")[0],
    tanggalLahir: "",
    noKTP: "",
    bpjs: "",
    ...initialData,
  });

  const [fotoPreview, setFotoPreview] = useState(initialData.foto || null);
  const [fotoFile, setFotoFile] = useState(null);

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        rateNormal: initialData.rateNormal || "",
        rateOvertime: initialData.rateOvertime || "",
        rateHoliday: initialData.rateHoliday || "",
      }));
      if (initialData.foto) {
        setFotoPreview(initialData.foto);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Harap pilih file gambar (JPG, PNG, dll)");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }
      setFotoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data
    const submitData = {
      ...formData,
      rateNormal: parseFloat(formData.rateNormal) || 0,
      rateOvertime: parseFloat(formData.rateOvertime) || 0,
      rateHoliday: parseFloat(formData.rateHoliday) || 0,
    };

    // If new foto selected, convert to base64
    if (fotoFile) {
      const base64 = await fileToBase64(fotoFile);
      submitData.fotoBase64 = base64.split(",")[1]; // Remove data:image/xxx;base64, prefix
      submitData.fotoMimeType = fotoFile.type;
    }

    onSubmit(submitData);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="animate-in">
      {/* Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={() => navigate("/master/pegawai")}
          style={{ padding: "var(--space-2)" }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="page-title">
            {mode === "add" ? "Tambah Pegawai Baru" : "Edit Data Pegawai"}
          </h1>
          <p className="page-subtitle">
            {mode === "add"
              ? "Isi data lengkap pegawai baru"
              : `Edit data ${formData.name || "pegawai"}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "300px 1fr" }}
        >
          {/* Left Column - Photo */}
          <div className="card" style={{ padding: "var(--space-6)" }}>
            <h3
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "600",
                marginBottom: "var(--space-4)",
              }}
            >
              Foto Pegawai
            </h3>

            {/* Photo Preview */}
            <div
              style={{
                width: "100%",
                aspectRatio: "3/4",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-tertiary)",
                border: "2px dashed var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                marginBottom: "var(--space-4)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary-500)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
              }}
            >
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  <Camera
                    size={48}
                    style={{ marginBottom: "var(--space-2)", opacity: 0.5 }}
                  />
                  <p style={{ fontSize: "var(--text-sm)" }}>
                    Klik untuk upload foto
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              style={{ display: "none" }}
            />

            <button
              type="button"
              className="btn btn-secondary btn-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              {fotoPreview ? "Ganti Foto" : "Upload Foto"}
            </button>

            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                marginTop: "var(--space-2)",
                textAlign: "center",
              }}
            >
              Format: JPG, PNG (Maks. 5MB)
            </p>
          </div>

          {/* Right Column - Form Fields */}
          <div className="card" style={{ padding: "var(--space-6)" }}>
            <h3
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "600",
                marginBottom: "var(--space-5)",
              }}
            >
              Data Pegawai
            </h3>

            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "1fr 1fr" }}
            >
              {/* NIP */}
              <div className="form-group">
                <label className="form-label">NIP *</label>
                <input
                  type="text"
                  name="nip"
                  className="form-input"
                  placeholder="Contoh: 20240001"
                  value={formData.nip}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Nama */}
              <div className="form-group">
                <label className="form-label">Nama Lengkap *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Jabatan */}
              <div className="form-group">
                <label className="form-label">Jabatan *</label>
                <input
                  type="text"
                  name="jabatan"
                  className="form-input"
                  placeholder="Contoh: Mandor Lapangan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Skill */}
              <div className="form-group">
                <label className="form-label">Keahlian</label>
                <select
                  name="skill"
                  className="form-select"
                  value={formData.skill}
                  onChange={handleChange}
                >
                  <option value="Pemula">Pemula</option>
                  <option value="Terampil">Terampil</option>
                  <option value="Ahli">Ahli</option>
                </select>
              </div>

              {/* Tipe Karyawan */}
              <div className="form-group">
                <label className="form-label">Tipe Karyawan *</label>
                <select
                  name="tipe"
                  className="form-select"
                  value={formData.tipe}
                  onChange={handleChange}
                  required
                >
                  <option value="Tetap">Tetap</option>
                  <option value="Kontrak">Kontrak</option>
                  <option value="Harian">Harian</option>
                </select>
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Non-Aktif</option>
                  <option value="cuti">Cuti</option>
                </select>
              </div>

              {/* No. Telepon */}
              <div className="form-group">
                <label className="form-label">No. Telepon</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="Contoh: 08123456789"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Tanggal Masuk */}
              <div className="form-group">
                <label className="form-label">Tanggal Masuk *</label>
                <input
                  type="date"
                  name="tanggalMasuk"
                  className="form-input"
                  value={formData.tanggalMasuk}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Alamat - Full Width */}
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Alamat</label>
                <textarea
                  name="alamat"
                  className="form-input"
                  placeholder="Alamat lengkap"
                  rows={2}
                  value={formData.alamat}
                  onChange={handleChange}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>

            {/* Separator */}
            <hr
              style={{
                border: "none",
                borderTop: "1px solid var(--border-color)",
                margin: "var(--space-6) 0",
              }}
            />

            {/* Tarif Upah Section */}
            <h4
              style={{
                fontSize: "var(--text-base)",
                fontWeight: "600",
                marginBottom: "var(--space-4)",
                color: "var(--text-secondary)",
              }}
            >
              Tarif Upah
            </h4>

            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
            >
              <div className="form-group">
                <label className="form-label">Upah Normal (per hari)</label>
                <input
                  type="number"
                  name="rateNormal"
                  className="form-input"
                  placeholder="0"
                  value={formData.rateNormal}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Upah Lembur (per jam)</label>
                <input
                  type="number"
                  name="rateOvertime"
                  className="form-input"
                  placeholder="0"
                  value={formData.rateOvertime}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Upah Hari Libur</label>
                <input
                  type="number"
                  name="rateHoliday"
                  className="form-input"
                  placeholder="0"
                  value={formData.rateHoliday}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Separator */}
            <hr
              style={{
                border: "none",
                borderTop: "1px solid var(--border-color)",
                margin: "var(--space-6) 0",
              }}
            />

            {/* Data Pribadi Section */}
            <h4
              style={{
                fontSize: "var(--text-base)",
                fontWeight: "600",
                marginBottom: "var(--space-4)",
                color: "var(--text-secondary)",
              }}
            >
              Data Pribadi
            </h4>

            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
            >
              <div className="form-group">
                <label className="form-label">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggalLahir"
                  className="form-input"
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">No. KTP</label>
                <input
                  type="text"
                  name="noKTP"
                  className="form-input"
                  placeholder="16 digit No. KTP"
                  value={formData.noKTP}
                  onChange={handleChange}
                  maxLength={16}
                />
              </div>
              <div className="form-group">
                <label className="form-label">No. BPJS</label>
                <input
                  type="text"
                  name="bpjs"
                  className="form-input"
                  placeholder="No. BPJS Ketenagakerjaan"
                  value={formData.bpjs}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                marginTop: "var(--space-8)",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/master/pegawai")}
                disabled={isLoading}
              >
                <X size={16} />
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {mode === "add" ? "Simpan Pegawai" : "Update Pegawai"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
