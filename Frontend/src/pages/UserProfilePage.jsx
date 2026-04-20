import { useState, useEffect } from "react";
import COLORS from "../constants/colors";
import Input from "../components/ui/Input";
import Btn from "../components/ui/Btn";
import { getUserProfile, changePassword } from "../api";

export default function UserProfilePage({ user, setPage, showToast }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      setProfile(res.data);
      setLoading(false);
    } catch (err) {
      showToast("Failed to load profile", "error");
      setLoading(false);
    }
  };

  const handlePasswordChange = (key) => (e) => {
    setPasswordForm({ ...passwordForm, [key]: e.target.value });
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      showToast("Please fill all password fields", "error");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast("New passwords do not match", "error");
      return;
    }

    if (passwordForm.new_password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      });

      showToast("✅ Password changed successfully!", "success");
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      setIsEditingPassword(false);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.msg || "Failed to change password";
      showToast(`❌ ${errorMsg}`, "error");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
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
        <div style={{ color: COLORS.white }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.navy,
        padding: "84px 24px 40px",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 36,
              fontWeight: 900,
              color: COLORS.white,
              margin: 0,
            }}
          >
            👤 My Profile
          </h1>
          <Btn onClick={() => setPage("landing")} variant="secondary" style={{ fontSize: 12 }}>
            ← Back
          </Btn>
        </div>

        {/* Profile Info Card */}
        <div
          style={{
            background: COLORS.navyMid,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 28,
            marginBottom: 24,
          }}
        >
          <h2 style={{ color: COLORS.white, marginTop: 0, marginBottom: 20 }}>Account Information</h2>

          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: COLORS.gray, fontSize: 12, marginBottom: 6 }}>
              Full Name
            </label>
            <div
              style={{
                padding: "12px 14px",
                background: COLORS.navy,
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: COLORS.white,
                fontSize: 14,
              }}
            >
              {profile?.name}
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: COLORS.gray, fontSize: 12, marginBottom: 6 }}>
              Email Address
            </label>
            <div
              style={{
                padding: "12px 14px",
                background: COLORS.navy,
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: COLORS.white,
                fontSize: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{profile?.email}</span>
              <span style={{ color: "#10b981", fontSize: 12, fontWeight: 600 }}>✓ Verified</span>
            </div>
          </div>

          {/* Role */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: COLORS.gray, fontSize: 12, marginBottom: 6 }}>
              Account Role
            </label>
            <div
              style={{
                padding: "12px 14px",
                background: COLORS.navy,
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: COLORS.white,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{profile?.role === "admin" ? "👑 Admin" : "🗳️ Voter"}</span>
              <span
                style={{
                  padding: "2px 8px",
                  background: profile?.role === "admin" ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)",
                  color: profile?.role === "admin" ? "#fbbf24" : "#10b981",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {profile?.role}
              </span>
            </div>
          </div>

          {/* Verification Status */}
          <div
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 10,
              padding: 12,
              color: "#10b981",
              fontSize: 13,
            }}
          >
            <strong>✓ Email Verified</strong>
            <p style={{ margin: "6px 0 0", fontSize: 12 }}>
              Your email has been verified during registration
            </p>
          </div>
        </div>

        {/* Password Change Card */}
        <div
          style={{
            background: COLORS.navyMid,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 28,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ color: COLORS.white, margin: 0 }}>🔐 Security</h2>
          </div>

          {!isEditingPassword ? (
            <Btn onClick={() => setIsEditingPassword(true)} style={{ width: "100%" }}>
              Change Password
            </Btn>
          ) : (
            <>
              <Input
                label="Current Password"
                type="password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange("current_password")}
                placeholder="Enter your current password"
                icon="🔑"
              />

              <Input
                label="New Password"
                type="password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange("new_password")}
                placeholder="••••••••"
                icon="🔑"
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange("confirm_password")}
                placeholder="••••••••"
                icon="🔑"
              />

              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <Btn onClick={handleChangePassword} disabled={changingPassword} style={{ flex: 1 }}>
                  {changingPassword ? "Updating..." : "✅ Update Password"}
                </Btn>
                <Btn
                  onClick={() => {
                    setIsEditingPassword(false);
                    setPasswordForm({
                      current_password: "",
                      new_password: "",
                      confirm_password: "",
                    });
                  }}
                  variant="secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </Btn>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
