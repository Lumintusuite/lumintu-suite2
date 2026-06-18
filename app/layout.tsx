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
  title: "Lumintu Suite - Build. Automate. Scale.",
  description: "Sell digital products, manage licenses, grow with affiliates, and automate your business from one platform.",
  keywords: ["digital products", "license management", "affiliate system", "SaaS", "automation"],
  authors: [{ name: "Lumintu Suite" }],
  creator: "Lumintu Suite",
  publisher: "Lumintu Suite",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://lumintu-suite.com",
    title: "Lumintu Suite - Build. Automate. Scale.",
    description: "Sell digital products, manage licenses, grow with affiliates, and automate your business from one platform.",
    siteName: "Lumintu Suite",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumintu Suite - Build. Automate. Scale.",
    description: "Sell digital products, manage licenses, grow with affiliates, and automate your business from one platform.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
