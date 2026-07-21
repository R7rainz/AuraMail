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
          background:
            "radial-gradient(900px 520px at 50% -12%, rgba(255,255,255,0.16), transparent 62%), #000000",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              border: "2px solid rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 3,
                background: "#fafafa",
                transform: "rotate(45deg)",
              }}
            />
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
            AuraMail
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 20,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#a1a1a1",
            }}
          >
            Placement intelligence for students
          </div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            Every placement mail is a clock.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 28,
            fontSize: 22,
            color: "#a1a1a1",
          }}
        >
          <span>AI briefs</span>
          <span style={{ color: "#3d3d3d" }}>/</span>
          <span>Deadlines → calendar</span>
          <span style={{ color: "#3d3d3d" }}>/</span>
          <span>Follow-ups & files</span>
        </div>
      </div>
    ),
    size,
  );
}
