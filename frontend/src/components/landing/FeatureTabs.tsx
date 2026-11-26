"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  Check,
  FileText,
  Link2,
  MessagesSquare,
  Paperclip,
  Sheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WindowChrome } from "./InboxDemo";
import { demoMail, leftLabel, statusColor, statusOf, statusText } from "./demoData";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Children rise in one after another; capped so long lists don't drag. */
const stagger = (i: number) => ({
  initial: { opacity: 0, y: 10, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.5, ease: EASE, delay: Math.min(i, 6) * 0.07 },
});

function Extracted() {
  const mail = demoMail.halcyon;
  const rows = [
    ["Company", mail.company],
    ["Role", mail.role],
    ["Location", mail.location],
    ["Compensation", mail.pay],
    ["Eligibility", mail.eligibility],
    ["Closes", "Thursday, 11:59 PM"],
  ];
  return (
    <dl className="divide-y">
      {rows.map(([label, value], i) => (
        <motion.div key={label} {...stagger(i)} className="flex items-baseline justify-between gap-6 py-3 text-sm">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="text-right font-medium">{value}</dd>
        </motion.div>
      ))}
    </dl>
  );
}

function Sorted() {
  const ids = ["kestrel", "northwind", "monsoon", "halcyon", "pinecrest"];
  return (
    <ul className="space-y-4">
      {ids.map((id, i) => {
        const mail = demoMail[id];
        const status = statusOf(mail.hours);
        return (
          <motion.li key={id} {...stagger(i)}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{mail.company}</span>
              <span className={cn("font-mono text-xs", statusText[status])}>{leftLabel(mail.hours)}</span>
            </div>
            <div className="runway mt-2 h-1.5 rounded-full">
              <motion.span
                className="block h-full origin-left rounded-full"
                style={{ background: statusColor[status] }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: mail.spent }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.15 + i * 0.07 }}
              />
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}

function Threads() {
  const messages = [
    ["Placement Cell", "Halcyon Systems: SDE Intern registrations open", "Tue"],
    ["Placement Cell", "Deadline extended to Thursday", "Wed"],
    ["Placement Cell", "Online test link and instructions", "Today"],
  ];
  return (
    <div>
      <motion.div {...stagger(0)} className="flex items-center justify-between rounded-xl bg-accent px-4 py-3">
        <span className="text-sm font-medium">Halcyon Systems</span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessagesSquare className="size-3.5" /> 3 messages, one thread
        </span>
      </motion.div>
      <ol className="relative mt-4 ml-4 space-y-4 border-l pl-5">
        {messages.map(([from, subject, when], i) => (
          <motion.li key={subject} {...stagger(i + 1)} className="relative">
            <span className="absolute top-1.5 -left-[25px] size-2 rounded-full border-2 border-card bg-foreground" />
            <p className="flex justify-between gap-4 text-xs text-muted-foreground">
              <span>{from}</span>
              <span className="font-mono">{when}</span>
            </p>
            <p className="mt-0.5 text-sm">{subject}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function Files() {
  const files = [
    { icon: FileText, name: "Job description.pdf", meta: "248 KB" },
    { icon: Sheet, name: "Eligible students.xlsx", meta: "36 KB" },
  ];
  const links = ["Registration form", "Company careers page"];
  return (
    <div className="space-y-5">
      <div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Paperclip className="size-3.5" /> Attachments</p>
        <ul className="mt-2 space-y-2">
          {files.map(({ icon: Icon, name, meta }, i) => (
            <motion.li key={name} {...stagger(i)} className="flex items-center gap-3 rounded-xl border px-3 py-2.5">
              <Icon className="size-4 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">{name}</span>
              <span className="font-mono text-xs text-muted-foreground">{meta}</span>
            </motion.li>
          ))}
        </ul>
      </div>
      <div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Link2 className="size-3.5" /> Links</p>
        <ul className="mt-2 space-y-2">
          {links.map((name, i) => (
            <motion.li key={name} {...stagger(i + 2)} className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm">
              <span className="flex-1 underline decoration-foreground/25 underline-offset-4">{name}</span>
            </motion.li>
          ))}
          <motion.li {...stagger(4)} className="flex items-center gap-3 rounded-xl border border-dashed px-3 py-2.5 text-sm text-muted-foreground">
            <span className="flex-1 line-through decoration-muted-foreground/60">Unsubscribe · newsletter footer</span>
            <span className="text-xs">Filtered</span>
          </motion.li>
        </ul>
      </div>
    </div>
  );
}

function Calendar() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {days.map((day, i) => (
          <motion.div key={day} {...stagger(i)} className="h-36 rounded-xl border p-2">
            <p className="font-mono text-[11px] text-muted-foreground">{day}</p>
            {day === "Thu" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 26, delay: 0.55 }}
                className="mt-2 rounded-lg bg-foreground px-2 py-1.5 text-[11px] leading-tight text-background"
              >
                Halcyon · apply by 11:59 PM
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="mt-4 flex items-center gap-2 text-sm text-open"
      >
        <Check className="size-4" /> Added to Google Calendar
      </motion.p>
    </div>
  );
}

const features = [
  {
    title: "The details, pulled out",
    body: "Company, role, location, pay, eligibility and the deadline, read from the email so you don't have to.",
    window: "Halcyon Systems",
    Scene: Extracted,
  },
  {
    title: "Sorted by what closes first",
    body: "Every opportunity carries a runway from the day it arrived to the day it closes.",
    window: "Closing first",
    Scene: Sorted,
  },
  {
    title: "One thread per opportunity",
    body: "Follow-ups, extensions and test links stay with the announcement they belong to.",
    window: "Conversation",
    Scene: Threads,
  },
  {
    title: "Files and links, one click away",
    body: "Attachments open straight from Gmail. Useful links stay; footer and promo links are filtered out.",
    window: "Attachments & links",
    Scene: Files,
  },
  {
    title: "Deadlines on your calendar",
    body: "Add an application deadline to Google Calendar from the email itself.",
    window: "This week",
    Scene: Calendar,
  },
];

const CYCLE_MS = 6000;

export function FeatureTabs() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const id = useId();
  const { Scene, window: windowTitle } = features[index];
  const running = inView && !paused;

  return (
    <div
      ref={ref}
      className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div role="tablist" aria-orientation="vertical" aria-label="Features" className="flex flex-col">
        {features.map((feature, i) => {
          const selected = i === index;
          return (
            <button
              key={feature.title}
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setIndex(i)}
              onKeyDown={(e) => {
                const delta = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
                if (!delta) return;
                e.preventDefault();
                const next = (i + delta + features.length) % features.length;
                setIndex(next);
                document.getElementById(`${id}-tab-${next}`)?.focus();
              }}
              className="group relative border-t py-5 text-left first:border-t-0 focus-visible:rounded-lg"
            >
              <span className={cn("block text-lg font-medium tracking-[-0.02em] transition-colors duration-300", selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                {feature.title}
              </span>
              <span
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
                  selected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <span className="overflow-hidden">
                  <span className="block pt-2 text-[15px] leading-relaxed text-muted-foreground">{feature.body}</span>
                </span>
              </span>
              {selected && (
                <span className="absolute inset-x-0 -top-px h-px overflow-hidden bg-transparent">
                  <span
                    key={index}
                    onAnimationEnd={() => setIndex((index + 1) % features.length)}
                    className="block h-full origin-left bg-foreground motion-reduce:hidden"
                    style={{
                      animation: `feature-progress ${CYCLE_MS}ms linear forwards`,
                      animationPlayState: running ? "running" : "paused",
                    }}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`}>
        <WindowChrome title={windowTitle}>
          <div className="relative h-[380px] overflow-hidden p-6 sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.18 } }}
              >
                <Scene />
              </motion.div>
            </AnimatePresence>
          </div>
        </WindowChrome>
      </div>
    </div>
  );
}
