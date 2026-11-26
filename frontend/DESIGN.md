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
  brand: "src/components/BrandMark.tsx, src/app/icon.svg"
  primitives: "src/components/ui/button.tsx, src/components/ui/card.tsx, src/components/ui/badge.tsx, src/components/ThemeSwitcher.tsx"
  dashboard: "src/app/dashboard/page.tsx, src/app/dashboard/components/*"
  legal: "src/app/legal-page.tsx"

principles:
  - "Ink is the action colour: primary actions are the text colour as a filled pill, never a brand hue."
  - "Colour means time: urgent, soon, open and closed are the only hues, and they mark deadline state."
  - "Two-tone headlines: a medium-weight lead line, then a muted line that finishes the thought."
  - "Glass is chrome only: frosted pills and panels float over content; content surfaces stay solid."
  - "One highlight moves: selection is a single shared shape that slides between items."
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
    fontFamily: "Google Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(48px, 5.6vw, 76px)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  display-closing:
    fontFamily: "Google Sans, sans-serif"
    fontSize: "clamp(44px, 7vw, 96px)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Google Sans, sans-serif"
    fontSize: "clamp(34px, 4.6vw, 60px)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Google Sans, sans-serif"
    fontSize: "clamp(26px, 3vw, 36px)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title-small:
    fontFamily: "Google Sans, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    letterSpacing: "-0.02em"
  body-lead:
    fontFamily: "Google Sans, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Google Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Google Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Google Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.43
  meta:
    fontFamily: "Google Sans Code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 400
    fontFeature: "tnum"

rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  window: "22px"
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
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 28px"
  button-ink-compact:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "36px"
    padding: "8px 16px"
  button-glass:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "36px"
    padding: "8px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  nav-pill:
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "4px"
  nav-link:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
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
    padding: "20px"
  inbox-row-selected:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.xl}"
    padding: "14px 12px"
  window-chrome:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.window}"
  input-search:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    height: "40px"
    padding: "4px 12px 4px 36px"

effects:
  glass-control: "Frosted pill for floating chrome: white 66% (dark 6%), 1px hairline, inset top highlight, blur(20px) saturate(1.5)."
  glass-strong: "Elevated glass for menus, the privacy panel and toasts: vertical white gradient (dark graphite), blur(32px) saturate(1.7), long soft drop 0 32px 80px -32px."
  button-ink: "Ink fill with an inset top highlight and a 0 8px 20px -10px drop; hover opacity 0.86, press scale 0.97."
  paper-grain: "180px SVG fractal noise, multiply at 6% (dark: inverted, screen at 3.5%) over landing, legal and dashboard overview."
  dither-field: "Fixed WebGL backdrop: domain-warped fbm thresholded through an 8x8 Bayer matrix, 2px cells upscaled pixelated, in --dither-ink at 50% (dark 42%). Clears a column behind the hero copy and fades past the hero."
  nav-feather: "7rem blurred band behind the floating nav, masked to dissolve downward."
  text-halo: "Four stacked background-coloured text shadows (3/8/14/22px) so copy never sits on dither dots."
  runway: "Track at 9% ink; ::after fills scaleX(var(--runway)) in --runway-color, grows over 1.1s; urgent rows pulse 2.4s."
  view-transition: "Theme change grows a clip-path circle from the toggle's centre over 520ms."

responsive:
  mobile:
    - "Hero headline clamp(40px, 10vw, 48px); gutters 20px."
    - "Site nav: brand pill, theme toggle and a 48px menu button that opens a glass-strong sheet; the centre link pill is hidden below md."
    - "Inbox and detail are mutually exclusive full-width panes; category pills scroll horizontally in the inbox."
    - "The demo hides its reading pane below sm and shows the sorted list only."
  tablet:
    - "From md the inbox rail is 360px and the detail pane sits beside it."
    - "How-it-works steps become three columns at md."
  desktop:
    - "Mailbox navigation rail (224px) appears at xl; category pills move into it."
    - "Inbox rail grows to 390px and the 320px calendar rail appears at 2xl."
    - "Feature tabs and the privacy and FAQ sections become two columns at lg."

accessibility:
  focus: "Global :focus-visible outline 2px solid --ring, offset 2px; primitives add a 3px ring at ring/50."
  motion: "prefers-reduced-motion collapses animations and transitions to 0.01ms, freezes the dither on one frame, shows the demo's final sorted frame, removes the tilt and skips the circle reveal."
  semantics: "Feature tabs are a vertical tablist with arrow keys; FAQ uses aria-expanded regions; runways are progressbars with descriptive labels; demo is a figure with a caption."
  contrast: "Deadline colours are darkened in light theme (soon #b05d08, open #12804a) so they read as text, not only as bars."

avoid:
  - "Do not introduce a brand hue for actions; primary stays ink."
  - "Do not use the deadline colours for decoration, categories or emphasis."
  - "Do not put frosted glass behind reading content; cards and rows stay solid."
  - "Do not light every selected item separately; use one shared layoutId highlight per list."
  - "Do not bring back the retired warm graphite, amber and serif-display system."
---

# Design System: AuraMail

## Overview

**Creative North Star: "Ink on Paper, Timed"**

AuraMail is a cool, near-neutral sheet of paper with one ink. Text, primary buttons, the brand mark and the selected calendar day are all drawn in the same ink colour; there is no brand hue. The only saturated colour is the deadline scale (urgent, soon, open, closed), so wherever colour shows up, it is telling the student how much time is left. The runway, a thin bar filling from received to closing, is the system's signature and appears in the brand mark, the landing demo, the feature tabs, every inbox row and the detail view.

Atmosphere comes from material rather than colour. The landing page sits over a slow ordered-dither cloud of fine blue-grey dots, with paper grain on top; floating chrome (nav, toggles, menus) is frosted glass; content surfaces (cards, rows, window frames) are solid. Headlines are set in Google Sans at medium weight with tight negative tracking, split into an ink lead line and a muted second line. Motion is quick and springy: one highlight slides between items, sections rise in on an expo ease-out, and the theme switch grows out of its own button as a circle.

The dashboard is the same world made denser: a 64px frosted header, solid rails separated by hairlines, mono metadata, and the runway on every row. The marketing and product surfaces share the same tokens, so the landing demo looks like the real dashboard.

**Key Characteristics:**
- Ink-on-paper palette in two equal themes; ink is the action colour.
- Deadline state is the only colour.
- Runway bars as the recurring signature.
- Two-tone, medium-weight, tightly tracked headlines.
- Frosted glass for chrome, solid surfaces for content.
- Ordered-dither cloud and paper grain as the landing atmosphere.
- Spring-driven shared-layout highlights and expo ease-out entrances.

## Colors

A cool neutral ramp from paper to ink in each theme, plus a four-step deadline scale and a single blue focus ring.

### Primary
- **Ink** (#0e0f12 light / #f6f7f9 dark): Body text, headlines, primary buttons (`button-ink`), the brand mark tile, the active filter chip, the focused calendar day and the feature-tab progress line. `--primary` equals ink by design.

### Neutral
- **Paper** (#f7f8fa / #0c0d10): Page background, the colour knocked out of ink buttons and the brand mark, and the `text-halo` shadow colour.
- **Card White / Card Graphite** (#ffffff / #131418): Solid content surfaces: cards, window chrome, dashboard rails.
- **Mist** (#eef0f3 / #1a1c20): Secondary and muted fills: search field, secondary badges, demo title bar at 50%.
- **Selection Haze** (#e9ecf0 / #1f2126): The accent fill used for every selected item highlight (nav, inbox row, demo row, ghost hover).
- **Slate Text** (#646975 / #969ca8): Muted text, including the second line of every two-tone headline.
- **Hairline** (#e0e3e8 / #282b31): Borders, dividers, section rules. Inputs use #d5d9e0 / #33363d.
- **Dither Blue-Grey** (rgb 77,107,153 / rgb 120,150,200): Only the WebGL dither dots, at 50% / 42% alpha.

### Deadline Scale
- **Urgent** (#d43c3c / #ff6b6b): Under 24 hours left. Runway fill, time-left label, `High` badge, pulsing runway. Also `--destructive`.
- **Soon** (#b05d08 / #f5b94a): 24 to 72 hours left; calendar deadline dots; the star of an important message.
- **Open** (#12804a / #4cc38a): More than 72 hours left; success confirmations ("Added to Google Calendar", the "can" checks on the privacy panel).
- **Closed** (#6b7280 / #8b93a1): Applications closed.

### Focus
- **Signal Blue** (#0066ff / #3b82f6): `--ring` only: focus outlines and input caret. Never a fill.

### Named Rules
**The Ink Is the Action Rule.** Primary actions are filled with the text colour. A new screen does not get a brand hue for its main button.

**The Colour Means Time Rule.** Urgent, soon, open and closed appear only where they describe a deadline or its direct outcome. Categories, tags and counts are neutral.

## Typography

**Display and Body Font:** Google Sans (fallback -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif)
**Mono Font:** Google Sans Code (fallback ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)

**Character:** One humanist sans does all the talking, set medium and tight for headlines and regular for reading. The code face from the same family handles anything that counts: dates, time left, file sizes, day labels.

### Hierarchy
- **Display** (500, clamp(48px, 5.6vw, 76px); clamp(40px, 10vw, 48px) below sm, line-height 1.02, -0.035em): Landing hero only.
- **Display Closing** (500, clamp(44px, 7vw, 96px), 0.98, -0.04em): The closing call to action.
- **Headline** (500, clamp(34px, 4.6vw, 60px), 1.04, -0.035em): Landing section headings. Legal page titles use clamp(40px, 6vw, 64px) at 1.02.
- **Title** (500, clamp(26px, 3vw, 36px), 1.1, -0.03em): Email subject in the detail view; dashboard welcome uses clamp(28px, 3.2vw, 42px). Step titles are 24px at -0.025em; tab, FAQ and mobile-menu items are 18px at -0.02em; the inbox heading is 20px.
- **Body Lead** (400, 17px from sm / 16px mobile, 1.625): Hero and section intros, max 32rem or 28rem.
- **Body** (400, 16px, 1.5): Default.
- **Body Small** (400, 15px, 1.625 or 28px on legal): Feature bodies, step bodies, FAQ answers, legal text, inbox company names.
- **Label** (500, 14px): Buttons, nav links, panel headings, footer column titles. Captions are 12px.
- **Meta** (Google Sans Code, 400, 10.5px to 14px, tabular numerals): Received dates, time-left labels, counts, file sizes, calendar days.

### Named Rules
**The Two-Tone Headline Rule.** Section headings are two block lines: the lead in ink at weight 500, the rest in muted slate. The second line completes the sentence; it is not a subtitle.

**The Count in Code Rule.** Times, dates and numbers in lists are set in Google Sans Code with tabular numerals, so columns of "5h left" and "2d ago" align.

## Layout

Single centred column on the landing page with containers of 72rem (sections), 64rem (demo) and 48rem (headings, legal). Gutters are 20px, 32px from sm and 40px from lg. Sections are separated by viewport-relative space, clamp(96px, 16svh, 180px), with the closing section given clamp(120px, 22svh, 240px) above. The hero starts 144px down (176px sm, 192px lg) to clear the 80px floating nav. Two-column sections use asymmetric splits: features 0.9fr / 1.1fr, FAQ 0.8fr / 1.2fr, privacy 1fr / 1fr. Footer is 1.4fr plus three equal link columns.

The dashboard is a full-height shell: 64px header, then up to four columns separated by 1px hairlines: mailbox nav 224px (xl+), inbox 360px (md) to 390px (2xl), flexible detail, calendar 320px (2xl+). Below md the inbox and the detail view swap rather than share the screen. The detail view reads in a 56rem column with 32px vertical rhythm between sections.

Spacing sits on Tailwind's 4px unit; common steps are 8, 12, 16, 20, 24, 32, 40 and 56px.

## Elevation & Depth

Depth is mostly material, not shadow. Content is flat and solid, separated by hairlines. Floating chrome is frosted glass with an inset top highlight. Only three things cast real shadows: the ink button, the elevated glass panel, and the product window frame, and each uses a long, very soft, negatively spread drop so the object hovers rather than sits.

### Shadow Vocabulary
- **Glass Control** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(15,23,42,0.05)`; dark: `inset 0 1px 0 rgba(255,255,255,0.07)`): Nav pills, toggles, FAQ plus button, outline buttons.
- **Glass Strong** (`box-shadow: inset 0 1px 0 #fff, 0 32px 80px -32px rgba(30,45,80,0.4), 0 2px 6px rgba(15,23,42,0.06)`; dark uses rgba(0,0,0,0.8) and 0.3): Mobile menu, privacy panel, error toast.
- **Window** (`box-shadow: 0 1px 2px var(--shadow), 0 40px 100px -40px rgba(15,23,42,0.45)`; dark rgba(0,0,0,0.9)): The product window frame in the landing demo and feature tabs.
- **Ink Button** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.16), 0 8px 20px -10px rgba(15,23,42,0.5)`): Primary action pill.

### Named Rules
**The Glass Is Chrome Rule.** Backdrop blur belongs to things that float over content: the nav, the frosted header, toggles, menus and toasts. Cards, inbox rows and reading panes are solid.

**The Halo Rule.** Text that sits over the dither field carries `text-halo` so no dot ever touches a letter.

## Shapes

Soft and pill-shaped. Every button, nav link, chip, badge, search field and avatar is a full pill (9999px). Content cards and list rows use a 16px radius; the product window frame 22px; elevated glass panels 28px. The radius base is 12px (`--radius: 0.75rem`), giving 8, 10, 12 and 16px steps. The brand mark is a 32px tile with a 9px corner holding an envelope flap stroke (2.2px, round caps) over a 2.2px runway bar filled to 60% that fills to 100% on hover. Borders are always 1px hairlines; dashed borders mark filtered-out items. Bars and dots are fully rounded.

## Components

### Buttons
- **Shape:** Full pill (9999px).
- **Primary (`button-ink`):** Ink fill, paper text, 14px medium. Landing CTA is 48px tall with 28px side padding and a trailing arrow that nudges 2px right on hover; the shared Button primitive defaults to 36px with 16px padding (sm 36px, lg 44px).
- **Hover / Press:** Opacity to 0.86 over 200ms; press scales to 0.97 on the expo curve. Focus adds a 3px ring at 50% signal blue.
- **Outline (`glass-control`):** Frosted pill, ink text, background brightens on hover. Used for secondary actions such as "Add to calendar" and the sync button.
- **Ghost:** Transparent until hover, then the selection haze fill.
- **Text link:** Underline at 25% ink, offset 4 to 6px, going to full ink on hover.

### Chips and Badges
- **Badge:** Pill, 12px medium, 4px by 10px padding, 12px icons. Deadline variants are tinted, not filled: 10% fill, 25% border, full-colour text. Secondary and outline variants are neutral.
- **Filter chip:** Pill with a 1px hairline, 12px text, 6px by 12px. Active is an ink fill with paper text; inactive is muted text that gains the mist fill on hover.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Card white / card graphite, 1px hairline.
- **Shadow Strategy:** None; see Elevation.
- **Internal Padding:** 16 to 20px in the detail view, 24px in the Card primitive.

### Inputs / Fields
- **Style:** The search field is a pill on the mist fill, no border, no shadow, with a 16px leading search icon (36px left padding). The generic Input is a 40px, 12px-radius field on paper with an input-coloured hairline.
- **Focus:** Border shifts to signal blue with a 3px ring at 50%; the search field also brightens to the card colour.

### Navigation
- **Site nav:** Fixed, 80px tall, over a `nav-feather` blur band. Brand pill left (48px glass, mark plus 17px wordmark), a centred 48px glass pill of 14px muted links, and theme toggle plus ink "Sign in" on the right. A single `nav-hover` highlight at 7% ink springs (stiffness 500, damping 40) between links. Below md a 48px menu button morphs its two bars into a cross and opens a glass-strong sheet whose links stagger in.
- **Mailbox nav:** 224px solid rail with 12px medium section labels in muted text and 14px items with tabular counts; the active item has one `nav-active` selection-haze highlight that slides between items.

### Runway (signature)
A fully rounded track at 9% ink, 4px tall in rows and 6px in the detail view and features, filled from the left to the share of the application window already spent, in the colour of its deadline state. It grows in over 1.1s on the expo curve; urgent runways pulse between full and half opacity every 2.4s. It carries progressbar semantics and is always paired with a mono time-left label in the same colour.

### Inbox Row
Company in 15px ink, received date in 11px mono at the right, role in 14px muted, then runway and time-left, then neutral badges. Rows stagger in 28ms apart (capped at 12). The selected row gets one `inbox-active` 16px selection-haze highlight sliding between rows (spring 500/42); the star toggle appears on hover and stays in soon colour once set.

### Product Window
A 22px solid card with the window shadow, a 44px title bar on mist at 50% with three 12px window dots and a centred 12px muted title. The landing demo runs a timed loop inside it: a new email drops in blurred from above, then the list reorders by deadline with FLIP layout springs (stiffness 420, damping 38), and one `demo-selection` highlight follows the newest arrival.

### Feature Tabs
A vertical tablist of 18px titles separated by hairlines; the selected tab reveals its body by animating grid rows and draws a 1px ink progress line across its top over 6s before advancing. Hover or focus pauses the cycle. The matching scene plays in a product window with children rising 70ms apart.

### Theme Switcher
A 36px (48px in the site nav) round button with a 16px sun or moon that blurs in on change. Switching grows the new theme as a clip-path circle from the button's centre over 520ms using View Transitions, and falls back to an instant swap.

## Do's and Don'ts

### Do:
- **Do** fill primary actions with ink (`button-ink`) and keep them pill-shaped.
- **Do** colour a deadline with exactly one of urgent, soon, open or closed, and pair every runway with a mono time-left label in the same colour.
- **Do** set section headings as two lines: ink lead at 500, muted completion, tracking -0.035em.
- **Do** use one shared `layoutId` highlight per list, sprung at stiffness about 500 and damping 40 to 42.
- **Do** enter content with `cubic-bezier(0.22, 1, 0.36, 1)`: `hero-rise` for page openings, `item-enter` for list items, `stagger-children` for detail sections.
- **Do** keep frosted glass on floating chrome and give text over the dither field `text-halo`.
- **Do** honour reduced motion by showing the final state, not a frozen mid-animation.

### Don't:
- **Don't** introduce a brand accent colour; signal blue is the focus ring only.
- **Don't** use deadline colours for categories, tags, counts or decoration.
- **Don't** blur or frost content surfaces such as cards, rows or reading panes.
- **Don't** add heavy or hard shadows; depth is a long soft drop on three elements only.
- **Don't** set headlines in bold or uppercase; the display weight is 500 with negative tracking.
- **Don't** bring back the retired warm graphite, amber and serif-display system.
