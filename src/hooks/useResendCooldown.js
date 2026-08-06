import { useEffect, useState } from "react";

export function useResendCooldown(initialSeconds = 0) {
  const [cooldown, setCooldown] = useState(initialSeconds);

  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  function startCooldown(seconds) {
    setCooldown(seconds);
  }

  function resetCooldown() {
    setCooldown(0);
  }

  return {
    cooldown,
    isCoolingDown: cooldown > 0,
    startCooldown,
    resetCooldown,
  };
}
