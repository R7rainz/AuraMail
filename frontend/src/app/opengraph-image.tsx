import { ImageResponse } from "next/og";

export const alt = "AuraMail — Placement intelligence for students";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dynamic Open Graph / Twitter card, rendered at request time. Self-contained
// (no remote assets or fonts) so it works under the strict build sandbox.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0c0d10",
          color: "#f6f7f9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="48" height="48" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="9" fill="#f6f7f9" />
            <circle cx="16" cy="16" r="9.2" fill="none" stroke="#0c0d10" strokeWidth="2" strokeOpacity="0.25" />
            <path d="M16 6.8 A9.2 9.2 0 1 1 6.96 17.72" fill="none" stroke="#0c0d10" strokeWidth="2" strokeLinecap="round" />
            <rect x="11.6" y="12.9" width="8.8" height="6.4" rx="1.4" fill="none" stroke="#0c0d10" strokeWidth="1.6" />
            <path d="m12 13.6 4 2.9 4-2.9" fill="none" stroke="#0c0d10" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 600, letterSpacing: -1 }}>
            <span>Aura</span>
            <span style={{ color: "#969ca8", marginLeft: -3 }}>Mail</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, lineHeight: 1.02, letterSpacing: -2.6 }}>
          <div style={{ fontWeight: 600 }}>Every placement email,</div>
          <div style={{ color: "#969ca8" }}>sorted by what closes first.</div>
        </div>

        <div style={{ display: "flex", gap: 28, fontSize: 22, color: "#969ca8" }}>
          <span>Read-only Gmail access</span>
          <span style={{ color: "#3a3d44" }}>/</span>
          <span>Deadlines to Google Calendar</span>
        </div>
      </div>
    ),
    size,
  );
}
