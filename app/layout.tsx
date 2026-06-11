import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Manrope, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/app/providers/AppProvider";
import { ToastProvider } from "@/components/ui/molecules/Toast";
import { PWAUpdatePrompt } from "@/components/pwa/PWAUpdatePrompt";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CatatUang - Premium Personal Finance & Planning",
  description: "Track your wallets, transactions, debts, and financial goals in one beautiful dashboard.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CatatUang",
  },
  icons: {
    icon: [{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${manrope.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-surface text-text-primary">
        <ToastProvider>
          <AppProvider>
            {children}
          </AppProvider>
          <PWAUpdatePrompt />
        </ToastProvider>
      </body>
    </html>
  );
}
