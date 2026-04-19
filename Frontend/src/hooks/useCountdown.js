import { useState, useEffect } from "react";

export function useCountdown(endTime) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) { setTime("Ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTime(`${d}d ${h}h ${m}m`);
    };
    update();
    const i = setInterval(update, 60000);
    return () => clearInterval(i);
  }, [endTime]);

  return time;
}