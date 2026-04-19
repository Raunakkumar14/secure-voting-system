import COLORS from "../../constants/colors";

export default function ChainBlock({ active }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px",
      background: active ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.05)",
      border: `1px solid ${active ? COLORS.cyan : "rgba(255,255,255,0.1)"}`,
      borderRadius: 20, fontSize: 11, color: active ? COLORS.cyan : COLORS.gray,
      fontFamily: "monospace",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: active ? COLORS.cyan : COLORS.gray,
        display: "inline-block",
      }} />
      {active ? "CHAIN ACTIVE" : "OFFLINE"}
    </div>
  );
}
