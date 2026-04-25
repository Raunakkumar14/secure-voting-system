import { useState } from "react";
import COLORS from "../../constants/colors";

export default function Input({ label, type = "text", value, onChange, placeholder, icon, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: 20 }}>
      {label && (
        <label style={{
          display: "block", fontSize: "13px", fontWeight: 600, color: COLORS.gray,
          marginBottom: 8, letterSpacing: "0.02em", fontFamily: "'Outfit', sans-serif"
        }}>
          {label}
        </label>
      )}
      <div style={{
        display: "flex", alignItems: "center",
        background: focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${focused ? COLORS.blue : "rgba(255,255,255,0.1)"}`,
        borderRadius: "12px", 
        padding: "12px 16px", 
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: focused ? `0 0 0 4px rgba(26, 86, 219, 0.15)` : "none",
      }}>
        {icon && <span style={{ marginRight: 12, fontSize: "18px", opacity: focused ? 1 : 0.6, transition: "opacity 0.3s" }}>{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            background: "none", border: "none", outline: "none",
            color: COLORS.white, fontSize: "15px", width: "100%",
            fontFamily: "'Inter', sans-serif",
          }}
          {...props}
        />
      </div>
    </div>
  );
}
