import { motion } from "framer-motion";
import { ArrowLeft, CalendarClock, Inbox, ShieldAlert } from "lucide-react";

interface DashboardOverviewProps {
  userFirstName: string;
  totalEmails: number;
  highPriorityCount: number;
  upcomingDeadlinesCount: number;
}

export function DashboardOverview({
  userFirstName,
  totalEmails,
  highPriorityCount,
  upcomingDeadlinesCount,
}: DashboardOverviewProps) {
  const stats = [
    { label: "Conversations", value: totalEmails, icon: Inbox },
    { label: "Active deadlines", value: upcomingDeadlinesCount, icon: CalendarClock },
    { label: "Needs attention", value: highPriorityCount, icon: ShieldAlert },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 z-10 overflow-y-auto custom-scrollbar"
    >
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center px-8 py-12 xl:px-14">
        <div className="mb-12 flex items-center gap-3 text-[11px] font-semibold uppercase aura-accent">
          <span className="h-px w-8 bg-[var(--aura-accent)]" />
          Inbox intelligence online
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-3 text-sm aura-muted">Good to see you, {userFirstName}.</p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-[var(--aura-text)] lg:text-5xl">
              Your next important update is already organized.
            </h1>
          </div>
          <div className="hidden items-center gap-2 pb-2 text-xs aura-faint lg:flex">
            <ArrowLeft className="h-4 w-4" /> Select a conversation
          </div>
        </div>

        <div className="mt-14 grid gap-px border bg-[var(--aura-line)] sm:grid-cols-3" style={{ borderColor: "var(--aura-line)" }}>
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[var(--aura-surface-solid)] p-6">
              <div className="flex items-start justify-between">
                <span className="text-3xl font-semibold tabular-nums">{value}</span>
                <Icon className="h-4 w-4 aura-accent" />
              </div>
              <p className="mt-8 text-[10px] font-semibold uppercase aura-muted">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-5 text-xs aura-faint" style={{ borderColor: "var(--aura-line)" }}>
          <span>Automatic sync checks every minute while this workspace is open.</span>
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live</span>
        </div>
      </div>
    </motion.div>
  );
}
