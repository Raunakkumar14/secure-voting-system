import React, { useState, useEffect } from "react";
import { createElection, listElections, startElection, endElection, getElectionResults } from "../api";
import Btn from "../components/ui/Btn";
import COLORS from "../constants/colors";

export const ElectionManagement = ({ onBack }) => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setLoading(true);
      const response = await listElections();
      setElections(response.data);
    } catch (err) {
      console.error("Failed to load elections:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async () => {
    if (!formData.title.trim()) {
      alert("Please enter election title");
      return;
    }

    try {
      setLoading(true);
      await createElection({
        title: formData.title,
        description: formData.description || null,
      });
      setFormData({ title: "", description: "" });
      setShowCreateForm(false);
      loadElections();
      alert("✅ Election created successfully!");
    } catch (err) {
      alert(`❌ Error creating election: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartElection = async (electionId) => {
    try {
      setLoading(true);
      await startElection(electionId);
      loadElections();
      alert("✅ Election started!");
    } catch (err) {
      alert(`❌ Error starting election: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEndElection = async (electionId) => {
    try {
      setLoading(true);
      await endElection(electionId);
      loadElections();
      alert("✅ Election ended!");
    } catch (err) {
      alert(`❌ Error ending election: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = async (election) => {
    try {
      setLoading(true);
      const response = await getElectionResults(election.id);
      setResults(response.data);
      setSelectedElection(election);
      setShowResults(true);
    } catch (err) {
      alert(`❌ Error loading results: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return COLORS.yellow;
      case "active":
        return COLORS.green;
      case "ended":
        return COLORS.blue;
      default:
        return COLORS.gray;
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case "upcoming":
        return "📅";
      case "active":
        return "🔴";
      case "ended":
        return "✅";
      default:
        return "❓";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.navy,
        padding: "80px 24px 40px",
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
          <div>
            <h1 style={{ fontSize: 40, color: COLORS.white, margin: 0, marginBottom: 6 }}>🗳️ Elections</h1>
            <p style={{ color: COLORS.gray, fontSize: 14, margin: 0 }}>Create and manage elections</p>
          </div>
          <button
            onClick={onBack}
            style={{
              padding: "10px 20px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: COLORS.white,
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ← Back
          </button>
        </div>

        {/* Show Results View */}
        {showResults && results ? (
          <div
            style={{
              background: COLORS.navyMid,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 36,
            }}
          >
            <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <h2 style={{ color: COLORS.white, margin: 0, marginBottom: 8 }}>{results.title}</h2>
              <p style={{ color: COLORS.gray, fontSize: 14, margin: 0 }}>
                {results.status === "ended" ? "✅ Ended" : results.status === "active" ? "🔴 Active" : "📅 Upcoming"} •
                Total votes: {results.total_votes}
              </p>
            </div>

            {/* Results Table */}
            <div style={{ marginBottom: 24 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ textAlign: "left", padding: "12px 0", color: COLORS.gray }}>Candidate</th>
                    <th style={{ textAlign: "center", padding: "12px 0", color: COLORS.gray }}>Votes</th>
                    <th style={{ textAlign: "right", padding: "12px 0", color: COLORS.gray }}>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {results.candidates.map((candidate, idx) => {
                    const percentage =
                      results.total_votes > 0 ? ((candidate.votes / results.total_votes) * 100).toFixed(1) : 0;
                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <td style={{ padding: "16px 0", color: COLORS.white }}>{candidate.name}</td>
                        <td style={{ textAlign: "center", padding: "16px 0", color: COLORS.blue }}>
                          <strong>{candidate.votes}</strong>
                        </td>
                        <td style={{ textAlign: "right", padding: "16px 0", color: COLORS.green }}>
                          <strong>{percentage}%</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowResults(false)}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: COLORS.white,
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ← Back to Elections
            </button>
          </div>
        ) : showCreateForm ? (
          /* Create Election Form */
          <div
            style={{
              background: COLORS.navyMid,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 36,
              maxWidth: 600,
            }}
          >
            <h2 style={{ color: COLORS.white, margin: 0, marginBottom: 24 }}>Create New Election</h2>

            <Input
              label="Election Title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter election title"
              icon="🗳️"
              style={{ marginBottom: 16 }}
            />

            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Election description (optional)"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: COLORS.white,
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 14,
                marginBottom: 24,
                boxSizing: "border-box",
                minHeight: 80,
              }}
            />

            <Btn
              onClick={handleCreateElection}
              disabled={loading}
              style={{ width: "100%", marginBottom: 12 }}
            >
              {loading ? "Creating..." : "Create Election"}
            </Btn>

            <button
              onClick={() => setShowCreateForm(false)}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: COLORS.gray,
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          /* Elections List */
          <div>
            <Btn onClick={() => setShowCreateForm(true)} style={{ marginBottom: 24 }}>
              ➕ Create New Election
            </Btn>

            {elections.length === 0 ? (
              <div
                style={{
                  background: COLORS.navyMid,
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  padding: 36,
                  textAlign: "center",
                  color: COLORS.gray,
                }}
              >
                <p style={{ fontSize: 16, margin: 0 }}>No elections created yet</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                {elections.map((election) => (
                  <div
                    key={election.id}
                    style={{
                      background: COLORS.navyMid,
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 20,
                      padding: 24,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h3 style={{ color: COLORS.white, margin: 0, marginBottom: 8 }}>
                        {election.title}
                      </h3>
                      <p style={{ color: COLORS.gray, fontSize: 13, margin: 0, marginBottom: 8 }}>
                        {election.description}
                      </p>
                      <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
                        <span
                          style={{
                            color: getStatusColor(election.status),
                            fontWeight: 600,
                          }}
                        >
                          {getStatusEmoji(election.status)} {election.status.toUpperCase()}
                        </span>
                        <span style={{ color: COLORS.gray }}>
                          Created: {new Date(election.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {election.status === "upcoming" && (
                        <button
                          onClick={() => handleStartElection(election.id)}
                          disabled={loading}
                          style={{
                            padding: "10px 16px",
                            background: COLORS.green,
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          🚀 Start
                        </button>
                      )}

                      {election.status === "active" && (
                        <button
                          onClick={() => handleEndElection(election.id)}
                          disabled={loading}
                          style={{
                            padding: "10px 16px",
                            background: COLORS.red,
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          ⏹️ End
                        </button>
                      )}

                      {(election.status === "active" || election.status === "ended") && (
                        <button
                          onClick={() => handleViewResults(election)}
                          disabled={loading}
                          style={{
                            padding: "10px 16px",
                            background: "rgba(59,130,246,0.3)",
                            color: COLORS.blue,
                            border: `1px solid ${COLORS.blue}`,
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          📊 Results
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
