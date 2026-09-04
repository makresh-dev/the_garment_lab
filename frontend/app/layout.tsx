import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/Navbar";
//import ThemeProvider from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Garment Lab — Engineered Silhouettes & Modern Wardrobe",
  description: "Curated contemporary apparel and architectural garments crafted for precision, comfort, and longevity.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-[#fafafa] text-zinc-900 selection:bg-zinc-900 selection:text-white dark:bg-[#09090b] dark:text-zinc-100 dark:selection:bg-white dark:selection:text-black`}
      >
        <Navbar />
        <div className="flex-1">
          {children}
        </div>

        {/* Minimalist Studio Footer */}
        <footer className="border-t border-zinc-200/80 bg-white py-12 text-zinc-600 dark:border-zinc-800/80 dark:bg-[#09090b] dark:text-zinc-400">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                    THE GARMENT LAB
                  </span>
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    STUDIO
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  Engineered wardrobe essentials & archival silhouettes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
                <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Archive
                </Link>
                <Link href="/products" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Catalog
                </Link>
                <Link href="/orders" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Client Portal
                </Link>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
                  © {new Date().getFullYear()} TGL // ALL RIGHTS RESERVED
                </span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}