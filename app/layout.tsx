import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteNav from "@/components/SiteNav";
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
  title: "Local Adventures & Activities Guide",
  description: "Local Adventures & Activities Guide",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Bottom padding on mobile leaves room for the fixed bottom nav. */}
      <body className="min-h-full flex flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
