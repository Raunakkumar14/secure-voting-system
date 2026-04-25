import COLORS from "../constants/colors";
import Btn from "../components/ui/Btn";

const STATS = [
  { label: "Votes Cast", val: "2.4M+" },
  { label: "Elections", val: "180+" },
  { label: "Security", val: "AES-256" },
  { label: "Uptime", val: "99.9%" },
];

const FEATURES = [
  { icon: "🔒", title: "Immutable Ledger", desc: "Every vote is cryptographically sealed on the blockchain — tamper-proof forever." },
  { icon: "🕵️", title: "Anonymous Voting", desc: "Your identity stays private. Only your hashed ID connects to your vote." },
  { icon: "⚡", title: "Real-time Results", desc: "Transparent, live vote tallying with full audit trails accessible to all." },
  { icon: "🛡️", title: "ID Verification", desc: "Voter ID scan + database match ensures one person, one vote." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Register", desc: "Submit your Voter ID for verification" },
  { step: "02", title: "Verify", desc: "ID scanned & matched against database" },
  { step: "03", title: "Vote", desc: "Cast your encrypted vote securely" },
  { step: "04", title: "Record", desc: "Vote sealed on the blockchain ledger" },
];

export default function LandingPage({ setPage }) {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.navy, color: COLORS.white, fontFamily: "'Inter', sans-serif" }}>
      {/* ── Hero Section ── */}
      <div style={{
        minHeight: "100vh", position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `radial-gradient(circle at 50% -20%, rgba(26, 86, 219, 0.15), transparent), radial-gradient(circle at 0% 100%, rgba(6, 182, 212, 0.1), transparent)`,
      }}>
        {/* Animated Background Grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.1,
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }} />

        {/* Floating Glow Orbs */}
        <div className="float" style={{ position: "absolute", left: "10%", top: "20%", width: 300, height: 300, background: COLORS.blue, filter: "blur(120px)", opacity: 0.1, pointerEvents: "none" }} />
        <div className="float" style={{ position: "absolute", right: "10%", bottom: "20%", width: 400, height: 400, background: COLORS.cyan, filter: "blur(150px)", opacity: 0.08, pointerEvents: "none", animationDelay: "-2s" }} />

        <div className="fade-in" style={{ position: "relative", textAlign: "center", maxWidth: 850, padding: "0 24px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(6, 182, 212, 0.08)", border: "1px solid rgba(6, 182, 212, 0.2)",
            borderRadius: 30, padding: "6px 18px", marginBottom: 32,
            boxShadow: "0 0 20px rgba(6, 182, 212, 0.1)"
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.cyan, display: "inline-block", animation: "pulse-glow 2s infinite" }} />
            <span style={{ fontSize: 13, color: COLORS.cyan, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>
              Secure. Transparent. Immutable.
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(48px, 8vw, 88px)", fontWeight: 800, margin: "0 0 24px",
            fontFamily: "'Outfit', sans-serif", lineHeight: 1, letterSpacing: "-0.03em",
            background: `linear-gradient(to bottom right, #fff 30%, ${COLORS.bluePale} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            The Future of <br />Digital Democracy
          </h1>

          <p style={{ fontSize: "clamp(18px, 2vw, 21px)", color: COLORS.gray, lineHeight: 1.6, maxWidth: 600, margin: "0 auto 48px", fontWeight: 400 }}>
            Experience the most secure voting platform ever built. Protected by military-grade encryption and blockchain technology.
          </p>

          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => setPage("register")} style={{ padding: "16px 42px", fontSize: 17 }}>Get Started</Btn>
            <Btn onClick={() => setPage("login")} variant="secondary" style={{ padding: "16px 42px", fontSize: 17 }}>Voter Login</Btn>
            <Btn onClick={() => setPage("adminLogin")} variant="secondary" style={{ padding: "16px 42px", fontSize: 17 }}>Admin Portal</Btn>
          </div>

          {/* Stats Section */}
          <div style={{ 
            display: "flex", gap: 40, justifyContent: "center", marginTop: 80, padding: "30px",
            background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(5px)", flexWrap: "wrap"
          }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ textAlign: "center", minWidth: 120 }}>
                <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: "#fff", marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: COLORS.gray, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features Section ── */}
      <div style={{ padding: "120px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <h2 style={{ fontSize: 48, fontWeight: 800, fontFamily: "'Outfit', sans-serif", margin: 0, letterSpacing: "-0.02em" }}>Advanced Security</h2>
          <p style={{ color: COLORS.gray, marginTop: 16, fontSize: 18 }}>Built on the pillars of integrity and accessibility.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.06)", 
              borderRadius: 24, padding: "40px 32px",
              transition: "all 0.3s ease",
              cursor: "default"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
              e.currentTarget.style.transform = "translateY(0)";
            }}>
              <div style={{ fontSize: 44, marginBottom: 24 }}>{f.icon}</div>
              <h3 style={{ margin: "0 0 12px", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700 }}>{f.title}</h3>
              <p style={{ color: COLORS.gray, fontSize: 16, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Workflow Section ── */}
      <div style={{ background: "rgba(255, 255, 255, 0.01)", padding: "100px 32px", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 42, fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: "#fff", marginBottom: 64 }}>The Voting Process</h2>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={i} style={{ flex: "1 1 200px", position: "relative" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px", fontWeight: 800, fontSize: 20,
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: "0 8px 20px rgba(26, 86, 219, 0.3)",
                }}>
                  {s.step}
                </div>
                <h4 style={{ fontWeight: 700, color: "#fff", marginBottom: 8, fontFamily: "'Outfit', sans-serif", fontSize: 18 }}>{s.title}</h4>
                <p style={{ fontSize: 14, color: COLORS.gray, lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "40px 32px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", margin: 0 }}>© 2026 VoteChain Secure Voting System. All rights reserved.</p>
      </div>
    </div>
  );
}
