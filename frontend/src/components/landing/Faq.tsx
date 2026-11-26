"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What is AuraMail?",
    a: "A placement inbox for students. It reads the placement mail in your Gmail, pulls out the company, role, eligibility, pay, links, files and deadline, and lists every opportunity by what closes first.",
  },
  {
    q: "Can AuraMail send, edit or delete my email?",
    a: "No. AuraMail asks Google for read-only Gmail access. Your messages stay in Gmail exactly as they are, and every entry links back to the original.",
  },
  {
    q: "Which emails does it pick up?",
    a: "Placement and career mail: internship and job announcements, pre-placement talks, workshops, tests, interviews, results and reminders. Related messages are grouped into one thread.",
  },
  {
    q: "How are the summaries made?",
    a: "An AI model reads each placement email and writes a detailed summary, keeping the specifics you need to apply instead of squeezing a long notice into one line.",
  },
  {
    q: "Can I put deadlines on my calendar?",
    a: "Yes. Open an opportunity and choose Add to calendar to create the deadline in Google Calendar. You can remove it the same way.",
  },
  {
    q: "How do I stop AuraMail's access?",
    a: "Sign out, then remove AuraMail from the third-party access page of your Google Account. That revokes access straight away.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();

  return (
    <ul className="divide-y border-y">
      {faqs.map(({ q, a }, i) => {
        const expanded = open === i;
        return (
          <li key={q}>
            <h3>
              <button
                type="button"
                id={`${id}-q-${i}`}
                aria-expanded={expanded}
                aria-controls={`${id}-a-${i}`}
                onClick={() => setOpen(expanded ? null : i)}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left focus-visible:rounded-lg"
              >
                <span className="text-lg font-medium tracking-[-0.02em] sm:text-xl">{q}</span>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border bg-card transition-colors group-hover:bg-accent">
                  <Plus
                    className={cn(
                      "size-4 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
                      expanded && "rotate-45",
                    )}
                  />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  id={`${id}-a-${i}`}
                  role="region"
                  aria-labelledby={`${id}-q-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-7 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                    {a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
