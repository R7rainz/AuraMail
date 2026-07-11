export function getDaysDiff(date: string): number {
  const target = new Date(date);
  const now = new Date();
  return Math.floor(
    (Date.UTC(target.getFullYear(), target.getMonth(), target.getDate()) -
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) /
      (1000 * 60 * 60 * 24),
  );
}

export function formatRelativeDate(date: string) {
  const days = -getDaysDiff(date);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDeadline(date: string) {
  const days = getDaysDiff(date);
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, urgent: true };
  if (days === 0) return { text: "Today", urgent: true };
  if (days === 1) return { text: "Tomorrow", urgent: true };
  if (days <= 3) return { text: `${days} days`, urgent: true };
  return {
    text: new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    urgent: false,
  };
}
