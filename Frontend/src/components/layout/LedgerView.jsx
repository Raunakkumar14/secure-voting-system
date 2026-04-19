import COLORS from "../../constants/colors";
import BarChart from "../ui/BarChart";
import { MOCK_LEDGER } from "../../data/mockData";

export default function LedgerView({ isAdmin }) {
  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 20, flexWrap: "wrap", gap: 10,
      }}>
        <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 26, color: COLORS.white, margin: 0 }}>
          ⛓️ Blockchain Ledger
        </h3>
        <span style={{
          fontSize: 12, color: COLORS.cyan, background: "rgba(6,182,212,0.1)",
          padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(6,182,212,0.3)",
        }}>
          {isAdmin ? "Admin View — Full Ledger" : "Voter View — Your Vote Only"}
        </span>
      </div>

      <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.05)" }}>
              {["#", "Block", "Voter Hash", "Candidate", "Timestamp"].map((h) => (
                <th key={h} style={{
                  padding: "14px 16px", textAlign: "left", color: COLORS.gray,
                  fontWeight: 600, fontSize: 11, textTransform: "uppercase",
                  letterSpacing: 1, whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_LEDGER.map((row, i) => (
              <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "14px 16px", color: COLORS.gray }}>{row.index}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    padding: "3px 8px", borderRadius: 6,
                    background: "rgba(26,86,219,0.15)", color: COLORS.bluePale, fontSize: 11,
                  }}>
                    #{String(row.index + 1000).padStart(6, "0")}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", color: COLORS.cyan }}>{row.hash}</td>
                <td style={{ padding: "14px 16px", color: COLORS.white }}>{row.candidate}</td>
                <td style={{ padding: "14px 16px", color: COLORS.gray, fontSize: 12 }}>{row.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: 24, background: COLORS.navyMid,
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24,
      }}>
        <h4 style={{ margin: "0 0 4px", color: COLORS.white, fontFamily: "'Rajdhani', sans-serif", fontSize: 20 }}>
          Vote Distribution
        </h4>
        <BarChart data={{ "Carol Zhang": 2, "Alice Johnson": 1, "Bob Martinez": 1, "David Patel": 1 }} />
      </div>
    </div>
  );
}
