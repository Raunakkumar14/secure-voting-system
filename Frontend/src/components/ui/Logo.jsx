import COLORS from "../../constants/colors";

export default function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, boxShadow: `0 0 20px rgba(26,86,219,0.5)`,
      }}>
        ⛓️
      </div>
      <div>
        <div style={{
          fontSize: 15, fontWeight: 800, letterSpacing: 1, color: COLORS.white,
          fontFamily: "'Rajdhani', sans-serif",
        }}>
          VOTECHAIN
        </div>
        <div style={{ fontSize: 9, letterSpacing: 3, color: COLORS.cyan, textTransform: "uppercase" }}>
          Blockchain Secure
        </div>
      </div>
    </div>
  );
}
