"use client";

import { RunwayBar } from "@/app/dashboard/components/Runway";
import { getRunway, runwayTextClass } from "@/app/dashboard/lib/runway";
import { useClock } from "@/lib/useClock";
import { cn } from "@/lib/utils";

const DAY = 86_400_000;

/** Offsets from load, chosen to span all three states of the urgency scale. */
const board = [
  { company: "Microsoft", role: "SDE Intern, Summer 2027", openedAgo: 6.5, closesIn: 0.35 },
  { company: "Zomato", role: "Product Analyst, New Grad", openedAgo: 3, closesIn: 2.1 },
  { company: "Deutsche Bank", role: "Technology Analyst", openedAgo: 1.5, closesIn: 9 },
  { company: "Sprinklr", role: "Product Engineer", openedAgo: 0.5, closesIn: 16 },
];

export function RunwayBoard({ className }: { className?: string }) {
  const now = useClock(15_000);

  return (
    <div className={cn("divide-y", className)}>
      {board.map((item) => {
        const runway = now
          ? getRunway(
              new Date(now.getTime() + item.closesIn * DAY).toISOString(),
              new Date(now.getTime() - item.openedAgo * DAY).toISOString(),
              now,
            )
          : null;

        return (
          <div key={item.company} className="px-5 py-3.5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="truncate text-sm font-medium">{item.company}</span>
              <span
                className={cn(
                  "shrink-0 font-mono text-xs tabular-nums",
                  runway ? runwayTextClass[runway.status] : "text-muted-foreground",
                )}
              >
                {runway?.label ?? "—"}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {item.role}
            </p>
            {runway ? (
              <RunwayBar runway={runway} className="mt-2.5 h-1" />
            ) : (
              <div className="runway mt-2.5 h-1 rounded-full" />
            )}
          </div>
        );
      })}
    </div>
  );
}
