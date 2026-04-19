import { useState } from "react";
import COLORS from "../constants/colors";
import Input from "../components/ui/Input";
import Btn from "../components/ui/Btn";
import { forgotPassword, verifyResetOtp, resetPassword } from "../api";

export default function ForgotPasswordPage({ setPage, showToast }) {
  const [step, setStep] = useState("email"); // email, otp, newpassword
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendReset = async () => {
    if (!email) {
      showToast("Please enter your email", "error");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      showToast("Password reset OTP sent to your email", "success");
      setStep("otp");
    } catch (err) {
      showToast("Failed to send reset OTP", "error");
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
      await verifyResetOtp(email, otp);
      showToast("OTP verified, enter new password", "success");
      setStep("newpassword");
    } catch (err) {
      showToast("Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showToast("Please fill all fields", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      showToast("Password reset successful! Please login with your new password.", "success");
      setTimeout(() => setPage("login"), 1500);
    } catch (err) {
      showToast("Failed to reset password", "error");
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
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
          <h2
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 36,
              fontWeight: 800,
              color: COLORS.white,
              margin: 0,
            }}
          >
            Reset Password
          </h2>
          <p style={{ color: COLORS.gray, fontSize: 14, marginTop: 6 }}>
            {step === "email" && "Enter your email to receive reset OTP"}
            {step === "otp" && "Enter the OTP sent to your email"}
            {step === "newpassword" && "Create your new password"}
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
          {step === "email" && (
            <>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                icon="✉️"
              />

              <Btn
                onClick={handleSendReset}
                style={{ width: "100%", marginBottom: 12 }}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset OTP"}
              </Btn>

              <button
                onClick={() => setPage("login")}
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
                ← Back to Login
              </button>
            </>
          )}

          {step === "otp" && (
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
                📧 OTP sent to <strong>{email}</strong>
              </div>

              <Input
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                icon="🔐"
                maxLength="6"
              />

              <Btn
                onClick={handleVerifyOtp}
                style={{ width: "100%", marginBottom: 12 }}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Btn>

              <button
                onClick={() => {
                  setStep("email");
                  setOtp("");
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
                ← Back
              </button>
            </>
          )}

          {step === "newpassword" && (
            <>
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                icon="🔑"
              />

              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                icon="🔑"
              />

              <Btn
                onClick={handleResetPassword}
                style={{ width: "100%", marginBottom: 12 }}
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Btn>

              <button
                onClick={() => {
                  setStep("otp");
                  setNewPassword("");
                  setConfirmPassword("");
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
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
