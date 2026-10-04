"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export const themes = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
] as const;

type Theme = (typeof themes)[number]["id"];

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("auramail-theme", theme);
  window.dispatchEvent(new Event("auramail-theme-change"));
}

function getTheme(): Theme {
  const current = document.documentElement.dataset.theme as Theme | undefined;
  return current && themes.some(({ id }) => id === current) ? current : "light";
}

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("auramail-theme-change", onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener("auramail-theme-change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, () => "light");
  const nextTheme: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => applyTheme(nextTheme)}
      aria-label={`Use ${nextTheme} theme`}
      title={`Use ${nextTheme} theme`}
      className={cn(
        "grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        className,
      )}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
