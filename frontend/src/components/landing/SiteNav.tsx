"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="hero-rise fixed inset-x-0 top-0 z-50" style={{ animationDuration: "0.9s" }}>
      <div aria-hidden="true" className="nav-feather pointer-events-none absolute inset-x-0 top-0" />
      <div className="relative flex h-20 items-center justify-between gap-3 px-4 sm:px-8 lg:px-10">
        <Link
          href={base || "#top"}
          aria-label="AuraMail home"
          className="group glass-control flex h-12 items-center gap-2.5 rounded-full pr-5 pl-2"
        >
          <BrandMark className="size-8" />
          <span className="text-[17px] font-medium tracking-[-0.02em]">AuraMail</span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="glass-control absolute left-1/2 hidden h-12 -translate-x-1/2 items-center rounded-full p-1 md:flex"
          onPointerLeave={() => setHovered(null)}
        >
          {links.map(([label, hash]) => (
            <Link
              key={hash}
              href={`${base}${hash}`}
              onPointerEnter={() => setHovered(hash)}
              onFocus={() => setHovered(hash)}
              onBlur={() => setHovered(null)}
              className="relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {hovered === hash && (
                <motion.span
                  layoutId="nav-hover"
                  className="absolute inset-0 rounded-full bg-foreground/[0.07]"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span className="relative">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSwitcher className="glass-control size-12 text-foreground" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="glass-control grid size-12 place-items-center rounded-full md:hidden"
          >
            <span className="relative grid size-4 place-items-center" aria-hidden="true">
              <span className={cn("absolute h-[1.6px] w-[15px] rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]", open ? "rotate-45" : "-translate-y-[3px]")} />
              <span className={cn("absolute h-[1.6px] w-[15px] rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]", open ? "-rotate-45" : "translate-y-[3px]")} />
            </span>
          </button>
          <a
            href={SIGN_IN_URL}
            className="button-ink hidden h-12 items-center gap-1.5 rounded-full px-6 text-sm font-medium sm:inline-flex"
          >
            Sign in
          </a>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              className="fixed inset-0 -z-10 cursor-default md:hidden"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.nav
              id="mobile-menu"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -10, scale: 0.96, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, scale: 0.98, filter: "blur(4px)", transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="glass-strong absolute inset-x-4 top-[4.5rem] origin-top rounded-[28px] p-3 md:hidden"
            >
              {links.map(([label, hash], i) => (
                <motion.div
                  key={hash}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i + 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={`${base}${hash}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-lg font-medium tracking-[-0.02em] transition-colors hover:bg-foreground/[0.06]"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
              <a
                href={SIGN_IN_URL}
                className="button-ink mt-2 flex h-12 items-center justify-center gap-1.5 rounded-full text-sm font-medium"
              >
                Continue with Google <ArrowRight className="size-4" />
              </a>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
