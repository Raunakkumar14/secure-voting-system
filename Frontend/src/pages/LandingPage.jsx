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
    <div style={{ minHeight: "100vh", background: COLORS.navy, color: COLORS.white, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* ── Hero ── */}
      <div style={{
        minHeight: "100vh", position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(26,86,219,0.25) 0%, transparent 70%), ${COLORS.navy}`,
      }}>
        {/* Grid BG */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.07,
          backgroundImage: "linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        {/* Orbs */}
        {[[-200, -100, 500, COLORS.blue, 0.12], [600, 300, 300, COLORS.cyan, 0.08], [-100, 500, 200, "#a78bfa", 0.08]].map(([x, y, s, c, o], i) => (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: c, filter: "blur(80px)", opacity: o, pointerEvents: "none" }} />
        ))}

        <div style={{ position: "relative", textAlign: "center", maxWidth: 720, padding: "0 24px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)",
            borderRadius: 20, padding: "5px 14px", marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.cyan, display: "inline-block", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 12, color: COLORS.cyan, letterSpacing: 2, textTransform: "uppercase" }}>Blockchain Powered Voting</span>
          </div>

          <h1 style={{
            fontSize: "clamp(42px, 7vw, 76px)", fontWeight: 900, margin: "0 0 20px",
            fontFamily: "'Rajdhani', sans-serif", lineHeight: 1.05,
            background: `linear-gradient(135deg, #fff 0%, ${COLORS.bluePale} 50%, ${COLORS.cyan} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Vote Securely.<br />Vote Transparently.
          </h1>

          <p style={{ fontSize: 18, color: COLORS.gray, lineHeight: 1.7, maxWidth: 540, margin: "0 auto 40px" }}>
            Your vote is your voice. We protect it with military-grade blockchain encryption — immutable, anonymous, and verifiable.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => setPage("register")} style={{ fontSize: 16, padding: "14px 36px" }}>🗳️ Register as Voter</Btn>
            <Btn onClick={() => setPage("login")} variant="secondary" style={{ fontSize: 16, padding: "14px 36px" }}>🗳️ User Login</Btn>
            <Btn onClick={() => setPage("adminLogin")} variant="secondary" style={{ fontSize: 16, padding: "14px 36px" }}>👑 Admin Login</Btn>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 64, flexWrap: "wrap" }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Rajdhani', sans-serif", color: COLORS.white }}>{s.val}</div>
                <div style={{ fontSize: 11, color: COLORS.gray, letterSpacing: 2, textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <div style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 42, fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", margin: 0, color: COLORS.white }}>Why VoteChain?</h2>
          <p style={{ color: COLORS.gray, marginTop: 10 }}>Built for trust, designed for the future.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px",
            }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ margin: "0 0 8px", color: COLORS.white, fontFamily: "'Rajdhani', sans-serif", fontSize: 20 }}>{f.title}</h3>
              <p style={{ color: COLORS.gray, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works ── */}
      <div style={{ background: COLORS.navyMid, padding: "70px 32px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 38, fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: COLORS.white, marginBottom: 48 }}>How It Works</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ textAlign: "center", padding: "0 20px", minWidth: 140 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 12px", fontWeight: 800, fontSize: 16,
                    fontFamily: "'Rajdhani', sans-serif",
                    boxShadow: `0 0 24px rgba(26,86,219,0.4)`,
                  }}>
                    {s.step}
                  </div>
                  <div style={{ fontWeight: 700, color: COLORS.white, marginBottom: 4, fontFamily: "'Rajdhani', sans-serif", fontSize: 16 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.gray }}>{s.desc}</div>
                </div>
                {i < 3 && <div style={{ width: 40, height: 2, background: "rgba(59,130,246,0.4)", flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
