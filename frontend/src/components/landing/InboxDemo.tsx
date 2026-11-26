"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { CalendarPlus, ExternalLink, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEMO_FRAMES,
  demoFrame,
  demoMail,
  leftLabel,
  statusColor,
  statusOf,
  statusText,
} from "./demoData";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 } as const;
/** How long each frame holds: arrivals are brief, sorted states linger. */
const holdFor = (step: number) =>
  step === 0 ? 1500 : step === DEMO_FRAMES - 1 ? 3400 : step % 2 ? 950 : 1900;

export function WindowChrome({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[22px] border bg-card shadow-[0_1px_2px_var(--shadow),0_40px_100px_-40px_rgba(15,23,42,0.45)] dark:shadow-[0_1px_2px_var(--shadow),0_40px_100px_-40px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      <div className="relative flex h-11 items-center border-b bg-muted/50 px-4">
        <span className="flex gap-2" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="absolute left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function Runway({ spent, hours, className }: { spent: number; hours: number; className?: string }) {
  return (
    <span
      className={cn("runway block rounded-full", className)}
      style={
        {
          "--runway": spent,
          "--runway-color": statusColor[statusOf(hours)],
        } as React.CSSProperties
      }
    />
  );
}

export function InboxDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const frame = demoFrame(reduce ? DEMO_FRAMES - 1 : step);
  const active = demoMail[frame.active];

  useEffect(() => {
    if (reduce || !inView) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % DEMO_FRAMES), holdFor(step));
    return () => window.clearTimeout(id);
  }, [step, inView, reduce]);

  return (
    <figure ref={ref} aria-label="Example: AuraMail sorting new placement emails by deadline">
      <WindowChrome title="AuraMail — Inbox">
        <div aria-hidden="true" className="grid h-[440px] sm:grid-cols-[minmax(0,300px)_1fr] lg:grid-cols-[340px_1fr]">
          <div className="flex min-h-0 flex-col border-r">
            <div className="flex items-center gap-2 px-4 pt-4 pb-2">
              <span className="flex h-8 flex-1 items-center gap-2 rounded-full bg-muted px-3 text-xs text-muted-foreground">
                <Search className="size-3.5" />
                Search company, role
              </span>
            </div>
            <p className="px-4 pb-1 text-[11px] font-medium text-muted-foreground">
              Closing first
            </p>
            <LayoutGroup>
              <ul className="relative min-h-0 flex-1 overflow-hidden px-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {frame.order.map((id) => {
                    const mail = demoMail[id];
                    const status = statusOf(mail.hours);
                    const selected = id === frame.active;
                    return (
                      <motion.li
                        key={id}
                        layout="position"
                        initial={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.25 } }}
                        transition={{ ...SPRING, opacity: { duration: 0.4, ease: EASE }, filter: { duration: 0.4, ease: EASE } }}
                        className="relative rounded-xl px-3 py-2.5"
                      >
                        {selected && (
                          <motion.span
                            layoutId="demo-selection"
                            transition={SPRING}
                            className="absolute inset-0 rounded-xl bg-accent"
                          />
                        )}
                        <span className="relative block">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-[13.5px] font-medium">{mail.company}</span>
                            <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground">
                              {mail.received}
                            </span>
                          </span>
                          <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">
                            {mail.role}
                          </span>
                          <span className="mt-2 flex items-center gap-2">
                            <Runway spent={mail.spent} hours={mail.hours} className="h-1 flex-1" />
                            <span className={cn("shrink-0 text-right font-mono text-[10.5px] whitespace-nowrap", statusText[status])}>
                              {leftLabel(mail.hours)}
                            </span>
                          </span>
                        </span>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </LayoutGroup>
          </div>

          <div className="relative hidden min-w-0 overflow-hidden sm:block">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.15 } }}
                transition={{ duration: 0.45, ease: EASE }}
                className="flex h-full flex-col p-6 lg:p-8"
              >
                <p className="text-sm text-muted-foreground">{active.company}</p>
                <p className="mt-1 text-2xl font-medium tracking-[-0.025em] text-balance">{active.role}</p>

                <div className="mt-6">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-muted-foreground">Application window</span>
                    <span className={cn("font-mono", statusText[statusOf(active.hours)])}>
                      {leftLabel(active.hours)}
                    </span>
                  </div>
                  <Runway spent={active.spent} hours={active.hours} className="mt-2 h-1.5" />
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-5 text-sm">
                  {[
                    ["Location", active.location],
                    ["Compensation", active.pay],
                    ["Eligibility", active.eligibility],
                  ].map(([label, value]) => (
                    <div key={label} className={label === "Eligibility" ? "col-span-2" : undefined}>
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-1 font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-5 text-sm leading-6 text-muted-foreground">{active.summary}</p>

                <div className="mt-auto flex gap-2 pt-6">
                  <span className="button-ink inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-medium">
                    Apply <ExternalLink className="size-3.5" />
                  </span>
                  <span className="glass-control inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-medium">
                    <CalendarPlus className="size-3.5" /> Add to calendar
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </WindowChrome>
      <figcaption className="text-halo mt-3 text-center text-xs text-muted-foreground">
        Example inbox. Companies are fictional.
      </figcaption>
    </figure>
  );
}
