import { useEffect } from "react";
import { useSettings } from "./useSettings";
import type { Theme } from "./store";

function resolveIsDark(theme: Theme): boolean {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return theme === "dark";
}

export function useApplyTheme(): void {
  const [{ theme }] = useSettings();

  useEffect(() => {
    const apply = () => {
      document.documentElement.classList.toggle("dark", resolveIsDark(theme));
    };
    apply();

    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [theme]);
}
