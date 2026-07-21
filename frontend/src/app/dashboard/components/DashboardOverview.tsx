import { motion } from "framer-motion";
import { ArrowLeft, CalendarClock, Inbox, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className="scrollbar-thin absolute inset-0 overflow-y-auto"
    >
      {/* Still, soft pool of light so the empty workspace reads as depth. */}
      <div
        aria-hidden
        className="workspace-glow grain pointer-events-none absolute inset-x-0 top-0 h-[60%]"
      />

      <div className="relative mx-auto flex min-h-full max-w-2xl flex-col justify-center px-8 py-16">
        <p className="text-sm text-muted-foreground">
          {userFirstName ? `Good to see you, ${userFirstName}.` : "Welcome back."}
        </p>

        <h1 className="display mt-3 text-4xl leading-tight font-medium text-balance">
          {upcomingDeadlinesCount > 0
            ? `${upcomingDeadlinesCount} ${upcomingDeadlinesCount === 1 ? "deadline" : "deadlines"} still open.`
            : "Nothing closing right now."}
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground text-pretty">
          {totalEmails === 0
            ? "Run a sync to pull placement mail out of your inbox and onto a timeline."
            : "Your inbox is sorted by what closes first. Pick an opportunity to see the brief, files, and dates."}
        </p>

        <dl className="mt-12 grid grid-cols-3 divide-x rounded-xl border">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="p-5">
              <Icon className={cn("size-4 text-muted-foreground", tone)} />
              <dd
                className={cn(
                  "mt-6 font-mono text-3xl font-medium tabular-nums",
                  tone,
                )}
              >
                {value}
              </dd>
              <dt className="mt-1 text-xs text-muted-foreground">{label}</dt>
            </div>
          ))}
        </dl>

        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowLeft className="size-3.5" />
          Select a conversation to open it
        </p>
      </div>
    </motion.div>
  );
}
