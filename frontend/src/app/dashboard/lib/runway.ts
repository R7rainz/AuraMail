/**
 * A placement opportunity has a shape Gmail never shows you: it opens when the
 * mail lands and closes at the deadline. The runway models that window so the
 * UI can render how much of it a student has already spent.
 */

export type RunwayStatus = "open" | "soon" | "urgent" | "closed";

export interface Runway {
  status: RunwayStatus;
  /** Fraction of the window consumed, clamped to 0–1. */
  progress: number;
  /** Short label for the time remaining, e.g. "6d left". */
  label: string;
  /** Precise remaining time for tooltips and screen readers. */
  detail: string;
  msRemaining: number;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Windows shorter than this get a floor, so same-day mail isn't always 100%. */
const MIN_WINDOW = 2 * DAY;

export function getRunway(
  deadline: string,
  receivedAt?: string,
  now: Date = new Date(),
): Runway | null {
  const closes = new Date(deadline);
  if (Number.isNaN(closes.getTime())) return null;

  const opened = receivedAt ? new Date(receivedAt) : null;
  const openedAt =
    opened && !Number.isNaN(opened.getTime()) ? opened.getTime() : null;

  const closesAt = closes.getTime();
  const current = now.getTime();
  const msRemaining = closesAt - current;

  const window = openedAt ? Math.max(closesAt - openedAt, MIN_WINDOW) : MIN_WINDOW;
  const consumed = openedAt ? current - openedAt : window - msRemaining;
  const progress = Math.min(Math.max(consumed / window, 0), 1);

  if (msRemaining <= 0) {
    return {
      status: "closed",
      progress: 1,
      label: "Closed",
      detail: `Closed ${formatSpan(-msRemaining)} ago`,
      msRemaining,
    };
  }

  const status: RunwayStatus =
    msRemaining < DAY ? "urgent" : msRemaining < 3 * DAY ? "soon" : "open";

  return {
    status,
    progress,
    label: `${formatSpan(msRemaining)} left`,
    detail: `Closes ${closes.toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    })}`,
    msRemaining,
  };
}

/** Coarse, single-unit span: students scan these, they don't read them. */
function formatSpan(ms: number): string {
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / MINUTE))}m`;
  if (ms < DAY) return `${Math.round(ms / HOUR)}h`;
  return `${Math.round(ms / DAY)}d`;
}

export const runwayTextClass: Record<RunwayStatus, string> = {
  open: "text-open",
  soon: "text-soon",
  urgent: "text-urgent",
  closed: "text-closed",
};

export const runwayVarColor: Record<RunwayStatus, string> = {
  open: "var(--open)",
  soon: "var(--soon)",
  urgent: "var(--urgent)",
  closed: "var(--closed)",
};
