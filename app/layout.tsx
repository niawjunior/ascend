import type { Metadata } from "next";
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
  title: "Ascend | Professional Climbing Workouts",
  description: "A premium, client-side interval timer and workout builder designed specifically for rock climbers. Features Max Hangs, Repeaters, ARC training, and more with chalk-friendly UI and audio cues.",
  keywords: "rock climbing, bouldering, training, hangboard, timer, workout, fitness",
  authors: [{ name: "Ascend Training" }],
  openGraph: {
    title: "Ascend | Professional Climbing Workouts",
    description: "A premium interval timer and workout builder designed specifically for rock climbers.",
    type: "website",
  }
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
        {children}
      </body>
    </html>
  );
}
