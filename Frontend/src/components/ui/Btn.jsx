import COLORS from "../../constants/colors";
import { useState } from "react";

export default function Btn({ children, onClick, variant = "primary", style: s = {}, disabled }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const base = {
    padding: "12px 28px", 
    borderRadius: "12px", 
    fontWeight: 600, 
    fontSize: "15px",
    cursor: disabled ? "not-allowed" : "pointer", 
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "none", 
    fontFamily: "'Outfit', sans-serif", 
    letterSpacing: "0.02em",
    opacity: disabled ? 0.5 : 1,
    transform: isActive ? "scale(0.96)" : isHovered ? "scale(1.02) translateY(-1px)" : "scale(1)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    ...s,
  };

  const variants = {
    primary: { 
      background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})`, 
      color: "#fff", 
      boxShadow: isHovered ? "0 10px 25px -5px rgba(26, 86, 219, 0.5)" : "0 4px 15px rgba(26, 86, 219, 0.3)" 
    },
    secondary: { 
      background: isHovered ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)", 
      color: COLORS.white, 
      border: "1px solid rgba(255, 255, 255, 0.15)",
      backdropFilter: "blur(10px)"
    },
    success: { 
      background: `linear-gradient(135deg, ${COLORS.green}, #34d399)`, 
      color: "#fff", 
      boxShadow: isHovered ? "0 10px 20px -5px rgba(16, 185, 129, 0.5)" : "0 4px 12px rgba(16, 185, 129, 0.3)" 
    },
    danger: { 
      background: "rgba(239, 68, 68, 0.12)", 
      color: "#fca5a5", 
      border: "1px solid rgba(239, 68, 68, 0.25)" 
    },
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
      onMouseDown={() => !disabled && setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      {children}
    </button>
  );
}