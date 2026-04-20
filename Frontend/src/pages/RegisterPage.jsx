import { useState, useEffect } from "react";
import COLORS from "../constants/colors";
import Input from "../components/ui/Input";
import Btn from "../components/ui/Btn";
import { checkEmail, registerUser, sendOtp, verifyOtp, resendOtp } from "../api";

export default function RegisterPage({ setPage, showToast, onLogin }) {
  const [step, setStep] = useState("form"); // form, otp, verifying
  const [form, setForm] = useState({
    name: "",
    email: "",
    voterId: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // OTP Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const upd = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSendOtp = async () => {
    if (!form.name || !form.email || !form.password) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      await checkEmail(form.email);
      await sendOtp(form.email);
      showToast("✅ OTP sent to your email", "success");
      setStep("otp");
      setResendCooldown(60);
    } catch (err) {
      const errorMsg = err.response?.data?.detail;
      if (errorMsg?.includes("already registered")) {
        showToast("❌ Email already registered. Please login or use a different email.", "error");
      } else {
        showToast("❌ Failed to send OTP. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) {
      showToast(`⏳ Please wait ${resendCooldown}s before resending`, "info");
      return;
    }

    setLoading(true);
    try {
      await resendOtp(form.email);
      showToast("✅ OTP resent to your email", "success");
      setOtp(""); // Clear previous OTP input
      setResendCooldown(60);
    } catch (err) {
      const errorMsg = err.response?.data?.detail;
      showToast(`❌ ${errorMsg || "Failed to resend OTP"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      showToast("Please enter OTP", "error");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(form.email, otp);
      const res = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      const { access_token, user } = res.data;
      onLogin(access_token, user);
      
      showToast("✅ Registration successful!", "success");
      setTimeout(() => setPage("voterDash"), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.detail;
      showToast(`❌ ${errorMsg || "Invalid OTP or registration failed"}`, "error");
    } finally {
      setLoading(false);
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
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>
            {step === "form" ? "📝" : "🔐"}
          </div>
          <h2
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 36,
              fontWeight: 800,
              color: COLORS.white,
              margin: 0,
            }}
          >
            {step === "form" ? "Create Account" : "Verify Email"}
          </h2>
          <p style={{ color: COLORS.gray, fontSize: 14, marginTop: 6 }}>
            {step === "form"
              ? "Register to participate in secure elections"
              : "Enter the OTP sent to your email"}
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
          {step === "form" ? (
            <>
              <Input
                label="Full Name"
                value={form.name}
                onChange={upd("name")}
                placeholder="John Doe"
                icon="👤"
              />
              <Input
                label="Email Address"
                type="email"
                value={form.email}
                onChange={upd("email")}
                placeholder="john@email.com"
                icon="✉️"
              />
              <Input
                label="Voter ID"
                value={form.voterId}
                onChange={upd("voterId")}
                placeholder="VTR-2026-XXXXXX"
                icon="🪪"
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={upd("password")}
                placeholder="••••••••"
                icon="🔑"
              />

              <div
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 20,
                  fontSize: 12,
                  color: "#fbbf24",
                }}
              >
                ⚠️ Your Voter ID must match government records for verification
              </div>

              <Btn
                onClick={handleSendOtp}
                style={{ width: "100%" }}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Btn>

              <p
                style={{
                  textAlign: "center",
                  marginTop: 16,
                  color: COLORS.gray,
                  fontSize: 13,
                }}
              >
                Already registered?{" "}
                <button
                  onClick={() => setPage("login")}
                  style={{
                    background: "none",
                    border: "none",
                    color: COLORS.blueLight,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Login here
                </button>
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  marginBottom: 20,
                  fontSize: 13,
                  color: "#60a5fa",
                }}
              >
                📧 OTP sent to <strong>{form.email}</strong>
              </div>

              <Input
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                icon="🔑"
                maxLength="6"
              />

              <Btn
                onClick={handleVerifyOtp}
                style={{ width: "100%", marginBottom: 12 }}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Register"}
              </Btn>

              {/* Resend OTP Button with Cooldown */}
              <button
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 10,
                  border: `1px solid ${resendCooldown > 0 ? "rgba(255,255,255,0.1)" : "rgba(16,185,129,0.3)"}`,
                  background: resendCooldown > 0 ? "rgba(255,255,255,0.05)" : "rgba(16,185,129,0.1)",
                  color: resendCooldown > 0 ? COLORS.gray : "#10b981",
                  cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 12,
                  transition: "all 0.3s ease",
                }}
              >
                {resendCooldown > 0 
                  ? `🕐 Resend OTP in ${resendCooldown}s`
                  : "🔄 Resend OTP"
                }
              </button>

              <button
                onClick={() => {
                  setStep("form");
                  setOtp("");
                  setResendCooldown(0);
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: COLORS.gray,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                ← Back to Form
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}