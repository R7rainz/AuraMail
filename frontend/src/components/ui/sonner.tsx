"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// This app is dark-mode-only and never applies Tailwind's ".dark" class to
// the document, so the shadcn default of pulling colors from --popover/
// --border (which resolve to :root's light-theme values) would render a
// white toast bubble against the all-black dashboard. Hardcode dark colors
// matching the rest of the dashboard's palette (e.g. InboxSidebar's dropdown)
// instead of relying on those theme variables.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#121212",
          "--normal-text": "#ffffff",
          "--normal-border": "rgba(255, 255, 255, 0.1)",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
