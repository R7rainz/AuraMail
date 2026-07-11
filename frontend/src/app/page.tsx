"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Mail,
  MessagesSquare,
  Paperclip,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const features = [
  {
    icon: Sparkles,
    title: "Signal, extracted",
    text: "Roles, eligibility, compensation, links, and deadlines surfaced automatically — no more scanning walls of text.",
  },
  {
    icon: MessagesSquare,
    title: "Threads stay together",
    text: "Follow-ups remain attached to the original opportunity, with the latest update always on top.",
  },
  {
    icon: CalendarDays,
    title: "Deadlines become plans",
    text: "Turn an important date into a Google Calendar event with reminders in a single tap.",
  },
  {
    icon: Paperclip,
    title: "Every file in context",
    text: "Preview and download forms, briefs, and job descriptions from the message that sent them.",
  },
];

const previewMail = [
  { sender: "Career Development Centre", title: "Microsoft SWE internship", meta: "2 replies · PDF", time: "10:42" },
  { sender: "Placement Office", title: "TCS assessment schedule", meta: "Tomorrow, 9:00 AM", time: "09:18" },
  { sender: "VIT Bhopal", title: "Pre-placement talk", meta: "Auditorium · 18 Jul", time: "Yesterday" },
];

const steps = [
  ["01", "Connect", "Authorize your campus Gmail with scoped, read-only Google access."],
  ["02", "Understand", "AuraMail classifies every message and extracts the details that matter."],
  ["03", "Act", "Review follow-ups, open files, and schedule deadlines from one workspace."],
];

const metrics = [
  ["< 30s", "inbox to triaged"],
  ["8+", "signals read per mail"],
  ["1 tap", "deadline to calendar"],
  ["0", "follow-ups lost"],
];

export default function LandingPage() {
  const root = useRef<HTMLElement>(null);
  const login = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  useGSAP(
    () => {
      // Only animate when the visitor hasn't asked for reduced motion; when
      // they have, gsap.from never runs so every element stays in its final,
      // visible state (also the no-JS fallback).
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from("[data-hero]", { y: 22, opacity: 0, duration: 0.7, stagger: 0.08 })
          .from("[data-hero-panel]", { y: 28, opacity: 0, duration: 0.85 }, "-=0.55");

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            scrollTrigger: { trigger: el, start: "top 86%" },
            y: 26,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <main ref={root} className="aura-shell min-h-screen overflow-hidden">
      <div className="fixed inset-0 aura-grid pointer-events-none opacity-[0.12]" />
      <div className="fixed inset-0 aura-noise pointer-events-none" />

      {/* HEADER */}
      <header className="fixed inset-x-0 top-0 z-50 border-b aura-panel backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="AuraMail home">
            <span className="grid h-8 w-8 place-items-center rounded-md border aura-surface shadow-[0_0_24px_var(--aura-glow)]">
              <Mail className="h-4 w-4 aura-accent" />
            </span>
            <span className="text-sm font-semibold tracking-tight">AuraMail</span>
            <span
              className="mono-label hidden border-l pl-3 sm:inline"
              style={{ borderColor: "var(--aura-line)" }}
            >
              beta
            </span>
          </a>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {[["#system", "System"], ["#workflow", "Workflow"], ["#access", "Access"]].map(
              ([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="group relative text-sm aura-muted transition-colors hover:text-[var(--aura-text)]"
                >
                  {label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-[var(--aura-accent)] transition-all duration-300 group-hover:w-full" />
                </a>
              ),
            )}
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle compact />
            <button
              onClick={login}
              className="aura-hover-glow h-9 rounded-md border px-4 text-sm font-medium aura-surface transition-colors hover:bg-[var(--aura-surface-hover)]"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        id="top"
        className="relative mx-auto grid min-h-[94vh] max-w-7xl items-center gap-12 px-5 pb-16 pt-28 lg:grid-cols-[0.85fr_1.15fr] lg:px-8"
      >
        <div className="aura-scrim pointer-events-none absolute -inset-x-24 -inset-y-16 -z-10 lg:right-[42%]" />

        <div className="relative z-10 max-w-xl">
          <div data-hero className="mb-7 flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--aura-accent)]" />
            <span className="mono-label text-[var(--aura-accent)]">
              Placement intelligence for students
            </span>
          </div>
          <h1 data-hero className="text-5xl font-semibold sm:text-6xl lg:text-7xl">
            Your placement inbox, finally under control.
          </h1>
          <p data-hero className="mt-6 max-w-lg text-lg leading-8 aura-muted">
            AuraMail turns crowded campus mail into a focused stream of
            opportunities, follow-ups, files, and deadlines — read and organized
            by AI before you open it.
          </p>
          <div data-hero className="mt-9 flex flex-wrap items-center gap-4">
            <button
              onClick={login}
              className="group flex h-12 items-center gap-3 rounded-md bg-[var(--aura-accent)] px-5 text-sm font-semibold text-[#0a0b18] transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_16px_40px_-12px_var(--aura-glow)] active:translate-y-0 active:scale-[.98]"
            >
              Continue with Google
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <span className="flex items-center gap-2 text-sm aura-muted">
              <ShieldCheck className="h-4 w-4 aura-accent" /> Scoped, read-only
              Gmail access
            </span>
          </div>
        </div>

        <div data-hero-panel className="relative min-w-0">
          <div className="relative overflow-hidden rounded-xl border aura-surface shadow-[0_40px_120px_-30px_rgba(0,0,0,.65)]">
            <div
              className="flex h-11 items-center justify-between border-b px-4"
              style={{ borderColor: "var(--aura-line)" }}
            >
              <div className="flex items-center gap-2 text-xs aura-muted">
                <span className="status-dot status-dot--online" /> Inbox synchronized
              </div>
              <div className="flex items-center gap-3">
                <Search className="h-3.5 w-3.5 aura-faint" />
                <span className="mono-label">11 JUL 2026</span>
              </div>
            </div>
            <div className="grid min-h-[460px] sm:grid-cols-[230px_1fr]">
              <div className="border-r p-3" style={{ borderColor: "var(--aura-line)" }}>
                <p className="mono-label px-2 py-3">Priority stream</p>
                {previewMail.map((mail, index) => (
                  <div
                    key={mail.title}
                    className={`mb-1 rounded-md p-3 transition-colors ${index === 0 ? "border-l-2 border-[var(--aura-accent)] bg-[var(--aura-accent-soft)]" : "border-l-2 border-transparent"}`}
                  >
                    <div className="mb-1 flex justify-between gap-2">
                      <span className="truncate text-xs font-semibold">{mail.sender}</span>
                      <span className="mono-num text-[10px] aura-faint">{mail.time}</span>
                    </div>
                    <p className="truncate text-xs aura-muted">{mail.title}</p>
                    <p className="mt-2 text-[10px] aura-faint">{mail.meta}</p>
                  </div>
                ))}
              </div>
              <div className="relative p-6 sm:p-8">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <p className="mono-label text-[var(--aura-accent)]">
                      Internship · high priority
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold">Microsoft SWE internship</h2>
                    <p className="mt-2 text-sm aura-muted">
                      Career Development Centre · Today, 10:42 AM
                    </p>
                  </div>
                  <span className="grid h-9 w-9 place-items-center rounded-md border aura-panel">
                    <Sparkles className="h-4 w-4 aura-accent" />
                  </span>
                </div>
                <div className="rounded-md border-l-2 border-[var(--aura-accent)] bg-[var(--aura-accent-soft)] p-4">
                  <p className="mono-label text-[var(--aura-accent)]">AI brief</p>
                  <p className="mt-2 text-sm leading-6 aura-muted">
                    Applications open for the summer software engineering program.
                    CGPA 8.0+, deadline July 18.
                  </p>
                </div>
                <div
                  className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-[var(--aura-line)]"
                  style={{ borderColor: "var(--aura-line)" }}
                >
                  {[
                    [Clock3, "Deadline", "18 Jul, 11:59 PM"],
                    [Paperclip, "Attachments", "Role brief.pdf"],
                    [MessagesSquare, "Conversation", "3 messages"],
                    [CalendarDays, "Schedule", "Add to calendar"],
                  ].map(([Icon, label, value]) => {
                    const ItemIcon = Icon as typeof Clock3;
                    return (
                      <div key={label as string} className="bg-[var(--aura-surface-solid)] p-4">
                        <ItemIcon className="mb-3 h-4 w-4 aura-accent" />
                        <p className="mono-label">{label as string}</p>
                        <p className="mt-1 text-xs font-medium">{value as string}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS BAND */}
      <section className="border-y" style={{ borderColor: "var(--aura-line)" }}>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-[var(--aura-line)] px-5 lg:grid-cols-4 lg:px-8">
          {metrics.map(([value, label]) => (
            <div
              key={label}
              data-reveal
              className="bg-[var(--aura-canvas)] px-2 py-10 text-center"
            >
              <div className="mono-num text-4xl font-semibold text-[var(--aura-text)]">
                {value}
              </div>
              <p className="mono-label mt-3">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SYSTEM / FEATURES */}
      <section id="system" className="relative py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div data-reveal>
              <p className="mono-label text-[var(--aura-accent)]">Built for attention</p>
              <h2 className="mt-4 max-w-md text-3xl font-semibold sm:text-4xl">
                Less inbox maintenance. More informed decisions.
              </h2>
            </div>
            <div
              className="grid gap-px overflow-hidden rounded-xl border bg-[var(--aura-line)] sm:grid-cols-2"
              style={{ borderColor: "var(--aura-line)" }}
            >
              {features.map(({ icon: Icon, title, text }, i) => (
                <article
                  key={title}
                  data-reveal
                  className="group relative bg-[var(--aura-canvas-raised)] p-7 transition-colors hover:bg-[var(--aura-surface-solid)]"
                >
                  <span className="mono-label absolute right-5 top-5 text-[var(--aura-faint)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-5 w-5 aura-accent transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="mt-8 text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 aura-muted">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {steps.map(([step, title, text]) => (
            <div
              key={step}
              data-reveal
              className="border-t pt-5"
              style={{ borderColor: "var(--aura-line-strong)" }}
            >
              <span className="mono-num text-sm text-[var(--aura-accent)]">{step}</span>
              <h3 className="mt-8 text-lg font-semibold">{title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 aura-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ACCESS / CTA */}
      <section id="access" className="border-t" style={{ borderColor: "var(--aura-line)" }}>
        <div
          data-reveal
          className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-20 sm:flex-row sm:items-end lg:px-8"
        >
          <div>
            <p className="mono-label text-[var(--aura-accent)]">Private beta</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Start with the inbox you already have.
            </h2>
            <p className="mt-3 text-sm aura-muted">Free for students during beta.</p>
          </div>
          <button
            onClick={login}
            className="group aura-hover-glow flex h-12 items-center gap-3 rounded-md border border-[var(--aura-line-strong)] px-5 text-sm font-semibold transition-colors hover:bg-[var(--aura-surface-hover)]"
          >
            Open AuraMail
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t" style={{ borderColor: "var(--aura-line)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8">
          <span className="mono-label">AuraMail · beta</span>
          <div className="flex items-center gap-2 text-xs aura-faint">
            <span className="status-dot status-dot--online" /> Systems operational
          </div>
        </div>
      </footer>
    </main>
  );
}
