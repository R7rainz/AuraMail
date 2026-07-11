"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const toggleTheme = () => {
    const next =
      document.documentElement.dataset.theme === "dawn" ? "eclipse" : "dawn";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("auramail-theme", next);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title="Toggle color theme"
      aria-label="Toggle color theme"
      className={`theme-toggle ${compact ? "theme-toggle-compact" : ""}`}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb">
          <Moon className="theme-icon-eclipse" />
          <Sun className="theme-icon-dawn" />
        </span>
      </span>
      {!compact && <span>Theme</span>}
    </button>
  );
}
