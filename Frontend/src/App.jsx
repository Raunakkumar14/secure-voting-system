import { useState, useEffect } from "react";
import { getCandidates } from "./api";
import Navbar from "./components/layout/Navbar";
import Toast from "./components/ui/Toast";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VoterDashboard from "./pages/VoterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LedgerPage from "./pages/LedgerPage";
import { useToast } from "./hooks/useToast";
import COLORS from "./constants/colors";

export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  useEffect(() => {
  getCandidates()
    .then(res => console.log("CANDIDATES:", res.data))
    .catch(err => console.error("ERROR:", err));
}, []);
  const { toast, showToast, clearToast } = useToast();

  const onLogin = (u) => setUser(u);

  const onLogout = () => {
    setUser(null);
    setPage("landing");
    showToast("Logged out successfully", "info");
  };

  return (
    <div style={{ background: COLORS.navy, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;800;900&family=IBM+Plex+Sans:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideIn { from{transform:translateX(40px);opacity:0} to{transform:translateX(0);opacity:1} }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.4); border-radius: 3px; }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.5); }
      `}</style>

      <Navbar setPage={setPage} user={user} onLogout={onLogout} />

      {page === "landing"      && <LandingPage setPage={setPage} />}
      {page === "register"     && <RegisterPage setPage={setPage} showToast={showToast} />}
      {page === "login"        && <LoginPage setPage={setPage} onLogin={onLogin} showToast={showToast} />}
      {page === "forgotPassword" && <ForgotPasswordPage setPage={setPage} showToast={showToast} />}
      {page === "voterDash"    && <VoterDashboard user={user} setPage={setPage} showToast={showToast} />}
      {page === "adminDash"    && <AdminDashboard setPage={setPage} showToast={showToast} />}
      {page === "ledger"       && <LedgerPage user={user} />}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}
    </div>
  );
}
