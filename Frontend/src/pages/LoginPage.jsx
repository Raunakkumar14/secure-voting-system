import { useState } from "react";
import COLORS from "../constants/colors";
import Input from "../components/ui/Input";
import Btn from "../components/ui/Btn";
import { loginUser } from "../api";

export default function LoginPage({ setPage, onLogin, showToast }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const upd = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      showToast("Please enter credentials", "error");
      return;
    }

    try {
      const res = await loginUser({
        email: form.email,
        password: form.password,
      });

      const { access_token, user } = res.data;
      
      onLogin(access_token, user);

      const roleMessage = user.role === "admin" ? "👑 Admin Dashboard" : "🗳️ Voter Dashboard";
      showToast(`Welcome back, ${user.name}! Accessing ${roleMessage}`, "success");

      setPage(user.role === "admin" ? "admin" : "voterDash");
    } catch (err) {
      showToast("Invalid email or password", "error");
    }
  };

  return (
    <div
      className="fade-in"
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at 50% 0%, rgba(26, 86, 219, 0.1), transparent), ${COLORS.navy}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ 
            width: 80, height: 80, background: "rgba(255,255,255,0.03)", 
            borderRadius: 24, display: "flex", alignItems: "center", 
            justifyContent: "center", fontSize: 40, margin: "0 auto 24px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            🔐
          </div>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 32,
              fontWeight: 800,
              color: COLORS.white,
              margin: 0,
              letterSpacing: "-0.02em"
            }}
          >
            Welcome Back
          </h2>
          <p style={{ color: COLORS.gray, fontSize: 16, marginTop: 10, fontWeight: 400 }}>
            Access your secure voting portal
          </p>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 28,
            padding: "40px",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          }}
        >
          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={upd("email")}
            placeholder="Enter your email"
            icon="✉️"
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={upd("password")}
            placeholder="••••••••"
            icon="🔑"
          />

          <Btn
            onClick={handleLogin}
            style={{ width: "100%", marginTop: 10, padding: "14px" }}
          >
            Login to Dashboard
          </Btn>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 24,
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 16 }}>
              <button
                onClick={() => setPage("register")}
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.blueLight,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif"
                }}
              >
                Create account
              </button>
              <button
                onClick={() => setPage("forgotPassword")}
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.blueLight,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif"
                }}
              >
                Forgot password?
              </button>
            </div>
            <button
              onClick={() => setPage("landing")}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontSize: 13,
                marginTop: 8,
                transition: "color 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.color = COLORS.white}
              onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.4)"}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}