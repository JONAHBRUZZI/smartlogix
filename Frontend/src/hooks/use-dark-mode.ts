import { useEffect, useState } from "react";

const DARK_MODE_KEY = "smartlogix-dark-mode";

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem(DARK_MODE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(DARK_MODE_KEY, String(dark));
  }, [dark]);

  function toggle() {
    setDark((prev) => !prev);
  }

  return { dark, toggle };
}
