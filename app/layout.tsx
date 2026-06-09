import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/app/providers/AppProvider";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexSansMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-sans-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CatatUang - Premium Personal Finance & Planning",
  description: "Track your wallets, transactions, debts, and financial goals in one beautiful dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexSansMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-surface text-text-primary">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
