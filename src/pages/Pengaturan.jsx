import { useState } from "react";
import {
  Settings,
  User,
  Building2,
  Database,
  Bell,
  Shield,
  Palette,
  Save,
  RefreshCw,
  Key,
  Globe,
  Cloud,
  CheckCircle2,
} from "lucide-react";

export default function Pengaturan() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    companyName: "PT. SIPIL KONSTRUKSI",
    companyAddress: "Jl. Raya Serang KM.5, Tangerang",
    companyPhone: "021-12345678",
    apiKey: "",
    spreadsheetId: "",
    autoSync: true,
    syncInterval: 5,
    darkMode: true,
    notifications: {
      dueDateReminder: true,
      payrollReminder: true,
      lowCashAlert: true,
    },
    currency: "IDR",
    language: "id",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle nested notifications
  const handleNotificationChange = (key) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  // Save settings
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Tabs config
  const tabs = [
    { id: "general", name: "Umum", icon: Building2 },
    { id: "api", name: "API & Sinkronisasi", icon: Cloud },
    { id: "notifications", name: "Notifikasi", icon: Bell },
    { id: "appearance", name: "Tampilan", icon: Palette },
    { id: "security", name: "Keamanan", icon: Shield },
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
        }}
      >
        <div>
          <h1 className="page-title">Pengaturan</h1>
          <p className="page-subtitle">Konfigurasi aplikasi</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {saved ? "Tersimpan!" : "Simpan Perubahan"}
        </button>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "250px 1fr" }}>
        {/* Tabs */}
        <div className="card" style={{ padding: "var(--space-3)" }}>
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ width: "100%", justifyContent: "flex-start" }}
              >
                <tab.icon size={18} />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="card">
          {/* General Settings */}
          {activeTab === "general" && (
            <div>
              <h3 style={{ marginBottom: "var(--space-5)", fontWeight: "600" }}>
                Informasi Perusahaan
              </h3>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "1fr 1fr" }}
              >
                <div className="form-group">
                  <label className="form-label">Nama Perusahaan</label>
                  <input
                    type="text"
                    name="companyName"
                    className="form-input"
                    value={settings.companyName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Telepon</label>
                  <input
                    type="text"
                    name="companyPhone"
                    className="form-input"
                    value={settings.companyPhone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Alamat</label>
                  <input
                    type="text"
                    name="companyAddress"
                    className="form-input"
                    value={settings.companyAddress}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid var(--border-color)",
                  margin: "var(--space-6) 0",
                }}
              />

              <h3 style={{ marginBottom: "var(--space-5)", fontWeight: "600" }}>
                Regional
              </h3>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "1fr 1fr" }}
              >
                <div className="form-group">
                  <label className="form-label">Mata Uang</label>
                  <select
                    name="currency"
                    className="form-select"
                    value={settings.currency}
                    onChange={handleChange}
                  >
                    <option value="IDR">Rupiah (IDR)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bahasa</label>
                  <select
                    name="language"
                    className="form-select"
                    value={settings.language}
                    onChange={handleChange}
                  >
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* API Settings */}
          {activeTab === "api" && (
            <div>
              <h3 style={{ marginBottom: "var(--space-5)", fontWeight: "600" }}>
                Google Sheets API
              </h3>
              <div className="grid gap-4">
                <div className="form-group">
                  <label className="form-label">API Key</label>
                  <input
                    type="password"
                    name="apiKey"
                    className="form-input font-mono"
                    placeholder="AIza..."
                    value={settings.apiKey}
                    onChange={handleChange}
                  />
                  <span className="form-hint">
                    Dapatkan API Key dari Google Cloud Console
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label">Spreadsheet ID</label>
                  <input
                    type="text"
                    name="spreadsheetId"
                    className="form-input font-mono"
                    placeholder="1BxiM..."
                    value={settings.spreadsheetId}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid var(--border-color)",
                  margin: "var(--space-6) 0",
                }}
              />

              <h3 style={{ marginBottom: "var(--space-5)", fontWeight: "600" }}>
                Sinkronisasi
              </h3>
              <div className="grid gap-4">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    name="autoSync"
                    checked={settings.autoSync}
                    onChange={handleChange}
                    style={{ width: "20px", height: "20px" }}
                  />
                  <div>
                    <div style={{ fontWeight: "500" }}>
                      Sinkronisasi Otomatis
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--text-muted)",
                      }}
                    >
                      Sinkronkan data secara otomatis setiap beberapa menit
                    </div>
                  </div>
                </label>

                {settings.autoSync && (
                  <div className="form-group" style={{ maxWidth: "200px" }}>
                    <label className="form-label">Interval (menit)</label>
                    <input
                      type="number"
                      name="syncInterval"
                      className="form-input"
                      min="1"
                      max="60"
                      value={settings.syncInterval}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <button
                  className="btn btn-secondary"
                  style={{ width: "fit-content" }}
                >
                  <RefreshCw size={18} />
                  Sinkronkan Sekarang
                </button>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <div>
              <h3 style={{ marginBottom: "var(--space-5)", fontWeight: "600" }}>
                Pengingat
              </h3>
              <div className="flex flex-col gap-4">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-4)",
                    background: "var(--bg-input)",
                    borderRadius: "var(--radius-lg)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.notifications.dueDateReminder}
                    onChange={() => handleNotificationChange("dueDateReminder")}
                    style={{ width: "20px", height: "20px" }}
                  />
                  <div>
                    <div style={{ fontWeight: "500" }}>
                      Pengingat Jatuh Tempo
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--text-muted)",
                      }}
                    >
                      Notifikasi ketika ada hutang yang jatuh tempo
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-4)",
                    background: "var(--bg-input)",
                    borderRadius: "var(--radius-lg)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.notifications.payrollReminder}
                    onChange={() => handleNotificationChange("payrollReminder")}
                    style={{ width: "20px", height: "20px" }}
                  />
                  <div>
                    <div style={{ fontWeight: "500" }}>Pengingat Payroll</div>
                    <div
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--text-muted)",
                      }}
                    >
                      Notifikasi ketika mendekati waktu penggajian
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-4)",
                    background: "var(--bg-input)",
                    borderRadius: "var(--radius-lg)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.notifications.lowCashAlert}
                    onChange={() => handleNotificationChange("lowCashAlert")}
                    style={{ width: "20px", height: "20px" }}
                  />
                  <div>
                    <div style={{ fontWeight: "500" }}>
                      Peringatan Kas Rendah
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--text-muted)",
                      }}
                    >
                      Notifikasi ketika saldo kas di bawah batas minimum
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === "appearance" && (
            <div>
              <h3 style={{ marginBottom: "var(--space-5)", fontWeight: "600" }}>
                Tema
              </h3>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
              >
                <div
                  style={{
                    padding: "var(--space-6)",
                    background: "#1e293b",
                    borderRadius: "var(--radius-xl)",
                    border: settings.darkMode
                      ? "2px solid var(--primary-500)"
                      : "2px solid transparent",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, darkMode: true }))
                  }
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "var(--radius-full)",
                      background: "#0f172a",
                      margin: "0 auto var(--space-3)",
                    }}
                  />
                  <div style={{ fontWeight: "500", color: "white" }}>
                    Mode Gelap
                  </div>
                </div>

                <div
                  style={{
                    padding: "var(--space-6)",
                    background: "#f8fafc",
                    borderRadius: "var(--radius-xl)",
                    border: !settings.darkMode
                      ? "2px solid var(--primary-500)"
                      : "2px solid transparent",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, darkMode: false }))
                  }
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "var(--radius-full)",
                      background: "#e2e8f0",
                      margin: "0 auto var(--space-3)",
                    }}
                  />
                  <div style={{ fontWeight: "500", color: "#1e293b" }}>
                    Mode Terang
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div>
              <h3 style={{ marginBottom: "var(--space-5)", fontWeight: "600" }}>
                Keamanan Akun
              </h3>
              <div className="grid gap-4">
                <div className="form-group">
                  <label className="form-label">Password Saat Ini</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password Baru</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Konfirmasi Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: "fit-content" }}
                >
                  <Key size={18} />
                  Ubah Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

