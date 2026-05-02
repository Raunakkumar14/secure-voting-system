import { useState, useEffect } from "react";
import COLORS from "../constants/colors";
import Btn from "../components/ui/Btn";
import Modal from "../components/ui/Modal";
import { getActiveElections, castVote, downloadVoteReceipt } from "../api";
import confetti from "canvas-confetti";

export default function VoterDashboard({ user, setPage, showToast }) {
  const [elections, setElections] = useState([]);
  const [activeViewElection, setActiveViewElection] = useState(null); // The election being viewed/voted in
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [votedElections, setVotedElections] = useState([]); // Array of IDs
  const [isDownloading, setIsDownloading] = useState(null); // ID of election being downloaded

  useEffect(() => {
    getActiveElections()
      .then((res) => setElections(res.data))
      .catch(() => showToast("Failed to load elections", "error"));
  }, []);

  const handleVoteClick = (candidateId) => {
    setSelectedCandidate(candidateId);
    setConfirmModal(true);
  };

  const confirmVote = async () => {
    try {
      await castVote(selectedCandidate);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [COLORS.blue, COLORS.cyan, COLORS.green]
      });
      showToast("✅ Vote recorded successfully!", "success");
      setVotedElections([...votedElections, activeViewElection.id]);
      setConfirmModal(false);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Voting failed";
      showToast(`❌ ${errorMsg}`, "error");
      if (errorMsg.includes("already voted")) {
        setVotedElections([...votedElections, activeViewElection.id]);
      }
      setConfirmModal(false);
    }
  };

  const handleDownloadReceipt = async (electionId) => {
    setIsDownloading(electionId);
    try {
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
      showToast("❌ Failed to download receipt.", "error");
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="fade-in" style={{ minHeight: "100vh", background: COLORS.navy, padding: "100px 24px 60px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 850, margin: "0 auto" }}>
        
        {/* Header Section */}
        {!activeViewElection ? (
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ 
              color: COLORS.white, 
              fontFamily: "'Outfit', sans-serif", 
              fontSize: "clamp(32px, 5vw, 42px)", 
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.02em"
            }}>
              Active Ballots 🗳️
            </h1>
            <p style={{ color: COLORS.gray, fontSize: 16, marginTop: 8 }}>
              Select an ongoing election below to view candidates and cast your vote.
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <button 
                onClick={() => {
                  setActiveViewElection(null);
                  setSelectedCandidate(null);
                }}
                style={{ 
                  background: "rgba(255,255,255,0.05)", 
                  border: "1px solid rgba(255,255,255,0.1)", 
                  color: COLORS.gray, 
                  padding: "8px 16px", 
                  borderRadius: 10, 
                  cursor: "pointer",
                  fontSize: 13,
                  marginBottom: 16,
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
                onMouseOut={(e) => e.target.style.background = "rgba(255,255,255,0.05)"}
              >
                ← Back to Elections
              </button>
              <h1 style={{ 
                color: COLORS.white, 
                fontFamily: "'Outfit', sans-serif", 
                fontSize: 32, 
                fontWeight: 800,
                margin: 0
              }}>
                {activeViewElection.title}
              </h1>
              <p style={{ color: COLORS.gray, fontSize: 15, marginTop: 6 }}>
                {activeViewElection.description}
              </p>
            </div>
            {votedElections.includes(activeViewElection.id) && (
              <div style={{ 
                background: "rgba(16, 185, 129, 0.1)", 
                color: COLORS.green, 
                padding: "8px 16px", 
                borderRadius: 20, 
                fontSize: 12, 
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 1
              }}>
                Voted ✅
              </div>
            )}
          </div>
        )}

        <div style={{ display: "grid", gap: 24 }}>
          {!activeViewElection ? (
            /* ELECTION LIST VIEW */
            elections.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "60px", 
                background: "rgba(255,255,255,0.02)", 
                borderRadius: 28,
                border: "1px solid rgba(255,255,255,0.08)"
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <h3 style={{ color: COLORS.white, margin: 0 }}>No Active Elections</h3>
                <p style={{ color: COLORS.gray, marginTop: 8 }}>Please check back later for upcoming ballots.</p>
              </div>
            ) : elections.map((election) => {
              const hasVotedThis = votedElections.includes(election.id);
              return (
                <div 
                  key={election.id} 
                  onClick={() => setActiveViewElection(election)}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: `1px solid ${hasVotedThis ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)"}`,
                    borderRadius: 24,
                    padding: "24px 32px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 10px 30px -15px rgba(0,0,0,0.5)"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor = hasVotedThis ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = hasVotedThis ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)";
                  }}
                >
                  <div>
                    <h3 style={{ color: COLORS.white, margin: 0, fontSize: 20, fontFamily: "'Outfit', sans-serif" }}>
                      {election.title}
                    </h3>
                    <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 13, color: COLORS.gray }}>
                      <span>👤 {election.candidates.length} Candidates</span>
                      <span>•</span>
                      <span style={{ color: hasVotedThis ? COLORS.green : COLORS.blue, fontWeight: 600 }}>
                        {hasVotedThis ? "Voted ✅" : "Voting Open 🔓"}
                      </span>
                    </div>
                  </div>
                  <div style={{ color: COLORS.gray, fontSize: 20 }}>→</div>
                </div>
              );
            })
          ) : (
            /* CANDIDATE SELECTION VIEW */
            <div>
              {votedElections.includes(activeViewElection.id) ? (
                <div style={{
                  padding: "40px",
                  borderRadius: 28,
                  background: "rgba(16, 185, 129, 0.03)",
                  border: "1px dashed rgba(16, 185, 129, 0.3)",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <h2 style={{ color: COLORS.white, margin: 0 }}>Vote Confirmed</h2>
                  <p style={{ color: COLORS.gray, marginTop: 8, marginBottom: 32 }}>
                    Your vote for this election has been cryptographically sealed.
                  </p>
                  <Btn 
                    onClick={() => handleDownloadReceipt(activeViewElection.id)} 
                    variant="success" 
                    disabled={isDownloading === activeViewElection.id}
                    style={{ padding: "14px 40px" }}
                  >
                    {isDownloading === activeViewElection.id ? "Generating Receipt..." : "📥 Download Official Receipt"}
                  </Btn>
                </div>
              ) : (
                <div style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 28,
                  padding: "32px",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)"
                }}>
                  <div style={{ display: "grid", gap: 12 }}>
                    {activeViewElection.candidates.map((c) => (
                      <label key={c.id} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "20px 24px",
                        background: selectedCandidate === c.id ? "rgba(26, 86, 219, 0.15)" : "rgba(255, 255, 255, 0.03)",
                        border: `1px solid ${selectedCandidate === c.id ? COLORS.blue : "rgba(255, 255, 255, 0.08)"}`,
                        borderRadius: 20,
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}>
                        <input
                          type="radio"
                          name={`election-${activeViewElection.id}`}
                          checked={selectedCandidate === c.id}
                          onChange={() => setSelectedCandidate(c.id)}
                          style={{ width: 20, height: 20, accentColor: COLORS.blue }}
                        />
                        <div>
                          <div style={{ color: COLORS.white, fontSize: 18, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{c.name}</div>
                          {c.description && <div style={{ color: COLORS.gray, fontSize: 13, marginTop: 4 }}>{c.description}</div>}
                        </div>
                      </label>
                    ))}
                  </div>
                  <Btn 
                    onClick={() => handleVoteClick(selectedCandidate)} 
                    style={{ width: "100%", marginTop: 32, padding: "18px" }} 
                    disabled={!selectedCandidate}
                  >
                    Review & Cast Vote
                  </Btn>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!activeViewElection && (
          <div style={{ marginTop: 48, display: "flex", gap: 16 }}>
            <Btn onClick={() => setPage("ledger")} variant="secondary" style={{ flex: 1 }}>
              📜 Public Ledger
            </Btn>
            <Btn onClick={() => setPage("profile")} variant="secondary" style={{ flex: 1 }}>
              👤 My Profile
            </Btn>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <Modal title="Confirm Your Vote" onClose={() => setConfirmModal(false)}>
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗳️</div>
            <p style={{ color: COLORS.white, fontSize: 16, lineHeight: 1.6 }}>
              You are about to cast your vote for:<br />
              <strong style={{ fontSize: 24, color: COLORS.cyan, display: "block", marginTop: 8 }}>
                {activeViewElection?.candidates.find(c => c.id === selectedCandidate)?.name}
              </strong>
              in the <span style={{ color: COLORS.blue }}>{activeViewElection?.title}</span>
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