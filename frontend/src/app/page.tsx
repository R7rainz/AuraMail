"use client";

import { motion } from "framer-motion";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const features = [
  { icon: Sparkles, title: "Signal, extracted", text: "Roles, eligibility, compensation, links, and deadlines surfaced automatically." },
  { icon: MessagesSquare, title: "Threads stay together", text: "Follow-ups remain attached to the original opportunity, with the latest update first." },
  { icon: CalendarDays, title: "Deadlines become plans", text: "Turn important dates into calendar events without retyping a thing." },
  { icon: Paperclip, title: "Every file in context", text: "Preview and download forms, briefs, and job descriptions from the message that sent them." },
];

const previewMail = [
  { sender: "Career Development Centre", title: "Microsoft SWE internship", meta: "2 replies - PDF", time: "10:42" },
  { sender: "Placement Office", title: "TCS assessment schedule", meta: "Tomorrow, 9:00 AM", time: "09:18" },
  { sender: "VIT Bhopal", title: "Pre-placement talk", meta: "Auditorium - 18 Jul", time: "Yesterday" },
];

export default function LandingPage() {
  const login = () => { window.location.href = `${API_URL}/auth/google`; };

  return (
    <main className="aura-shell min-h-screen overflow-hidden">
      <div className="fixed inset-0 aura-grid pointer-events-none opacity-15" />
      <div className="fixed inset-0 aura-noise pointer-events-none" />

      <header className="fixed inset-x-0 top-0 z-50 border-b aura-panel backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="AuraMail home">
            <span className="grid h-8 w-8 place-items-center border aura-surface shadow-[0_0_24px_var(--aura-glow)]">
              <Mail className="h-4 w-4 aura-accent" />
            </span>
            <span className="text-sm font-semibold">AuraMail</span>
            <span className="hidden border-l pl-3 text-[10px] font-semibold uppercase text-[var(--aura-faint)] sm:inline" style={{ borderColor: "var(--aura-line)" }}>VIT beta</span>
          </a>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            {[["#system", "System"], ["#workflow", "Workflow"], ["#access", "Access"]].map(([href, label]) => (
              <a key={href} href={href} className="group relative text-xs aura-muted transition-colors hover:text-[var(--aura-text)]">
                {label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-[var(--aura-accent)] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle compact />
            <button onClick={login} className="aura-hover-glow h-9 border px-4 text-xs font-semibold aura-surface transition-colors hover:bg-[var(--aura-surface-hover)]">Sign in</button>
          </div>
        </div>
      </header>

      <section id="top" className="relative mx-auto grid min-h-[92vh] max-w-7xl items-center gap-12 px-5 pb-14 pt-28 lg:grid-cols-[.82fr_1.18fr] lg:px-8">
        <div
          className="pointer-events-none absolute -inset-x-24 -inset-y-16 -z-10 lg:right-[38%]"
          style={{ background: "radial-gradient(60% 55% at 32% 42%, var(--aura-canvas) 0%, transparent 72%)" }}
        />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="relative z-10 max-w-xl">
          <div className="mb-7 flex items-center gap-2 text-[11px] font-semibold uppercase aura-accent">
            <span className="h-px w-8 bg-[var(--aura-accent)]" />
            Placement intelligence for students
          </div>
          <h1 className="text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
            Your placement inbox, finally under control.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 aura-muted sm:text-lg">
            AuraMail turns crowded campus mail into a focused stream of opportunities, follow-ups, files, and deadlines.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button onClick={login} className="group flex h-12 items-center gap-3 bg-[var(--aura-accent)] px-5 text-sm font-semibold text-[#0a0b18] shadow-[0_0_0_rgba(0,0,0,0)] transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_16px_40px_-12px_var(--aura-glow)] active:translate-y-0 active:scale-[.98]">
              Continue with Google
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <span className="flex items-center gap-2 text-xs aura-muted"><ShieldCheck className="h-4 w-4 aura-accent" /> Scoped Gmail access</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: .97, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .8, delay: .12 }} className="relative min-w-0">
          <div className="relative overflow-hidden border aura-surface shadow-[0_32px_100px_rgba(0,0,0,.4)]">
            <div className="flex h-11 items-center justify-between border-b px-4" style={{ borderColor: "var(--aura-line)" }}>
              <div className="flex items-center gap-2 text-[11px] aura-muted"><span className="status-dot status-dot--online" /> Inbox synchronized</div>
              <div className="flex items-center gap-3"><Search className="h-3.5 w-3.5 aura-faint" /><span className="font-mono text-[10px] aura-faint">11 JUL 2026</span></div>
            </div>
            <div className="grid min-h-[460px] sm:grid-cols-[230px_1fr]">
              <div className="border-r p-3" style={{ borderColor: "var(--aura-line)" }}>
                <p className="px-2 py-3 text-[10px] font-semibold uppercase aura-faint">Priority stream</p>
                {previewMail.map((mail, index) => (
                  <div key={mail.title} className={`mb-1 p-3 transition-colors ${index === 0 ? "bg-[var(--aura-accent-soft)] border-l-2 border-[var(--aura-accent)]" : "border-l-2 border-transparent"}`}>
                    <div className="mb-1 flex justify-between gap-2"><span className="truncate text-[11px] font-semibold">{mail.sender}</span><span className="font-mono text-[9px] aura-faint">{mail.time}</span></div>
                    <p className="truncate text-xs aura-muted">{mail.title}</p>
                    <p className="mt-2 text-[9px] aura-faint">{mail.meta}</p>
                  </div>
                ))}
              </div>
              <div className="relative p-6 sm:p-8">
                <div className="mb-8 flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase aura-accent">Internship / high priority</p><h2 className="mt-3 text-2xl font-semibold">Microsoft SWE internship</h2><p className="mt-2 text-xs aura-muted">Career Development Centre - Today, 10:42 AM</p></div><span className="grid h-9 w-9 place-items-center border aura-panel"><Sparkles className="h-4 w-4 aura-accent" /></span></div>
                <div className="border-l-2 border-[var(--aura-accent)] bg-[var(--aura-accent-soft)] p-4"><p className="text-[10px] font-semibold uppercase aura-accent">AI brief</p><p className="mt-2 text-sm leading-6 aura-muted">Applications are open for the summer software engineering program. CGPA 8.0+, deadline July 18.</p></div>
                <div className="mt-6 grid grid-cols-2 gap-px bg-[var(--aura-line)] border" style={{ borderColor: "var(--aura-line)" }}>
                  {[ [Clock3, "Deadline", "18 Jul, 11:59 PM"], [Paperclip, "Attachments", "Role brief.pdf"], [MessagesSquare, "Conversation", "3 messages"], [CalendarDays, "Schedule", "Add to calendar"] ].map(([Icon, label, value]) => {
                    const ItemIcon = Icon as typeof Clock3;
                    return <div key={label as string} className="bg-[var(--aura-surface-solid)] p-4"><ItemIcon className="mb-3 h-4 w-4 aura-accent" /><p className="text-[9px] uppercase aura-faint">{label as string}</p><p className="mt-1 text-xs font-medium">{value as string}</p></div>;
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="system" className="relative border-y py-24" style={{ borderColor: "var(--aura-line)" }}>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-[11px] font-semibold uppercase aura-accent">Built for attention</p><h2 className="mt-4 max-w-md text-3xl font-semibold sm:text-4xl">Less inbox maintenance. More informed decisions.</h2></div><div className="grid gap-px border bg-[var(--aura-line)] sm:grid-cols-2" style={{ borderColor: "var(--aura-line)" }}>{features.map(({ icon: Icon, title, text }) => <article key={title} className="aura-hover-lift group bg-[var(--aura-canvas-raised)] p-6 transition-colors hover:bg-[var(--aura-surface-solid)]"><Icon className="h-5 w-5 aura-accent transition-transform duration-300 group-hover:scale-110" /><h3 className="mt-8 text-sm font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 aura-muted">{text}</p></article>)}</div></div>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">{[["01", "Connect", "Authorize your VIT Gmail account with scoped Google access."], ["02", "Understand", "AuraMail classifies messages and extracts the details that matter."], ["03", "Act", "Review follow-ups, open files, and schedule deadlines from one workspace."]].map(([step, title, text]) => <div key={step} className="border-t pt-5" style={{ borderColor: "var(--aura-line-strong)" }}><span className="font-mono text-xs aura-accent">{step}</span><h3 className="mt-8 text-lg font-semibold">{title}</h3><p className="mt-3 max-w-sm text-sm leading-6 aura-muted">{text}</p></div>)}</div>
      </section>

      <section id="access" className="border-t" style={{ borderColor: "var(--aura-line)" }}><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-20 sm:flex-row sm:items-end lg:px-8"><div><p className="text-[11px] font-semibold uppercase aura-accent">Private beta</p><h2 className="mt-4 text-3xl font-semibold">Start with the inbox you already have.</h2><p className="mt-3 text-sm aura-muted">Free for VIT students during beta.</p></div><button onClick={login} className="group aura-hover-glow flex h-12 items-center gap-3 border border-[var(--aura-line-strong)] px-5 text-sm font-semibold transition-colors hover:bg-[var(--aura-surface-hover)]">Open AuraMail <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button></div></section>

      <footer className="border-t" style={{ borderColor: "var(--aura-line)" }}><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 text-xs aura-faint lg:px-8"><span>AuraMail / VIT beta</span><div className="flex items-center gap-2"><span className="status-dot status-dot--online" /> Systems operational</div></div></footer>
    </main>
  );
}
