import { useState, useEffect } from "react";
import COLORS from "../../constants/colors";
import BarChart from "../ui/BarChart";
import { getElectionTally, getElectionLedger, listElections } from "../../api";

export default function LedgerView({ isAdmin }) {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [tallyData, setTallyData] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial fetch of all elections
    listElections()
      .then((res) => {
        const available = res.data.filter(e => e.status !== "upcoming");
        setElections(available);
        if (available.length > 0) {
          setSelectedElectionId(available[0].id);
        }
      })
      .catch((err) => console.error("Failed to fetch elections", err));
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      loadElectionData(selectedElectionId);
    }
  }, [selectedElectionId]);

  const loadElectionData = async (id) => {
    setLoading(true);
    try {
      const [tallyRes, ledgerRes] = await Promise.all([
        getElectionTally(id),
        getElectionLedger(id)
      ]);
      setTallyData(tallyRes.data);
      setLedgerData(ledgerRes.data);
    } catch (err) {
      console.error("Failed to load election details", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Selector Section */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "20px 24px",
        marginBottom: 32,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, color: COLORS.white, margin: 0 }}>
            ⛓️ Public Voting Ledger
          </h3>
          <p style={{ color: COLORS.gray, fontSize: 13, margin: "4px 0 0" }}>
            Real-time, cryptographically hashed records for each election.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label style={{ color: COLORS.gray, fontSize: 13, fontWeight: 600 }}>Select Election:</label>
          <select 
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value)}
            style={{
              background: COLORS.navy,
              border: "1px solid rgba(255,255,255,0.2)",
              color: COLORS.white,
              padding: "8px 12px",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              minWidth: 200
            }}
          >
            {elections.map(e => (
              <option key={e.id} value={e.id}>{e.title} ({e.status.toUpperCase()})</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "100px 0", color: COLORS.gray }}>
          <div style={{ fontSize: 40, animation: "pulse 1.5s infinite" }}>⛓️</div>
          <p style={{ marginTop: 16, fontWeight: 600, letterSpacing: 1 }}>DECODING BLOCKCHAIN LEDGER...</p>
        </div>
      ) : (
        <>
          {/* Live Tally Section */}
          <div style={{
            background: COLORS.navyMid,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: 32,
            marginBottom: 32,
            boxShadow: "0 20px 40px -15px rgba(0,0,0,0.4)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
              <div>
                <h4 style={{ margin: 0, color: COLORS.white, fontFamily: "'Rajdhani', sans-serif", fontSize: 22 }}>
                  Live Tally: {tallyData?.title}
                </h4>
                <p style={{ color: COLORS.gray, fontSize: 14, marginTop: 4 }}>
                  Total Valid Votes: <strong style={{ color: COLORS.bluePale }}>{tallyData?.total_votes}</strong>
                </p>
              </div>
              <div style={{ 
                background: "rgba(6,182,212,0.1)", 
                color: COLORS.cyan, 
                padding: "4px 12px", 
                borderRadius: 20, 
                fontSize: 11, 
                fontWeight: 800,
                border: "1px solid rgba(6,182,212,0.3)"
              }}>
                LIVE SYNCED
              </div>
            </div>
            
            {tallyData && Object.keys(tallyData.tally).length > 0 ? (
              <BarChart data={tallyData.tally} />
            ) : (
              <p style={{ color: COLORS.gray, textAlign: "center", padding: "40px 0" }}>No votes recorded yet for this election.</p>
            )}
          </div>

          {/* Audit Ledger Section */}
          <div style={{
            background: "rgba(255,255,255,0.01)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            overflow: "hidden"
          }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <h4 style={{ margin: 0, color: COLORS.white, fontFamily: "'Rajdhani', sans-serif", fontSize: 20 }}>
                Audit Ledger Logs
              </h4>
              <span style={{ fontSize: 12, color: COLORS.gray }}>Anonymized Transaction History</span>
            </div>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                    {["#", "Transaction Hash", "Candidate Choice", "Timestamp"].map((h) => (
                      <th key={h} style={{
                        padding: "16px 24px", textAlign: "left", color: COLORS.gray,
                        fontWeight: 600, fontSize: 11, textTransform: "uppercase",
                        letterSpacing: 1, whiteSpace: "nowrap",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ledgerData.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: "40px", textAlign: "center", color: COLORS.gray }}>
                        No transactions found in this block.
                      </td>
                    </tr>
                  ) : ledgerData.map((row) => (
                    <tr key={row.index} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s" }} className="ledger-row">
                      <td style={{ padding: "16px 24px", color: COLORS.gray }}>{row.index}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{
                          padding: "4px 10px", borderRadius: 6,
                          background: "rgba(26,86,219,0.15)", color: COLORS.bluePale, fontSize: 11,
                          fontFamily: "monospace"
                        }}>
                          {row.hash}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px", color: COLORS.white, fontWeight: 600 }}>{row.candidate}</td>
                      <td style={{ padding: "16px 24px", color: COLORS.gray, fontSize: 12 }}>{row.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <style>{`
        .ledger-row:hover { background: rgba(255,255,255,0.03); }
      `}</style>
    </div>
  );
}
