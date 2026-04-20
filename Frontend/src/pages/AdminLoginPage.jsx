import { useState } from "react";
import COLORS from "../constants/colors";
import Input from "../components/ui/Input";
import Btn from "../components/ui/Btn";
import { loginUser } from "../api";

export default function AdminLoginPage({ setPage, onLogin, showToast }) {
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
      
      // ✅ IMPORTANT: Check if user is actually an admin
      if (user.role !== "admin") {
        showToast(`❌ Error: Your account is a ${user.role}. You are not authorized to access the admin dashboard.`, "error");
        return;
      }

      onLogin(access_token, user);

      showToast(`Welcome back, Admin ${user.name}! 👑`, "success");

      setPage("admin");
    } catch (err) {
      showToast("Invalid admin credentials", "error");
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
          <div style={{ fontSize: 50, marginBottom: 12 }}>👑</div>
          <h2
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 36,
              fontWeight: 800,
              color: COLORS.white,
              margin: 0,
            }}
          >
            Admin Access
          </h2>
          <p style={{ color: COLORS.gray, fontSize: 14, marginTop: 6 }}>
            Restricted to administrators only
          </p>
          <p style={{ color: "#ef4444", fontSize: 12, marginTop: 8, padding: 8, background: "rgba(239,68,68,0.1)", borderRadius: 6 }}>
            ⚠️ Only admin accounts can access this dashboard. Regular user accounts will be rejected.
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
          <Input
            label="Admin Email"
            type="email"
            value={form.email}
            onChange={upd("email")}
            placeholder="Enter admin email"
            icon="✉️"
          />

          <Input
            label="Admin Password"
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
            👑 Admin Login
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
              onClick={() => setPage("login")}
              style={{
                background: "none",
                border: "none",
                color: COLORS.blueLight,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              🗳️ User Login
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

        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 12,
            color: COLORS.blueLight,
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          <strong>ℹ️ Admin Portal</strong><br/>
          This is a secure admin-only portal. If you are a regular user, please use the <strong>User Login</strong> option instead.
        </div>
      </div>
    </div>
  );
}
