import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ud-theme";

function getInitialTheme(): boolean {
  if (typeof document === "undefined") return false;
  // index.html's inline script already set this class before paint —
  // just read it back so React state matches what's on screen.
  return document.documentElement.classList.contains("dark");
}

/**
 * Dark mode that actually persists across visits and respects the OS
 * preference on first load. Previously `Navbar` only checked
 * `document.documentElement.classList.contains("dark")` on mount, which is
 * always false on a fresh load since nothing else ever set that class —
 * every visit started light regardless of what someone picked last time.
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // localStorage can throw in private-browsing / disabled-storage modes
    }
  }, [isDark]);

  const toggle = useCallback(() => setIsDark((d) => !d), []);

  return { isDark, toggle };
}
