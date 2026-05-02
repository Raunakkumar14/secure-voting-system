import { useState, useEffect } from "react";
import COLORS from "../constants/colors";
import Btn from "../components/ui/Btn";
import {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  listElections,
} from "../api";

export default function CandidateManagement({ setPage, showToast }) {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", election_id: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCandidates();
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await listElections();
      setElections(res.data);
    } catch (err) {
      console.error("Failed to load elections", err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await getCandidates();
      setCandidates(res.data);
    } catch (err) {
      showToast("Failed to load candidates", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Candidate name is required", "error");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await updateCandidate(editingId, formData);
        showToast("Candidate updated successfully", "success");
      } else {
        await createCandidate({
          ...formData,
          election_id: formData.election_id || null
        });
        showToast("Candidate created successfully", "success");
      }
      setFormData({ name: "", description: "", election_id: "" });
      setEditingId(null);
      setIsCreating(false);
      await fetchCandidates();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to save candidate", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (candidate) => {
    setFormData({ 
      name: candidate.name, 
      description: candidate.description || "", 
      election_id: candidate.election_id || "" 
    });
    setEditingId(candidate.id);
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await deleteCandidate(id);
        showToast("Candidate deleted successfully", "success");
        await fetchCandidates();
      } catch (err) {
        showToast("Failed to delete candidate", "error");
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "" });
    setEditingId(null);
    setIsCreating(false);
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
            🏆 Manage Candidates
          </h1>
          <Btn onClick={() => setPage("admin")} variant="secondary">
            Back to Dashboard
          </Btn>
        </div>

        {/* Add/Edit Form */}
        {isCreating && (
          <div style={{
            background: COLORS.navyMid,
            padding: 24,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 24,
          }}>
            <h3 style={{ color: COLORS.white, marginTop: 0 }}>
              {editingId ? "Edit Candidate" : "Add New Candidate"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: COLORS.gray, fontSize: 12, display: "block", marginBottom: 6 }}>
                  Candidate Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  placeholder="Enter candidate name"
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
                  placeholder="Enter candidate description"
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: COLORS.gray, fontSize: 12, display: "block", marginBottom: 6 }}>
                  Assign to Election
                </label>
                <select
                  value={formData.election_id}
                  onChange={(e) => setFormData({ ...formData, election_id: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: COLORS.navy,
                    border: `1px solid rgba(255,255,255,0.2)`,
                    borderRadius: 8,
                    color: COLORS.white,
                    fontSize: 14,
                    boxSizing: "border-box",
                    cursor: "pointer"
                  }}
                >
                  <option value="">-- No Election Assigned --</option>
                  {elections.map(e => (
                    <option key={e.id} value={e.id}>{e.title} ({e.status})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Btn type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update Candidate" : "Create Candidate"}
                </Btn>
                <Btn onClick={handleCancel} variant="secondary">
                  Cancel
                </Btn>
              </div>
            </form>
          </div>
        )}

        {!isCreating && (
          <div style={{ marginBottom: 24 }}>
            <Btn onClick={() => { setFormData({ name: "", description: "" }); setIsCreating(true); }}>
              + Add New Candidate
            </Btn>
          </div>
        )}

        {/* Candidates List */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {candidates.map((candidate) => (
            <div key={candidate.id} style={{
              background: COLORS.navyMid,
              padding: 20,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <h3 style={{
                color: COLORS.white,
                fontSize: 18,
                fontWeight: 700,
                marginTop: 0,
                marginBottom: 8,
              }}>
                {candidate.name}
              </h3>
              {candidate.description && (
                <p style={{
                  color: COLORS.gray,
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 1.5,
                }}>
                  {candidate.description}
                </p>
              )}
              {candidate.election_id && (
                <div style={{ 
                  marginBottom: 16, 
                  fontSize: 11, 
                  background: "rgba(59,130,246,0.1)", 
                  color: COLORS.blue, 
                  padding: "4px 8px", 
                  borderRadius: 4,
                  display: "inline-block",
                  fontWeight: 700,
                  textTransform: "uppercase"
                }}>
                  Election: {elections.find(e => e.id === candidate.election_id)?.title || "Unknown"}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleEdit(candidate)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    background: COLORS.accent,
                    border: "none",
                    borderRadius: 8,
                    color: COLORS.white,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(candidate.id)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    background: "#ef4444",
                    border: "none",
                    borderRadius: 8,
                    color: COLORS.white,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {candidates.length === 0 && !isCreating && (
          <div style={{
            textAlign: "center",
            padding: 40,
            color: COLORS.gray,
          }}>
            <p>No candidates yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
