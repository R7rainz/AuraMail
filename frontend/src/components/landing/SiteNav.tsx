"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BrandMark, Wordmark } from "@/components/BrandMark";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export const SIGN_IN_URL = `${API_URL}/auth/google`;

const links = [
  ["Product", "#product"],
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
  ["FAQ", "#faq"],
] as const;

/** `base` is "/" off the landing page so the section anchors still resolve. */
export function SiteNav({ base = "" }: { base?: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 24);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="hero-rise fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6" style={{ animationDuration: "0.9s" }}>
      <div
        className={cn(
          "glass-bar mx-auto max-w-6xl rounded-2xl transition-[box-shadow,background-color] duration-500",
          scrolled && "shadow-[0_12px_40px_-16px_rgba(15,23,42,0.35)]",
        )}
      >
        <div className="relative flex h-14 items-center justify-between gap-3 pr-2 pl-3">
          <Link href={base || "#top"} aria-label="AuraMail home" className="group flex items-center gap-2.5 rounded-lg">
            <BrandMark className="size-8" />
            <Wordmark className="text-[17px]" />
          </Link>

          <nav
            aria-label="Main navigation"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center md:flex"
            onPointerLeave={() => setHovered(null)}
          >
            {links.map(([label, hash]) => (
              <Link
                key={hash}
                href={`${base}${hash}`}
                onPointerEnter={() => setHovered(hash)}
                onFocus={() => setHovered(hash)}
                onBlur={() => setHovered(null)}
                className="relative rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {hovered === hash && (
                  <motion.span
                    layoutId="nav-hover"
                    className="absolute inset-0 rounded-lg bg-foreground/[0.06]"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeSwitcher className="rounded-xl text-foreground" />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-10 place-items-center rounded-xl transition-colors hover:bg-accent md:hidden"
            >
              <span className="relative grid size-4 place-items-center" aria-hidden="true">
                <span className={cn("absolute h-[1.6px] w-[15px] rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]", open ? "rotate-45" : "-translate-y-[3px]")} />
                <span className={cn("absolute h-[1.6px] w-[15px] rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]", open ? "-rotate-45" : "translate-y-[3px]")} />
              </span>
            </button>
            <a
              href={SIGN_IN_URL}
              className="btn-primary hidden h-10 items-center gap-1.5 rounded-xl px-5 text-sm font-medium sm:inline-flex"
            >
              Sign in
            </a>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.nav
              id="mobile-menu"
              aria-label="Mobile navigation"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden md:hidden"
            >
              <div className="border-t px-2 pt-2 pb-3">
                {links.map(([label, hash], i) => (
                  <motion.div
                    key={hash}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i + 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={`${base}${hash}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-3 text-lg font-medium tracking-[-0.02em] transition-colors hover:bg-foreground/[0.05]"
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}
                <a
                  href={SIGN_IN_URL}
                  className="btn-primary mt-2 flex h-12 items-center justify-center gap-1.5 rounded-xl text-sm font-medium"
                >
                  Continue with Google <ArrowRight className="size-4" />
                </a>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
