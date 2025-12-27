import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
}) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: { maxWidth: "400px" },
    md: { maxWidth: "500px" },
    lg: { maxWidth: "700px" },
    xl: { maxWidth: "900px" },
    full: { maxWidth: "95vw", width: "100%" },
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "var(--space-4)",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        className="modal-content card"
        style={{
          width: "100%",
          ...sizeStyles[size],
          animation: "slideUp 0.3s ease-out",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div
            className="modal-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "var(--space-4) var(--space-5)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <h3 style={{ fontWeight: "600", fontSize: "var(--text-lg)" }}>
              {title}
            </h3>
            {showClose && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={onClose}
                style={{ marginRight: "-8px" }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          className="modal-body"
          style={{
            padding: "var(--space-5)",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

