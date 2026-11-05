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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
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
        <footer className="bg-emerald-900 text-emerald-100">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm">
            <p className="font-semibold uppercase tracking-widest text-amber-300">
              For educational purposes only
            </p>
            <p className="mt-2 max-w-2xl">
              This site is a student project made for learning. It isn&apos;t
              affiliated with the places listed, and details like hours, ratings
              and photos may be out of date, so check with each place before you
              go.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
