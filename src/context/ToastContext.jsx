import { createContext, useState, useCallback, useContext } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const ToastContext = createContext(null);

// Custom hook - exported from this file to avoid Fast Refresh warning
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Toast types with colors
const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    bgColor: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    borderColor: "#10b981",
  },
  error: {
    icon: AlertCircle,
    bgColor: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    borderColor: "#ef4444",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    borderColor: "#f59e0b",
  },
  info: {
    icon: Info,
    bgColor: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    borderColor: "#3b82f6",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }

    return id;
  }, []);

  // Shorthand methods
  const success = useCallback(
    (message, duration) => addToast(message, "success", duration),
    [addToast]
  );
  const error = useCallback(
    (message, duration) => addToast(message, "error", duration),
    [addToast]
  );
  const warning = useCallback(
    (message, duration) => addToast(message, "warning", duration),
    [addToast]
  );
  const info = useCallback(
    (message, duration) => addToast(message, "info", duration),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ addToast, removeToast, success, error, warning, info }}
    >
      {children}

      {/* Toast Container - Fixed at top right */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => {
          const toastConfig = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
          const Icon = toastConfig.icon;

          return (
            <div
              key={toast.id}
              style={{
                background: toastConfig.bgColor,
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "white",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                minWidth: "320px",
                maxWidth: "420px",
                pointerEvents: "auto",
                animation: "slideInRight 0.3s ease-out",
                backdropFilter: "blur(10px)",
                border: `1px solid ${toastConfig.borderColor}40`,
              }}
            >
              <Icon size={22} style={{ flexShrink: 0 }} />
              <span
                style={{
                  flex: 1,
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "1.4",
                }}
              >
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.2)";
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Animation keyframes */}
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </ToastContext.Provider>
  );
}

