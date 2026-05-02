import { useState, useEffect } from "react";
import { getCandidates } from "./api";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/layout/Navbar";
import Toast from "./components/ui/Toast";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VoterDashboard from "./pages/VoterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CandidateManagement from "./pages/CandidateManagement";
import { ElectionManagement } from "./pages/ElectionManagement";
import LedgerPage from "./pages/LedgerPage";
import UserProfilePage from "./pages/UserProfilePage";
import { useToast } from "./hooks/useToast";
import { ThemeProvider } from "./context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./components/ui/ThemeToggle";
import COLORS from "./constants/colors";

export default function App() {
  const [page, setPage] = useState("landing");
  const { user, login, logout, isAuthenticated, loading } = useAuth();
  const { toast, showToast, clearToast } = useToast();

  useEffect(() => {
    getCandidates()
      .then(res => console.log("CANDIDATES:", res.data))
      .catch(err => console.error("ERROR:", err));
  }, []);

  const onLogin = (token, userData) => {
    login(token, userData);
  };

  const onLogout = () => {
    logout();
    setPage("landing");
    showToast("Logged out successfully", "info");
  };

  // Redirect unauthenticated users away from protected pages
  useEffect(() => {
    if (!loading && !isAuthenticated && (page === "voterDash" || page === "admin" || page === "ledger" || page === "candidates" || page === "elections" || page === "profile")) {
      setPage("landing");
      showToast("Please login first", "info");
    }
  }, [isAuthenticated, page, loading, showToast]);

  // Redirect non-admin users trying to access admin pages
  useEffect(() => {
    if (!loading && isAuthenticated && (page === "admin" || page === "candidates" || page === "elections") && user?.role !== "admin") {
      setPage("voterDash");
      showToast("❌ You are not an admin. Only admins can access this page.", "error");
    }
  }, [isAuthenticated, user, page, loading, showToast]);

  if (loading) {
    return (
      <div style={{ background: COLORS.navy, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: COLORS.white, fontSize: 18 }}>Loading...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AppContent 
        page={page} setPage={setPage} 
        user={user} onLogin={onLogin} onLogout={onLogout} 
        isAuthenticated={isAuthenticated} 
        toast={toast} showToast={showToast} clearToast={clearToast}
      />
    </ThemeProvider>
  );
}

function AppContent({ page, setPage, user, onLogin, onLogout, isAuthenticated, toast, showToast, clearToast }) {
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div style={{ background: "var(--navy)", minHeight: "100vh", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;800;900&family=IBM+Plex+Sans:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.4); border-radius: 3px; }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.5); }
      `}</style>

      <Navbar setPage={setPage} user={user} onLogout={onLogout} />

      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <ThemeToggle />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="page-container"
        >
          {page === "landing"      && <LandingPage setPage={setPage} />}
          {page === "register"     && <RegisterPage setPage={setPage} showToast={showToast} onLogin={onLogin} />}
          {page === "login"        && <LoginPage setPage={setPage} onLogin={onLogin} showToast={showToast} />}
          {page === "adminLogin"   && <AdminLoginPage setPage={setPage} onLogin={onLogin} showToast={showToast} />}
          {page === "forgotPassword" && <ForgotPasswordPage setPage={setPage} showToast={showToast} />}
          {isAuthenticated && page === "profile"       && <UserProfilePage user={user} setPage={setPage} showToast={showToast} />}
          {isAuthenticated && user?.role === "voter" && page === "voterDash"    && <VoterDashboard user={user} setPage={setPage} showToast={showToast} />}
          {isAuthenticated && user?.role === "admin" && page === "admin"        && <AdminDashboard setPage={setPage} showToast={showToast} />}
          {isAuthenticated && user?.role === "admin" && page === "candidates"   && <CandidateManagement setPage={setPage} showToast={showToast} />}
          {isAuthenticated && user?.role === "admin" && page === "elections"    && <ElectionManagement onBack={() => setPage("admin")} />}
          {isAuthenticated && page === "ledger"       && <LedgerPage user={user} />}
        </motion.div>
      </AnimatePresence>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}
    </div>
  );
}
