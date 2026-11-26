"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { CalendarCheck, CalendarPlus, ChevronLeft, ExternalLink, RefreshCw, Search, Star } from "lucide-react";
import { BrandMark, Wordmark } from "@/components/BrandMark";
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
const LAST = DEMO_FRAMES - 1;
/** How long each autoplay frame holds: arrivals are brief, sorted states linger. */
const holdFor = (step: number) =>
  step === 0 ? 1500 : step === LAST ? 3400 : step % 2 ? 950 : 1900;

/** AuraMail's own app chrome, used for every product window on the site. */
export function WindowChrome({
  title,
  actions,
  children,
  className,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border bg-card shadow-[0_1px_2px_var(--shadow),0_40px_100px_-40px_rgba(15,23,42,0.45)] dark:shadow-[0_1px_2px_var(--shadow),0_40px_100px_-40px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      <div className="flex h-12 items-center justify-between gap-3 border-b bg-muted/40 px-4">
        <div className="flex min-w-0 items-center gap-2" aria-hidden="true">
          <BrandMark className="size-6" />
          <Wordmark className="text-sm" />
          <span className="mx-1 h-4 w-px bg-border" />
          <span className="truncate text-sm text-muted-foreground">{title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <span className="rounded-md border px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground">Example</span>
        </div>
      </div>
      {children}
    </div>
  );
}

function Runway({ spent, hours, className }: { spent: number; hours: number; className?: string }) {
  return (
    <span
      className={cn("runway block rounded-full", className)}
      style={{ "--runway": spent, "--runway-color": statusColor[statusOf(hours)] } as React.CSSProperties}
    />
  );
}

const toggle = (set: Set<string>, id: string) => {
  const next = new Set(set);
  if (!next.delete(id)) next.add(id);
  return next;
};

/**
 * A playable AuraMail. It runs itself (mail lands, then sorts by deadline)
 * until the visitor touches it; from then on every control works on example data.
 */
export function InboxDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [query, setQuery] = useState("");
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [onCalendar, setOnCalendar] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const frame = demoFrame(reduce && auto ? LAST : step);
  const q = query.trim().toLowerCase();
  const order = frame.order.filter((id) =>
    `${demoMail[id].company} ${demoMail[id].role}`.toLowerCase().includes(q),
  );
  const activeId = selected && order.includes(selected) ? selected : auto ? frame.active : order[0];
  const active = activeId ? demoMail[activeId] : null;

  useEffect(() => {
    if (!auto || reduce || !inView) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % DEMO_FRAMES), holdFor(step));
    return () => window.clearTimeout(id);
  }, [step, auto, inView, reduce]);

  useEffect(() => {
    if (!note) return;
    const id = window.setTimeout(() => setNote(null), 2600);
    return () => window.clearTimeout(id);
  }, [note]);

  /** The visitor's first touch stops autoplay and settles the list. */
  const takeOver = () => {
    if (!auto) return;
    setAuto(false);
    if (reduce) setStep(LAST);
    else if (step % 2) setStep(step + 1);
  };

  const sync = () => {
    takeOver();
    if (syncing) return;
    const settled = reduce && auto ? LAST : step % 2 ? step + 1 : step;
    if (settled >= LAST) {
      setNote("You're up to date. Nothing new to sync.");
      return;
    }
    setSyncing(true);
    window.setTimeout(() => {
      const arrival = settled + 1;
      setSyncing(false);
      setStep(arrival);
      setSelected(demoFrame(arrival).active);
      window.setTimeout(() => setStep(arrival + 1), 900);
    }, 650);
  };

  const open = (id: string) => {
    takeOver();
    setSelected(id);
    setMobileDetail(true);
  };

  return (
    <figure ref={ref} aria-label="Interactive AuraMail demo with example data">
      <div onPointerDownCapture={takeOver} onKeyDownCapture={takeOver}>
        <WindowChrome
          title="Inbox"
          actions={
            <button
              type="button"
              onClick={sync}
              disabled={syncing}
              className="btn-outline inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium"
            >
              <RefreshCw className={cn("size-3.5", syncing && "animate-spin")} />
              {syncing ? "Syncing" : "Sync"}
            </button>
          }
        >
          <div className="relative grid h-[460px] sm:grid-cols-[minmax(0,300px)_1fr] lg:grid-cols-[340px_1fr]">
            <div className="flex min-h-0 flex-col border-r">
              <div className="px-3 pt-3 pb-2">
                <label className="flex h-9 items-center gap-2 rounded-xl bg-muted px-3 text-sm text-muted-foreground focus-within:bg-card focus-within:outline-2 focus-within:outline-ring">
                  <Search className="size-3.5 shrink-0" />
                  <span className="sr-only">Search the example inbox</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search company, role"
                    className="w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </label>
              </div>
              <p className="px-4 pb-1 text-[11px] font-medium text-muted-foreground">Closing first</p>
              <LayoutGroup>
                <ul className="scrollbar-thin relative min-h-0 flex-1 overflow-y-auto px-2 pb-2">
                  <AnimatePresence initial={false} mode="popLayout">
                    {order.map((id) => {
                      const mail = demoMail[id];
                      const status = statusOf(mail.hours);
                      const isActive = id === activeId;
                      return (
                        <motion.li
                          key={id}
                          layout="position"
                          initial={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                          transition={{ ...SPRING, opacity: { duration: 0.4, ease: EASE }, filter: { duration: 0.4, ease: EASE } }}
                        >
                          <button
                            type="button"
                            onClick={() => open(id)}
                            aria-current={isActive ? "true" : undefined}
                            className="relative block w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-foreground/[0.04]"
                          >
                            {isActive && (
                              <motion.span
                                layoutId="demo-selection"
                                transition={SPRING}
                                className="absolute inset-0 rounded-xl bg-accent"
                              />
                            )}
                            <span className="relative block">
                              <span className="flex items-baseline justify-between gap-2">
                                <span className="flex min-w-0 items-center gap-1.5">
                                  <span className="truncate text-[13.5px] font-medium">{mail.company}</span>
                                  {starred.has(id) && <Star className="size-3 shrink-0 fill-soon text-soon" />}
                                </span>
                                <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground">{mail.received}</span>
                              </span>
                              <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">{mail.role}</span>
                              <span className="mt-2 flex items-center gap-2">
                                <Runway spent={mail.spent} hours={mail.hours} className="h-1 flex-1" />
                                <span className={cn("shrink-0 font-mono text-[10.5px] whitespace-nowrap", statusText[status])}>
                                  {leftLabel(mail.hours)}
                                </span>
                              </span>
                            </span>
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                  {order.length === 0 && (
                    <li className="px-3 py-10 text-center text-sm text-muted-foreground">No matches in the example inbox.</li>
                  )}
                </ul>
              </LayoutGroup>
            </div>

            <div
              className={cn(
                "min-w-0 overflow-hidden bg-card",
                mobileDetail ? "absolute inset-0 z-10 sm:static" : "hidden sm:block",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {active ? (
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.15 } }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="flex h-full flex-col p-5 sm:p-6 lg:p-8"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setMobileDetail(false)}
                          className="-ml-1 mb-3 flex items-center gap-1 rounded-lg px-1 text-sm text-muted-foreground sm:hidden"
                        >
                          <ChevronLeft className="size-4" /> Inbox
                        </button>
                        <p className="text-sm text-muted-foreground">{active.company}</p>
                        <p className="mt-1 text-2xl font-medium tracking-[-0.025em] text-balance">{active.role}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStarred((s) => toggle(s, active.id))}
                        aria-pressed={starred.has(active.id)}
                        aria-label={starred.has(active.id) ? "Unstar" : "Star"}
                        className="grid size-9 shrink-0 place-items-center rounded-xl transition-colors hover:bg-accent"
                      >
                        <motion.span
                          key={String(starred.has(active.id))}
                          initial={{ scale: 0.6 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 600, damping: 18 }}
                        >
                          <Star className={cn("size-4", starred.has(active.id) ? "fill-soon text-soon" : "text-muted-foreground")} />
                        </motion.span>
                      </button>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-muted-foreground">Application window</span>
                        <span className={cn("font-mono", statusText[statusOf(active.hours)])}>{leftLabel(active.hours)}</span>
                      </div>
                      <Runway spent={active.spent} hours={active.hours} className="mt-2 h-1.5" />
                    </div>

                    <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-5 text-sm">
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

                    <div className="mt-auto pt-5">
                      <AnimatePresence>
                        {note && (
                          <motion.p
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-3 text-xs text-muted-foreground"
                            role="status"
                          >
                            {note}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setNote("In the app, Apply opens the company's application form.")}
                          className="btn-primary inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-medium"
                        >
                          Apply <ExternalLink className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setOnCalendar((s) => toggle(s, active.id))}
                          aria-pressed={onCalendar.has(active.id)}
                          className="btn-outline inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-medium"
                        >
                          {onCalendar.has(active.id) ? (
                            <>
                              <CalendarCheck className="size-3.5 text-open" /> On your calendar
                            </>
                          ) : (
                            <>
                              <CalendarPlus className="size-3.5" /> Add to calendar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <p className="grid h-full place-items-center text-sm text-muted-foreground">Nothing selected.</p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </WindowChrome>
      </div>
      <figcaption className="text-halo mt-3 text-center text-xs text-muted-foreground">
        A live sandbox with fictional companies. Open an email, star it, or press Sync.
      </figcaption>
    </figure>
  );
}
