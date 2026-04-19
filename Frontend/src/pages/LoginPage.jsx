import { useState } from "react";
import COLORS from "../constants/colors";
import Input from "../components/ui/Input";
import Btn from "../components/ui/Btn";
import { loginUser } from "../api";

export default function LoginPage({ setPage, onLogin, showToast }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "voter",
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

      const user = res.data;

      onLogin({
        name: user.name,
        role: user.role,
        id: user.id,
      });

      showToast(`Welcome back, ${user.name}!`, "success");

      setPage(user.role === "admin" ? "adminDash" : "voterDash");
    } catch (err) {
      showToast("Invalid email or password", "error");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.navy,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 40px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
          <h2
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 36,
              fontWeight: 800,
              color: COLORS.white,
              margin: 0,
            }}
          >
            Welcome Back
          </h2>
          <p style={{ color: COLORS.gray, fontSize: 14, marginTop: 6 }}>
            Access your secure voting portal
          </p>
        </div>

        <div
          style={{
            background: COLORS.navyMid,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 36,
          }}
        >
          {/* Role Toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 10,
              padding: 4,
              marginBottom: 24,
            }}
          >
            {["voter", "admin"].map((r) => (
              <button
                key={r}
                onClick={() =>
                  setForm((f) => ({ ...f, role: r }))
                }
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background:
                    form.role === r
                      ? `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})`
                      : "transparent",
                  color: form.role === r ? "#fff" : COLORS.gray,
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: 1,
                  textTransform: "capitalize",
                }}
              >
                {r === "voter" ? "🗳️ Voter" : "👑 Admin"}
              </button>
            ))}
          </div>

          <Input
            label="Email / Username"
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
            style={{ width: "100%", marginTop: 4 }}
          >
            {form.role === "admin"
              ? "👑 Admin Login"
              : "🗳️ Login to Vote"}
          </Btn>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 16,
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setPage("register")}
              style={{
                background: "none",
                border: "none",
                color: COLORS.blueLight,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
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
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Forgot password?
            </button>
            <button
              onClick={() => setPage("landing")}
              style={{
                background: "none",
                border: "none",
                color: COLORS.gray,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}