import COLORS from "../../constants/colors";

const palette = [COLORS.blue, COLORS.cyan, COLORS.green, COLORS.gold, "#a78bfa"];

export default function BarChart({ data }) {
  const max = Math.max(...Object.values(data));
  const total = Object.values(data).reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
      {Object.entries(data).map(([name, votes], i) => (
        <div key={name}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: COLORS.white }}>{name}</span>
            <span style={{ fontSize: 12, color: COLORS.gray }}>
              {votes} votes ({total ? Math.round((votes / total) * 100) : 0}%)
            </span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              width: `${max ? (votes / max) * 100 : 0}%`,
              background: palette[i % palette.length],
              transition: "width 1s ease",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
