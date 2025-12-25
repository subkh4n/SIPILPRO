import { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label = "Pilih Tanggal",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update position when opening
  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
    setIsOpen(!isOpen);
  };

  // Get calendar data
  const getCalendarDays = (month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPadding = monthStart.getDay();
    const paddedDays = [];

    for (let i = 0; i < startPadding; i++) {
      paddedDays.push(null);
    }

    return [...paddedDays, ...days];
  };

  const handleDateClick = (date) => {
    if (!date) return;

    if (selectingStart) {
      onStartDateChange(format(date, "yyyy-MM-dd"));
      setSelectingStart(false);
    } else {
      const start = parseISO(startDate);
      if (date < start) {
        onStartDateChange(format(date, "yyyy-MM-dd"));
        onEndDateChange(format(start, "yyyy-MM-dd"));
      } else {
        onEndDateChange(format(date, "yyyy-MM-dd"));
      }
      setSelectingStart(true);
      setIsOpen(false);
    }
  };

  const isInRange = (date) => {
    if (!date || !startDate || !endDate) return false;
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      return isWithinInterval(date, { start, end });
    } catch {
      return false;
    }
  };

  const isStart = (date) => {
    if (!date || !startDate) return false;
    try {
      return isSameDay(date, parseISO(startDate));
    } catch {
      return false;
    }
  };

  const isEnd = (date) => {
    if (!date || !endDate) return false;
    try {
      return isSameDay(date, parseISO(endDate));
    } catch {
      return false;
    }
  };

  const calendarDays = getCalendarDays(currentMonth);

  // Preset ranges
  const presets = [
    {
      label: "Minggu Ini",
      getRange: () => {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { start, end };
      },
    },
    {
      label: "Bulan Ini",
      getRange: () => ({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
      }),
    },
    {
      label: "Bulan Lalu",
      getRange: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
        };
      },
    },
    {
      label: "30 Hari Terakhir",
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        return { start, end };
      },
    },
  ];

  const applyPreset = (preset) => {
    const { start, end } = preset.getRange();
    onStartDateChange(format(start, "yyyy-MM-dd"));
    onEndDateChange(format(end, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {label && (
        <label
          className="form-label"
          style={{ marginBottom: "var(--space-2)", display: "block" }}
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-3) var(--space-4)",
          background: "var(--bg-input)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          cursor: "pointer",
          minWidth: "280px",
          transition: "all var(--transition-fast)",
        }}
      >
        <Calendar size={18} style={{ color: "var(--text-muted)" }} />
        <span style={{ flex: 1, textAlign: "left" }}>
          {startDate && endDate ? (
            <span style={{ fontWeight: "500" }}>
              {format(parseISO(startDate), "d MMM", { locale: id })}
              <span style={{ color: "var(--text-muted)", margin: "0 6px" }}>
                —
              </span>
              {format(parseISO(endDate), "d MMM yyyy", { locale: id })}
            </span>
          ) : (
            <span style={{ color: "var(--text-muted)" }}>
              Pilih rentang tanggal
            </span>
          )}
        </span>
        {startDate && endDate && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartDateChange("");
              onEndDateChange("");
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px",
              color: "var(--text-muted)",
            }}
          >
            <X size={14} />
          </button>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            zIndex: 9999,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            display: "flex",
            overflow: "hidden",
            animation: "slideDown 0.2s ease-out",
          }}
        >
          {/* Presets */}
          <div
            style={{
              width: "140px",
              borderRight: "1px solid var(--border-color)",
              padding: "var(--space-3)",
            }}
          >
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "var(--space-2)",
                padding: "0 var(--space-2)",
              }}
            >
              Pintasan
            </div>
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "var(--space-2) var(--space-3)",
                  background: "transparent",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)",
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "var(--bg-tertiary)";
                  e.target.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "var(--text-secondary)";
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Calendar */}
          <div style={{ padding: "var(--space-4)", minWidth: "280px" }}>
            {/* Month Navigation */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-3)",
              }}
            >
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                style={{
                  background: "var(--bg-tertiary)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-1)",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontWeight: "600" }}>
                {format(currentMonth, "MMMM yyyy", { locale: id })}
              </span>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                style={{
                  background: "var(--bg-tertiary)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-1)",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                }}
              >
                <ChevronRight size={18} />
              </button>
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
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(
                (day, i) => (
                  <div
                    key={day}
                    style={{
                      textAlign: "center",
                      fontSize: "var(--text-xs)",
                      fontWeight: "600",
                      color:
                        i === 0 ? "var(--danger-400)" : "var(--text-muted)",
                      padding: "var(--space-1)",
                    }}
                  >
                    {day}
                  </div>
                )
              )}
            </div>

            {/* Calendar Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "2px",
              }}
            >
              {calendarDays.map((date, index) => {
                const inRange = date && isInRange(date);
                const isStartDate = date && isStart(date);
                const isEndDate = date && isEnd(date);
                const isToday =
                  date &&
                  format(date, "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd");
                const isSunday = date && date.getDay() === 0;

                return (
                  <button
                    key={index}
                    type="button"
                    disabled={!date}
                    onClick={() => handleDateClick(date)}
                    style={{
                      aspectRatio: "1",
                      padding: "var(--space-1)",
                      background:
                        isStartDate || isEndDate
                          ? "var(--primary-500)"
                          : inRange
                          ? "rgba(59, 130, 246, 0.2)"
                          : isToday
                          ? "rgba(59, 130, 246, 0.1)"
                          : "transparent",
                      border:
                        isToday && !isStartDate && !isEndDate
                          ? "1px solid var(--primary-500)"
                          : "1px solid transparent",
                      borderRadius:
                        isStartDate && isEndDate
                          ? "var(--radius-md)"
                          : isStartDate
                          ? "var(--radius-md) 0 0 var(--radius-md)"
                          : isEndDate
                          ? "0 var(--radius-md) var(--radius-md) 0"
                          : inRange
                          ? "0"
                          : "var(--radius-md)",
                      cursor: date ? "pointer" : "default",
                      fontSize: "var(--text-sm)",
                      fontWeight: isStartDate || isEndDate ? "600" : "400",
                      color:
                        isStartDate || isEndDate
                          ? "white"
                          : isSunday
                          ? "var(--danger-400)"
                          : date
                          ? "var(--text-primary)"
                          : "transparent",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    {date ? format(date, "d") : ""}
                  </button>
                );
              })}
            </div>

            {/* Selection Info */}
            <div
              style={{
                marginTop: "var(--space-3)",
                paddingTop: "var(--space-3)",
                borderTop: "1px solid var(--border-color)",
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                textAlign: "center",
              }}
            >
              {selectingStart ? "Pilih tanggal mulai" : "Pilih tanggal akhir"}
            </div>
          </div>

          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
