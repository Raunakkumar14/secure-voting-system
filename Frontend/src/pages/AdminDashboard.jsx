import { useState, useEffect } from "react";
import COLORS from "../constants/colors";
import Btn from "../components/ui/Btn";
import BarChart from "../components/ui/BarChart";
import { getResults, getStats } from "../api";

export default function AdminDashboard({ setPage, showToast }) {
  const [results, setResults] = useState({});
  const [stats, setStats] = useState({
    total_users: 0,
    total_votes: 0,
    total_candidates: 0,
  });

  useEffect(() => {
    // 📊 Vote results
    getResults()
      .then((res) => setResults(res.data))
      .catch(() => showToast("Failed to load results", "error"));

    // 📈 Stats
    getStats()
      .then((res) => setStats(res.data))
      .catch(() => showToast("Failed to load stats", "error"));
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.navy,
      padding: "84px 24px 40px",
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 40,
          fontWeight: 900,
          color: COLORS.white,
        }}>
          📊 Admin Dashboard
        </h1>

        {/* 🔥 Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}>
          {[
            { label: "Total Users", value: stats.total_users, icon: "👤" },
            { label: "Total Votes", value: stats.total_votes, icon: "🗳️" },
            { label: "Candidates", value: stats.total_candidates, icon: "🏆" },
          ].map((card, i) => (
            <div key={i} style={{
              background: COLORS.navyMid,
              padding: 20,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ fontSize: 24 }}>{card.icon}</div>
              <div style={{ color: COLORS.gray, fontSize: 12, marginTop: 6 }}>
                {card.label}
              </div>
              <div style={{
                color: COLORS.white,
                fontSize: 26,
                fontWeight: 700,
                marginTop: 4,
              }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* 📊 Chart */}
        <div style={{
          marginTop: 30,
          background: COLORS.navyMid,
          padding: 24,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <h3 style={{ color: COLORS.white }}>Live Vote Results</h3>
          <BarChart data={results} />
        </div>

        <div style={{ marginTop: 20 }}>
          <Btn onClick={() => setPage("ledger")} variant="secondary">
            View Ledger
          </Btn>
        </div>

      </div>
    </div>
  );
}