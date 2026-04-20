import { useState, useEffect } from "react";
import COLORS from "../constants/colors";
import Btn from "../components/ui/Btn";
import {
  getAllElections,
  createElection,
  startElection,
  endElection,
} from "../api";

export default function ElectionControl({ setPage, showToast }) {
  const [elections, setElections] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await getAllElections();
      setElections(res.data);
    } catch (err) {
      showToast("Failed to load elections", "error");
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Election title is required", "error");
      return;
    }

    setLoading(true);
    try {
      await createElection(formData);
      showToast("Election created successfully", "success");
      setFormData({ title: "", description: "" });
      setIsCreating(false);
      await fetchElections();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to create election", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStartElection = async (id) => {
    if (!window.confirm("Start this election? Voters will be able to vote.")) return;
    try {
      await startElection(id);
      showToast("Election started successfully", "success");
      await fetchElections();
    } catch (err) {
      showToast("Failed to start election", "error");
    }
  };

  const handleEndElection = async (id) => {
    if (!window.confirm("End this election? Voting will be disabled.")) return;
    try {
      await endElection(id);
      showToast("Election ended successfully", "success");
      await fetchElections();
    } catch (err) {
      showToast("Failed to end election", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "#8b5cf6";
      case "active":
        return "#10b981";
      case "ended":
        return "#ef4444";
      default:
        return COLORS.gray;
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case "upcoming":
        return "⏳";
      case "active":
        return "🔴";
      case "ended":
        return "✅";
      default:
        return "❓";
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.navy,
      padding: "84px 24px 40px",
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 40,
            fontWeight: 900,
            color: COLORS.white,
            margin: 0,
          }}>
            🗳️ Election Control
          </h1>
          <Btn onClick={() => setPage("admin")} variant="secondary">
            Back to Dashboard
          </Btn>
        </div>

        {/* Create Election Form */}
        {isCreating && (
          <div style={{
            background: COLORS.navyMid,
            padding: 24,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 24,
          }}>
            <h3 style={{ color: COLORS.white, marginTop: 0 }}>
              Create New Election
            </h3>
            <form onSubmit={handleCreateElection}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: COLORS.gray, fontSize: 12, display: "block", marginBottom: 6 }}>
                  Election Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: COLORS.navy,
                    border: `1px solid rgba(255,255,255,0.2)`,
                    borderRadius: 8,
                    color: COLORS.white,
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                  placeholder="Enter election title"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: COLORS.gray, fontSize: 12, display: "block", marginBottom: 6 }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: COLORS.navy,
                    border: `1px solid rgba(255,255,255,0.2)`,
                    borderRadius: 8,
                    color: COLORS.white,
                    fontSize: 14,
                    boxSizing: "border-box",
                    minHeight: 80,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                  placeholder="Enter election description"
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Btn type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Election"}
                </Btn>
                <Btn onClick={() => { setFormData({ title: "", description: "" }); setIsCreating(false); }} variant="secondary">
                  Cancel
                </Btn>
              </div>
            </form>
          </div>
        )}

        {!isCreating && (
          <div style={{ marginBottom: 24 }}>
            <Btn onClick={() => setIsCreating(true)}>
              + Create New Election
            </Btn>
          </div>
        )}

        {/* Elections List */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}>
          {elections.map((election) => (
            <div key={election.id} style={{
              background: COLORS.navyMid,
              padding: 20,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>
                  {getStatusEmoji(election.status)}
                </span>
                <span style={{
                  background: getStatusColor(election.status),
                  color: COLORS.white,
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}>
                  {election.status}
                </span>
              </div>
              <h3 style={{
                color: COLORS.white,
                fontSize: 18,
                fontWeight: 700,
                marginTop: 0,
                marginBottom: 8,
              }}>
                {election.title}
              </h3>
              {election.description && (
                <p style={{
                  color: COLORS.gray,
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 1.5,
                }}>
                  {election.description}
                </p>
              )}
              <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 16 }}>
                <div>Created: {new Date(election.created_at).toLocaleDateString()}</div>
                {election.started_at && <div>Started: {new Date(election.started_at).toLocaleDateString()}</div>}
                {election.ended_at && <div>Ended: {new Date(election.ended_at).toLocaleDateString()}</div>}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                {election.status === "upcoming" && (
                  <Btn
                    onClick={() => handleStartElection(election.id)}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      fontSize: 13,
                      background: "#10b981",
                    }}
                  >
                    ▶️ Start
                  </Btn>
                )}
                {election.status === "active" && (
                  <Btn
                    onClick={() => handleEndElection(election.id)}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      fontSize: 13,
                      background: "#ef4444",
                    }}
                  >
                    ⏹️ End
                  </Btn>
                )}
                {election.status === "ended" && (
                  <div style={{
                    flex: 1,
                    padding: "10px 12px",
                    textAlign: "center",
                    color: COLORS.gray,
                    fontSize: 13,
                  }}>
                    Election Completed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {elections.length === 0 && !isCreating && (
          <div style={{
            textAlign: "center",
            padding: 40,
            color: COLORS.gray,
          }}>
            <p>No elections yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
