import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

import { getUser } from "@/actions/auth";
import { getUnreadConversationCount } from "@/actions/conversations";
import RouteLoader from "@/components/RouteLoader";
import MotionProvider from "@/components/MotionProvider";

export const metadata: Metadata = {
  title: "NestScout — Curated Editorial Real Estate",
  description:
    "NestScout curates the world's most evocative living spaces. Moving beyond listings to discover homes that speak to your personality, values, and vision.",
  keywords: ["rental", "property", "real estate", "curated", "editorial", "luxury"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getUser();
  const unreadCount = profile ? await getUnreadConversationCount() : 0;

  return (
    <html lang="en" className="min-h-screen antialiased">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6213864135630742"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-container">
        <RouteLoader />
        <Navbar initialProfile={profile} unreadCount={unreadCount} />
        <main className="flex-1 pt-[72px]">
          <MotionProvider>{children}</MotionProvider>
        </main>
      </body>
    </html>
  );
}
