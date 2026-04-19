import COLORS from "../../constants/colors";
import Logo from "../ui/Logo";
import ChainBlock from "../ui/ChainBlock";

export default function Navbar({ setPage, user, onLogout }) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: "rgba(10,14,26,0.85)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      padding: "0 32px", height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <button onClick={() => setPage("landing")} style={{ background: "none", border: "none", cursor: "pointer" }}>
        <Logo />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <ChainBlock active />
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: COLORS.gray }}>
              {user.role === "admin" ? "👑" : "🗳️"} {user.name}
            </span>
            <button onClick={onLogout} style={{
              padding: "7px 16px", borderRadius: 8,
              border: "1px solid rgba(239,68,68,0.4)",
              background: "rgba(239,68,68,0.1)", color: "#fca5a5",
              fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setPage("login")} style={{
              padding: "7px 18px", borderRadius: 8,
              border: `1px solid rgba(59,130,246,0.4)`,
              background: "rgba(59,130,246,0.1)", color: COLORS.blueLight,
              fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}>
              Login
            </button>
            <button onClick={() => setPage("register")} style={{
              padding: "7px 18px", borderRadius: 8, border: "none",
              background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})`,
              color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 700,
            }}>
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
