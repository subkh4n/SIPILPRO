import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import PegawaiForm from "../../components/forms/PegawaiForm";

export default function TambahPegawai() {
  const navigate = useNavigate();
  const { addWorker, refreshData } = useData();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      await addWorker(data);
      alert("Pegawai berhasil ditambahkan!");
      refreshData();
      navigate("/master/pegawai");
    } catch (err) {
      alert("Gagal menambah pegawai: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PegawaiForm
      mode="add"
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
}
