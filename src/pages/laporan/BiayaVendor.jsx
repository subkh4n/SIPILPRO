import { useState, useMemo } from "react";
import { useData } from "../../context";
import { formatCurrency } from "../../utils/helpers";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import {
  Store,
  Download,
  Filter,
  Package,
  TrendingUp,
  Calendar,
  FileText,
} from "lucide-react";

export default function BiayaVendor() {
  const { vendors, purchases } = useData();
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [selectedVendor, setSelectedVendor] = useState("all");

  // Parse selected month
  const monthDate = new Date(selectedMonth + "-01");
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  // Calculate spending per vendor
  const vendorData = useMemo(() => {
    return vendors.map((vendor) => {
      // Filter purchases for this vendor in selected month
      const vendorPurchases = purchases.filter((p) => {
        const purchaseDate = parseISO(p.date);
        return (
          p.vendorId === vendor.id &&
          purchaseDate >= monthStart &&
          purchaseDate <= monthEnd
        );
      });

      // Calculate totals
      const totalPurchases = vendorPurchases.length;
      const totalAmount = vendorPurchases.reduce(
        (sum, p) => sum + (parseFloat(p.total) || 0),
        0
      );
      const paidAmount = vendorPurchases
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
      const unpaidAmount = vendorPurchases
        .filter((p) => p.status === "unpaid")
        .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);

      // Get item breakdown
      const itemBreakdown = {};
      vendorPurchases.forEach((p) => {
        p.items?.forEach((item) => {
          if (itemBreakdown[item.name]) {
            itemBreakdown[item.name].qty += item.qty;
            itemBreakdown[item.name].total += item.total;
          } else {
            itemBreakdown[item.name] = {
              name: item.name,
              unit: item.unit,
              qty: item.qty,
              total: item.total,
            };
          }
        });
      });

      return {
        ...vendor,
        totalPurchases,
        totalAmount,
        paidAmount,
        unpaidAmount,
        items: Object.values(itemBreakdown),
        purchases: vendorPurchases,
      };
    });
  }, [vendors, purchases, monthStart, monthEnd]);

  // Filter by selected vendor
  const filteredData =
    selectedVendor === "all"
      ? vendorData.filter((v) => v.totalPurchases > 0)
      : vendorData.filter((v) => v.id === selectedVendor);

  // Summary totals
  const totalSpending = filteredData.reduce((sum, v) => sum + v.totalAmount, 0);
  const totalPaid = filteredData.reduce((sum, v) => sum + v.paidAmount, 0);
  const totalUnpaid = filteredData.reduce((sum, v) => sum + v.unpaidAmount, 0);
  const totalInvoices = filteredData.reduce(
    (sum, v) => sum + v.totalPurchases,
    0
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
          <h1 className="page-title">Biaya Vendor</h1>
          <p className="page-subtitle">
            Rekap belanja material/jasa per vendor
          </p>
        </div>
        <button className="btn btn-secondary">
          <Download size={18} />
          Export Excel
        </button>
      </div>

      {/* Filter */}
      <div
        className="card mb-6"
        style={{ marginBottom: "var(--space-6)", padding: "var(--space-4)" }}
      >
        <div
          style={{
            display: "flex",
            gap: "var(--space-4)",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div
            className="form-group"
            style={{ minWidth: "180px", marginBottom: 0 }}
          >
            <label className="form-label">Periode</label>
            <input
              type="month"
              className="form-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>

          <div
            className="form-group"
            style={{ minWidth: "200px", marginBottom: 0 }}
          >
            <label className="form-label">Vendor</label>
            <select
              className="form-select"
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
            >
              <option value="all">Semua Vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="badge badge-primary">
            <Filter size={14} />
            {filteredData.length} Vendor
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div
        className="grid gap-4 mb-6"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          marginBottom: "var(--space-6)",
        }}
      >
        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--primary-500)" }}
        >
          <div className="stat-icon primary">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Belanja</div>
            <div className="stat-value small">
              {formatCurrency(totalSpending)}
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--success-500)" }}
        >
          <div className="stat-icon success">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Sudah Dibayar</div>
            <div className="stat-value small">{formatCurrency(totalPaid)}</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--danger-500)" }}
        >
          <div className="stat-icon danger">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Belum Dibayar</div>
            <div className="stat-value small">
              {formatCurrency(totalUnpaid)}
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--accent-500)" }}
        >
          <div className="stat-icon accent">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Invoice</div>
            <div className="stat-value">{totalInvoices}</div>
          </div>
        </div>
      </div>

      {/* Vendor Cards */}
      <div className="flex flex-col gap-4">
        {filteredData.map((vendor) => (
          <div key={vendor.id} className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
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
                  <h3 style={{ fontWeight: "600", fontSize: "var(--text-lg)" }}>
                    {vendor.name}
                  </h3>
                  <div
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {vendor.address}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  Total Belanja
                </div>
                <div
                  className="font-mono font-bold"
                  style={{
                    fontSize: "var(--text-xl)",
                    color: "var(--primary-400)",
                  }}
                >
                  {formatCurrency(vendor.totalAmount)}
                </div>
              </div>
            </div>

            {/* Summary Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "var(--space-4)",
                marginBottom: "var(--space-4)",
                padding: "var(--space-3)",
                background: "var(--bg-input)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  Jumlah Invoice
                </div>
                <div style={{ fontWeight: "600" }}>{vendor.totalPurchases}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  Lunas
                </div>
                <div style={{ fontWeight: "600", color: "var(--success-400)" }}>
                  {formatCurrency(vendor.paidAmount)}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  Belum Lunas
                </div>
                <div
                  style={{
                    fontWeight: "600",
                    color:
                      vendor.unpaidAmount > 0
                        ? "var(--danger-400)"
                        : "var(--text-primary)",
                  }}
                >
                  {formatCurrency(vendor.unpaidAmount)}
                </div>
              </div>
            </div>

            {/* Item Breakdown */}
            {vendor.items.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Rincian Item
                </div>
                <div className="table-container" style={{ border: "none" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style={{ textAlign: "right" }}>Qty</th>
                        <th style={{ textAlign: "right" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendor.items.slice(0, 5).map((item, i) => (
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
                      {vendor.items.length > 5 && (
                        <tr>
                          <td
                            colSpan="3"
                            style={{
                              textAlign: "center",
                              color: "var(--text-muted)",
                              fontSize: "var(--text-sm)",
                            }}
                          >
                            +{vendor.items.length - 5} item lainnya
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
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
          <h3 style={{ marginBottom: "var(--space-2)" }}>Tidak Ada Data</h3>
          <p className="text-muted">
            Tidak ada transaksi vendor untuk periode ini
          </p>
        </div>
      )}
    </div>
  );
}

