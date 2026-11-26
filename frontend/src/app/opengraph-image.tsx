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
            <path d="M8.5 11.5 16 17l7.5-5.5" fill="none" stroke="#0c0d10" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="8.5" y="21" width="15" height="2.2" rx="1.1" fill="#0c0d10" fillOpacity="0.3" />
            <rect x="8.5" y="21" width="9" height="2.2" rx="1.1" fill="#0c0d10" />
          </svg>
          <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: -0.6 }}>
            AuraMail
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
