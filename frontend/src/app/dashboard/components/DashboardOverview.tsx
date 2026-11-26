import { CalendarClock, Inbox, Zap } from "lucide-react";
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
    { label: "Messages", value: totalEmails, icon: Inbox, tone: "" },
    { label: "Upcoming", value: upcomingDeadlinesCount, icon: CalendarClock, tone: upcomingDeadlinesCount ? "text-soon" : "" },
    { label: "Priority", value: highPriorityCount, icon: Zap, tone: highPriorityCount ? "text-urgent" : "" },
  ];

  return (
    <div className="absolute inset-0 overflow-y-auto bg-background">
      <div aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex min-h-full max-w-xl flex-col items-center justify-center px-6 py-14 text-center">
        <h2 className="hero-rise text-[clamp(28px,3.2vw,42px)] leading-[1.06] tracking-[-0.035em] text-balance">
          <span className="block font-medium">
            {`Welcome${userFirstName ? `, ${userFirstName}` : ""}.`}
          </span>
          <span className="block text-muted-foreground">
            {totalEmails === 0
              ? "Sync to bring in your placement mail."
              : "Pick a conversation to read."}
          </span>
        </h2>
        <p
          className="hero-rise mt-4 max-w-sm text-sm leading-6 text-muted-foreground"
          style={{ animationDelay: "0.1s" }}
        >
          {totalEmails === 0
            ? "AuraMail reads your Gmail and lists every opportunity by deadline."
            : "Each one opens with its deadline, eligibility, files and application link."}
        </p>

        <dl
          className="hero-rise mt-10 grid w-full grid-cols-3 overflow-hidden rounded-2xl border bg-card text-left"
          style={{ animationDelay: "0.2s" }}
        >
          {stats.map(({ label, value, icon: Icon, tone }, index) => (
            <div key={label} className={cn("px-4 py-3.5", index > 0 && "border-l")}>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className={cn("size-3.5", tone)} />
                <dt className="text-xs">{label}</dt>
              </div>
              <dd className={cn("mt-1.5 text-lg font-medium tabular-nums", tone)}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
