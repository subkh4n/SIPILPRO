import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import PegawaiForm from "../../components/forms/PegawaiForm";
import { Loader } from "lucide-react";

export default function EditPegawai() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workers, updateWorker, refreshData } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [initialData, setInitialData] = useState(null);

  // Find worker by ID
  useEffect(() => {
    if (workers && workers.length > 0) {
      const worker = workers.find((w) => w.id === id);
      if (worker) {
        setInitialData({
          ...worker,
          tanggalMasuk: worker.tanggalMasuk
            ? new Date(worker.tanggalMasuk).toISOString().split("T")[0]
            : "",
          tanggalLahir: worker.tanggalLahir
            ? new Date(worker.tanggalLahir).toISOString().split("T")[0]
            : "",
        });
      } else {
        alert("Pegawai tidak ditemukan");
        navigate("/master/pegawai");
      }
      setIsLoadingData(false);
    }
  }, [workers, id, navigate]);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      await updateWorker(id, data);
      alert("Data pegawai berhasil diupdate!");
      refreshData();
      navigate("/master/pegawai");
    } catch (err) {
      alert("Gagal update pegawai: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "50vh",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <Loader size={32} className="spin" style={{ color: "var(--primary-500)" }} />
        <p style={{ color: "var(--text-muted)" }}>Memuat data pegawai...</p>
      </div>
    );
  }

  return (
    <PegawaiForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
}
