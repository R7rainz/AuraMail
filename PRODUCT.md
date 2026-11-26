# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

College students going through campus placement season (for example at VIT). The placement cell sends a steady stream of internship, job, PPT, workshop, exam, interview and result emails, and students lose track of which ones need action and when they close. They read AuraMail on a laptop between classes and on a phone on the move.

## Product Purpose

AuraMail connects to a student's Gmail with read-only access, finds the placement mail, and turns each opportunity into a structured entry: company, role, location, eligibility, compensation, deadline, application link, attachments. Success means a student never misses a deadline and can act on an opportunity without rereading the original email.

## Positioning

AuraMail sorts placement mail by what closes first. Each opportunity carries a deadline runway (received → now → closes) so urgency is visible at a glance, and the original email stays one click away in Gmail.

## Operating Context

- Gmail stays the inbox of record; AuraMail never sends, edits or deletes mail.
- Sign-in is Google OAuth; sessions use access and refresh tokens.
- Mail syncs in the background; related messages are grouped into threads.
- Deadlines can be added to Google Calendar from an email.
- Optional deadline notifications per user.

## Capabilities and Constraints

- AI-assisted summaries and field extraction (roles, companies, locations, experience, eligibility, deadlines, compensation, application instructions).
- Useful links from the body stay clickable; known promotional/footer links are filtered.
- Attachment metadata is shown; attachments open in a new tab from Gmail.
- Filtering by category, priority, deadline, sender and search.
- Frontend: Next.js 16, React 19, Tailwind CSS 4 (Vercel). Backend: Go (Render), Postgres (Neon).
- Undecided: pricing. The site must not state a price.

## Brand Commitments

- Name: AuraMail.
- Light and dark themes both supported; default follows the OS.
- Visual reference the owner chose for the 2026-11 redesign: spacefs.com.

## Evidence on Hand

- README feature list and the live app at aura-mail-dun.vercel.app.
- No testimonials, usage numbers, customer logos or benchmarks exist. Do not invent them; demo data on the landing page must be labelled as an example.

## Product Principles

1. Deadline first: what closes soonest leads.
2. Read-only and reversible: the student's mailbox stays theirs.
3. Extract, don't summarise away: keep the details a student needs to apply.
4. One click back to the source email, link or attachment.

## Accessibility & Inclusion

Keyboard focus visible on every control; respect prefers-reduced-motion; urgency is never carried by colour alone (labels accompany it).
