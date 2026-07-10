import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./lib/authContext";

export const metadata: Metadata = {
  title: "AuraMail - AI-Powered Placement Mail Assistant",
  description: "Automatically fetch, summarize, and organize your college placement emails — powered by AI & n8n automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
