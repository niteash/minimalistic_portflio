import { useEffect, useState } from "react";

/**
 * Tracks the user's `prefers-reduced-motion` setting live (not just on
 * mount), so components can degrade gracefully — skipping scroll pins,
 * marquees, and continuous 3D drag/orbit animation for people who've asked
 * the OS for less motion.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
