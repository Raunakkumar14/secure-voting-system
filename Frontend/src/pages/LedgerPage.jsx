import COLORS from "../constants/colors";
import LedgerView from "../components/layout/LedgerView";

export default function LedgerPage({ user }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.navy,
      padding: "84px 24px 40px",
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <LedgerView isAdmin={user?.role === "admin"} />
      </div>
    </div>
  );
}
