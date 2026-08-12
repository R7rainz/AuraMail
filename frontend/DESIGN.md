---
version: current
name: AuraMail
website: "http://localhost:3000"
description: >-
  A dark, warm placement-intelligence inbox for students. AuraMail turns a
  crowded campus mailbox into a calm timeline of opportunities, deadlines,
  follow-ups, files, and calendar events.

source:
  tokens: "src/app/globals.css"
  layout: "src/app/layout.tsx"
  landing: "src/app/page.tsx"
  dashboard: "src/app/dashboard/page.tsx"
  detail: "src/app/dashboard/components/EmailDetailView.tsx"

seo:
  title: "AuraMail Design System — dark placement intelligence"
  metaDescription: >-
    AuraMail's design system: warm graphite surfaces, amber deadlines, serif
    editorial display type, glass panels, and a deadline runway for placement
    opportunities.
  tags:
    - "Productivity"
    - "Education"
    - "Email intelligence"
  lastUpdated: "2026-08-12"

  opening: |
    AuraMail is designed around one useful question: what closes first? The
    interface is a dark working surface with warm paper text, amber action
    color, and a restrained teal counterpoint. The inbox is dense but quiet;
    deadline state carries the color, while glass panels and hairline borders
    create hierarchy without turning the product into a generic dashboard.

    The landing page uses a more editorial expression of the same system:
    Optima-like serif headlines, animated light rays, and a runway board that
    demonstrates the product before sign-in. The dashboard trades spectacle for
    scan speed: a 64px header, a wide inbox rail, an optional calendar rail,
    and a focused detail view. On mobile, inbox and detail are one pane at a
    time.

principles:
  - "Deadline first: sort and color by what closes, not only by arrival time."
  - "Dark, warm, and legible: use cream text on graphite surfaces instead of pure white on pure black."
  - "Amber is the action color; urgency colors belong to deadline state."
  - "Glass and hairlines separate working surfaces without heavy chrome."
  - "Editorial display type gives the product a human voice; utility type stays neutral."
  - "Every interactive control keeps a visible keyboard focus ring."

colors:
  # Core CSS variables from globals.css.
  background: "#0d1011"
  foreground: "#eee9df"
  card: "#151a1b"
  card-foreground: "#eee9df"
  popover: "#1b2223"
  popover-foreground: "#eee9df"
  primary: "#e2aa65"
  primary-foreground: "#191512"
  secondary: "#1a2223"
  secondary-foreground: "#e9efeb"
  muted: "#1c2425"
  muted-foreground: "#91a09e"
  accent: "#243333"
  accent-foreground: "#eff5f0"
  destructive: "#dc7468"
  border: "rgba(238, 233, 223, 0.12)"
  input: "rgba(238, 233, 223, 0.16)"
  ring: "#d9a25c"

  # Deadline state is the product's only semantic color scale.
  closed: "#7d8885"
  urgent: "#e17868"
  soon: "#e3aa61"
  open: "#72c2a1"

  # Local surface colors used where a panel needs a little more separation.
  hero: "#101516"
  header: "#111617"
  panel: "#121819"
  amber-deep: "#9e6942"

typography:
  sans:
    fontFamily: "Geist, system-ui, sans-serif"
    usage: "Body copy, labels, controls, inbox rows, and headings"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    usage: "Dates, counts, deadline labels, metadata, and eyebrow labels"
  display-serif:
    fontFamily: "Optima, Iowan Old Style, Palatino Linotype, serif"
    fontSize: "clamp(2.25rem, 6vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1.12
    usage: "Landing hero, landing CTA, and dashboard welcome headline"
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontWeight: 500
    letterSpacing: "-0.045em"
    lineHeight: 1.08
    usage: "Compact product headings when the serif layer is not appropriate"
  body:
    fontSize: "16px"
    lineHeight: 1.5
  small:
    fontSize: "14px"
    lineHeight: 1.5
  caption:
    fontSize: "11px–12px"
    lineHeight: 1.4

spacing:
  base: "4px"
  scale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64]
  page-inline: "24px on mobile; 32px on desktop dashboard; 40px in detail view"
  section: "96px–128px on landing pages"

shape:
  baseRadius: "1rem"
  controls: "rounded-xl; compact controls may use rounded-lg"
  cards: "rounded-2xl"
  badges: "rounded-full"
  avatars: "rounded-full"
  runway: "rounded-full"

effects:
  dashboard-shell: >-
    A graphite base with a muted teal radial glow at the upper right and a
    low terracotta glow near the lower left.
  glass-panel: >-
    rgba(20, 26, 27, 0.78) with a 1px cream border at 10% opacity, a soft
    black shadow, and 20px backdrop blur.
  soft-glow: >-
    A subtle amber ring and large black shadow reserved for elevated focus.
  light-rays: >-
    Landing and overview ambience uses WebGL rays with a CSS conic/radial
    fallback; reduced motion disables the animation.
  grain: "A very low-opacity noise layer prevents banding in dark gradients."

components:
  landing-header:
    height: "64px"
    treatment: "Fixed, translucent background, bottom hairline, 24px horizontal padding"
    actions: "AuraMail wordmark and a compact Sign in button"
  landing-hero:
    surface: "hero"
    alignment: "Centered"
    content: "11px mono eyebrow, serif headline, readable paragraph, primary CTA"
    motion: "Light rays behind content; honor prefers-reduced-motion"
  runway-board:
    surface: "glass-panel"
    rows: "Company, role, time remaining, and a 4px runway bar"
    order: "Closing first"
  dashboard-header:
    height: "64px"
    surface: "header with backdrop blur and bottom hairline"
    actions: "Sync, deadline notifications, user initial, sign out"
  inbox-sidebar:
    width: "100% mobile; 380px from md; 420px from xl"
    surface: "glass-panel / panel"
    content: "Inbox heading, search, sort, filter pills, and opportunity rows"
    row: "Company, received date, role/snippet, runway, urgency and attachment badges"
  overview:
    content: "Welcome eyebrow, serif deadline statement, capability chips, three stats"
    surface: "Light rays plus workspace glow over the dashboard shell"
  email-detail:
    layout: "Sticky action bar followed by a centered max-width reading column"
    order: "Identity, application runway, extracted fields, AI brief, conversation, files, details, links"
    prose: "Large readable text with a primary-tinted left rule"
  calendar-panel:
    visibility: "Hidden below 2xl; 320px rail at 2xl and above"
    content: "Month grid, deadline/event markers, selected-day details, next seven days"
  urgency-badge:
    treatment: "Tinted pill with a subtle state-colored border"
    states: "open, soon, urgent, closed"

responsive:
  mobile:
    - "Inbox and detail are mutually exclusive full-width panes."
    - "Detail action buttons wrap; content uses 20px horizontal padding."
    - "Calendar rail is hidden."
  tablet:
    - "Inbox rail is 380px and detail remains visible beside it."
    - "Extracted fields become two columns when space allows."
  desktop:
    - "Inbox rail grows to 420px at xl."
    - "Calendar rail appears at 2xl with a fixed 320px width."

accessibility:
  contrast: "Cream text and semantic urgency colors sit on dark surfaces; preserve the defined tokens."
  focus: "Use the shared visible ring treatment on buttons, links, pills, calendar days, and disclosure controls."
  motion: "Respect prefers-reduced-motion; reveal content must remain visible without animation."
  semantics: "Use headings, landmarks, time elements, progressbar runway labels, and descriptive aria-labels."

avoid:
  - "Do not bring back the stale Aesop cream/graphite palette."
  - "Do not add saturated colors outside the deadline urgency scale."
  - "Do not replace the serif display layer with a generic bold sans."
  - "Do not use large shadows or gradients as decoration when a hairline or surface contrast is enough."
