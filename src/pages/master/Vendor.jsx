import { useState } from "react";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/helpers";
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Search,
  Filter,
  Phone,
  MapPin,
  CreditCard,
  Eye,
  AlertTriangle,
} from "lucide-react";

export default function Vendor() {
  const {
    vendors,
    purchases,
    addVendor,
    updateVendor,
    deleteVendor,
    refreshData,
  } = useData();
  const toast = useToast();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  // Modal states
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addVendor({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
      });
      setFormData({ name: "", address: "", phone: "" });
      setShowForm(false);
      refreshData();
    } catch (err) {
      toast.error("Gagal menambah vendor: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: "", address: "", phone: "" });
    setShowForm(false);
  };

  // Handle View
  const handleView = (vendor) => {
    setViewModal(vendor);
  };

  // Handle Edit
  const handleEdit = (vendor) => {
    setEditFormData({
      name: vendor.name,
      address: vendor.address,
      phone: vendor.phone,
    });
    setEditModal(vendor);
  };

  const handleEditSubmit = async () => {
    setIsLoading(true);
    try {
      await updateVendor(editModal.id, editFormData);
      setEditModal(null);
      refreshData();
    } catch (err) {
      toast.error("Gagal update vendor: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      await deleteVendor(deleteConfirm.id);
      setDeleteConfirm(null);
      refreshData();
    } catch (err) {
      toast.error("Gagal hapus vendor: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate vendor debt
  const getVendorDebt = (vendorId) => {
    return purchases
      .filter((p) => p.vendorId === vendorId && p.status === "unpaid")
      .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
  };

  // Filter vendors
  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in">
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <h1 className="page-title">Data Vendor</h1>
          <p className="page-subtitle">
            Daftar vendor dan monitoring saldo piutang
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          Tambah Vendor
        </button>
      </div>

      {/* Input Form */}
      {showForm && (
        <div className="card mb-6" style={{ marginBottom: "var(--space-6)" }}>
          <div className="card-header">
            <h3 className="card-title">Input Data Vendor Baru</h3>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              <div className="form-group">
                <label className="form-label">Nama Vendor</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="TB. Sinar Jaya"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  placeholder="Jl. Raya Serang KM.5"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">No. Telepon</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  placeholder="021-12345678"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                marginTop: "var(--space-5)",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                Simpan Vendor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div
        className="card mb-6"
        style={{
          marginBottom: "var(--space-6)",
          padding: "var(--space-4)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "var(--space-4)",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div
            className="form-group"
            style={{ flex: 1, minWidth: "200px", marginBottom: 0 }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Cari nama vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "40px" }}
              />
            </div>
          </div>

          <div className="badge badge-primary">
            <Filter size={14} />
            {filteredVendors.length} Vendor
          </div>
        </div>
      </div>

      {/* Vendor Cards */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
      >
        {filteredVendors.map((vendor) => {
          const debt = getVendorDebt(vendor.id);
          return (
            <div key={vendor.id} className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-4)",
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
                      width: 48,
                      height: 48,
                      borderRadius: "var(--radius-lg)",
                      background:
                        "linear-gradient(135deg, var(--accent-500), var(--primary-600))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <Store size={24} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontWeight: "600",
                        fontSize: "var(--text-base)",
                        marginBottom: "2px",
                      }}
                    >
                      {vendor.name}
                    </h3>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--text-muted)",
                      }}
                    >
                      ID: {vendor.id}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "var(--space-2)",
                  }}
                >
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Lihat"
                    style={{ color: "var(--accent-400)" }}
                    onClick={() => handleView(vendor)}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Edit"
                    style={{ color: "var(--primary-400)" }}
                    onClick={() => handleEdit(vendor)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Hapus"
                    style={{ color: "var(--danger-400)" }}
                    onClick={() => setDeleteConfirm(vendor)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    fontSize: "var(--text-sm)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <MapPin size={14} style={{ flexShrink: 0 }} />
                  {vendor.address}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    fontSize: "var(--text-sm)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Phone size={14} style={{ flexShrink: 0 }} />
                  {vendor.phone}
                </div>
              </div>

              <div
                style={{
                  background:
                    debt > 0
                      ? "rgba(239, 68, 68, 0.1)"
                      : "rgba(34, 197, 94, 0.1)",
                  border: `1px solid ${
                    debt > 0
                      ? "rgba(239, 68, 68, 0.25)"
                      : "rgba(34, 197, 94, 0.25)"
                  }`,
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    fontSize: "var(--text-sm)",
                    color:
                      debt > 0 ? "var(--danger-400)" : "var(--success-400)",
                  }}
                >
                  <CreditCard size={16} />
                  Saldo Hutang
                </div>
                <div
                  className="font-mono font-bold"
                  style={{
                    color:
                      debt > 0 ? "var(--danger-400)" : "var(--success-400)",
                    fontSize: "var(--text-base)",
                  }}
                >
                  {formatCurrency(debt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredVendors.length === 0 && (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "var(--space-12)",
          }}
        >
          <Store
            size={48}
            style={{
              color: "var(--text-muted)",
              marginBottom: "var(--space-4)",
            }}
          />
          <h3 style={{ marginBottom: "var(--space-2)" }}>
            {searchQuery ? "Tidak Ditemukan" : "Belum Ada Vendor"}
          </h3>
          <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
            {searchQuery
              ? "Coba ubah kata kunci pencarian"
              : "Tambahkan vendor pertama Anda"}
          </p>
          {!searchQuery && (
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} />
              Tambah Vendor Pertama
            </button>
          )}
        </div>
      )}

      {/* View Modal */}
      {viewModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-6)",
              width: "100%",
              maxWidth: "500px",
              border: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-4)",
              }}
            >
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "600" }}>
                Detail Vendor
              </h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setViewModal(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  ID
                </div>
                <div style={{ fontWeight: "500" }}>{viewModal.id}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Nama Vendor
                </div>
                <div style={{ fontWeight: "500" }}>{viewModal.name}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Alamat
                </div>
                <div style={{ fontWeight: "500" }}>{viewModal.address}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Telepon
                </div>
                <div style={{ fontWeight: "500" }}>{viewModal.phone}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Saldo Hutang
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontWeight: "500",
                    color:
                      getVendorDebt(viewModal.id) > 0
                        ? "var(--danger-400)"
                        : "var(--success-400)",
                  }}
                >
                  {formatCurrency(getVendorDebt(viewModal.id))}
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: "var(--space-6)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setViewModal(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-6)",
              width: "100%",
              maxWidth: "500px",
              border: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-4)",
              }}
            >
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "600" }}>
                Edit Vendor
              </h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setEditModal(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
              }}
            >
              <div className="form-group">
                <label className="form-label">Nama Vendor</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.name || ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Alamat</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.address || ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">No. Telepon</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.phone || ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div
              style={{
                marginTop: "var(--space-6)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "var(--space-3)",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setEditModal(null)}
              >
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={handleEditSubmit}
                disabled={isLoading}
              >
                <Save size={16} />
                {isLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-6)",
              width: "100%",
              maxWidth: "400px",
              border: "1px solid var(--border-color)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-4)",
              }}
            >
              <AlertTriangle size={30} style={{ color: "var(--danger-400)" }} />
            </div>
            <h3
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "600",
                marginBottom: "var(--space-2)",
              }}
            >
              Hapus Vendor?
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: "var(--space-6)",
              }}
            >
              Anda yakin ingin menghapus vendor{" "}
              <strong>{deleteConfirm.name}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </p>
            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                justifyContent: "center",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Batal
              </button>
              <button
                className="btn"
                style={{ background: "var(--danger-500)", color: "white" }}
                onClick={handleDeleteConfirm}
                disabled={isLoading}
              >
                <Trash2 size={16} />
                {isLoading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
