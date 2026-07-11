import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider } from "./lib/authContext";
import { FluidBackground } from "@/components/FluidBackground";
import { TooltipProvider } from "@/components/ui/tooltip";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07080c" },
    { media: "(prefers-color-scheme: light)", color: "#f0f1f5" },
  ],
  colorScheme: "dark light",
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
    <html
      lang="en"
      data-theme="eclipse"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.theme=localStorage.getItem('auramail-theme')||'eclipse'}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <FluidBackground />
        <TooltipProvider delayDuration={200}>
          <AuthProvider>{children}</AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
