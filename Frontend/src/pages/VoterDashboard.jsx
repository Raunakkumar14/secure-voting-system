import { useState, useEffect } from "react";
import COLORS from "../constants/colors";
import Btn from "../components/ui/Btn";
import Modal from "../components/ui/Modal";
import { getCandidates, castVote } from "../api";

export default function VoterDashboard({ user, setPage, showToast }) {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

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

  return (
    <div style={{ minHeight: "100vh", background: COLORS.navy, padding: "84px 24px 40px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ color: COLORS.white }}>
          Welcome, {user.name} 🗳️
        </h1>

        {/* Already voted */}
        {hasVoted && (
          <div style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 10,
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.3)",
            color: COLORS.green,
          }}>
            ✅ You have already voted. Thank you!
          </div>
        )}

        {/* Candidates */}
        {!hasVoted && (
          <>
            <div style={{ marginTop: 20 }}>
              {candidates.map((c) => (
                <label key={c.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 12,
                  marginBottom: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  cursor: "pointer",
                }}>
                  <input
                    type="radio"
                    name="candidate"
                    value={c.id}
                    onChange={() => setSelected(c.id)}
                  />
                  <span style={{ color: COLORS.white }}>{c.name}</span>
                </label>
              ))}
            </div>

            <Btn onClick={handleVote} style={{ marginTop: 10 }}>
              Cast Vote
            </Btn>
          </>
        )}

        <div style={{ marginTop: 20 }}>
          <Btn onClick={() => setPage("ledger")} variant="secondary">
            View Ledger
          </Btn>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <Modal title="Confirm Vote" onClose={() => setConfirmModal(false)}>
          <p style={{ color: COLORS.white }}>
            Are you sure you want to vote?
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Btn onClick={confirmVote} variant="success">Confirm</Btn>
            <Btn onClick={() => setConfirmModal(false)} variant="secondary">Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}