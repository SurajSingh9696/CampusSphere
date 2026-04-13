import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";
import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Academic Orbit",
    template: "%s | Academic Orbit",
  },
  description:
    "Modern unified campus platform built with Next.js and MongoDB for students and colleges.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
