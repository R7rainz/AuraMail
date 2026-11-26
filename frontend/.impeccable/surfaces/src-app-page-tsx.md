---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/dashboard/page.tsx","src/app/legal-page.tsx"]
---

Scope: landing page (Persuade), dashboard (Operate), privacy/terms (Read). One visual world across all three.
Audience/job: placement-season students deciding whether to connect Gmail; then triaging opportunities daily.
Proof/content: README facts only; landing demo data labelled as an example. No price, no stats, no testimonials.
Constraints: light + dark both first-class, OS default; prefers-reduced-motion path everywhere; keep all dashboard behaviour.

## Direction contract

seed: none (pinned) — the owner's words: "visit this website - spacefs.com ... looking at the design and all stuff i want you to create a brand new design for this website ... with all the proper animations transitions and smoothness". Scope, theme and content were confirmed in the question round (whole site; follow the OS; expand from README facts).

FORM: spacefs.com's page form, carried over: floating glass control pills, a centred two-line headline, one ink CTA, then a product window as the proof object; sections alternate a two-tone heading with one demonstrating artifact (feature tabs beside a window, a numbered three-step row, a glass permission card, an accordion FAQ) and end on a large two-tone closing CTA. The dashboard and legal pages keep their existing structures and take on only the materials and motion.

THESIS: The inbox re-sorts itself in front of you. The page refuses the category hero (headline left, static screenshot right) and instead centres a calm two-tone headline over a live app window where placement mail lands and slides into deadline order.

OWN-WORLD: AuraMail's own calm desktop, rebranded 2026-11-26 at the owner's request ("everything should be branded on our own ... fonts and buttons and all stuff should be personalized"): #f7f8fa / #0c0d10 ground; Schibsted Grotesk + Fragment Mono; 16px-radius ink buttons whose fill runs left to right like a deadline runway; one floating frosted nav bar; the aura-ring logo (a ring 72% drawn around an envelope) with a two-tone AuraMail wordmark; a slow field of short horizontal "runway" dashes with paper grain; AuraMail's own window chrome on every product window. Colour only from the deadline scale plus a blue focus ring.

STORY: see mail get sorted by what closes → see what gets extracted → learn it is read-only → three steps → FAQ → continue with Google.

FIRST VIEWPORT: floating glass nav pills; centred H1 two lines (ink medium / muted regular) ~76px desktop; one ink CTA; the demo window rising from the fold.

SIGNATURE: a playable sandbox inbox: rows arrive and FLIP into deadline order until the visitor touches it, then search, star, Sync, Apply and Add to calendar all work on example data; feature tabs swap with blur-in.

MOTION: hero-rise stagger (1.1s, cubic-bezier(.22,1,.36,1)); in-view rise 0.7s; shared-layout selection highlight in the dashboard; theme switch circle reveal via View Transitions.
