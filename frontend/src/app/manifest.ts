import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AuraMail — Placement intelligence for students",
    short_name: "AuraMail",
    description:
      "A focused inbox for placement opportunities, deadlines, and campus updates.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f8fa",
    theme_color: "#ffffff",
    categories: ["productivity", "education", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
