"use client";

import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LightRaysBackground } from "@/components/LightRaysBackground";
import { Reveal } from "@/components/Reveal";
import { RunwayBoard } from "@/components/landing/RunwayBoard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const capabilities = [
  {
    title: "Deadlines, extracted",
    body: "Closing dates are read out of the mail body and attached to the opportunity. Nothing to type in.",
  },
  {
    title: "Threads that hold together",
    body: "Corrections and reminders group under the drive they belong to, newest first.",
  },
  {
    title: "One step to your calendar",
    body: "Push a closing date to Google Calendar without leaving the message.",
  },
];

export default function LandingPage() {
  const login = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <a
            href="#top"
            className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            aria-label="AuraMail home"
          >
            <Mail className="size-4" />
            <span className="text-sm font-medium tracking-tight">AuraMail</span>
          </a>
          <Button size="sm" onClick={login}>
            Sign in
          </Button>
        </div>
      </header>

      <main id="top">
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="relative isolate flex min-h-[86vh] items-center justify-center overflow-hidden bg-[#101516] px-6 pt-24 pb-20">
          <LightRaysBackground
            intensity={1.1}
            spread={0.56}
            falloff={0.42}
            sharpness={0.48}
            drift={0.32}
          />
          <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
            <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
              Placement intelligence
            </p>

            <h1 className="display-serif mt-8 text-5xl text-balance sm:text-6xl md:text-7xl">
              Every placement mail
              <br />
              is a clock.
            </h1>

            <p className="mx-auto mt-7 max-w-lg text-base leading-relaxed text-muted-foreground text-pretty">
              AuraMail reads your campus inbox and puts the closing date on every
              opportunity — so the drive expiring tonight stops hiding under sixty
              announcements.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={login} className="group w-full sm:w-auto">
                Continue with Google
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Button>
              <span className="font-mono text-xs text-muted-foreground">
                Read-only access
              </span>
            </div>
          </div>
        </section>

        {/* ── THE BOARD ────────────────────────────────────────── */}
        <section className="px-6 pb-28">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <div className="glass-panel overflow-hidden rounded-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <span className="text-sm font-medium">Closing first</span>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    4 open
                  </span>
                </div>
                <RunwayBoard />
              </div>
            </Reveal>

            <Reveal delay={100}>
              <p className="mt-5 text-center font-mono text-xs text-muted-foreground">
                Sorted by what closes first, not what arrived last.
              </p>
            </Reveal>
          </div>
        </section>

        <div className="rule mx-auto max-w-5xl" />

        {/* ── CAPABILITIES ─────────────────────────────────────── */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
              {capabilities.map(({ title, body }, i) => (
                <Reveal key={title} delay={i * 90} className="bg-background">
                  <div className="h-full bg-card p-6">
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mt-6 text-sm font-medium">{title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                      {body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <div className="rule mx-auto max-w-5xl" />

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="px-6 py-32">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="display-serif text-4xl text-balance sm:text-5xl">
              Start with the inbox
              <br />
              you already have.
            </h2>
            <p className="mt-5 text-sm text-muted-foreground">
              Free for VIT students during the beta.
            </p>
            <Button size="lg" onClick={login} className="group mt-9">
              Open AuraMail
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>AuraMail</span>
          <span>Built at VIT Bhopal</span>
        </div>
      </footer>
    </div>
  );
}
