import COLORS from "../../constants/colors";

export default function Btn({ children, onClick, variant = "primary", style: s = {}, disabled }) {
  const base = {
    padding: "11px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s",
    border: "none", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5,
    opacity: disabled ? 0.5 : 1, ...s,
  };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})`, color: "#fff", boxShadow: "0 4px 20px rgba(26,86,219,0.4)" },
    secondary: { background: "rgba(255,255,255,0.06)", color: COLORS.white, border: "1px solid rgba(255,255,255,0.12)" },
    success: { background: `linear-gradient(135deg, ${COLORS.green}, #34d399)`, color: "#fff", boxShadow: "0 4px 16px rgba(16,185,129,0.4)" },
    danger: { background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}