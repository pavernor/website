import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pavernor.tech"),
  title: {
    default: "Pavernor — Agentic AI Consultancy",
    template: "%s — Pavernor",
  },
  description:
    "Pavernor designs, builds, and operates agentic AI systems for companies across Indonesia and Southeast Asia — agents that read your data, use your tools, and finish the work.",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "https://pavernor.tech/feed.xml",
    },
  },
  openGraph: {
    title: "Pavernor — Agentic AI Consultancy",
    description:
      "Agentic AI systems that reason, act, and deliver outcomes — built in Jakarta for Southeast Asia.",
    url: "https://pavernor.tech",
    siteName: "Pavernor",
    type: "website",
    images: [{ url: "/images/hero-port-1376.webp", width: 1376, height: 768 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#F2F1EE",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg font-sans text-fg">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
