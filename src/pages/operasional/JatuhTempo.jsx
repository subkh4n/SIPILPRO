import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/helpers";
import { format, differenceInDays, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Store,
} from "lucide-react";
import { useState } from "react";

export default function JatuhTempo() {
  const { purchases, vendors, payDebt } = useData();
  const toast = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get unpaid purchases
  const unpaidPurchases = purchases.filter((p) => p.status === "unpaid");

  // Get vendor name
  const getVendorName = (vendorId) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor?.name || "Unknown";
  };

  // Get days until due
  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = parseISO(dueDate);
    return differenceInDays(due, today);
  };

  // Get urgency color
  const getUrgencyColor = (days) => {
    if (days === null) return "var(--gray-400)";
    if (days < 0) return "var(--danger-500)";
    if (days === 0) return "var(--danger-400)";
    if (days <= 3) return "var(--warning-400)";
    return "var(--success-400)";
  };

  // Get urgency badge
  const getUrgencyBadge = (days) => {
    if (days === null) return { text: "Tidak Ada", class: "badge-gray" };
    if (days < 0)
      return { text: `Lewat ${Math.abs(days)} hari`, class: "badge-danger" };
    if (days === 0) return { text: "Hari Ini!", class: "badge-danger" };
    if (days <= 3) return { text: `${days} hari lagi`, class: "badge-warning" };
    if (days <= 7) return { text: `${days} hari lagi`, class: "badge-primary" };
    return { text: `${days} hari lagi`, class: "badge-success" };
  };

  // Sort by urgency (most urgent first)
  const sortedPurchases = [...unpaidPurchases].sort((a, b) => {
    const daysA = getDaysUntilDue(a.dueDate) ?? 999;
    const daysB = getDaysUntilDue(b.dueDate) ?? 999;
    return daysA - daysB;
  });

  // Get calendar data
  const getCalendarData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Padding days from previous month
    for (let i = 0; i < startPadding; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        i
      ).padStart(2, "0")}`;
      const duePurchases = unpaidPurchases.filter((p) => p.dueDate === dateStr);
      const isToday = new Date().toISOString().split("T")[0] === dateStr;

      days.push({
        day: i,
        date: dateStr,
        isCurrentMonth: true,
        isToday,
        purchases: duePurchases,
      });
    }

    return days;
  };

  const calendarDays = getCalendarData();

  // Navigate months
  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  // Handle pay
  const [payingId, setPayingId] = useState(null);

  const handlePay = async (purchase) => {
    if (
      window.confirm(
        `Bayar hutang ${purchase.invoiceNo} sebesar ${formatCurrency(
          purchase.total
        )}?`
      )
    ) {
      setPayingId(purchase.id);
      try {
        await payDebt(purchase.id, purchase.total);
      } catch (err) {
        toast.error("Gagal memproses pembayaran: " + err.message);
      } finally {
        setPayingId(null);
      }
    }
  };

  return (
    <div className="animate-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Jatuh Tempo Hutang</h1>
        <p className="page-subtitle">Kalender pengingat pembayaran ke vendor</p>
      </div>

      {/* Summary Cards */}
      <div
        className="grid gap-4 mb-6"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          marginBottom: "var(--space-6)",
        }}
      >
        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--danger-500)" }}
        >
          <div className="stat-icon danger">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Sudah Lewat</div>
            <div className="stat-value">
              {
                sortedPurchases.filter((p) => getDaysUntilDue(p.dueDate) < 0)
                  .length
              }
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--warning-500)" }}
        >
          <div className="stat-icon warning">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Hari Ini / Besok</div>
            <div className="stat-value">
              {
                sortedPurchases.filter((p) => {
                  const days = getDaysUntilDue(p.dueDate);
                  return days !== null && days >= 0 && days <= 1;
                }).length
              }
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--primary-500)" }}
        >
          <div className="stat-icon primary">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Minggu Ini</div>
            <div className="stat-value">
              {
                sortedPurchases.filter((p) => {
                  const days = getDaysUntilDue(p.dueDate);
                  return days !== null && days >= 0 && days <= 7;
                }).length
              }
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--stat-accent": "var(--success-500)" }}
        >
          <div className="stat-icon success">
            <CreditCard size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Hutang</div>
            <div className="stat-value small">
              {formatCurrency(
                unpaidPurchases.reduce(
                  (sum, p) => sum + (parseFloat(p.total) || 0),
                  0
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Calendar */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Kalender</h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <button className="btn btn-ghost btn-sm" onClick={prevMonth}>
                <ChevronLeft size={18} />
              </button>
              <span
                style={{
                  minWidth: "140px",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                {format(currentMonth, "MMMM yyyy", { locale: id })}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={nextMonth}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "2px",
              marginBottom: "var(--space-2)",
            }}
          >
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  fontSize: "var(--text-xs)",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  padding: "var(--space-2)",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "2px",
            }}
          >
            {calendarDays.map((dayData, index) => (
              <div
                key={index}
                style={{
                  aspectRatio: "1",
                  padding: "var(--space-1)",
                  background: dayData.isToday
                    ? "rgba(59, 130, 246, 0.2)"
                    : dayData.isCurrentMonth
                    ? "var(--bg-input)"
                    : "transparent",
                  borderRadius: "var(--radius-md)",
                  border: dayData.isToday
                    ? "1px solid var(--primary-500)"
                    : "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {dayData.day && (
                  <>
                    <span
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: dayData.isToday ? "600" : "400",
                        color: dayData.isToday
                          ? "var(--primary-400)"
                          : "var(--text-primary)",
                      }}
                    >
                      {dayData.day}
                    </span>
                    {dayData.purchases?.length > 0 && (
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "var(--danger-500)",
                          marginTop: "2px",
                        }}
                        title={`${dayData.purchases.length} hutang jatuh tempo`}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Daftar Jatuh Tempo</h3>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            {sortedPurchases.slice(0, 8).map((purchase) => {
              const days = getDaysUntilDue(purchase.dueDate);
              const urgency = getUrgencyBadge(days);

              return (
                <div
                  key={purchase.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--space-3)",
                    background: "var(--bg-input)",
                    borderRadius: "var(--radius-lg)",
                    borderLeft: `3px solid ${getUrgencyColor(days)}`,
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
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Store size={18} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "500",
                          fontSize: "var(--text-sm)",
                        }}
                      >
                        {purchase.invoiceNo}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {getVendorName(purchase.vendorId)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      className="font-mono"
                      style={{ fontSize: "var(--text-sm)", fontWeight: "600" }}
                    >
                      {formatCurrency(purchase.total)}
                    </div>
                    <span
                      className={`badge ${urgency.class}`}
                      style={{ marginTop: "4px" }}
                    >
                      {urgency.text}
                    </span>
                  </div>

                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handlePay(purchase)}
                    style={{ marginLeft: "var(--space-3)" }}
                    disabled={payingId === purchase.id}
                  >
                    {payingId === purchase.id ? (
                      <>
                        <div
                          className="spinner-border spinner-border-sm text-light me-1"
                          role="status"
                          style={{ width: "0.8rem", height: "0.8rem" }}
                        ></div>
                        Bayar...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        Bayar
                      </>
                    )}
                  </button>
                </div>
              );
            })}

            {sortedPurchases.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--space-8)",
                  color: "var(--text-muted)",
                }}
              >
                <CheckCircle2
                  size={48}
                  style={{ marginBottom: "var(--space-3)", opacity: 0.5 }}
                />
                <p>Tidak ada hutang yang perlu dibayar 🎉</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
