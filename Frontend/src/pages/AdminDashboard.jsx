import { useState, useEffect } from "react";
import COLORS from "../constants/colors";
import Btn from "../components/ui/Btn";
import BarChart from "../components/ui/BarChart";
import { getResults, getStats, getAuditLogs } from "../api";

export default function AdminDashboard({ setPage, showToast }) {
  const [results, setResults] = useState({});
  const [stats, setStats] = useState({
    total_users: 0,
    total_votes: 0,
    total_candidates: 0,
  });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getResults()
      .then((res) => setResults(res.data))
      .catch(() => showToast("Failed to load results", "error"));

    getStats()
      .then((res) => setStats(res.data))
      .catch(() => showToast("Failed to load stats", "error"));

    getAuditLogs()
      .then((res) => setLogs(res.data))
      .catch(() => console.error("Failed to load audit logs"));
  }, []);

  return (
    <div className="fade-in" style={{
      minHeight: "100vh",
      background: `radial-gradient(circle at 100% 0%, rgba(26, 86, 219, 0.1), transparent), ${COLORS.navy}`,
      padding: "100px 24px 60px",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(32px, 5vw, 42px)",
            fontWeight: 800,
            color: COLORS.white,
            margin: 0,
            letterSpacing: "-0.02em"
          }}>
            Admin Oversight ⚖️
          </h1>
          <p style={{ color: COLORS.gray, fontSize: 16, marginTop: 8 }}>
            System-wide statistics and management portal.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
        }}>
          {[
            { label: "Registered Voters", value: stats.total_users, icon: "👤", color: COLORS.blue },
            { label: "Total Votes Cast", value: stats.total_votes, icon: "🗳️", color: COLORS.cyan },
            { label: "Active Candidates", value: stats.total_candidates, icon: "🏆", color: COLORS.gold },
          ].map((card, i) => (
            <div key={i} style={{
              background: "rgba(255, 255, 255, 0.02)",
              padding: "32px",
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 20
            }}>
              <div style={{ 
                width: 60, height: 60, borderRadius: 16, background: "rgba(255,255,255,0.04)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                border: "1px solid rgba(255,255,255,0.08)"
              }}>
                {card.icon}
              </div>
              <div>
                <div style={{ color: COLORS.gray, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                  {card.label}
                </div>
                <div style={{
                  color: COLORS.white,
                  fontSize: 32,
                  fontWeight: 800,
                  fontFamily: "'Outfit', sans-serif",
                  marginTop: 4,
                }}>
                  {card.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 24,
          marginTop: 24
        }}>
          {/* Chart Container */}
          <div style={{
            background: "rgba(255, 255, 255, 0.02)",
            padding: "32px",
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)"
          }}>
            <h3 style={{ color: COLORS.white, fontFamily: "'Outfit', sans-serif", fontSize: 22, margin: "0 0 24px" }}>
              Live Tally Results
            </h3>
            <div style={{ height: 300 }}>
              <BarChart data={results} />
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: "grid", gap: 24 }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.02)",
              padding: "32px",
              borderRadius: 28,
              border: "1px solid rgba(255,255,255,0.08)",
              textAlign: "left",
            }}>
              <h3 style={{ color: COLORS.white, fontFamily: "'Outfit', sans-serif", fontSize: 20, margin: "0 0 16px" }}>
                Candidate Mgmt
              </h3>
              <p style={{ color: COLORS.gray, fontSize: 14, marginBottom: 24 }}>
                Add, update or remove participants from active elections.
              </p>
              <Btn onClick={() => setPage("candidates")} style={{ width: "100%" }}>
                Open Management
              </Btn>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.02)",
              padding: "32px",
              borderRadius: 28,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              textAlign: "left",
            }}>
              <h3 style={{ color: COLORS.white, fontFamily: "'Outfit', sans-serif", fontSize: 20, margin: "0 0 16px" }}>
                Election Control
              </h3>
              <p style={{ color: COLORS.gray, fontSize: 14, marginBottom: 24 }}>
                Schedule start/end times and manage ballot access.
              </p>
              <Btn onClick={() => setPage("elections")} style={{ width: "100%" }}>
                Open Controls
              </Btn>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: "flex", gap: 16 }}>
          <Btn onClick={() => setPage("ledger")} variant="secondary" style={{ flex: 1 }}>
            View Public Voting Ledger
          </Btn>
        </div>

        {/* Audit Logs Section */}
        <div style={{
          marginTop: 48,
          background: "rgba(255, 255, 255, 0.01)",
          padding: "32px",
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h3 style={{ color: COLORS.white, fontFamily: "'Outfit', sans-serif", fontSize: 22, margin: 0 }}>
                System Activity Logs 📜
              </h3>
              <p style={{ color: COLORS.gray, fontSize: 14, marginTop: 4 }}>
                Tracked administrative actions and security events.
              </p>
            </div>
            <div style={{ color: COLORS.gray, fontSize: 13, fontWeight: 600 }}>
              Showing last {logs.length} events
            </div>
          </div>

          <div style={{ 
            maxHeight: 400, 
            overflowY: "auto", 
            paddingRight: 12,
            display: "flex",
            flexDirection: "column",
            gap: 12
          }} className="custom-scrollbar">
            {logs.length === 0 ? (
              <div style={{ color: COLORS.gray, textAlign: "center", padding: "40px 0" }}>
                No activity logs recorded yet.
              </div>
            ) : logs.map((log, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)",
                padding: "16px 20px",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.05)",
                display: "grid",
                gridTemplateColumns: "100px 1fr 180px",
                alignItems: "center",
                gap: 20
              }}>
                <div style={{ 
                  fontSize: 11, 
                  fontWeight: 700, 
                  color: log.action.includes("DELETE") ? COLORS.red : log.action.includes("CREATE") ? COLORS.green : COLORS.blue,
                  background: "rgba(255,255,255,0.04)",
                  padding: "4px 8px",
                  borderRadius: 6,
                  textAlign: "center",
                  textTransform: "uppercase"
                }}>
                  {log.action.replace("_", " ")}
                </div>
                <div>
                  <div style={{ color: COLORS.white, fontSize: 14, fontWeight: 500 }}>
                    {log.details}
                  </div>
                  <div style={{ color: COLORS.gray, fontSize: 12, marginTop: 2 }}>
                    By <span style={{ color: COLORS.blue }}>{log.admin_name}</span> • IP: {log.ip_address}
                  </div>
                </div>
                <div style={{ color: COLORS.gray, fontSize: 12, textAlign: "right", fontFamily: "monospace" }}>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}