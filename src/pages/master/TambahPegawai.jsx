import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import PegawaiForm from "../../components/forms/PegawaiForm";

export default function TambahPegawai() {
  const navigate = useNavigate();
  const toast = useToast();
  const { addWorker } = useData();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      await addWorker(data);
      toast.success("Pegawai berhasil ditambahkan!");
      // Removed refreshData() - state already updated by addWorker()
      // This prevents race condition where data is re-fetched before backend saves
      navigate("/master/pegawai");
    } catch (err) {
      toast.error("Gagal menambah pegawai: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PegawaiForm mode="add" onSubmit={handleSubmit} isLoading={isLoading} />
  );
}
