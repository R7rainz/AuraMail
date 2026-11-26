---
name: AuraMail
description: >-
  A placement inbox for students, drawn in ink on cool paper. Every opportunity
  is one entry with a runway from the day it arrived to the day it closes, and
  the only colour in the product is the deadline state.

source:
  tokens: "src/app/globals.css"
  fonts: "src/app/layout.tsx"
  landing: "src/app/page.tsx, src/components/landing/*"
  brand: "src/components/BrandMark.tsx, src/app/icon.svg, src/app/opengraph-image.tsx"
  primitives: "src/components/ui/button.tsx, src/components/ui/card.tsx, src/components/ui/badge.tsx, src/components/ThemeSwitcher.tsx"
  dashboard: "src/app/dashboard/page.tsx, src/app/dashboard/components/*"
  legal: "src/app/legal-page.tsx"

principles:
  - "Ink is the action colour: primary actions are an ink tile, never a brand hue."
  - "Colour means time: urgent, soon, open and closed are the only hues, and they mark deadline state."
  - "Two-tone type: headlines and the wordmark pair an ink lead with a muted completion."
  - "Glass is chrome only: the nav bar, headers and menus are frosted; content surfaces stay solid."
  - "One highlight moves: selection and hover are a single shared shape that slides between items."
  - "Our own chrome: product windows carry the AuraMail mark, wordmark and an Example tag, not operating-system window controls."
  - "Light and dark are equal themes, switched by a circle grown from the toggle."

colors:
  # Light theme (default, :root and [data-theme="light"])
  paper: "#f7f8fa"
  ink: "#0e0f12"
  card: "#ffffff"
  popover: "#ffffff"
  primary: "#0e0f12"
  primary-foreground: "#f7f8fa"
  secondary: "#eef0f3"
  muted: "#eef0f3"
  muted-foreground: "#646975"
  accent: "#e9ecf0"
  border: "#e0e3e8"
  input: "#d5d9e0"
  ring: "#0066ff"
  destructive: "#d43c3c"
  urgent: "#d43c3c"
  soon: "#b05d08"
  open: "#12804a"
  closed: "#6b7280"
  header: "rgba(247, 248, 250, 0.72)"
  shadow: "rgba(15, 23, 42, 0.08)"
  dither-ink: "rgb(77, 107, 153)"
  # Dark theme ([data-theme="dark"])
  paper-dark: "#0c0d10"
  ink-dark: "#f6f7f9"
  card-dark: "#131418"
  popover-dark: "#18191e"
  primary-dark: "#f6f7f9"
  primary-foreground-dark: "#0c0d10"
  secondary-dark: "#1a1c20"
  muted-dark: "#1a1c20"
  muted-foreground-dark: "#969ca8"
  accent-dark: "#1f2126"
  border-dark: "#282b31"
  input-dark: "#33363d"
  ring-dark: "#3b82f6"
  destructive-dark: "#f06a6a"
  urgent-dark: "#ff6b6b"
  soon-dark: "#f5b94a"
  open-dark: "#4cc38a"
  closed-dark: "#8b93a1"
  header-dark: "rgba(12, 13, 16, 0.72)"
  shadow-dark: "rgba(0, 0, 0, 0.32)"
  dither-ink-dark: "rgb(120, 150, 200)"

typography:
  display:
    fontFamily: "Schibsted Grotesk, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(48px, 5.6vw, 76px)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  display-closing:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "clamp(44px, 7vw, 96px)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "clamp(34px, 4.6vw, 60px)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "clamp(26px, 3vw, 36px)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title-small:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    letterSpacing: "-0.02em"
  wordmark:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    letterSpacing: "-0.035em"
  body-lead:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.43
  meta:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 400
    fontFeature: "tnum"

rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  window: "20px"
  panel: "28px"
  pill: "9999px"

spacing:
  unit: "4px"
  gutter-mobile: "20px"
  gutter-tablet: "32px"
  gutter-desktop: "40px"
  section: "clamp(96px, 16svh, 180px)"
  section-closing: "clamp(120px, 22svh, 240px)"
  hero-top: "144px"
  hero-top-tablet: "176px"
  hero-top-desktop: "192px"
  container: "72rem"
  container-demo: "64rem"
  container-reading: "48rem"
  container-detail: "56rem"

components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    height: "36px"
    padding: "8px 16px"
  button-primary-cta:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    height: "48px"
    padding: "0 24px"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    height: "36px"
    padding: "8px 16px"
  button-outline-hover:
    backgroundColor: "{colors.accent}"
  button-ghost-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
  nav-bar:
    rounded: "{rounded.xl}"
    height: "56px"
    width: "72rem"
  nav-link:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "8px 14px"
  badge-urgent:
    textColor: "{colors.urgent}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  filter-chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "24px"
  inbox-row-selected:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.xl}"
    padding: "14px 12px"
  window-chrome:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.window}"
  window-titlebar:
    height: "48px"
    padding: "0 16px"
  input-search:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    height: "40px"
    padding: "4px 12px 4px 36px"

effects:
  glass-bar: "The floating nav bar: white 72% (dark rgba(22,24,28,0.66)), 1px hairline, inset top highlight, blur(24px) saturate(1.6). After 24px of scroll it gains 0 12px 40px -16px rgba(15,23,42,0.35) over 500ms."
  glass-strong: "Elevated glass for the privacy panel and the dashboard error toast: vertical white gradient (dark graphite), blur(32px) saturate(1.7), long soft drop 0 32px 80px -32px."
  btn-primary: "Ink tile with an inset top highlight and a 0 10px 24px -14px drop. On hover a fill of 18% paper mixed into ink wipes in from the left (scaleX over 0.55s, expo) and leaves through the right; press scales to 0.97."
  btn-outline: "Card fill, 1px hairline, 0 1px 2px shadow; hover goes to the accent fill with an 18% ink border; press scales to 0.97."
  app-header: "Dashboard header and sticky detail bar: --header at 72%, blur(20px) saturate(1.5)."
  paper-grain: "180px SVG fractal noise, multiply at 6% (dark: inverted, screen at 3.5%) over landing, legal and dashboard overview."
  dither-field: "Fixed WebGL backdrop: domain-warped fbm thresholded per 6x4 CSS px block through a 4x4 Bayer matrix and drawn as a 4x2 px horizontal dash, so the cloud reads as tiny runways. --dither-ink at 50% (dark 42%), 2px cells upscaled pixelated. Clears a column behind the hero copy and quiets past the hero."
  text-halo: "Four stacked background-coloured text shadows (3/8/14/22px) so copy never sits on dither dashes."
  runway: "Track at 9% ink; ::after fills scaleX(var(--runway)) in --runway-color, grows over 1.1s; urgent rows pulse 2.4s."
  brand-ring: "The mark's ring is drawn 72% of the way round (dashoffset 28 of 100); inside a group, hover closes it over 700ms on the expo curve."
  view-transition: "Theme change grows a clip-path circle from the toggle's centre over 520ms."

responsive:
  mobile:
    - "Hero headline clamp(40px, 10vw, 48px); gutters 20px; the nav bar sits 12px from the edges."
    - "Site nav: mark, wordmark, theme toggle and a 40px menu button; the menu expands inside the same bar (height auto over 450ms) with staggered 18px links and a full-width 48px Continue with Google button. Sign in is hidden below sm."
    - "Inbox and detail are mutually exclusive full-width panes; category pills scroll horizontally in the inbox."
    - "The landing sandbox shows the list only below sm; opening an email lays the reading pane over it with a back link."
  tablet:
    - "From md the centred nav links appear and the dashboard inbox rail is 360px beside the detail pane."
    - "How-it-works steps become three columns at md."
  desktop:
    - "Mailbox navigation rail appears at xl; category pills move into it."
    - "Inbox rail grows to 390px and the 320px calendar rail appears at 2xl."
    - "Feature tabs and the privacy and FAQ sections become two columns at lg; the sandbox list is 340px at lg."

accessibility:
  focus: "Global :focus-visible outline 2px solid --ring, offset 2px; primitives add a 3px ring at ring/50."
  motion: "prefers-reduced-motion collapses animations and transitions to 0.01ms, freezes the dither on one frame, shows the sandbox's final sorted frame without autoplay, removes the tilt and skips the circle reveal."
  semantics: "Feature tabs are a vertical tablist with arrow keys; FAQ uses aria-expanded regions; runways are progressbars with descriptive labels; the sandbox is a labelled figure with a caption, aria-pressed star and calendar toggles, and a status line for notes."
  contrast: "Deadline colours are darkened in light theme (soon #b05d08, open #12804a) so they read as text, not only as bars."

avoid:
  - "Do not introduce a brand hue for actions; primary stays ink."
  - "Do not use the deadline colours for decoration, categories or emphasis."
  - "Do not put frosted glass behind reading content; cards and rows stay solid."
  - "Do not light every selected item separately; use one shared layoutId highlight per list."
  - "Do not draw operating-system window controls on product windows; use the AuraMail chrome."
  - "Do not make buttons full pills; pills are for chips, badges, search and avatars."
  - "Do not bring back the retired warm graphite, amber and serif-display system."
---

# Design System: AuraMail

## Overview

**Creative North Star: "Ink on Paper, Timed"**

AuraMail is a cool, near-neutral sheet of paper with one ink. Text, primary buttons, the brand mark and the selected calendar day are all drawn in the same ink colour; there is no brand hue. The only saturated colour is the deadline scale (urgent, soon, open, closed), so wherever colour shows up, it is telling the student how much time is left. The runway, a thin bar filling from received to closing, is the system's signature. It appears in every inbox row, the detail view, the feature tabs, the sandbox, the primary button's hover wipe, the brand mark's unfinished ring and the dashes of the background field.

Atmosphere comes from material rather than colour. The landing page sits over a slow ordered-dither cloud of short blue-grey dashes, with paper grain on top. Floating chrome (the nav bar, the dashboard header, menus, toasts) is frosted glass; content surfaces (cards, rows, product windows) are solid. Type is Schibsted Grotesk throughout, set medium and tight for headlines and split into an ink lead and a muted completion, with Fragment Mono for anything that counts. Motion is quick and springy: one highlight slides between items, sections rise in on an expo ease-out, and the theme switch grows out of its own button as a circle.

The dashboard is the same world made denser: a 64px frosted header, solid rails separated by hairlines, mono metadata, and the runway on every row. The landing sandbox is built from the same parts and wears the same AuraMail chrome, so what a visitor plays with is what they get.

**Key Characteristics:**
- Ink-on-paper palette in two equal themes; ink is the action colour.
- Deadline state is the only colour.
- Runway bars as the recurring signature, echoed in the mark, the button hover and the dither dashes.
- Two-tone, medium-weight, tightly tracked headlines and a two-tone wordmark.
- Frosted glass for chrome, solid surfaces for content.
- Rounded-square buttons; pills only for chips, badges and fields.
- Spring-driven shared-layout highlights and expo ease-out entrances.

## Colors

A cool neutral ramp from paper to ink in each theme, plus a four-step deadline scale and a single blue focus ring.

### Primary
- **Ink** (#0e0f12 light / #f6f7f9 dark): Body text, headlines, primary buttons, the brand mark tile, the active filter chip, the focused calendar day and the feature-tab progress line. `--primary` equals ink by design.

### Neutral
- **Paper** (#f7f8fa / #0c0d10): Page background, the colour knocked out of ink buttons and the brand mark, and the `text-halo` shadow colour.
- **Card White / Card Graphite** (#ffffff / #131418): Solid content surfaces: cards, product windows, outline buttons, dashboard rails.
- **Mist** (#eef0f3 / #1a1c20): Secondary and muted fills: search fields, secondary badges, the product window title bar at 40%.
- **Selection Haze** (#e9ecf0 / #1f2126): The accent fill for every selected item highlight and for outline and ghost hover.
- **Slate Text** (#646975 / #969ca8): Muted text, including the second line of every two-tone headline and the "Mail" half of the wordmark.
- **Hairline** (#e0e3e8 / #282b31): Borders, dividers, section rules. Inputs use #d5d9e0 / #33363d.
- **Dither Blue-Grey** (rgb 77,107,153 / rgb 120,150,200): Only the WebGL dither dashes, at 50% / 42% alpha.

### Deadline Scale
- **Urgent** (#d43c3c / #ff6b6b): Under 24 hours left. Runway fill, time-left label, `High` badge, pulsing runway. Also `--destructive`.
- **Soon** (#b05d08 / #f5b94a): 24 to 72 hours left; calendar deadline dots; the star on a starred message.
- **Open** (#12804a / #4cc38a): More than 72 hours left; success confirmations (the calendar check, the "can" ticks on the privacy panel).
- **Closed** (#6b7280 / #8b93a1): Applications closed.

### Focus
- **Signal Blue** (#0066ff / #3b82f6): `--ring` only: focus outlines and input caret. Never a fill.

### Named Rules
**The Ink Is the Action Rule.** Primary actions are filled with the text colour. A new screen does not get a brand hue for its main button.

**The Colour Means Time Rule.** Urgent, soon, open and closed appear only where they describe a deadline or its direct outcome. Categories, tags and counts are neutral.

## Typography

**Display and Body Font:** Schibsted Grotesk (fallback -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif), loaded through next/font as `--font-brand-sans`.
**Mono Font:** Fragment Mono, weight 400 only (fallback ui-monospace, SFMono-Regular, Menlo, Consolas, monospace), loaded as `--font-brand-mono`.

**Character:** A sturdy, slightly condensed grotesk does all the talking: medium and tight for headlines, regular for reading, semibold only in the wordmark. The mono is narrow and plain, and handles everything that counts: dates, time left, counts, calendar days and the Example tag.

### Hierarchy
- **Display** (500, clamp(48px, 5.6vw, 76px); clamp(40px, 10vw, 48px) below sm, line-height 1.02, -0.035em): Landing hero only.
- **Display Closing** (500, clamp(44px, 7vw, 96px), 0.98, -0.04em): The closing call to action.
- **Headline** (500, clamp(34px, 4.6vw, 60px), 1.04, -0.035em): Landing section headings. Legal page titles use clamp(40px, 6vw, 64px) at 1.02; the dashboard welcome uses clamp(28px, 3.2vw, 42px) at 1.06.
- **Title** (500, clamp(26px, 3vw, 36px), 1.1, -0.03em): Email subject in the detail view. Step titles and the sandbox role are 24px at -0.025em; feature tab, FAQ and mobile-menu items are 18px at -0.02em (FAQ 20px from sm).
- **Wordmark** (600, -0.035em; 17px in the site nav, 16px in the dashboard header, 14px in window chrome): "Aura" in ink, "Mail" in slate.
- **Body Lead** (400, 17px from sm / 16px mobile, 1.625): Hero and section intros, max 32rem.
- **Body** (400, 16px, 1.5): Default.
- **Body Small** (400, 15px, 1.625): Feature bodies, step bodies, FAQ answers, legal text, inbox company names.
- **Label** (500, 14px): Buttons, nav links, panel headings, footer column titles. Captions are 12px; the CTA is 15px.
- **Meta** (Fragment Mono, 400, 10.5px to 14px, tabular numerals): Received dates, time-left labels, counts, file sizes, calendar days, the Example tag.

### Named Rules
**The Two-Tone Headline Rule.** Section headings are two block lines: the lead in ink at weight 500, the rest in muted slate. The second line completes the sentence; it is not a subtitle.

**The Count in Mono Rule.** Times, dates and numbers in lists are set in Fragment Mono at 400, so columns of "5h left" and "2d ago" align. The mono ships one weight; it is never set medium or bold.

## Layout

Single centred column on the landing page with containers of 72rem (sections and the nav bar), 64rem (the sandbox) and 48rem (headings, legal). Gutters are 20px, 32px from sm and 40px from lg. Sections are separated by viewport-relative space, clamp(96px, 16svh, 180px), with the closing section given clamp(120px, 22svh, 240px) above. The hero starts 144px down (176px sm, 192px lg) to clear the floating bar, which sits 12px from the top (24px side inset from sm) and is 56px tall. Two-column sections use asymmetric splits: FAQ 0.8fr / 1.2fr, privacy 1fr / 1fr. Footer is 1.4fr plus three equal link columns.

The dashboard is a full-height shell: 64px header, then up to four columns separated by 1px hairlines: mailbox nav (xl+), inbox 360px (md) to 390px (2xl), flexible detail, calendar 320px (2xl+). Below md the inbox and the detail view swap rather than share the screen. The detail view reads in a 56rem column.

The landing sandbox is a fixed 460px tall window: a 300px list (340px at lg) beside the reading pane, padded 20, 24 and 32px by breakpoint.

Spacing sits on Tailwind's 4px unit; common steps are 8, 12, 16, 20, 24, 32, 40 and 56px.

## Elevation & Depth

Depth is mostly material, not shadow. Content is flat and solid, separated by hairlines. Floating chrome is frosted glass with an inset top highlight. Real shadows are few, and each is a long, very soft, negatively spread drop so the object hovers rather than sits.

### Shadow Vocabulary
- **Glass Bar** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(15,23,42,0.05)`; dark: `inset 0 1px 0 rgba(255,255,255,0.06)`): The site nav bar at rest.
- **Glass Bar Scrolled** (`box-shadow: 0 12px 40px -16px rgba(15,23,42,0.35)`): Added to the nav bar once the page has scrolled 24px.
- **Glass Strong** (`box-shadow: inset 0 1px 0 #fff, 0 32px 80px -32px rgba(30,45,80,0.4), 0 2px 6px rgba(15,23,42,0.06)`; dark uses rgba(0,0,0,0.8) and 0.3): Privacy panel, dashboard error toast.
- **Window** (`box-shadow: 0 1px 2px var(--shadow), 0 40px 100px -40px rgba(15,23,42,0.45)`; dark rgba(0,0,0,0.9)): Product windows in the sandbox and feature tabs.
- **Ink Button** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 10px 24px -14px rgba(15,23,42,0.6)`): Primary action.
- **Outline Button** (`box-shadow: 0 1px 2px var(--shadow)`): Secondary action.

### Named Rules
**The Glass Is Chrome Rule.** Backdrop blur belongs to things that float over content: the nav bar, the dashboard header, menus and toasts. Cards, inbox rows and reading panes are solid.

**The Halo Rule.** Text that sits over the dither field carries `text-halo` so no dash ever touches a letter.

## Shapes

Rounded squares for things you press and things that hold content; pills for things that label or filter. Buttons, the nav bar, cards, inbox rows and selection highlights share a 16px corner; nav link highlights, the sandbox's small Sync button and calendar event chips use 12px; the Example tag 10px. Product windows are 20px and elevated glass panels 28px. Chips, badges, search fields, avatars, the theme toggle, runway bars and dots are full pills (9999px). The radius base is 12px (`--radius: 0.75rem`), giving 8, 10, 12 and 16px steps.

The brand mark is a 32px ink tile with a 9px corner. Inside it, a 2px ring (r 9.2) in paper is drawn 72% of the way round from twelve o'clock over a 25% full-circle track, around a small envelope (8.8 by 6.4px, 1.4px corner, 1.6px stroke with a round-capped flap). The ring is a runway: hovering the mark's group closes it. The same geometry is the favicon and leads the Open Graph card. Borders are always 1px hairlines; dashed borders mark filtered-out items.

## Components

### Buttons
- **Shape:** Rounded square (16px), never a full pill.
- **Primary (`btn-primary`):** Ink tile, paper text, 14px medium. The shared Button defaults to 36px tall with 16px padding (lg 44px, icon 36px); the landing CTA is 48px tall with 24px padding at 15px with a trailing arrow that nudges 2px right on hover; Sign in in the nav is 40px.
- **Hover / Press:** A lighter fill (18% paper mixed into ink) wipes across left to right over 0.55s on the expo curve and exits through the right edge when the pointer leaves. Press scales to 0.97. Focus adds a 3px ring at 50% signal blue.
- **Outline (`btn-outline`):** Card fill, hairline border, ink text, a 1px shadow; hover moves to the selection haze with a darker hairline. Used for Add to calendar, Sync and dashboard secondary actions.
- **Ghost:** Transparent until hover, then the selection haze fill.
- **Text link:** Underline at 25% ink, offset 4 to 6px, going to full ink on hover.

### Chips and Badges
- **Badge:** Pill, 12px medium, 4px by 10px padding, 12px icons. Deadline variants are tinted, not filled: 10% fill, 25% border, full-colour text. Secondary and outline variants are neutral.
- **Filter chip:** Pill with a 1px hairline, 12px text, 6px by 12px. Active is an ink fill with paper text; inactive is muted text that gains the mist fill on hover.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Card white / card graphite, 1px hairline.
- **Shadow Strategy:** None; see Elevation.
- **Internal Padding:** 24px in the Card primitive; 16 to 20px in the detail view.

### Inputs / Fields
- **Style:** The dashboard search is a pill on the mist fill, no border, no shadow, with a 16px leading icon (36px left padding). The sandbox search is a 36px, 16px-radius field on mist. The generic Input is a 40px, 12px-radius field with an input-coloured hairline.
- **Focus:** Signal blue outline or border with a 3px ring at 50%; search fields also brighten to the card colour.

### Navigation
- **Site nav:** One floating frosted bar (`glass-bar`), 72rem wide, 56px tall, 16px corners. Mark and 17px wordmark left; four 14px medium muted links centred, with a single `nav-hover` highlight at 6% ink that springs (stiffness 500, damping 40) between them; theme toggle and a 40px ink Sign in on the right. Its shadow deepens after 24px of scroll. Below md a 40px menu button morphs its two bars into a cross and the menu expands inside the bar, under a hairline, with links staggering in 40ms apart.
- **Mailbox nav:** Solid rail with 12px medium section labels in muted text and 14px items with tabular counts; the active item has one `nav-active` selection-haze highlight (16px corner) that slides between items.

### Runway (signature)
A fully rounded track at 9% ink, 4px tall in rows and 6px in the detail view and features, filled from the left to the share of the application window already spent, in the colour of its deadline state. It grows in over 1.1s on the expo curve; urgent runways pulse between full and half opacity every 2.4s. It carries progressbar semantics and is always paired with a mono time-left label in the same colour.

### Inbox Row
Company in 15px ink (13.5px medium in the sandbox), received date in 11px mono at the right, role in muted text, then runway and time-left, then neutral badges. Rows stagger in 28ms apart (capped at 12). The selected row gets one 16px selection-haze highlight sliding between rows (spring 500/42 in the dashboard, 420/38 in the sandbox); a starred message shows the star in soon colour.

### Product Window (`WindowChrome`)
AuraMail's own app chrome, used for every product window on the site. A 20px solid card with the window shadow and a 48px title bar on mist at 40%: the 24px brand mark, a 14px wordmark, a hairline divider and the window title in muted 14px on the left; any actions and a mono "Example" tag (10.5px, 10px corner, hairline) on the right. No traffic-light dots.

### Landing Sandbox
The landing demo is a playable copy of the inbox on example data inside the product window. It autoplays while in view (mail drops in blurred from above, then the list re-sorts by deadline on a FLIP spring of stiffness 420, damping 38), and stops on the visitor's first pointer or key press. From then on search, select, star, Apply (shows a note), Add to calendar and Sync (adds the next arrival) all work. Notes appear as a muted status line above the actions for 2.6s.

### Feature Tabs
A vertical tablist of 18px titles separated by hairlines; the selected tab reveals its body by animating grid rows and draws a 1px ink progress line across its top over 6s before advancing. Hover or focus pauses the cycle. The matching scene plays in a product window.

### Theme Switcher
A 36px round button (a 16px-corner square in the site nav) with a 16px sun or moon that blurs in on change. Switching grows the new theme as a clip-path circle from the button's centre over 520ms using View Transitions, and falls back to an instant swap.

## Do's and Don'ts

### Do:
- **Do** fill primary actions with ink (`btn-primary`) on a 16px rounded square, with the left-to-right hover wipe.
- **Do** colour a deadline with exactly one of urgent, soon, open or closed, and pair every runway with a mono time-left label in the same colour.
- **Do** set section headings as two lines: ink lead at 500, muted completion, tracking -0.035em.
- **Do** frame product screens in `WindowChrome`: AuraMail mark, wordmark, title and the Example tag.
- **Do** use one shared `layoutId` highlight per list, sprung at stiffness about 500 and damping 40 to 42.
- **Do** enter content with `cubic-bezier(0.22, 1, 0.36, 1)`: `hero-rise` for page openings, `item-enter` for list items, `stagger-children` for detail sections.
- **Do** keep frosted glass on floating chrome and give text over the dither field `text-halo`.
- **Do** honour reduced motion by showing the final state, not a frozen mid-animation.

### Don't:
- **Don't** introduce a brand accent colour; signal blue is the focus ring only.
- **Don't** use deadline colours for categories, tags, counts or decoration.
- **Don't** blur or frost content surfaces such as cards, rows or reading panes.
- **Don't** make buttons full pills; pills belong to chips, badges, fields and avatars.
- **Don't** draw operating-system window dots or controls on product windows.
- **Don't** set Fragment Mono above weight 400, or headlines in bold or uppercase.
- **Don't** add heavy or hard shadows; depth is a long soft drop on a few floating elements.
- **Don't** bring back the retired warm graphite, amber and serif-display system.
