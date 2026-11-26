import { cn } from "@/lib/utils";

/** Envelope flap over a deadline runway. The runway fills on hover of a `group`. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0 text-foreground", className)}
    >
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path
        d="M8.5 11.5 16 17l7.5-5.5"
        fill="none"
        stroke="var(--background)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="8.5" y="21" width="15" height="2.2" rx="1.1" fill="var(--background)" opacity=".3" />
      <rect
        x="8.5"
        y="21"
        width="15"
        height="2.2"
        rx="1.1"
        fill="var(--background)"
        className="origin-[8.5px_22px] scale-x-[0.6] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100"
      />
    </svg>
  );
}
