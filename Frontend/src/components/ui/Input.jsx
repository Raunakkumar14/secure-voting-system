import { useState } from "react";
import COLORS from "../../constants/colors";

export default function Input({ label, type = "text", value, onChange, placeholder, icon }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label style={{
          display: "block", fontSize: 12, fontWeight: 600, color: COLORS.gray,
          marginBottom: 6, textTransform: "uppercase", letterSpacing: 1,
        }}>
          {label}
        </label>
      )}
      <div style={{
        display: "flex", alignItems: "center",
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${focused ? COLORS.blue : "rgba(255,255,255,0.1)"}`,
        borderRadius: 10, padding: "10px 14px", transition: "all 0.2s",
        boxShadow: focused ? `0 0 0 3px rgba(26,86,219,0.15)` : "none",
      }}>
        {icon && <span style={{ marginRight: 8, opacity: 0.6 }}>{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            background: "none", border: "none", outline: "none",
            color: COLORS.white, fontSize: 14, width: "100%",
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        />
      </div>
    </div>
  );
}
