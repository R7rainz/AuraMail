import { motion } from "framer-motion";
import { ArrowLeft, CalendarClock, Inbox, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { LightRaysBackground } from "@/components/LightRaysBackground";

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
    { label: "Opportunities", value: totalEmails, icon: Inbox, tone: "" },
    {
      label: "Closing soon",
      value: upcomingDeadlinesCount,
      icon: CalendarClock,
      tone: upcomingDeadlinesCount > 0 ? "text-soon" : "",
    },
    {
      label: "High priority",
      value: highPriorityCount,
      icon: Zap,
      tone: highPriorityCount > 0 ? "text-urgent" : "",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="scrollbar-thin absolute inset-0 isolate overflow-y-auto"
    >
      <LightRaysBackground
        intensity={0.62}
        spread={0.62}
        falloff={0.55}
        sharpness={0.32}
        drift={0.24}
      />
      <div
        aria-hidden
        className="workspace-glow pointer-events-none absolute inset-x-0 top-0 h-[60%]"
      />

      <div className="relative z-10 mx-auto flex min-h-full max-w-4xl flex-col justify-center px-6 py-16 sm:px-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {userFirstName ? `Good to see you, ${userFirstName}.` : "Welcome back."}
        </p>

        <h1 className="display-serif mt-5 max-w-2xl text-4xl text-balance sm:text-5xl">
          {upcomingDeadlinesCount > 0
            ? `${upcomingDeadlinesCount} ${upcomingDeadlinesCount === 1 ? "deadline" : "deadlines"} still open.`
            : "Nothing closing right now."}
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
          {totalEmails === 0
            ? "Run a sync to pull placement mail out of your inbox. AuraMail will sort the opportunities, follow-ups, presentations, and deadlines for you."
            : "Your inbox is sorted by what closes first. Pick a conversation to read the full message, AI brief, files, and dates."}
        </p>

        <div className="mt-10 flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <Sparkles className="size-4 text-soon" /> AI topic tags
          </span>
          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <CalendarClock className="size-4" /> Deadline tracking
          </span>
          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <Inbox className="size-4" /> Follow-ups grouped
          </span>
        </div>

        <dl className="mt-12 grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="glass-panel rounded-2xl p-5 sm:p-6">
              <Icon className={cn("size-4 text-muted-foreground", tone)} />
              <dd
                className={cn(
                  "mt-7 font-mono text-3xl tabular-nums",
                  tone,
                )}
              >
                {value}
              </dd>
              <dt className="mt-2 text-sm text-muted-foreground">{label}</dt>
            </div>
          ))}
        </dl>

        <p className="mt-7 flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="size-3.5" />
          Select a conversation to open it
        </p>
      </div>
    </motion.div>
  );
}
