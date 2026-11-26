import { cn } from "@/lib/utils";

/**
 * The aura: a ring around an envelope, drawn 72% of the way round like a
 * deadline window being spent. Inside a `group`, hovering closes the ring.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0 text-foreground", className)}
    >
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <circle cx="16" cy="16" r="9.2" fill="none" stroke="var(--background)" strokeWidth="2" opacity=".25" />
      <circle
        cx="16"
        cy="16"
        r="9.2"
        fill="none"
        stroke="var(--background)"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100"
        strokeDashoffset="28"
        transform="rotate(-90 16 16)"
        className="transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:[stroke-dashoffset:0]"
      />
      <rect x="11.6" y="12.9" width="8.8" height="6.4" rx="1.4" fill="none" stroke="var(--background)" strokeWidth="1.6" />
      <path
        d="m12 13.6 4 2.9 4-2.9"
        fill="none"
        stroke="var(--background)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Two-tone wordmark, echoing the two-tone headlines. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-[-0.035em]", className)}>
      Aura<span className="text-muted-foreground">Mail</span>
    </span>
  );
}
