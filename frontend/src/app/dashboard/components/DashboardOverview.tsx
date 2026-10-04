import { CalendarClock, Inbox, MailOpen, Zap } from "lucide-react";
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
      <div className="mx-auto flex min-h-full max-w-xl flex-col items-center justify-center px-6 py-14 text-center">
        <span className="grid size-12 place-items-center rounded-lg border bg-card text-muted-foreground shadow-sm">
          <MailOpen className="size-5" />
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">
          {totalEmails === 0
            ? `Welcome${userFirstName ? `, ${userFirstName}` : ""}`
            : "Select a message to read"}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {totalEmails === 0
            ? "Sync your Gmail account to bring placement messages into this inbox."
            : "Choose a conversation from the inbox to review its details, attachments, deadline, and application link."}
        </p>

        <dl className="mt-8 grid w-full grid-cols-3 overflow-hidden rounded-lg border bg-card text-left">
          {stats.map(({ label, value, icon: Icon, tone }, index) => (
            <div key={label} className={cn("p-4", index > 0 && "border-l")}>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className={cn("size-3.5", tone)} />
                <dt className="text-xs">{label}</dt>
              </div>
              <dd className={cn("mt-2 text-xl font-semibold tabular-nums", tone)}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
