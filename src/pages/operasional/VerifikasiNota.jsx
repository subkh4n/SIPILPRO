import { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/helpers";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import {
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Store,
  Calendar,
  Clock,
  AlertTriangle,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  X,
} from "lucide-react";

export default function VerifikasiNota() {
  const { purchases, updatePurchase, deletePurchase, refreshData } = useData();
  const toast = useToast();

  // Derive notes directly from purchases context
  const notes = useMemo(() => {
    return purchases
      .filter((p) => p.verifyStatus !== undefined) // Only show items that need verification or have been verified
      .map((p) => ({
        ...p,
        invoiceNo: p.invoiceNo || `INV-${p.id}`,
        vendorName: p.vendorName || "Unknown Vendor",
        projectName: p.projectName || "Unknown Project",
        submittedBy: p.submittedBy || "Admin",
        submittedAt: p.date
          ? new Date(p.date).toISOString()
          : new Date().toISOString(),
      }))
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }, [purchases]);

  const [selectedNote, setSelectedNote] = useState(null);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filter notes
  const filteredNotes = useMemo(() => {
    if (filterStatus === "all") return notes;
    return notes.filter((n) => (n.verifyStatus || "pending") === filterStatus);
  }, [notes, filterStatus]);

  // Approve note
  const handleApprove = async (noteId) => {
    setIsLoading(true);
    try {
      // ONLY update verifyStatus, preserve original payment status (paid/unpaid)
      await updatePurchase(noteId, {
        verifyStatus: "approved",
      });
      setSelectedNote(null);
      refreshData();
    } catch (err) {
      toast.error("Gagal menyetujui nota: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reject note
  const handleReject = async (noteId) => {
    const reason = prompt("Alasan penolakan:");
    if (reason) {
      setIsLoading(true);
      try {
        await updatePurchase(noteId, {
          verifyStatus: "rejected",
          rejectReason: reason,
        });
        setSelectedNote(null);
        refreshData();
      } catch (err) {
        toast.error("Gagal menolak nota: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };
  // Delete note
  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      await deletePurchase(deleteConfirm.id);
      setDeleteConfirm(null);
      if (selectedNote?.id === deleteConfirm.id) {
        setSelectedNote(null);
      }
      refreshData();
    } catch (err) {
      toast.error("Gagal menghapus nota: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="badge badge-success">
            <CheckCircle2 size={12} />
            Disetujui
          </span>
        );
      case "rejected":
        return (
          <span className="badge badge-danger">
            <XCircle size={12} />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="badge badge-warning">
            <Clock size={12} />
            Menunggu
          </span>
        );
    }
  };

  const pendingCount = notes.filter(
    (n) => (n.verifyStatus || "pending") === "pending"
  ).length;

  return (
    <div className="animate-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Verifikasi Nota</h1>
        <p className="page-subtitle">
          Halaman admin untuk menyetujui/menolak nota yang masuk
        </p>
      </div>

      {/* Alert for pending */}
      {pendingCount > 0 && (
        <div
          className="alert alert-warning mb-6"
          style={{ marginBottom: "var(--space-6)" }}
        >
          <AlertTriangle size={20} />
          <div>
            <strong>{pendingCount} nota</strong> menunggu verifikasi Anda
          </div>
        </div>
      )}

      {/* Filter */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          marginBottom: "var(--space-6)",
        }}
      >
        <button
          className={`btn btn-sm ${
            filterStatus === "all" ? "btn-primary" : "btn-secondary"
          }`}
          onClick={() => setFilterStatus("all")}
        >
          Semua
        </button>
        <button
          className={`btn btn-sm ${
            filterStatus === "pending" ? "btn-primary" : "btn-secondary"
          }`}
          onClick={() => setFilterStatus("pending")}
        >
          Menunggu ({pendingCount})
        </button>
        <button
          className={`btn btn-sm ${
            filterStatus === "approved" ? "btn-primary" : "btn-secondary"
          }`}
          onClick={() => setFilterStatus("approved")}
        >
          Disetujui
        </button>
        <button
          className={`btn btn-sm ${
            filterStatus === "rejected" ? "btn-primary" : "btn-secondary"
          }`}
          onClick={() => setFilterStatus("rejected")}
        >
          Ditolak
        </button>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Notes List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Daftar Nota</h3>
            <div className="badge badge-primary">
              <Filter size={14} />
              {filteredNotes.length}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  padding: "var(--space-4)",
                  background:
                    selectedNote?.id === note.id
                      ? "rgba(59, 130, 246, 0.1)"
                      : "var(--bg-input)",
                  border:
                    selectedNote?.id === note.id
                      ? "1px solid var(--primary-500)"
                      : "1px solid transparent",
                  borderRadius: "var(--radius-lg)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                onClick={() => setSelectedNote(note)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600" }}>{note.invoiceNo}</div>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {note.vendorName}
                    </div>
                  </div>
                  {getStatusBadge(note.verifyStatus || "pending")}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Calendar size={12} style={{ marginRight: "4px" }} />
                    {format(parseISO(note.date), "d MMM yyyy", { locale: id })}
                  </div>
                  <div
                    className="font-mono font-bold"
                    style={{ color: "var(--primary-400)" }}
                  >
                    {formatCurrency(note.total)}
                  </div>
                </div>
              </div>
            ))}

            {filteredNotes.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--space-8)",
                  color: "var(--text-muted)",
                }}
              >
                <FileText
                  size={48}
                  style={{ marginBottom: "var(--space-3)", opacity: 0.5 }}
                />
                <p>Tidak ada nota</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Detail Nota</h3>
          </div>

          {!selectedNote ? (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-12)",
                color: "var(--text-muted)",
              }}
            >
              <Eye
                size={48}
                style={{ marginBottom: "var(--space-3)", opacity: 0.5 }}
              />
              <p>Pilih nota untuk melihat detail</p>
            </div>
          ) : (
            <div>
              {/* Header Info */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-4)",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    No. Invoice
                  </div>
                  <div style={{ fontWeight: "600" }}>
                    {selectedNote.invoiceNo}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    Tanggal
                  </div>
                  <div style={{ fontWeight: "500" }}>
                    {format(parseISO(selectedNote.date), "d MMMM yyyy", {
                      locale: id,
                    })}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    Vendor
                  </div>
                  <div style={{ fontWeight: "500" }}>
                    {selectedNote.vendorName}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    Proyek
                  </div>
                  <div style={{ fontWeight: "500" }}>
                    {selectedNote.projectName}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "var(--space-2)",
                }}
              >
                Item
              </div>
              <div
                className="table-container mb-4"
                style={{ marginBottom: "var(--space-4)" }}
              >
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th style={{ textAlign: "right" }}>Qty</th>
                      <th style={{ textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedNote.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td style={{ textAlign: "right" }}>
                          {item.qty} {item.unit}
                        </td>
                        <td
                          style={{ textAlign: "right" }}
                          className="font-mono"
                        >
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "var(--bg-tertiary)" }}>
                      <td colSpan="2" style={{ fontWeight: "600" }}>
                        TOTAL
                      </td>
                      <td
                        style={{ textAlign: "right", fontWeight: "700" }}
                        className="font-mono"
                      >
                        {formatCurrency(selectedNote.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Submitted Info */}
              <div
                style={{
                  padding: "var(--space-3)",
                  background: "var(--bg-input)",
                  borderRadius: "var(--radius-lg)",
                  marginBottom: "var(--space-4)",
                  fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                Dikirim oleh <strong>{selectedNote.submittedBy}</strong> pada{" "}
                {format(
                  parseISO(selectedNote.submittedAt),
                  "d MMM yyyy HH:mm",
                  { locale: id }
                )}
              </div>

              {/* Actions */}
              {(selectedNote.verifyStatus || "pending") === "pending" && (
                <div style={{ display: "flex", gap: "var(--space-3)" }}>
                  <button
                    className="btn btn-danger btn-full"
                    onClick={() => handleReject(selectedNote.id)}
                  >
                    <ThumbsDown size={18} />
                    Tolak
                  </button>
                  <button
                    className="btn btn-success btn-full"
                    onClick={() => handleApprove(selectedNote.id)}
                  >
                    <ThumbsUp size={18} />
                    Setujui
                  </button>
                </div>
              )}

              {selectedNote.verifyStatus === "approved" && (
                <div className="alert alert-success">
                  <CheckCircle2 size={18} />
                  Nota ini sudah disetujui
                </div>
              )}

              {selectedNote.verifyStatus === "rejected" && (
                <div className="alert alert-danger">
                  <XCircle size={18} />
                  <div>
                    <strong>Ditolak</strong>
                    {selectedNote.rejectReason && (
                      <p>{selectedNote.rejectReason}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
              Hapus Nota?
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: "var(--space-6)",
              }}
            >
              Anda yakin ingin menghapus nota{" "}
              <strong>{deleteConfirm.invoiceNo}</strong>? Tindakan ini tidak
              dapat dibatalkan.
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
