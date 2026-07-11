import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./lib/authContext";
import { FluidBackground } from "@/components/FluidBackground";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "AuraMail - Placement intelligence for students",
  description: "A focused inbox for placement opportunities, deadlines, and campus updates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="eclipse" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.theme=localStorage.getItem('auramail-theme')||'eclipse'}catch(e){}`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <FluidBackground />
        <TooltipProvider delayDuration={200}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
