import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "AI Think Trust",
  description:
    "A collective of AI-forward practitioners helping business owners harness artificial intelligence — without the noise, the hype, or the wasted time.",
  openGraph: {
    title: "AI Think Trust",
    description: "We went down the rabbit hole so you don't have to.",
    url: "https://aithinktrust.com",
    siteName: "AI Think Trust",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
