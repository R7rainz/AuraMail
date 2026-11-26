"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, LockKeyhole, X } from "lucide-react";
import { useAuth } from "@/app/lib/authContext";
import { BrandMark, Wordmark } from "@/components/BrandMark";
import { Reveal } from "@/components/Reveal";
import { DitherField } from "@/components/landing/DitherField";
import { Faq } from "@/components/landing/Faq";
import { FeatureTabs } from "@/components/landing/FeatureTabs";
import { InboxDemo } from "@/components/landing/InboxDemo";
import { SIGN_IN_URL, SiteNav } from "@/components/landing/SiteNav";

const steps = [
  ["Connect Gmail", "Sign in with the Google account that receives your placement mail."],
  ["Review your inbox", "AuraMail groups threads and pulls out the company, role, deadline and files."],
  ["Take action", "Open the application, download attachments, or put the deadline on your calendar."],
];

const can = ["Read your placement email", "Add a deadline to Google Calendar when you ask"];
const cannot = ["Send email on your behalf", "Edit or delete your messages"];

function Heading({ lead, rest, className }: { lead: string; rest: string; className?: string }) {
  return (
    <h2 className={`text-[clamp(34px,4.6vw,60px)] leading-[1.04] tracking-[-0.035em] text-balance ${className ?? ""}`}>
      <span className="block font-medium">{lead}</span>
      <span className="block text-muted-foreground">{rest}</span>
    </h2>
  );
}

/** The demo window starts tipped back and lies flat as it scrolls into place. */
function TiltIn({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.2"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.35], [0.4, 1]);

  return (
    <div ref={ref} className={className} style={{ perspective: 1400 }}>
      <motion.div
        style={reduce ? undefined : { rotateX, scale, opacity, transformOrigin: "50% 0%" }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

function CtaButton({ children = "Continue with Google" }: { children?: React.ReactNode }) {
  return (
    <a
      href={SIGN_IN_URL}
      className="btn-primary group inline-flex h-12 items-center gap-2 rounded-xl px-6 text-[15px] font-medium"
    >
      {children}
      <ArrowRight className="size-4 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-0.5" />
    </a>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, router, user]);

  if (loading || user) return <div className="min-h-dvh bg-background" />;

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <DitherField />
      <SiteNav />

      <main id="top" className="relative z-10">
        <section className="px-5 pt-36 text-center sm:px-8 sm:pt-44 lg:pt-48">
          <h1
            className="hero-rise text-halo mx-auto max-w-5xl text-[clamp(40px,10vw,48px)] leading-[1.02] tracking-[-0.035em] text-balance sm:text-[clamp(48px,5.6vw,76px)]"
            style={{ animationDelay: "0.16s" }}
          >
            <span className="block font-medium">Every placement email,</span>
            <span className="block text-muted-foreground">sorted by what closes first.</span>
          </h1>
          <p
            className="hero-rise text-halo mx-auto mt-7 max-w-[32rem] text-base leading-relaxed text-pretty text-muted-foreground sm:text-[17px]"
            style={{ animationDelay: "0.3s" }}
          >
            AuraMail reads the placement mail in your Gmail and turns each opportunity into one clear entry: role, eligibility, files, link and deadline.
          </p>
          <div className="hero-rise mt-10 flex justify-center" style={{ animationDelay: "0.44s" }}>
            <CtaButton />
          </div>
          <p
            className="hero-rise text-halo mt-6 flex items-center justify-center gap-1.5 text-xs tracking-wide text-foreground/75"
            style={{ animationDelay: "0.58s" }}
          >
            <LockKeyhole className="size-3.5" />
            Read-only Gmail access · Nothing to set up
          </p>
        </section>

        <section id="product" aria-label="Product demo" className="px-4 pt-16 pb-8 sm:px-8 sm:pt-20">
          <div className="hero-rise" style={{ animationDelay: "0.7s", animationDuration: "1.4s" }}>
            <TiltIn className="mx-auto max-w-5xl">
              <InboxDemo />
            </TiltIn>
          </div>
        </section>

        <section id="features" className="px-5 pt-[clamp(96px,16svh,180px)] sm:px-8 lg:px-10">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Heading lead="Everything in the email." rest="Nothing you have to dig for." />
          </Reveal>
          <Reveal className="mx-auto mt-16 max-w-6xl sm:mt-20" delay={120}>
            <FeatureTabs />
          </Reveal>
        </section>

        <section id="how-it-works" className="px-5 pt-[clamp(96px,16svh,180px)] sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <Reveal className="max-w-2xl">
              <Heading lead="Set up in a minute." rest="Then it keeps up for you." />
            </Reveal>
            <ol className="mt-14 grid gap-10 sm:mt-16 md:grid-cols-3 md:gap-8">
              {steps.map(([title, body], i) => (
                <li key={title}>
                  <Reveal delay={i * 110} className="border-t border-foreground/80 pt-6">
                    <h3 className="text-2xl font-medium tracking-[-0.025em]">
                      <span className="mr-3 text-muted-foreground tabular-nums">{i + 1}</span>
                      {title}
                    </h3>
                    <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted-foreground">{body}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="privacy" className="px-5 pt-[clamp(96px,16svh,180px)] sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <Heading lead="Your mailbox" rest="stays yours." />
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-[17px]">
                AuraMail uses read-only Gmail access. It never sends, edits or deletes a message, and you can revoke access from your Google Account at any time.
              </p>
              <Link
                href="/privacy"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-medium underline decoration-foreground/25 underline-offset-[6px] transition-colors hover:decoration-foreground"
              >
                Read the privacy policy
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
            <Reveal delay={120}>
              <div className="glass-strong rounded-[28px] p-6 sm:p-8">
                <p className="text-sm font-medium">AuraMail can</p>
                <ul className="mt-3 space-y-3">
                  {can.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[15px]">
                      <span className="grid size-6 place-items-center rounded-full bg-open/12 text-open">
                        <Check className="size-3.5" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-7 text-sm font-medium">AuraMail can&apos;t</p>
                <ul className="mt-3 space-y-3">
                  {cannot.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[15px] text-muted-foreground">
                      <span className="grid size-6 place-items-center rounded-full bg-foreground/[0.06]">
                        <X className="size-3.5" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="faq" className="px-5 pt-[clamp(96px,16svh,180px)] sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <Heading lead="Common" rest="questions." />
              <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
                Something else?{" "}
                <a
                  href="https://github.com/R7rainz/AuraMail/issues"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground"
                >
                  Ask on GitHub
                </a>
                .
              </p>
            </Reveal>
            <Reveal delay={120}>
              <Faq />
            </Reveal>
          </div>
        </section>

        <section className="px-5 pt-[clamp(120px,22svh,240px)] pb-[clamp(96px,16svh,180px)] text-center sm:px-8">
          <Reveal>
            <h2 className="mx-auto max-w-4xl text-[clamp(44px,7vw,96px)] leading-[0.98] tracking-[-0.04em] text-balance">
              <span className="block font-medium">Placement season,</span>
              <span className="block text-muted-foreground">sorted.</span>
            </h2>
            <p className="mx-auto mt-7 max-w-md text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              Connect Gmail and see every open opportunity in deadline order.
            </p>
            <div className="mt-10 flex justify-center">
              <CtaButton />
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 border-t bg-background/70 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
          <div>
            <Link href="#top" className="group inline-flex items-center gap-2.5" aria-label="AuraMail home">
              <BrandMark className="size-7" />
              <Wordmark />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">Placement mail, sorted by what closes first.</p>
          </div>
          {[
            ["Product", [["Product", "#product"], ["Features", "#features"], ["How it works", "#how-it-works"], ["FAQ", "#faq"]]],
            ["Legal", [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]]],
            ["Project", [["GitHub", "https://github.com/R7rainz/AuraMail"], ["Report an issue", "https://github.com/R7rainz/AuraMail/issues"]]],
          ].map(([title, items]) => (
            <nav key={title as string} aria-label={title as string}>
              <p className="text-sm font-medium">{title as string}</p>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {(items as string[][]).map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="transition-colors hover:text-foreground">{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-10 text-xs text-muted-foreground sm:px-8 lg:px-10">
          © {new Date().getFullYear()} AuraMail
        </div>
      </footer>
    </div>
  );
}
