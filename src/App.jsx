import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { ToastProvider } from "./context/ToastContext";
import Layout from "./components/Layout";

// Core Pages
import Dashboard from "./pages/Dashboard";
import Absensi from "./pages/Absensi";
import Belanja from "./pages/Belanja";
import Hutang from "./pages/Hutang";
import Proyek from "./pages/Proyek";
import Pengaturan from "./pages/Pengaturan";

// Master Data Pages
import Pegawai from "./pages/master/Pegawai";
import TambahPegawai from "./pages/master/TambahPegawai";
import EditPegawai from "./pages/master/EditPegawai";
import Vendor from "./pages/master/Vendor";
import Kalender from "./pages/master/Kalender";

// Operasional Pages
import ScanAbsen from "./pages/operasional/ScanAbsen";
import LogAbsensi from "./pages/operasional/LogAbsensi";
import InputAbsensi from "./pages/operasional/InputAbsensi";
import ScanNota from "./pages/operasional/ScanNota";
import VerifikasiNota from "./pages/operasional/VerifikasiNota";
import JatuhTempo from "./pages/operasional/JatuhTempo";

// Keuangan Pages
import Payroll from "./pages/keuangan/Payroll";
import ArusKas from "./pages/keuangan/ArusKas";

// Laporan Pages
import LaporanRealisasi from "./pages/laporan/LaporanRealisasi";
import RekapAbsensi from "./pages/laporan/RekapAbsensi";
import BiayaVendor from "./pages/laporan/BiayaVendor";
import LaporanPayroll from "./pages/laporan/LaporanPayroll";
import LaporanProyek from "./pages/laporan/LaporanProyek";
import LaporanDetilBiaya from "./pages/laporan/LaporanDetilBiaya";

// Placeholder component for pages under development
function PlaceholderPage({ title, description }) {
  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{description}</p>
      </div>
      <div
        className="card"
        style={{ textAlign: "center", padding: "var(--space-12)" }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "var(--radius-full)",
            background: "var(--bg-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto var(--space-4)",
            fontSize: "2rem",
          }}
        >
          🚧
        </div>
        <h3 style={{ marginBottom: "var(--space-2)" }}>Dalam Pengembangan</h3>
        <p className="text-muted">
          Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <DataProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Master Data */}
              <Route path="/master/pegawai" element={<Pegawai />} />
              <Route
                path="/master/pegawai/tambah"
                element={<TambahPegawai />}
              />
              <Route
                path="/master/pegawai/edit/:id"
                element={<EditPegawai />}
              />
              <Route path="/master/proyek" element={<Proyek />} />
              <Route path="/master/vendor" element={<Vendor />} />
              <Route path="/master/kalender" element={<Kalender />} />

              {/* Operasional */}
              <Route path="/operasional/scan-absen" element={<ScanAbsen />} />
              <Route path="/operasional/absensi" element={<Absensi />} />
              <Route path="/operasional/log-absensi" element={<LogAbsensi />} />
              <Route
                path="/operasional/input-absensi"
                element={<InputAbsensi />}
              />
              <Route path="/operasional/scan-nota" element={<ScanNota />} />
              <Route path="/operasional/belanja" element={<Belanja />} />
              <Route
                path="/operasional/verifikasi"
                element={<VerifikasiNota />}
              />
              <Route path="/operasional/jatuh-tempo" element={<JatuhTempo />} />

              {/* Keuangan */}
              <Route path="/keuangan/payroll" element={<Payroll />} />
              <Route path="/keuangan/kas" element={<ArusKas />} />
              <Route path="/keuangan/hutang" element={<Hutang />} />
              <Route
                path="/keuangan/piutang"
                element={
                  <PlaceholderPage
                    title="Piutang"
                    description="Monitoring piutang (Coming soon)"
                  />
                }
              />

              <Route path="/laporan/realisasi" element={<LaporanRealisasi />} />
              <Route path="/laporan/absensi" element={<RekapAbsensi />} />
              <Route path="/laporan/vendor" element={<BiayaVendor />} />
              <Route path="/laporan/payroll" element={<LaporanPayroll />} />
              <Route path="/laporan/proyek" element={<LaporanProyek />} />
              <Route
                path="/laporan/detil-biaya"
                element={<LaporanDetilBiaya />}
              />

              {/* Settings */}
              <Route path="/settings" element={<Pengaturan />} />

              {/* Legacy routes - redirect */}
              <Route path="/absensi" element={<Absensi />} />
              <Route path="/belanja" element={<Belanja />} />
              <Route path="/hutang" element={<Hutang />} />
              <Route path="/proyek" element={<Proyek />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </DataProvider>
    </ToastProvider>
  );
}

export default App;
