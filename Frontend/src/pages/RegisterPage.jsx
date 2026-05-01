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
        showToast(`❌ ${errorMsg || "Failed to send OTP. Please try again."}`, "error");
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
      className="fade-in"
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at 0% 0%, rgba(26, 86, 219, 0.1), transparent), ${COLORS.navy}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div style={{ width: "100%", maxWidth: 500 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ 
            width: 80, height: 80, background: "rgba(255,255,255,0.03)", 
            borderRadius: 24, display: "flex", alignItems: "center", 
            justifyContent: "center", fontSize: 40, margin: "0 auto 24px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            {step === "form" ? "📝" : "🔐"}
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
            {step === "form" ? "Create Account" : "Verify Email"}
          </h2>
          <p style={{ color: COLORS.gray, fontSize: 16, marginTop: 10 }}>
            {step === "form"
              ? "Join the secure digital democracy"
              : "Enter the code sent to your email"}
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
                label="Voter ID (Optional)"
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

              <Btn
                onClick={handleSendOtp}
                style={{ width: "100%", marginTop: 10, padding: "14px" }}
                disabled={loading}
              >
                {loading ? "Sending..." : "Continue to Verification"}
              </Btn>

              <p
                style={{
                  textAlign: "center",
                  marginTop: 24,
                  color: COLORS.gray,
                  fontSize: 14,
                }}
              >
                Already have an account?{" "}
                <button
                  onClick={() => setPage("login")}
                  style={{
                    background: "none",
                    border: "none",
                    color: COLORS.blueLight,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontFamily: "'Outfit', sans-serif"
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
                  background: "rgba(59, 130, 246, 0.05)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  borderRadius: 12,
                  padding: "16px",
                  marginBottom: 24,
                  fontSize: 14,
                  color: "#93c5fd",
                  textAlign: "center"
                }}
              >
                We've sent a code to <strong>{form.email}</strong>
              </div>

              <Input
                label="Verification Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                icon="🔢"
                maxLength="6"
              />

              <Btn
                onClick={handleVerifyOtp}
                style={{ width: "100%", marginBottom: 16, padding: "14px" }}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Complete"}
              </Btn>

              <button
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.05)",
                  background: resendCooldown > 0 ? "transparent" : "rgba(16, 185, 129, 0.05)",
                  color: resendCooldown > 0 ? "rgba(255,255,255,0.3)" : "#34d399",
                  cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 16,
                  transition: "all 0.3s ease",
                  fontFamily: "'Outfit', sans-serif"
                }}
              >
                {resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s`
                  : "Resend Code"
                }
              </button>

              <button
                onClick={() => setStep("form")}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "none",
                  background: "none",
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ← Edit details
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}