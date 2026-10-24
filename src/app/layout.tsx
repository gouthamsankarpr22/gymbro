import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "GymBro — Social Fitness App for Gym Friends Across Distances",
  description: "Stay connected with your gym partners separated by college, distance, and work. Daily workout updates, PR milestones, memes, and brotherhood motivation.",
  keywords: ["gym", "fitness", "workout partner", "social fitness", "personal records", "lifting squad"],
  authors: [{ name: "GymBro Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090d16",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090d16] text-[#f1f5f9]">{children}</body>
    </html>
  );
}
