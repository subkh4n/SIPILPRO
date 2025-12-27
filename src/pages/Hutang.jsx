import { useState, useMemo } from "react";
import { useData } from "../context";
import { formatCurrency, getDueDateStatus } from "../utils/helpers";
import { format } from "date-fns";
import {
  Filter,
  CreditCard,
  Wallet,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function Hutang() {
  const { purchases, vendors, cashBalance, getTotalDebt, getVendor, payDebt } =
    useData();

  const [statusFilter, setStatusFilter] = useState("unpaid");
  const [vendorFilter, setVendorFilter] = useState("all");

  // Filter purchases
  const filteredPurchases = useMemo(() => {
    return purchases
      .filter((p) => {
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        if (vendorFilter !== "all" && p.vendorId !== vendorFilter) return false;
        return true;
      })
      .sort((a, b) => {
        // Sort by due date (closest first)
        if (a.status === "unpaid" && b.status === "unpaid") {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return 0;
      });
  }, [purchases, statusFilter, vendorFilter]);

  const totalDebt = getTotalDebt();

  // Handle pay
  const handlePay = (purchase) => {
    if (
      window.confirm(
        `Bayar hutang ${purchase.invoiceNo} sebesar ${formatCurrency(
          purchase.total
        )}?`
      )
    ) {
      payDebt(purchase.id, purchase.total);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Daftar Hutang Usaha</h1>
        <p className="page-subtitle">
          Accounts Payable - Monitoring hutang vendor
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6" style={{ marginBottom: "var(--space-6)" }}>
        <div
          style={{
            display: "flex",
            gap: "var(--space-4)",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Filter size={18} style={{ color: "var(--text-muted)" }} />

          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: "150px" }}
            >
              <option value="all">Semua Status</option>
              <option value="unpaid">Belum Lunas</option>
              <option value="paid">Sudah Lunas</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              className="form-select"
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              style={{ minWidth: "180px" }}
            >
              <option value="all">Semua Vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="table-container mb-6"
        style={{ marginBottom: "var(--space-6)" }}
      >
        <table className="table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Vendor</th>
              <th>No. Nota</th>
              <th>Jatuh Tempo</th>
              <th style={{ textAlign: "right" }}>Sisa Hutang</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "var(--space-8)",
                    color: "var(--text-muted)",
                  }}
                >
                  Tidak ada data hutang
                </td>
              </tr>
            ) : (
              filteredPurchases.map((purchase) => {
                const vendor = getVendor(purchase.vendorId);
                const dueStatus =
                  purchase.status === "unpaid"
                    ? getDueDateStatus(purchase.dueDate)
                    : null;

                return (
                  <tr key={purchase.id}>
                    <td>{format(new Date(purchase.date), "dd/MM/yyyy")}</td>
                    <td>
                      <strong>{vendor?.name || "-"}</strong>
                    </td>
                    <td className="font-mono">{purchase.invoiceNo}</td>
                    <td>
                      {purchase.status === "unpaid" ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-2)",
                          }}
                        >
                          <span>
                            {format(new Date(purchase.dueDate), "dd/MM")}
                          </span>
                          <span className={`badge ${dueStatus.className}`}>
                            {dueStatus.label}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="font-mono font-bold">
                        {purchase.status === "unpaid" ? (
                          formatCurrency(purchase.total)
                        ) : (
                          <span className="text-muted">Lunas</span>
                        )}
                      </span>
                    </td>
                    <td>
                      {purchase.status === "paid" ? (
                        <span className="badge badge-success">
                          <CheckCircle size={12} />
                          LUNAS
                        </span>
                      ) : (
                        <span className="badge badge-warning">BELUM</span>
                      )}
                    </td>
                    <td>
                      {purchase.status === "unpaid" && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handlePay(purchase)}
                        >
                          Bayar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
      >
        <div
          className="card"
          style={{
            background:
              "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.1))",
            border: "1px solid rgba(245, 158, 11, 0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "var(--radius-md)",
                background: "rgba(245, 158, 11, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--warning-500)",
              }}
            >
              <CreditCard size={24} />
            </div>
            <div>
              <p
                style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}
              >
                Total Hutang Berjalan
              </p>
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "var(--warning-500)",
                }}
              >
                {formatCurrency(totalDebt)}
              </p>
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            background:
              "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.1))",
            border: "1px solid rgba(59, 130, 246, 0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "var(--radius-md)",
                background: "rgba(59, 130, 246, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary-400)",
              }}
            >
              <Wallet size={24} />
            </div>
            <div>
              <p
                style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}
              >
                Saldo Kas Saat Ini
              </p>
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "var(--primary-400)",
                }}
              >
                {formatCurrency(cashBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning if debt > cash */}
      {totalDebt > cashBalance && (
        <div
          className="alert alert-danger"
          style={{ marginTop: "var(--space-6)" }}
        >
          <AlertTriangle size={20} />
          <div>
            <strong>Peringatan!</strong>
            <p style={{ fontSize: "0.875rem", marginTop: "4px" }}>
              Total hutang melebihi saldo kas. Selisih:{" "}
              {formatCurrency(totalDebt - cashBalance)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
