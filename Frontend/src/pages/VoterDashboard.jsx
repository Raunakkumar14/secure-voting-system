import { useState, useEffect } from "react";
import COLORS from "../constants/colors";
import Btn from "../components/ui/Btn";
import Modal from "../components/ui/Modal";
import { getCandidates, castVote, downloadVoteReceipt } from "../api";

export default function VoterDashboard({ user, setPage, showToast }) {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    getCandidates()
      .then((res) => setCandidates(res.data))
      .catch(() => showToast("Failed to load candidates", "error"));
  }, []);

  const handleVote = () => {
    if (!selected) {
      showToast("Please select a candidate", "error");
      return;
    }
    setConfirmModal(true);
  };

  const confirmVote = async () => {
    try {
      await castVote(selected);
      showToast("✅ Vote recorded successfully!", "success");
      setHasVoted(true);
      setConfirmModal(false);
    } catch (err) {
      showToast("❌ You have already voted or voting failed", "error");
      setHasVoted(true);
    }
  };

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    try {
      // Find the election ID from the first candidate
      const electionId = candidates[0]?.election_id || 1;
      const response = await downloadVoteReceipt(electionId);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vote_receipt_election_${electionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("📥 Receipt downloaded successfully", "success");
    } catch (err) {
      showToast("❌ Failed to download receipt. Did you vote first?", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fade-in" style={{ minHeight: "100vh", background: COLORS.navy, padding: "100px 24px 60px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 850, margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ 
            color: COLORS.white, 
            fontFamily: "'Outfit', sans-serif", 
            fontSize: "clamp(32px, 5vw, 42px)", 
            fontWeight: 800,
            margin: 0,
            letterSpacing: "-0.02em"
          }}>
            Welcome back, {user.name.split(' ')[0]} 🗳️
          </h1>
          <p style={{ color: COLORS.gray, fontSize: 16, marginTop: 8 }}>
            Select your preferred candidate to cast your secure vote.
          </p>
        </div>

        {/* Voting Status */}
        {hasVoted && (
          <div style={{
            marginBottom: 32,
            padding: "24px",
            borderRadius: 20,
            background: "rgba(16, 185, 129, 0.05)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 32 }}>✅</div>
              <div>
                <h3 style={{ color: COLORS.green, margin: 0, fontSize: 18, fontWeight: 700 }}>Voting Complete</h3>
                <p style={{ color: "rgba(16, 185, 129, 0.8)", margin: "4px 0 0", fontSize: 14 }}>
                  Your vote has been cryptographically sealed and recorded.
                </p>
              </div>
            </div>
            <Btn onClick={handleDownloadReceipt} disabled={isDownloading} variant="success" style={{ padding: "10px 20px", fontSize: 14 }}>
              {isDownloading ? "Generating..." : "📥 Download Receipt"}
            </Btn>
          </div>
        )}

        {/* Candidate Selection */}
        {!hasVoted && (
          <div style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 28,
            padding: "32px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)"
          }}>
            <h2 style={{ 
              color: COLORS.white, 
              fontSize: 20, 
              fontWeight: 700, 
              fontFamily: "'Outfit', sans-serif",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 10
            }}>
              <span>🏆</span> Active Candidates
            </h2>

            <div style={{ display: "grid", gap: 12 }}>
              {candidates.map((c) => (
                <label key={c.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "20px 24px",
                  background: selected === c.id ? "rgba(26, 86, 219, 0.1)" : "rgba(255, 255, 255, 0.03)",
                  border: `1px solid ${selected === c.id ? COLORS.blue : "rgba(255, 255, 255, 0.1)"}`,
                  borderRadius: 16,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: selected === c.id ? "scale(1.01)" : "scale(1)"
                }}>
                  <input
                    type="radio"
                    name="candidate"
                    value={c.id}
                    checked={selected === c.id}
                    onChange={() => setSelected(c.id)}
                    style={{ width: 20, height: 20, cursor: "pointer", accentColor: COLORS.blue }}
                  />
                  <div>
                    <div style={{ color: COLORS.white, fontSize: 18, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{c.name}</div>
                    {c.description && <div style={{ color: COLORS.gray, fontSize: 13, marginTop: 4 }}>{c.description}</div>}
                  </div>
                </label>
              ))}
            </div>

            <Btn onClick={handleVote} style={{ width: "100%", marginTop: 32, padding: "16px" }} disabled={!selected}>
              Review & Cast Vote
            </Btn>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ marginTop: 32, display: "flex", gap: 16 }}>
          <Btn onClick={() => setPage("ledger")} variant="secondary" style={{ flex: 1 }}>
            📜 Public Ledger
          </Btn>
          <Btn onClick={() => setPage("profile")} variant="secondary" style={{ flex: 1 }}>
            👤 My Profile
          </Btn>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <Modal title="Confirm Your Vote" onClose={() => setConfirmModal(false)}>
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗳️</div>
            <p style={{ color: COLORS.white, fontSize: 16, lineHeight: 1.6 }}>
              You are about to cast your vote for:<br />
              <strong style={{ fontSize: 24, color: COLORS.cyan, display: "block", marginTop: 8 }}>
                {candidates.find(c => c.id === selected)?.name}
              </strong>
            </p>
            <p style={{ color: COLORS.gray, fontSize: 13, marginTop: 16, background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 10 }}>
              ⚠️ This action is permanent and cannot be reversed once encrypted.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <Btn onClick={confirmVote} variant="success" style={{ flex: 1 }}>Confirm Vote</Btn>
              <Btn onClick={() => setConfirmModal(false)} variant="secondary" style={{ flex: 1 }}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}