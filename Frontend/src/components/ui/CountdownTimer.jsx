import COLORS from "../../constants/colors";
import { useCountdown } from "../../hooks/useCountdown";

export default function CountdownTimer({ endTime }) {
  const time = useCountdown(endTime);

  return (
    <span style={{ fontFamily: "monospace", color: COLORS.cyan, fontSize: 12 }}>
      {time}
    </span>
  );
}
