import COLORS from "../../constants/colors";

export default function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: COLORS.navyMid, border: "1px solid rgba(59,130,246,0.3)",
          borderRadius: 20, padding: 32, minWidth: 380, maxWidth: 480,
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{
            margin: 0, color: COLORS.white, fontSize: 18,
            fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: COLORS.gray, fontSize: 20, cursor: "pointer" }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
