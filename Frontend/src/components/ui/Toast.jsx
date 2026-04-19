import { useEffect } from "react";
import COLORS from "../../constants/colors";

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 9999,
      background: type === "success" ? "rgba(16,185,129,0.15)" : type === "error" ? "rgba(239,68,68,0.15)" : "rgba(26,86,219,0.15)",
      border: `1px solid ${type === "success" ? COLORS.green : type === "error" ? COLORS.red : COLORS.blue}`,
      borderRadius: 12, padding: "14px 20px", color: COLORS.white, fontSize: 14,
      backdropFilter: "blur(16px)", minWidth: 240,
      animation: "slideIn 0.3s ease",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span>{type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
      {message}
    </div>
  );
}
