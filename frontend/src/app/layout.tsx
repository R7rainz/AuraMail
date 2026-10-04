import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider } from "./lib/authContext";
import { TooltipProvider } from "@/components/ui/tooltip";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AuraMail — Placement intelligence for students",
    template: "%s · AuraMail",
  },
  description:
    "AuraMail organizes placement opportunities, follow-ups, files, and deadlines into one focused student inbox.",
  applicationName: "AuraMail",
  keywords: [
    "placement emails",
    "student inbox",
    "AI email assistant",
    "campus placements",
    "internship deadlines",
    "placement tracker",
    "Gmail for students",
    "VIT placements",
    "career development",
  ],
  authors: [{ name: "AuraMail" }],
  creator: "AuraMail",
  publisher: "AuraMail",
  category: "productivity",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "AuraMail",
    title: "AuraMail — Placement intelligence for students",
    description:
      "A focused inbox for placement opportunities, deadlines, and campus updates.",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraMail — Placement intelligence for students",
    description:
      "A focused inbox for placement opportunities, deadlines, and campus updates.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d10" },
  ],
  colorScheme: "light dark",
};

const themeScript = `
  try {
    const saved = localStorage.getItem("auramail-theme");
    const theme = ["light", "dark"].includes(saved)
      ? saved
      : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
  } catch (_) {
    document.documentElement.dataset.theme = "light";
  }
`;

// SoftwareApplication + Organization structured data for rich search results.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "AuraMail",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "A placement inbox for students that organizes roles, eligibility, deadlines, links, attachments, and calendar actions.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "Organization",
      name: "AuraMail",
      url: siteUrl,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <TooltipProvider delayDuration={200}>
          <AuthProvider>{children}</AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
