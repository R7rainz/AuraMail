import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./lib/authContext";
import { TooltipProvider } from "@/components/ui/tooltip";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AuraMail — Placement intelligence for students",
    template: "%s · AuraMail",
  },
  description:
    "AuraMail turns crowded campus mail into a focused stream of placement opportunities, follow-ups, files, and deadlines — with AI that extracts the details that matter.",
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
      "A focused inbox for placement opportunities, deadlines, and campus updates. AI reads the mail so you don't have to.",
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

// One theme, so the browser chrome matches the canvas unconditionally.
export const viewport: Viewport = {
  themeColor: "#0d1011",
  colorScheme: "dark",
};

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
        "AI-powered placement inbox for students — extracts roles, eligibility, deadlines, links, and attachments from campus mail and turns deadlines into calendar events.",
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
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geist.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <TooltipProvider delayDuration={200}>
          <AuthProvider>{children}</AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
