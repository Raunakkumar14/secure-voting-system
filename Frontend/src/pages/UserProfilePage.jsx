import { useState, useEffect } from "react";
import COLORS from "../constants/colors";
import Input from "../components/ui/Input";
import Btn from "../components/ui/Btn";
import { getUserProfile, changePassword, sendProfileUpdateOTP, verifyProfileUpdateOTP, resendProfileUpdateOTP, updateUserProfile, listSessions, logoutAllDevices, revokeSession } from "../api";

export default function UserProfilePage({ user, setPage, showToast }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [otpStep, setOtpStep] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await listSessions();
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      setProfile(res.data);
      setProfileForm({ name: res.data.name, email: res.data.email });
      setLoading(false);
    } catch (err) {
      showToast("Failed to load profile", "error");
      setLoading(false);
    }
  };

  const handleProfileChange = (key) => (e) => {
    setProfileForm({ ...profileForm, [key]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.name || !profileForm.email) {
      showToast("Please fill all fields", "error");
      return;
    }

    if (!profileForm.email.includes("@")) {
      showToast("Please enter a valid email", "error");
      return;
    }

    setUpdatingProfile(true);
    try {
      // Step 1: Send OTP to email
      await sendProfileUpdateOTP(profileForm.email);
      setOtpStep("verify");
      setOtpCode("");
      showToast("✅ OTP sent to your email", "success");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.msg || "Failed to send OTP";
      showToast(`❌ ${errorMsg}`, "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleVerifyAndUpdateProfile = async () => {
    if (!otpCode) {
      showToast("Please enter OTP code", "error");
      return;
    }

    setVerifyingOtp(true);
    try {
      // Step 2: Verify OTP
      await verifyProfileUpdateOTP(profileForm.email, otpCode);
      
      // Step 3: Update profile
      await updateUserProfile(profileForm.name, profileForm.email);
      setProfile({ ...profile, name: profileForm.name, email: profileForm.email });
      showToast("✅ Profile updated successfully!", "success");
      
      // Reset states
      setIsEditingProfile(false);
      setOtpStep(null);
      setOtpCode("");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.msg || "Failed to verify OTP";
      showToast(`❌ ${errorMsg}`, "error");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendProfileUpdateOTP(profileForm.email);
      showToast("✅ OTP resent successfully", "success");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.msg || "Failed to resend OTP";
      showToast(`❌ ${errorMsg}`, "error");
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

  const handleRevokeSession = async (jti) => {
    try {
      await revokeSession(jti);
      showToast("✅ Device logged out", "success");
      fetchSessions();
    } catch (err) {
      showToast("❌ Failed to revoke session", "error");
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm("This will log you out from all other devices. Continue?")) return;
    try {
      await logoutAllDevices();
      showToast("✅ Logged out from all other devices", "success");
      fetchSessions();
    } catch (err) {
      showToast("❌ Failed to logout all devices", "error");
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ color: COLORS.white, marginTop: 0, marginBottom: 0 }}>Account Information</h2>
            {!isEditingProfile && (
              <Btn onClick={() => setIsEditingProfile(true)} variant="secondary" style={{ fontSize: 12, padding: "8px 12px" }}>
                ✏️ Edit
              </Btn>
            )}
          </div>

          {!isEditingProfile ? (
            <>
              {/* Name - Display Mode */}
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

              {/* Email - Display Mode */}
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
            </>
          ) : otpStep === "verify" ? (
            <>
              {/* OTP Verification */}
              <div style={{ 
                background: "rgba(37, 99, 235, 0.1)",
                border: "1px solid rgba(37, 99, 235, 0.3)",
                borderRadius: 12,
                padding: 20,
                marginBottom: 20
              }}>
                <h3 style={{ color: COLORS.white, marginTop: 0, marginBottom: 12 }}>🔐 Verify Your Email</h3>
                <p style={{ color: COLORS.gray, marginBottom: 16, fontSize: 14 }}>
                  We've sent a 6-digit OTP to <strong>{profileForm.email}</strong>
                </p>
                
                <Input
                  label="Enter OTP Code"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  icon="🔐"
                />

                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <Btn onClick={handleVerifyAndUpdateProfile} disabled={verifyingOtp || !otpCode} style={{ flex: 1 }}>
                    {verifyingOtp ? "Verifying..." : "✅ Verify & Update"}
                  </Btn>
                  <Btn
                    onClick={() => {
                      setOtpStep(null);
                      setOtpCode("");
                      setProfileForm({ name: profile?.name, email: profile?.email });
                    }}
                    variant="secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Btn>
                </div>

                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <Btn onClick={handleResendOTP} variant="secondary" style={{ fontSize: 12, padding: "6px 12px" }}>
                    Didn't receive OTP? Resend
                  </Btn>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Name - Edit Mode */}
              <Input
                label="Full Name"
                type="text"
                value={profileForm.name}
                onChange={handleProfileChange("name")}
                placeholder="Enter your full name"
                icon="👤"
              />

              {/* Email - Edit Mode */}
              <Input
                label="Email Address"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange("email")}
                placeholder="Enter your email"
                icon="📧"
              />

              {/* Edit Action Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <Btn onClick={handleUpdateProfile} disabled={updatingProfile} style={{ flex: 1 }}>
                  {updatingProfile ? "Sending OTP..." : "📧 Send OTP"}
                </Btn>
                <Btn
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileForm({ name: profile?.name, email: profile?.email });
                    setOtpStep(null);
                  }}
                  variant="secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </Btn>
              </div>
            </>
          )}

          {/* Role - Always visible */}
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

        {/* Sessions / Active Devices Card */}
        <div
          style={{
            background: COLORS.navyMid,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 28,
            marginTop: 24
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ color: COLORS.white, margin: 0 }}>📱 Active Devices</h2>
              <p style={{ color: COLORS.gray, fontSize: 13, margin: "4px 0 0" }}>Devices currently logged into your account</p>
            </div>
            {sessions.length > 1 && (
              <Btn onClick={handleLogoutAll} variant="secondary" style={{ fontSize: 11, padding: "6px 10px", color: COLORS.red, borderColor: "rgba(239, 68, 68, 0.3)" }}>
                Logout All Others
              </Btn>
            )}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {loadingSessions ? (
              <div style={{ color: COLORS.gray, textAlign: "center", padding: 20 }}>Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div style={{ color: COLORS.gray, textAlign: "center", padding: 20 }}>No active sessions found</div>
            ) : (
              sessions.map((s) => (
                <div key={s.jti} style={{
                  padding: 16,
                  background: COLORS.navy,
                  borderRadius: 12,
                  border: `1px solid ${s.is_current ? "rgba(37, 99, 235, 0.3)" : "rgba(255,255,255,0.05)"}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ fontSize: 24 }}>{s.device.toLowerCase().includes("mobile") ? "📱" : "💻"}</div>
                    <div>
                      <div style={{ color: COLORS.white, fontSize: 14, fontWeight: 600 }}>
                        {s.device.split(')')[0].split('(')[1] || s.device.split('/')[0]}
                        {s.is_current && <span style={{ marginLeft: 8, color: COLORS.blue, fontSize: 10, background: "rgba(37, 99, 235, 0.1)", padding: "2px 6px", borderRadius: 4 }}>CURRENT</span>}
                      </div>
                      <div style={{ color: COLORS.gray, fontSize: 12, marginTop: 2 }}>
                        {s.ip} • {new Date(s.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {!s.is_current && (
                    <button 
                      onClick={() => handleRevokeSession(s.jti)}
                      style={{ 
                        background: "none", 
                        border: "none", 
                        color: COLORS.gray, 
                        cursor: "pointer", 
                        fontSize: 18,
                        padding: 8,
                        transition: "color 0.2s"
                      }}
                      onMouseOver={(e) => e.target.style.color = COLORS.red}
                      onMouseOut={(e) => e.target.style.color = COLORS.gray}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
