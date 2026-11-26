"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export const themes = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
] as const;

type Theme = (typeof themes)[number]["id"];

function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("auramail-theme", theme);
  window.dispatchEvent(new Event("auramail-theme-change"));
}

/** Grows the new theme out of the toggle as a circle where View Transitions exist. */
function applyTheme(theme: Theme, origin?: { x: number; y: number }) {
  if (
    !document.startViewTransition ||
    !origin ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return setTheme(theme);
  }

  const radius = Math.hypot(
    Math.max(origin.x, innerWidth - origin.x),
    Math.max(origin.y, innerHeight - origin.y),
  );
  document.startViewTransition(() => setTheme(theme)).ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${origin.x}px ${origin.y}px)`,
          `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
        ],
      },
      {
        duration: 520,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
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
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        applyTheme(nextTheme, {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }}
      aria-label={`Use ${nextTheme} theme`}
      title={`Use ${nextTheme} theme`}
      className={cn(
        "grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      <span key={theme} className="blur-in grid place-items-center">
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </span>
    </button>
  );
}
