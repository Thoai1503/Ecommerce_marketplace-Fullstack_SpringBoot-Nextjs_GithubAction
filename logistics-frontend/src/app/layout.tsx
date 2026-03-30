import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Logistics Service",
  description: "Logistics tracking and admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <header className="border-b border-zinc-200 bg-white/60 px-6 py-4 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo.svg" alt="Logistics logo" className="h-8 w-8" />
                <span className="text-lg font-semibold tracking-tight text-zinc-900">
                  Logistics
                </span>
              </Link>
              <nav className="flex items-center gap-4 text-sm text-zinc-700">
                <Link
                  href="/tracking"
                  className="rounded-md px-3 py-2 hover:bg-zinc-100"
                >
                  Tracking
                </Link>
                <Link
                  href="/admin"
                  className="rounded-md px-3 py-2 hover:bg-zinc-100"
                >
                  Admin
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
