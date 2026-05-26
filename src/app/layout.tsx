import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SystemNotificationManager from "@/components/SystemNotificationManager";

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
      <body className="min-h-screen flex flex-col bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-container relative overflow-x-hidden">
        {/* Universal Ambient Animated Background Blobs */}
        <div className="fixed -z-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] top-[-10%] left-[-10%] animate-float pointer-events-none"></div>
        <div className="fixed -z-10 w-[450px] h-[450px] bg-tertiary/5 rounded-full blur-[100px] top-[30%] right-[-10%] animate-float-delayed pointer-events-none"></div>
        <div className="fixed -z-10 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[90px] bottom-[-10%] left-[20%] animate-float pointer-events-none"></div>
        <div className="fixed -z-10 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[80px] bottom-[20%] right-[10%] animate-float-delayed pointer-events-none"></div>
        <RouteLoader />
        <Navbar initialProfile={profile} unreadCount={unreadCount} />
        <SystemNotificationManager profile={profile} />
        <main className="flex-1 pt-[72px]">
          <MotionProvider>{children}</MotionProvider>
        </main>
      </body>
    </html>
  );
}
