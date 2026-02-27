import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Critiqo — Rate Movies & TV Like a Critic",
  description:
    "Rate movies and TV shows across five dimensions. Track, review, and share your critiques.",
  openGraph: {
    title: "Critiqo — Rate Movies & TV Like a Critic",
    description:
      "Rate movies and TV shows across five dimensions. Track, review, and share your critiques.",
    siteName: "Critiqo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Critiqo — Rate Movies & TV Like a Critic",
    description:
      "Rate movies and TV shows across five dimensions. Track, review, and share your critiques.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <AuthProvider>
          <TooltipProvider>
            <Navbar />
            {children}
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
