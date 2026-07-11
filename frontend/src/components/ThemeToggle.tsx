"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<"eclipse" | "dawn">("eclipse");

  useEffect(() => {
    // Deferred to an effect (rather than a lazy useState initializer) so the
    // first client render matches the server-rendered "eclipse" markup;
    // layout.tsx's inline script already set the real data-theme attribute
    // before hydration, this just syncs React state to it post-mount.
    const current = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current === "dawn" ? "dawn" : "eclipse");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dawn" ? "eclipse" : "dawn";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("auramail-theme", next);
    setTheme(next);
    window.dispatchEvent(
      new CustomEvent("auramail-theme-change", { detail: { theme: next } }),
    );
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title="Toggle color theme"
      aria-label="Toggle color theme"
      className={`theme-toggle group ${compact ? "theme-toggle-compact" : ""}`}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <motion.span
          className="theme-toggle-thumb"
          animate={{ x: theme === "dawn" ? "0.95rem" : 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === "dawn" ? (
              <motion.span
                key="sun"
                initial={{ opacity: 0, rotate: -90, scale: 0.4 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.4 }}
                transition={{ duration: 0.22 }}
                className="grid place-items-center"
              >
                <Sun />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ opacity: 0, rotate: 90, scale: 0.4 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.4 }}
                transition={{ duration: 0.22 }}
                className="grid place-items-center"
              >
                <Moon />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
      </span>
      {!compact && (
        <span className="transition-colors group-hover:text-[var(--aura-text)]">
          Theme
        </span>
      )}
    </button>
  );
}
