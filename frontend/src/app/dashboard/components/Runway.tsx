import { cn } from "@/lib/utils";
import { type Runway as RunwayModel, runwayVarColor } from "../lib/runway";

interface RunwayBarProps {
  runway: RunwayModel;
  className?: string;
  /** Urgent windows pulse; everything else stays still. */
  live?: boolean;
}

export function RunwayBar({ runway, className, live = true }: RunwayBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(runway.progress * 100)}
      aria-label={runway.detail}
      className={cn(
        "runway rounded-full",
        live && runway.status === "urgent" && "runway-live",
        className,
      )}
      style={
        {
          "--runway": runway.progress,
          "--runway-color": runwayVarColor[runway.status],
        } as React.CSSProperties
      }
    />
  );
}
